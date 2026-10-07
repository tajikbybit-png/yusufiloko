import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rate limiting & concurrency protection
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
let activeCompilations = 0;
const MAX_CONCURRENT_JOBS = 10;
const MAX_SOURCE_BYTES = 128 * 1024; // 128 KB max source payload
const MAX_OUTPUT_CHARS = 64 * 1024;  // 64 KB max output

interface CompileFile {
  name: string;
  content: string;
}

interface CompileRequest {
  language?: string;
  standard?: 'c++17' | 'c++20' | 'c++23';
  optimization?: '-O0' | '-O2' | '-O3';
  warnings?: boolean;
  files: CompileFile[];
  stdin?: string;
}

/**
 * Resolves local #include "header.h" directives across project files
 * or supplies them as multi-file compilation units for the sandbox compiler.
 */
function prepareCompilationUnits(files: CompileFile[]) {
  // Sanitize filenames against path traversal
  const sanitizedFiles = files.map((f) => ({
    name: path.basename(f.name.replace(/\\/g, '/')),
    content: String(f.content || '')
  }));

  const mainFile =
    sanitizedFiles.find((f) => f.name === 'main.cpp') ||
    sanitizedFiles.find((f) => f.name.endsWith('.cpp') || f.name.endsWith('.cc') || f.name.endsWith('.cxx')) ||
    sanitizedFiles[0];

  const additionalUnits = sanitizedFiles.filter((f) => f.name !== mainFile.name);
  return { mainFile, additionalUnits, allFiles: sanitizedFiles };
}

/**
 * Merges multi-file C++ project into a single translation unit as a fallback
 * if a secondary sandbox engine only supports single-file compilation.
 */
function mergeMultiFileProject(files: CompileFile[]): string {
  const { mainFile, additionalUnits } = prepareCompilationUnits(files);
  if (additionalUnits.length === 0) return mainFile.content;

  const headerMap = new Map<string, string>();
  const cppUnits: CompileFile[] = [];

  for (const unit of additionalUnits) {
    if (unit.name.endsWith('.h') || unit.name.endsWith('.hpp')) {
      headerMap.set(unit.name, unit.content);
    } else if (unit.name.endsWith('.cpp') || unit.name.endsWith('.cc') || unit.name.endsWith('.cxx')) {
      cppUnits.push(unit);
    }
  }

  const includedHeaders = new Set<string>();

  const inlineHeaders = (code: string): string => {
    return code.replace(/^\s*#include\s+"([^"]+)"\s*$/gm, (match, headerName) => {
      const cleanName = path.basename(headerName);
      if (includedHeaders.has(cleanName)) {
        return `// [аллакай ҳамроҳ шуд: ${cleanName}]`;
      }
      const headerContent = headerMap.get(cleanName);
      if (headerContent !== undefined) {
        includedHeaders.add(cleanName);
        const strippedPragma = headerContent.replace(/^\s*#pragma\s+once\s*$/gm, '');
        return `// --- Оғози ${cleanName} ---\n${inlineHeaders(strippedPragma)}\n// --- Анҷоми ${cleanName} ---`;
      }
      return match;
    });
  };

  let combined = inlineHeaders(mainFile.content);
  for (const unit of cppUnits) {
    combined += `\n\n// --- Воҳиди компилятсия: ${unit.name} ---\n` + inlineHeaders(unit.content);
  }
  return combined;
}

async function compileWithWandbox(reqBody: CompileRequest, startTime: number) {
  const { mainFile, additionalUnits } = prepareCompilationUnits(reqBody.files);
  const stdFlag = reqBody.standard === 'c++20' ? 'c++20' : reqBody.standard === 'c++23' ? 'c++2b' : 'c++17';
  const optFlag = reqBody.optimization || '-O2';
  const warnFlags = reqBody.warnings !== false ? 'warning,' : '';

  const extraCppFiles = additionalUnits
    .filter((u) => u.name.endsWith('.cpp') || u.name.endsWith('.cc') || u.name.endsWith('.cxx'))
    .map((u) => u.name);

  const compilerOptionRaw = [
    `-std=${stdFlag}`,
    optFlag,
    '-pedantic-errors',
    ...extraCppFiles
  ].join('\n');

  const wandboxPayload: Record<string, unknown> = {
    compiler: 'gcc-head',
    code: mainFile.content,
    codes: additionalUnits.map((u) => ({
      file: u.name,
      code: u.content
    })),
    options: `${warnFlags}gnu++17`,
    'compiler-option-raw': compilerOptionRaw,
    stdin: reqBody.stdin || '',
    save: false
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 14000);

  try {
    const response = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wandboxPayload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as {
      status?: string;
      signal?: string;
      compiler_output?: string;
      compiler_error?: string;
      program_output?: string;
      program_error?: string;
    };

    const timeMs = Math.max(12, Date.now() - startTime);
    const exitCode = data.status !== undefined ? parseInt(String(data.status), 10) : 0;
    const compilerErr = (data.compiler_error || '').slice(0, MAX_OUTPUT_CHARS);
    const programOut = (data.program_output || '').slice(0, MAX_OUTPUT_CHARS);
    const programErr = (data.program_error || '').slice(0, MAX_OUTPUT_CHARS);

    const hasCompileFailure = exitCode !== 0 && !programOut && compilerErr.length > 0;
    const combinedStderr = [compilerErr, programErr, data.signal ? `Signal: ${data.signal}` : '']
      .filter(Boolean)
      .join('\n')
      .trim();

    return {
      success: exitCode === 0 && !data.signal,
      phase: hasCompileFailure ? 'compile_error' : exitCode !== 0 || data.signal ? 'runtime_error' : 'completed',
      stdout: programOut,
      stderr: combinedStderr,
      compilerOutput: compilerErr,
      exitCode: Number.isNaN(exitCode) ? 1 : exitCode,
      timeMs
    };
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

async function compileWithGodboltFallback(reqBody: CompileRequest, startTime: number) {
  const mergedCode = mergeMultiFileProject(reqBody.files);
  const stdFlag = reqBody.standard === 'c++20' ? '-std=c++20' : reqBody.standard === 'c++23' ? '-std=c++23' : '-std=c++17';
  const optFlag = reqBody.optimization || '-O2';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 14000);

  try {
    const response = await fetch('https://godbolt.org/api/compiler/g132/compile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        source: mergedCode,
        compiler: 'g132',
        options: {
          userArguments: `${stdFlag} ${optFlag} -Wall`,
          executeParameters: {
            args: [],
            stdin: reqBody.stdin || ''
          },
          compilerOptions: {
            executorRequest: true
          },
          filters: {
            execute: true
          }
        },
        lang: 'c++'
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Godbolt HTTP ${response.status}`);
    }

    const data = (await response.json()) as {
      code?: number;
      stdout?: Array<{ text: string }>;
      stderr?: Array<{ text: string }>;
      buildResult?: {
        code?: number;
        stderr?: Array<{ text: string }>;
      };
    };

    const timeMs = Math.max(15, Date.now() - startTime);
    const buildCode = data.buildResult?.code ?? 0;
    const execCode = data.code ?? 0;
    const buildStderr = (data.buildResult?.stderr || []).map((l) => l.text).join('\n');
    const runStdout = (data.stdout || []).map((l) => l.text).join('\n');
    const runStderr = (data.stderr || []).map((l) => l.text).join('\n');

    const exitCode = buildCode !== 0 ? buildCode : execCode;
    const stderr = [buildStderr, runStderr].filter(Boolean).join('\n').slice(0, MAX_OUTPUT_CHARS);

    return {
      success: exitCode === 0,
      phase: buildCode !== 0 ? 'compile_error' : exitCode !== 0 ? 'runtime_error' : 'completed',
      stdout: runStdout.slice(0, MAX_OUTPUT_CHARS),
      stderr,
      compilerOutput: buildStderr.slice(0, MAX_OUTPUT_CHARS),
      exitCode,
      timeMs
    };
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '256kb' }));

  // Health & Compiler Capabilities Endpoint
  app.get('/api/compiler/status', (_req, res) => {
    res.json({
      status: 'ready',
      compiler: 'GCC 13 / C++17 / C++20 / C++23 Sandbox',
      standards: ['c++17', 'c++20', 'c++23'],
      sandboxed: true
    });
  });

  // Secure C++ Compilation Endpoint
  app.post('/api/compile', async (req, res) => {
    const startTime = Date.now();
    const clientIp = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'local');

    // Rate limiting check (30 requests per minute per client)
    const now = Date.now();
    const clientRate = rateLimitMap.get(clientIp);
    if (clientRate && now < clientRate.resetTime) {
      if (clientRate.count >= 30) {
        res.status(429).json({
          success: false,
          phase: 'rate_limit',
          stdout: '',
          stderr: 'Маҳдудияти дархостҳо: Лутфан якчанд сония интизор шавед ва дубора кӯшиш кунед.',
          exitCode: 429,
          timeMs: 0
        });
        return;
      }
      clientRate.count += 1;
    } else {
      rateLimitMap.set(clientIp, { count: 1, resetTime: now + 60_000 });
    }

    if (activeCompilations >= MAX_CONCURRENT_JOBS) {
      res.status(503).json({
        success: false,
        phase: 'busy',
        stdout: '',
        stderr: 'Сервери компилятор банд аст. Лутфан баъд аз чанд сония такрор кунед.',
        exitCode: 503,
        timeMs: 0
      });
      return;
    }

    const body = req.body as CompileRequest;
    if (!body || !Array.isArray(body.files) || body.files.length === 0) {
      res.status(400).json({
        success: false,
        phase: 'validation_error',
        stdout: '',
        stderr: 'Хатои дархост: Файлҳои C++ барои компилятсия пешниҳод нашудаанд.',
        exitCode: 1,
        timeMs: 0
      });
      return;
    }

    const totalSize = body.files.reduce((acc, f) => acc + (f.content ? f.content.length : 0), 0);
    if (totalSize > MAX_SOURCE_BYTES) {
      res.status(400).json({
        success: false,
        phase: 'validation_error',
        stdout: '',
        stderr: 'Ҳаҷми коди манбаъ аз ҳадди иҷозатшуда (128 KB) зиёд аст.',
        exitCode: 1,
        timeMs: 0
      });
      return;
    }

    activeCompilations++;
    try {
      try {
        const result = await compileWithWandbox(body, startTime);
        res.json(result);
      } catch (_primaryError) {
        // Fallback to secondary sandboxed GCC service
        const fallbackResult = await compileWithGodboltFallback(body, startTime);
        res.json(fallbackResult);
      }
    } catch (error) {
      const timeMs = Date.now() - startTime;
      const isAbort = error instanceof Error && error.name === 'AbortError';
      res.status(200).json({
        success: false,
        phase: isAbort ? 'timeout' : 'compiler_error',
        stdout: '',
        stderr: isAbort
          ? 'Вақти иҷрои барнома ба охир расид (Timeout > 14 сония). Эҳтимол даври беохир (infinite loop) вуҷуд дорад.'
          : `Ҳангоми пайвастшавӣ ба муҳаррики компилятсия мушкилот ба вуҷуд омад: ${error instanceof Error ? error.message : 'Unknown error'}`,
        exitCode: isAbort ? 124 : 1,
        timeMs
      });
    } finally {
      activeCompilations = Math.max(0, activeCompilations - 1);
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const hmrEnabled = process.env.DISABLE_HMR !== 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: hmrEnabled,
        watch: hmrEnabled ? {} : null
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`YUSUF CODE IDE Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
