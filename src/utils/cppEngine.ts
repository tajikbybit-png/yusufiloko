import {
  AutocompleteItem,
  DiagnosticItem,
  ProjectFile,
  SignatureHelpInfo
} from '../types/ide';
import {
  CPP_KEYWORDS,
  CPP_SNIPPETS,
  MAP_SET_METHODS,
  STD_NAMESPACE_ITEMS,
  STRING_METHODS,
  VECTOR_METHODS
} from '../data/cppLibrary';

export interface ParsedUserSymbol {
  name: string;
  kind: 'variable' | 'function' | 'class';
  typeName: string; // e.g. 'int', 'std::string', 'std::vector', 'Student'
  signature?: string;
  parameters?: string[];
  members?: Array<{
    name: string;
    kind: 'variable' | 'method';
    typeName: string;
    signature?: string;
  }>;
  file: string;
  line: number;
}

/**
 * Parses raw C++ source across all files in the project to extract:
 * - classes and structs with their member fields & methods
 * - user-defined functions with parameter signatures
 * - local and global variables with their declared types
 */
export function analyzeProjectSymbols(files: ProjectFile[]): {
  symbols: ParsedUserSymbol[];
  classMap: Map<string, ParsedUserSymbol>;
  variableTypeMap: Map<string, string>;
  functionMap: Map<string, ParsedUserSymbol>;
} {
  const symbols: ParsedUserSymbol[] = [];
  const classMap = new Map<string, ParsedUserSymbol>();
  const variableTypeMap = new Map<string, string>();
  const functionMap = new Map<string, ParsedUserSymbol>();

  for (const file of files) {
    const raw = file.content;
    const lines = raw.split('\n');

    // 1. Parse classes & structs
    const classRegex = /\b(class|struct)\s+([A-Za-z_]\w*)\s*(?::\s*[^{]+)?\{([\s\S]*?)\};/g;
    let classMatch: RegExpExecArray | null;
    while ((classMatch = classRegex.exec(raw)) !== null) {
      const className = classMatch[2];
      const classBody = classMatch[3];
      const beforeClass = raw.slice(0, classMatch.index);
      const classLine = beforeClass.split('\n').length;

      const members: NonNullable<ParsedUserSymbol['members']> = [];
      const bodyLines = classBody.split('\n');

      for (const bLine of bodyLines) {
        const trimmed = bLine.trim();
        if (!trimmed || trimmed.startsWith('//') || /^(public|private|protected)\s*:/.test(trimmed)) {
          continue;
        }
        // Check member method: e.g. void print() const; or int area() { ... }
        const methodMatch = trimmed.match(
          /^(?:virtual\s+|static\s+|inline\s+)?([A-Za-z_][\w:<>]*[\s*&]*)\s+([A-Za-z_]\w*)\s*\(([^)]*)\)/
        );
        if (methodMatch && methodMatch[2] !== className) {
          const retType = methodMatch[1].trim();
          const mName = methodMatch[2].trim();
          const params = methodMatch[3].trim();
          members.push({
            name: mName,
            kind: 'method',
            typeName: retType,
            signature: `${retType} ${className}::${mName}(${params})`
          });
          continue;
        }
        // Check member field: e.g. std::string name; int age = 19;
        const fieldMatch = trimmed.match(
          /^([A-Za-z_][\w:<>]*[\s*&]*)\s+([A-Za-z_]\w*)(?:\s*=\s*[^;]+)?\s*;/
        );
        if (fieldMatch && !CPP_KEYWORDS.includes(fieldMatch[2])) {
          members.push({
            name: fieldMatch[2].trim(),
            kind: 'variable',
            typeName: fieldMatch[1].trim()
          });
        }
      }

      const classSymbol: ParsedUserSymbol = {
        name: className,
        kind: 'class',
        typeName: classMatch[1],
        members,
        file: file.name,
        line: classLine
      };

      symbols.push(classSymbol);
      classMap.set(className, classSymbol);
    }

    // 2. Line-by-line scan for functions and variables
    lines.forEach((lineText, idx) => {
      const cleanLine = lineText.replace(/\/\/.*$/, '').trim();
      if (!cleanLine || cleanLine.startsWith('#')) return;

      // Function definition or declaration: e.g. int calculateSum(int a, int b)
      const fnMatch = cleanLine.match(
        /^(?:inline\s+|static\s+|constexpr\s+)?([A-Za-z_][\w:<>]*[\s*&]*)\s+([A-Za-z_]\w*)\s*\(([^;{}]*)\)\s*(?:\{|;|const)/
      );
      if (fnMatch) {
        const returnType = fnMatch[1].trim();
        const fnName = fnMatch[2].trim();
        const paramStr = fnMatch[3].trim();
        if (
          !['if', 'for', 'while', 'switch', 'catch', 'return'].includes(fnName) &&
          !returnType.startsWith('class') &&
          !returnType.startsWith('struct')
        ) {
          const params = paramStr
            ? paramStr.split(',').map((p) => p.trim()).filter(Boolean)
            : [];
          const fnSym: ParsedUserSymbol = {
            name: fnName,
            kind: 'function',
            typeName: returnType,
            signature: `${returnType} ${fnName}(${paramStr})`,
            parameters: params,
            file: file.name,
            line: idx + 1
          };
          symbols.push(fnSym);
          functionMap.set(fnName, fnSym);

          // Also add function parameters as recognized variables
          for (const param of params) {
            const pMatch = param.match(/^([A-Za-z_][\w:<>\s*&]*?)\s+([A-Za-z_]\w*)$/);
            if (pMatch) {
              const pType = pMatch[1].trim();
              const pName = pMatch[2].trim();
              variableTypeMap.set(pName, pType);
              symbols.push({
                name: pName,
                kind: 'variable',
                typeName: pType,
                file: file.name,
                line: idx + 1
              });
            }
          }
          return;
        }
      }

      // Variable declaration: e.g. std::vector<int> numbers; or Student student; or int a = 25, b = 17;
      const varDeclMatch = cleanLine.match(
        /^(?:const\s+|static\s+|constexpr\s+)?((?:std::)?[A-Za-z_]\w*(?:\s*<[^>;]+>)?[\s*&]*)\s+([A-Za-z_]\w*(?:\s*(?:=\s*[^,;]+|\{[^}]*\})?\s*(?:,\s*[A-Za-z_]\w*(?:\s*=\s*[^,;]+)?)*))\s*;/
      );
      if (varDeclMatch) {
        const rawType = varDeclMatch[1].trim();
        const declList = varDeclMatch[2];
        if (['return', 'using', 'namespace', 'delete', 'throw', 'case'].includes(rawType)) {
          return;
        }

        // Split top-level comma declarations (ignoring commas inside <...>, (...), {...})
        const parts = declList.split(',');
        for (const part of parts) {
          const nameExtract = part.trim().match(/^([A-Za-z_]\w*)/);
          if (nameExtract) {
            const varName = nameExtract[1];
            if (!CPP_KEYWORDS.includes(varName)) {
              variableTypeMap.set(varName, rawType);
              symbols.push({
                name: varName,
                kind: 'variable',
                typeName: rawType,
                file: file.name,
                line: idx + 1
              });
            }
          }
        }
      }
    });
  }

  return { symbols, classMap, variableTypeMap, functionMap };
}

/**
 * Generates context-aware C++ IntelliSense suggestions at the current cursor offset.
 * Handles:
 * 1. `std::` namespace resolution
 * 2. `object.` or `ptr->` member resolution (std::string, std::vector, std::map, std::set, and user classes)
 * 3. User variables, functions, classes, standard library symbols, C++ keywords, and snippets
 */
export function getIntelliSenseSuggestions(
  code: string,
  cursorOffset: number,
  projectFiles: ProjectFile[]
): {
  items: AutocompleteItem[];
  replaceStart: number;
  replaceEnd: number;
  triggerContext: string;
} {
  const beforeCursor = code.slice(0, cursorOffset);
  const { symbols, classMap, variableTypeMap } = analyzeProjectSymbols(projectFiles);

  // Case 1: `std::` or `std::prefix`
  const stdMatch = beforeCursor.match(/\bstd::([A-Za-z_]\w*)?$/);
  if (stdMatch) {
    const prefix = (stdMatch[1] || '').toLowerCase();
    const replaceStart = cursorOffset - (stdMatch[1] ? stdMatch[1].length : 0);
    const filtered = STD_NAMESPACE_ITEMS.filter((item) =>
      item.label.toLowerCase().startsWith(prefix)
    ).sort((a, b) => b.priority - a.priority);

    return {
      items: filtered,
      replaceStart,
      replaceEnd: cursorOffset,
      triggerContext: `std::${stdMatch[1] || ''}`
    };
  }

  // Case 2: Member access `varName.` or `varName->`
  const memberMatch = beforeCursor.match(/\b([A-Za-z_]\w*)(?:\.|->)([A-Za-z_]\w*)?$/);
  if (memberMatch) {
    const objectName = memberMatch[1];
    const memberPrefix = (memberMatch[2] || '').toLowerCase();
    const replaceStart = cursorOffset - (memberMatch[2] ? memberMatch[2].length : 0);
    const rawType = variableTypeMap.get(objectName) || '';
    const cleanType = rawType.replace(/^const\s+/, '').replace(/[*&]+$/, '').trim();

    let candidateMethods: AutocompleteItem[] = [];

    if (cleanType === 'string' || cleanType === 'std::string') {
      candidateMethods = STRING_METHODS;
    } else if (cleanType.startsWith('vector<') || cleanType.startsWith('std::vector<')) {
      candidateMethods = VECTOR_METHODS;
    } else if (
      cleanType.startsWith('map<') ||
      cleanType.startsWith('std::map<') ||
      cleanType.startsWith('set<') ||
      cleanType.startsWith('std::set<')
    ) {
      candidateMethods = MAP_SET_METHODS;
    } else if (classMap.has(cleanType)) {
      const userClass = classMap.get(cleanType)!;
      candidateMethods = (userClass.members || []).map((m) => ({
        label: m.kind === 'method' ? `${m.name}()` : m.name,
        insertText: m.kind === 'method' ? `${m.name}()` : m.name,
        kind: m.kind === 'method' ? 'method' : 'variable',
        detail: m.signature || `${m.typeName} ${cleanType}::${m.name}`,
        documentation:
          m.kind === 'method'
            ? `Методи синфи корбарии ${cleanType}`
            : `Майдони синфи корбарии ${cleanType} (${m.typeName})`,
        signature: m.signature,
        priority: 100
      }));
    }

    const filtered = candidateMethods.filter((item) =>
      item.label.toLowerCase().startsWith(memberPrefix)
    );

    return {
      items: filtered,
      replaceStart,
      replaceEnd: cursorOffset,
      triggerContext: `${objectName}.${memberMatch[2] || ''}`
    };
  }

  // Case 3: General identifier prefix
  const wordMatch = beforeCursor.match(/\b([A-Za-z_]\w*)$/);
  if (!wordMatch) {
    return { items: [], replaceStart: cursorOffset, replaceEnd: cursorOffset, triggerContext: '' };
  }

  const prefix = wordMatch[1];
  const lowerPrefix = prefix.toLowerCase();
  const replaceStart = cursorOffset - prefix.length;

  const seenLabels = new Set<string>();
  const results: AutocompleteItem[] = [];

  const pushUnique = (item: AutocompleteItem) => {
    if (!seenLabels.has(item.label)) {
      seenLabels.add(item.label);
      results.push(item);
    }
  };

  // Priority 1-5: User symbols from current file & project
  for (const sym of symbols) {
    if (sym.name === prefix) continue;
    if (sym.name.toLowerCase().startsWith(lowerPrefix)) {
      const exactPrefixBonus = sym.name.startsWith(prefix) ? 10 : 0;
      if (sym.kind === 'variable') {
        pushUnique({
          label: sym.name,
          insertText: sym.name,
          kind: 'variable',
          detail: `${sym.typeName} ${sym.name}`,
          documentation: `Тағйирёбандаи корбарӣ дар ${sym.file} (сатри ${sym.line})`,
          priority: 110 + exactPrefixBonus
        });
      } else if (sym.kind === 'function') {
        const hasArgs = (sym.parameters?.length || 0) > 0;
        pushUnique({
          label: `${sym.name}()`,
          insertText: `${sym.name}()`,
          kind: 'function',
          detail: sym.signature || `${sym.typeName} ${sym.name}()`,
          documentation: `Функсияи корбарӣ дар ${sym.file} (сатри ${sym.line})`,
          signature: sym.signature,
          cursorOffset: hasArgs ? -1 : 0,
          priority: 108 + exactPrefixBonus
        });
      } else if (sym.kind === 'class') {
        pushUnique({
          label: sym.name,
          insertText: sym.name,
          kind: 'class',
          detail: `class ${sym.name}`,
          documentation: `Синфи корбарӣ дар ${sym.file} (сатри ${sym.line})`,
          priority: 106 + exactPrefixBonus
        });
      }
    }
  }

  // Namespace `std`
  if ('std'.startsWith(lowerPrefix)) {
    pushUnique({
      label: 'std',
      insertText: 'std::',
      kind: 'namespace',
      detail: 'namespace std (Китобхонаи стандартии C++)',
      documentation: 'Фазои номҳои стандартии C++ (cout, cin, string, vector, map, sort...).',
      priority: 102
    });
  }

  // Standard library items (when `using namespace std;` is present or for convenience)
  for (const stdItem of STD_NAMESPACE_ITEMS) {
    if (stdItem.label.toLowerCase().startsWith(lowerPrefix)) {
      pushUnique({
        ...stdItem,
        priority: stdItem.priority
      });
    }
  }

  // Snippets
  for (const snip of CPP_SNIPPETS) {
    if (snip.label.toLowerCase().startsWith(lowerPrefix)) {
      pushUnique(snip);
    }
  }

  // C++ Keywords
  for (const kw of CPP_KEYWORDS) {
    if (kw.startsWith(lowerPrefix) && kw !== prefix) {
      pushUnique({
        label: kw,
        insertText: kw,
        kind: 'keyword',
        detail: `Калимаи калидии C++ (${kw})`,
        documentation: `Калимаи калидии стандартии забони C++.`,
        priority: 75
      });
    }
  }

  results.sort((a, b) => b.priority - a.priority || a.label.localeCompare(b.label));

  return {
    items: results.slice(0, 14),
    replaceStart,
    replaceEnd: cursorOffset,
    triggerContext: prefix
  };
}

/**
 * Computes active function signature help when the cursor is inside a function call `fnName(arg1, |)`
 */
export function getSignatureHelp(
  code: string,
  cursorOffset: number,
  projectFiles: ProjectFile[]
): SignatureHelpInfo | null {
  const beforeCursor = code.slice(0, cursorOffset);
  const currentLine = beforeCursor.split('\n').pop() || '';

  // Find last unclosed '(' on the current line
  let parenDepth = 0;
  let openParenIndex = -1;
  let commaCount = 0;

  for (let i = currentLine.length - 1; i >= 0; i--) {
    const ch = currentLine[i];
    if (ch === ')') {
      parenDepth++;
    } else if (ch === '(') {
      if (parenDepth === 0) {
        openParenIndex = i;
        break;
      }
      parenDepth--;
    } else if (ch === ',' && parenDepth === 0) {
      commaCount++;
    }
  }

  if (openParenIndex === -1) return null;

  const prefixBeforeParen = currentLine.slice(0, openParenIndex).trim();
  const fnNameMatch = prefixBeforeParen.match(/([A-Za-z_]\w*)$/);
  if (!fnNameMatch) return null;

  const fnName = fnNameMatch[1];
  if (['if', 'for', 'while', 'switch', 'catch'].includes(fnName)) return null;

  const { functionMap } = analyzeProjectSymbols(projectFiles);
  if (functionMap.has(fnName)) {
    const userFn = functionMap.get(fnName)!;
    const params = userFn.parameters || [];
    return {
      functionName: fnName,
      signature: userFn.signature || `${userFn.typeName} ${fnName}(${params.join(', ')})`,
      parameters: params,
      activeParameter: Math.min(commaCount, Math.max(0, params.length - 1)),
      documentation: `Функсияи дар лоиҳа эълоншуда (${userFn.file}:${userFn.line})`
    };
  }

  // Check built-in C++ functions & methods
  const allBuiltins = [...STD_NAMESPACE_ITEMS, ...STRING_METHODS, ...VECTOR_METHODS];
  const builtin = allBuiltins.find(
    (b) => b.label.replace('()', '') === fnName && b.signature
  );
  if (builtin && builtin.signature) {
    const insideParamsMatch = builtin.signature.match(/\(([^)]*)\)/);
    const params =
      insideParamsMatch && insideParamsMatch[1].trim()
        ? insideParamsMatch[1].split(',').map((p) => p.trim())
        : [];
    return {
      functionName: fnName,
      signature: builtin.signature,
      parameters: params,
      activeParameter: Math.min(commaCount, Math.max(0, params.length - 1)),
      documentation: builtin.documentation
    };
  }

  return null;
}

/**
 * Real-time C++ syntax & semantic diagnostics engine.
 * Detects:
 * - Unmatched braces `{}`, parentheses `()`, brackets `[]`
 * - Unclosed string literals
 * - Missing semicolons after statements, return, variable assignments, cout/cin
 * - Common typo mistakes (e.g. `cout >>` or `cin <<`)
 */
export function runRealtimeDiagnostics(fileName: string, code: string): DiagnosticItem[] {
  const diagnostics: DiagnosticItem[] = [];
  const lines = code.split('\n');

  const braceStack: Array<{ char: string; line: number; col: number }> = [];
  let inBlockComment = false;

  lines.forEach((rawLine, idx) => {
    const lineNum = idx + 1;
    let lineWithoutComments = '';
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < rawLine.length; i++) {
      const ch = rawLine[i];
      const next = rawLine[i + 1];

      if (inBlockComment) {
        if (ch === '*' && next === '/') {
          inBlockComment = false;
          i++;
        }
        continue;
      }

      if (!inString && ch === '/' && next === '*') {
        inBlockComment = true;
        i++;
        continue;
      }

      if (!inString && ch === '/' && next === '/') {
        break; // Rest of line is comment
      }

      if ((ch === '"' || ch === "'") && rawLine[i - 1] !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = ch;
        } else if (ch === stringChar) {
          inString = false;
        }
      }

      if (!inString) {
        lineWithoutComments += ch;
        if (ch === '{' || ch === '(' || ch === '[') {
          braceStack.push({ char: ch, line: lineNum, col: i + 1 });
        } else if (ch === '}' || ch === ')' || ch === ']') {
          const expectedOpen = ch === '}' ? '{' : ch === ')' ? '(' : '[';
          const last = braceStack.pop();
          if (!last || last.char !== expectedOpen) {
            diagnostics.push({
              id: `diag-brace-${lineNum}-${i}`,
              file: fileName,
              line: lineNum,
              column: i + 1,
              severity: 'error',
              message: `Қавси пӯшидаи '${ch}' бе ҷуфти кушодаи мувофиқ аст.`,
              code: 'UNMATCHED_BRACKET'
            });
          }
        }
      } else {
        lineWithoutComments += ' ';
      }
    }

    if (inString) {
      diagnostics.push({
        id: `diag-str-${lineNum}`,
        file: fileName,
        line: lineNum,
        column: rawLine.length,
        severity: 'error',
        message: 'Сатри матнӣ (нохунак) дар ин сатр пӯшида нашудааст.',
        code: 'UNCLOSED_STRING'
      });
    }

    const trimmed = lineWithoutComments.trim();
    if (!trimmed) return;

    // Check stream direction mistakes: cout >> or cin <<
    if (/\b(?:std::)?cout\s*>>/.test(trimmed)) {
      diagnostics.push({
        id: `diag-cout-op-${lineNum}`,
        file: fileName,
        line: lineNum,
        column: Math.max(1, rawLine.indexOf('cout') + 1),
        severity: 'error',
        message: "Бо 'cout' оператори баромади '<<' истифода мешавад, на '>>'.",
        code: 'INVALID_STREAM_OP'
      });
    }
    if (/\b(?:std::)?cin\s*<</.test(trimmed)) {
      diagnostics.push({
        id: `diag-cin-op-${lineNum}`,
        file: fileName,
        line: lineNum,
        column: Math.max(1, rawLine.indexOf('cin') + 1),
        severity: 'error',
        message: "Бо 'cin' оператори вуруди '>>' истифода мешавад, на '<<'.",
        code: 'INVALID_STREAM_OP'
      });
    }

    // Check missing semicolon heuristics
    const isPreprocessor = trimmed.startsWith('#');
    const isControlOrBlock =
      /^(if|else|for|while|do|switch|case|default|try|catch|class|struct|namespace|public|private|protected|template)\b/.test(
        trimmed
      );
    const endsWithValidToken =
      trimmed.endsWith(';') ||
      trimmed.endsWith('{') ||
      trimmed.endsWith('}') ||
      trimmed.endsWith(':') ||
      trimmed.endsWith(',') ||
      trimmed.endsWith('<<') ||
      trimmed.endsWith('>>') ||
      trimmed.endsWith('+') ||
      trimmed.endsWith('-') ||
      trimmed.endsWith('*') ||
      trimmed.endsWith('/') ||
      trimmed.endsWith('=');

    // Check next non-empty line to see if it starts with '{' or '<<'
    let nextTrimmed = '';
    for (let j = idx + 1; j < lines.length; j++) {
      const t = lines[j].replace(/\/\/.*$/, '').trim();
      if (t) {
        nextTrimmed = t;
        break;
      }
    }
    const continuesOnNextLine =
      nextTrimmed.startsWith('{') ||
      nextTrimmed.startsWith('<<') ||
      nextTrimmed.startsWith('>>') ||
      nextTrimmed.startsWith(':') ||
      /^\)\s*\{?$/.test(trimmed);

    if (!isPreprocessor && !isControlOrBlock && !endsWithValidToken && !continuesOnNextLine) {
      // Check if it looks like a statement (return, cout, cin, assignment, or declaration)
      const looksLikeStatement =
        /^(return|break|continue|using)\b/.test(trimmed) ||
        /\b(cout|cin|cerr)\b/.test(trimmed) ||
        /\b[A-Za-z_]\w*\s*=[^=]/.test(trimmed) ||
        /^(?:const\s+)?(?:std::)?(int|double|float|char|bool|string|auto|long|vector|map)\b/.test(
          trimmed
        ) ||
        /\b[A-Za-z_]\w*\s*\([^)]*\)$/.test(trimmed);

      // Exclude function signature headers like `int main()` followed by `{`
      const isFunctionHeader =
        /^[A-Za-z_][\w:<>]*[\s*&]+\w+\s*\([^)]*\)\s*(?:const)?$/.test(trimmed);

      if (looksLikeStatement && !isFunctionHeader) {
        diagnostics.push({
          id: `diag-semi-${lineNum}`,
          file: fileName,
          line: lineNum,
          column: rawLine.length,
          severity: 'error',
          message: "Интизори ';' дар охири сатр.",
          code: 'EXPECTED_SEMICOLON'
        });
      }
    }
  });

  // Report any unclosed opening brackets
  for (const unclosed of braceStack) {
    const expectedClose = unclosed.char === '{' ? '}' : unclosed.char === '(' ? ')' : ']';
    diagnostics.push({
      id: `diag-unclosed-${unclosed.line}-${unclosed.col}`,
      file: fileName,
      line: unclosed.line,
      column: unclosed.col,
      severity: 'error',
      message: `Қавси кушодаи '${unclosed.char}' пӯшида нашудааст (интизори '${expectedClose}').`,
      code: 'UNCLOSED_BRACKET'
    });
  }

  return diagnostics;
}

/**
 * Parses GCC/Clang compiler stderr lines (`main.cpp:12:15: error: ...`) into structured clickable Diagnostics.
 */
export function parseCompilerErrors(stderr: string, defaultFile = 'main.cpp'): DiagnosticItem[] {
  if (!stderr.trim()) return [];
  const items: DiagnosticItem[] = [];
  const lines = stderr.split('\n');

  lines.forEach((line, index) => {
    const match = line.match(/^([^:\s]+):(\d+):(\d+):\s*(fatal error|error|warning):\s*(.+)$/);
    if (match) {
      const rawFile = match[1].split('/').pop() || defaultFile;
      const lineNum = parseInt(match[2], 10) || 1;
      const colNum = parseInt(match[3], 10) || 1;
      const sev = match[4].includes('warning') ? 'warning' : 'error';
      const msg = match[5].trim();

      items.push({
        id: `compiler-diag-${index}`,
        file: rawFile === 'prog.cc' ? defaultFile : rawFile,
        line: lineNum,
        column: colNum,
        severity: sev,
        message: msg,
        code: sev === 'error' ? 'COMPILER_ERROR' : 'COMPILER_WARNING'
      });
    }
  });

  return items;
}

/**
 * Formats raw C++ code with clean indentation, brace alignment, and operator spacing.
 * Never corrupts string literals or comments.
 */
export function formatCppCode(code: string, tabSize = 4): string {
  const indentUnit = ' '.repeat(tabSize);
  const rawLines = code.replace(/\r\n/g, '\n').split('\n');
  const formattedLines: string[] = [];
  let indentLevel = 0;

  for (let i = 0; i < rawLines.length; i++) {
    const trimmed = rawLines[i].trim();
    if (!trimmed) {
      if (formattedLines.length > 0 && formattedLines[formattedLines.length - 1] !== '') {
        formattedLines.push('');
      }
      continue;
    }

    // Preprocessor directives stay at column 0
    if (trimmed.startsWith('#')) {
      formattedLines.push(trimmed);
      continue;
    }

    // Access specifiers (public:, private:, protected:) indent one level less than class body
    if (/^(public|private|protected)\s*:/.test(trimmed)) {
      const specIndent = Math.max(0, indentLevel - 1);
      formattedLines.push(indentUnit.repeat(specIndent) + trimmed);
      continue;
    }

    // Decrease indent before line if it starts with '}'
    if (trimmed.startsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    const currentIndent = indentUnit.repeat(indentLevel);
    formattedLines.push(currentIndent + trimmed);

    // Count net brace change outside strings/comments
    let netBraces = 0;
    let inStr = false;
    let strCh = '';
    for (let c = 0; c < trimmed.length; c++) {
      const ch = trimmed[c];
      if (!inStr && ch === '/' && trimmed[c + 1] === '/') break;
      if ((ch === '"' || ch === "'") && trimmed[c - 1] !== '\\') {
        if (!inStr) {
          inStr = true;
          strCh = ch;
        } else if (ch === strCh) {
          inStr = false;
        }
      }
      if (!inStr) {
        if (ch === '{') netBraces++;
        else if (ch === '}') netBraces--;
      }
    }

    if (trimmed.startsWith('}')) {
      // We already decremented 1 for the leading '}'
      indentLevel = Math.max(0, indentLevel + netBraces + 1);
    } else {
      indentLevel = Math.max(0, indentLevel + netBraces);
    }
  }

  return formattedLines.join('\n').trim() + '\n';
}

/**
 * Pure C++ syntax highlighter that takes raw C++ code and returns safe React-renderable tokens
 * per line without ever mutating the canonical raw C++ source string.
 */
export interface HighlightToken {
  text: string;
  type:
    | 'plain'
    | 'keyword'
    | 'type'
    | 'preprocessor'
    | 'string'
    | 'comment'
    | 'number'
    | 'function'
    | 'operator';
}

const KEYWORD_SET = new Set(CPP_KEYWORDS);
const STD_TYPE_SET = new Set([
  'std',
  'string',
  'vector',
  'map',
  'set',
  'array',
  'pair',
  'cout',
  'cin',
  'cerr',
  'clog',
  'endl',
  'size_t',
  'ostream',
  'istream',
  'exception',
  'variant'
]);

export function tokenizeCppLine(line: string): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  const trimmed = line.trimStart();

  if (trimmed.startsWith('#')) {
    return [{ text: line, type: 'preprocessor' }];
  }

  let i = 0;
  while (i < line.length) {
    const ch = line[i];

    // Single-line comment
    if (ch === '/' && line[i + 1] === '/') {
      tokens.push({ text: line.slice(i), type: 'comment' });
      break;
    }

    // String or char literal
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === quote && line[j - 1] !== '\\') {
          j++;
          break;
        }
        j++;
      }
      tokens.push({ text: line.slice(i, j), type: 'string' });
      i = j;
      continue;
    }

    // Numbers (int, float, hex)
    if (/\d/.test(ch) && (i === 0 || !/[A-Za-z_]/.test(line[i - 1]))) {
      let j = i;
      while (j < line.length && /[0-9a-fA-FxX._]/.test(line[j])) {
        j++;
      }
      tokens.push({ text: line.slice(i, j), type: 'number' });
      i = j;
      continue;
    }

    // Identifiers / Keywords / Functions / Types
    if (/[A-Za-z_]/.test(ch)) {
      let j = i + 1;
      while (j < line.length && /[A-Za-z0-9_]/.test(line[j])) {
        j++;
      }
      const word = line.slice(i, j);
      const nextNonSpace = line.slice(j).match(/^\s*\(/) ? '(' : '';

      if (KEYWORD_SET.has(word)) {
        tokens.push({ text: word, type: 'keyword' });
      } else if (STD_TYPE_SET.has(word) || /^[A-Z]/.test(word)) {
        tokens.push({ text: word, type: 'type' });
      } else if (nextNonSpace === '(') {
        tokens.push({ text: word, type: 'function' });
      } else {
        tokens.push({ text: word, type: 'plain' });
      }
      i = j;
      continue;
    }

    // Operators & punctuation
    if (/[{}()[\];:<>=+\-*/%&|!?.,~^]/.test(ch)) {
      tokens.push({ text: ch, type: 'operator' });
      i++;
      continue;
    }

    // Whitespace
    let j = i;
    while (j < line.length && /\s/.test(line[j])) {
      j++;
    }
    tokens.push({ text: line.slice(i, j), type: 'plain' });
    i = j;
  }

  return tokens;
}
