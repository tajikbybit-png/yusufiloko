import React, { useState } from 'react';
import {
  CompileResult,
  DiagnosticItem,
  ExecutionStatus,
  ProjectFile
} from '../types/ide';
import { TranslationDictionary } from '../data/i18n';
import {
  Terminal as TerminalIcon,
  Play,
  Trash2,
  Copy,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  CornerDownLeft
} from 'lucide-react';

interface BottomPanelsProps {
  activeTab: 'output' | 'input' | 'errors' | 'terminal';
  setActiveTab: (tab: 'output' | 'input' | 'errors' | 'terminal') => void;
  compileResult: CompileResult | null;
  executionStatus: ExecutionStatus;
  stdin: string;
  onStdinChange: (val: string) => void;
  diagnostics: DiagnosticItem[];
  projectFiles: ProjectFile[];
  t: TranslationDictionary;
  onClearOutput: () => void;
  onCopyOutput: () => void;
  onJumpToError: (file: string, line: number) => void;
  onRunProgram: () => void;
  onFormatCode: () => void;
}

interface TerminalEntry {
  id: string;
  command?: string;
  output: string;
  type: 'info' | 'success' | 'error';
}

export const BottomPanels: React.FC<BottomPanelsProps> = ({
  activeTab,
  setActiveTab,
  compileResult,
  executionStatus,
  stdin,
  onStdinChange,
  diagnostics,
  projectFiles,
  t,
  onClearOutput,
  onCopyOutput,
  onJumpToError,
  onRunProgram,
  onFormatCode
}) => {
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<TerminalEntry[]>([
    {
      id: 'init-1',
      output: `${t.terminalWelcome}\n${t.terminalPromptHelp}`,
      type: 'info'
    }
  ]);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawCmd = terminalInput.trim();
    if (!rawCmd) return;
    setTerminalInput('');

    const cmd = rawCmd.toLowerCase();
    const blockedCmds = ['rm', 'sudo', 'format', 'shutdown', 'reboot', 'kill', 'bash', 'sh', 'chmod', 'chown'];

    if (blockedCmds.some((b) => cmd === b || cmd.startsWith(`${b} `))) {
      setTerminalHistory((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          command: rawCmd,
          output: '❌ Амният: Фармонҳои системавии OS дар терминали муҳофизатшудаи YUSUF CODE манъ аст.',
          type: 'error'
        }
      ]);
      return;
    }

    if (cmd === 'clear' || cmd === 'cls') {
      setTerminalHistory([]);
      return;
    }

    if (cmd === 'run' || cmd === 'build') {
      setTerminalHistory((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          command: rawCmd,
          output: '▶ Оғози компилятсия ва иҷрои барномаи C++ (g++ -std=c++17 -O2)...',
          type: 'success'
        }
      ]);
      onRunProgram();
      return;
    }

    if (cmd === 'format') {
      onFormatCode();
      setTerminalHistory((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          command: rawCmd,
          output: '✓ Коди C++ бомуваффақият формат карда шуд.',
          type: 'success'
        }
      ]);
      return;
    }

    if (cmd === 'files' || cmd === 'ls') {
      const list = projectFiles.map((f) => `${f.name} (${f.content.length} байт)`).join('\n');
      setTerminalHistory((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          command: rawCmd,
          output: list || 'Ягон файл нест.',
          type: 'info'
        }
      ]);
      return;
    }

    if (cmd === 'status') {
      setTerminalHistory((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          command: rawCmd,
          output: `Ҳолат: ${executionStatus} | Файлҳо: ${projectFiles.length} | Хатоҳо: ${diagnostics.length}`,
          type: 'info'
        }
      ]);
      return;
    }

    if (cmd === 'version' || cmd === 'g++ --version') {
      setTerminalHistory((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          command: rawCmd,
          output: 'YUSUF CODE C++ Engine v1.0.0 — GCC 13.2 (C++17 / C++20 / C++23 Sandboxed)',
          type: 'info'
        }
      ]);
      return;
    }

    if (cmd === 'help') {
      setTerminalHistory((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          command: rawCmd,
          output:
            'Фармонҳои идорашавандаи IDE:\n' +
            '  build   — Компилятсия ва иҷрои лоиҳаи ҷорӣ\n' +
            '  run     — Иҷрои барномаи C++\n' +
            '  format  — Формат кардани коди фаъол\n' +
            '  files   — Рӯйхати файлҳои лоиҳа\n' +
            '  status  — Ҳолати компилятор ва ташхиси хатоҳо\n' +
            '  version — Маълумот дар бораи компилятори C++\n' +
            '  clear   — Тоза кардани равзанаи терминал',
          type: 'info'
        }
      ]);
      return;
    }

    setTerminalHistory((prev) => [
      ...prev,
      {
        id: `cmd-${Date.now()}`,
        command: rawCmd,
        output: `Фармони номаълум: '${rawCmd}'. Барои дидани рӯйхати фармонҳо 'help' нависед.`,
        type: 'error'
      }
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-[#090D16] border-t border-slate-800/90 text-xs select-text">
      {/* Panel Header Tabs */}
      <div className="flex items-center justify-between px-3 h-9 bg-[#0B0F19] border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('output')}
            className={`px-3 py-1.5 font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'output'
                ? 'border-sky-400 text-sky-300 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.output}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('input')}
            className={`px-3 py-1.5 font-medium transition-colors whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
              activeTab === 'input'
                ? 'border-sky-400 text-sky-300 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{t.input}</span>
            {stdin.trim().length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('errors')}
            className={`px-3 py-1.5 font-medium transition-colors whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
              activeTab === 'errors'
                ? 'border-sky-400 text-sky-300 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{t.errors}</span>
            {diagnostics.length > 0 && (
              <span className="font-mono text-[11px] text-rose-400 font-semibold tabular-nums">
                ({diagnostics.length})
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terminal')}
            className={`px-3 py-1.5 font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'terminal'
                ? 'border-sky-400 text-sky-300 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.terminal}
          </button>
        </div>

        {/* Contextual Actions on Right */}
        {activeTab === 'output' && compileResult && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono tabular-nums">
              <Clock className="w-3 h-3 text-slate-500" />
              {compileResult.timeMs} ms · {t.exitCodeLabel}: {compileResult.exitCode}
            </span>
            <button
              type="button"
              onClick={onCopyOutput}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              title={t.copyOutput}
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClearOutput}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              title={t.clearOutput}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Tab Body Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 font-mono">
        {activeTab === 'output' && (
          <div className="h-full">
            {executionStatus === 'compiling' || executionStatus === 'running' ? (
              <div className="flex items-center gap-2.5 text-sky-300 py-2">
                <div className="w-4 h-4 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
                <span>{t.statusCompiling}</span>
              </div>
            ) : !compileResult ? (
              <div className="text-slate-500 font-sans py-2 flex items-center gap-2">
                <Play className="w-3.5 h-3.5 text-slate-600" />
                <span>{t.stdoutEmpty}</span>
              </div>
            ) : (
              <div className="space-y-2">
                {compileResult.stdout && (
                  <pre className="whitespace-pre-wrap break-words text-slate-100 leading-relaxed">
                    {compileResult.stdout}
                  </pre>
                )}
                {compileResult.stderr && (
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-200">
                    <div className="text-[11px] font-semibold text-rose-400 mb-1">
                      ❌ {t.statusCompileError} / {t.errors}:
                    </div>
                    <pre className="whitespace-pre-wrap break-words text-[11px] leading-relaxed">
                      {compileResult.stderr}
                    </pre>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800/70 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 tabular-nums">
                  <span className={compileResult.exitCode === 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {compileResult.exitCode === 0 ? '✓' : '❌'} {t.exitCodeLabel}: {compileResult.exitCode}
                  </span>
                  <span>·</span>
                  <span>
                    {t.execTimeLabel}: {compileResult.timeMs} ms
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'input' && (
          <div className="flex flex-col h-full gap-1.5">
            <div className="text-[11px] text-slate-400 font-sans flex items-center justify-between">
              <span>{t.stdinHelper}</span>
              <span className="font-mono text-slate-500">stdin</span>
            </div>
            <textarea
              value={stdin}
              onChange={(e) => onStdinChange(e.target.value)}
              placeholder={t.stdinPlaceholder}
              className="flex-1 w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-sky-500/60 focus:outline-none text-slate-100 font-mono text-xs resize-none"
            />
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="space-y-1.5">
            {diagnostics.length === 0 ? (
              <div className="flex items-center gap-2 text-emerald-400 font-sans py-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.noErrorsFound}</span>
              </div>
            ) : (
              diagnostics.map((diag) => (
                <button
                  key={diag.id}
                  type="button"
                  onClick={() => onJumpToError(diag.file, diag.line)}
                  className="w-full flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800/90 text-left transition-colors"
                >
                  <AlertTriangle
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      diag.severity === 'error' ? 'text-rose-400' : 'text-amber-400'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-sky-300">
                        {diag.file}:{diag.line}:{diag.column}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-[11px] text-slate-400">{diag.code}</span>
                    </div>
                    <div className="text-slate-200 font-sans mt-0.5 break-words">
                      {diag.message}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {activeTab === 'terminal' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 space-y-2 overflow-y-auto pb-2">
              {terminalHistory.map((item) => (
                <div key={item.id} className="space-y-1">
                  {item.command && (
                    <div className="flex items-center gap-1.5 text-sky-400">
                      <span>$</span>
                      <span className="text-slate-100">{item.command}</span>
                    </div>
                  )}
                  <pre
                    className={`whitespace-pre-wrap break-words text-[11px] leading-relaxed ${
                      item.type === 'error'
                        ? 'text-rose-400'
                        : item.type === 'success'
                        ? 'text-emerald-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {item.output}
                  </pre>
                </div>
              ))}
            </div>
            <form
              onSubmit={handleTerminalSubmit}
              className="flex items-center gap-2 pt-2 border-t border-slate-800/80 shrink-0"
            >
              <TerminalIcon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0 -ml-1" />
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="build, run, files, format, status, clear, help..."
                className="flex-1 bg-transparent text-slate-100 focus:outline-none text-xs font-mono"
              />
              <button
                type="submit"
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1"
              >
                <CornerDownLeft className="w-3 h-3" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
