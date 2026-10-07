import React, { useEffect, useRef, useState } from 'react';
import {
  AutocompleteItem,
  DiagnosticItem,
  EditorSettings,
  ProjectFile,
  SignatureHelpInfo
} from '../types/ide';
import {
  getIntelliSenseSuggestions,
  getSignatureHelp,
  tokenizeCppLine
} from '../utils/cppEngine';
import { TranslationDictionary } from '../data/i18n';
import { Search, Replace, X, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface CppEditorProps {
  file: ProjectFile;
  projectFiles: ProjectFile[];
  settings: EditorSettings;
  diagnostics: DiagnosticItem[];
  t: TranslationDictionary;
  onChange: (newContent: string) => void;
  onSave: () => void;
  onRun: () => void;
  onCursorChange: (line: number, col: number, charCount: number) => void;
  onSuggestionsChange: (items: AutocompleteItem[], selectedIndex: number, onAccept: (item: AutocompleteItem) => void) => void;
  externalJumpLine?: { line: number; timestamp: number } | null;
  showSearchBar: boolean;
  setShowSearchBar: (val: boolean) => void;
}

const MOBILE_SYMBOLS = [
  '{', '}', '(', ')', '[', ']', ';', ':', '#include',
  '<', '>', '=', '==', '!=', '+', '-', '*', '/', '%',
  '"', "'", '_', '&', '|', '!', '?', 'std::', 'cout', 'cin', 'endl'
];

const KIND_BADGE: Record<AutocompleteItem['kind'], { label: string; colorClass: string }> = {
  variable: { label: 'var', colorClass: 'text-sky-400 border-sky-500/30 bg-sky-500/10' },
  function: { label: 'fn', colorClass: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  class: { label: 'class', colorClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  method: { label: 'method', colorClass: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  namespace: { label: 'ns', colorClass: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
  keyword: { label: 'kw', colorClass: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
  snippet: { label: 'snip', colorClass: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' },
  type: { label: 'type', colorClass: 'text-teal-400 border-teal-500/30 bg-teal-500/10' }
};

export const CppEditor: React.FC<CppEditorProps> = ({
  file,
  projectFiles,
  settings,
  diagnostics,
  t,
  onChange,
  onSave,
  onRun,
  onCursorChange,
  onSuggestionsChange,
  externalJumpLine,
  showSearchBar,
  setShowSearchBar
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const preRef = useRef<HTMLPreElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);

  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol, setCursorCol] = useState(1);

  // IntelliSense Popup State
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [replaceRange, setReplaceRange] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const [signatureHelp, setSignatureHelp] = useState<SignatureHelpInfo | null>(null);
  const [popupCoords, setPopupCoords] = useState<{ top: number; left: number }>({ top: 44, left: 64 });

  // Search & Replace State
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);

  // Undo / Redo History per file
  const historyRef = useRef<{ stack: string[]; index: number; fileId: string }>({
    stack: [file.content],
    index: 0,
    fileId: file.id
  });

  useEffect(() => {
    if (historyRef.current.fileId !== file.id) {
      historyRef.current = {
        stack: [file.content],
        index: 0,
        fileId: file.id
      };
      setSuggestions([]);
      setSignatureHelp(null);
    }
  }, [file.id, file.content]);

  const pushHistory = (newCode: string) => {
    const h = historyRef.current;
    if (h.stack[h.index] === newCode) return;
    const nextStack = h.stack.slice(0, h.index + 1);
    nextStack.push(newCode);
    if (nextStack.length > 80) nextStack.shift();
    h.stack = nextStack;
    h.index = nextStack.length - 1;
  };

  // Handle jump to line from Errors panel
  useEffect(() => {
    if (!externalJumpLine || !textareaRef.current) return;
    const lines = file.content.split('\n');
    const targetLine = Math.max(1, Math.min(externalJumpLine.line, lines.length));
    let charOffset = 0;
    for (let i = 0; i < targetLine - 1; i++) {
      charOffset += lines[i].length + 1;
    }
    const lineEnd = charOffset + (lines[targetLine - 1]?.length || 0);
    const ta = textareaRef.current;
    ta.focus();
    ta.setSelectionRange(charOffset, lineEnd);
    const lineHeight = Math.round(settings.fontSize * 1.65);
    ta.scrollTop = Math.max(0, (targetLine - 4) * lineHeight);
    updateCursorMetrics(ta);
  }, [externalJumpLine]);

  const updateCursorMetrics = (ta: HTMLTextAreaElement) => {
    const selStart = ta.selectionStart || 0;
    const before = ta.value.slice(0, selStart);
    const linesBefore = before.split('\n');
    const ln = linesBefore.length;
    const col = (linesBefore[linesBefore.length - 1]?.length || 0) + 1;
    setCursorLine(ln);
    setCursorCol(col);
    onCursorChange(ln, col, ta.value.length);

    // Calculate approximate popup position near cursor
    const lineHeight = Math.round(settings.fontSize * 1.65);
    const charWidth = settings.fontSize * 0.6;
    const rawTop = ln * lineHeight - ta.scrollTop + 8;
    const rawLeft = Math.min(260, Math.max(16, (col - 1) * charWidth - ta.scrollLeft + 52));
    setPopupCoords({
      top: Math.max(36, Math.min(rawTop, (ta.clientHeight || 300) - 150)),
      left: rawLeft
    });
  };

  const evaluateIntelliSense = (code: string, cursorOffset: number) => {
    if (!settings.intelliSense) {
      setSuggestions([]);
      setSignatureHelp(null);
      onSuggestionsChange([], 0, () => {});
      return;
    }

    const updatedFiles = projectFiles.map((pf) =>
      pf.id === file.id ? { ...pf, content: code } : pf
    );

    const { items, replaceStart, replaceEnd } = getIntelliSenseSuggestions(
      code,
      cursorOffset,
      updatedFiles
    );
    setSuggestions(items);
    setSelectedIndex(0);
    setReplaceRange({ start: replaceStart, end: replaceEnd });

    const sig = getSignatureHelp(code, cursorOffset, updatedFiles);
    setSignatureHelp(sig);
  };

  const acceptSuggestion = (item: AutocompleteItem) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const currentCode = file.content;
    const before = currentCode.slice(0, replaceRange.start);
    const after = currentCode.slice(replaceRange.end);

    // Indent multi-line snippets to match current line indentation
    const currentLinePrefix = before.split('\n').pop() || '';
    const leadingSpaces = currentLinePrefix.match(/^\s*/)?.[0] || '';
    const indentedInsert = item.insertText
      .split('\n')
      .map((line, i) => (i === 0 ? line : leadingSpaces + line))
      .join('\n');

    const nextCode = before + indentedInsert + after;
    pushHistory(nextCode);
    onChange(nextCode);
    setSuggestions([]);

    const targetCursor =
      before.length +
      indentedInsert.length +
      (item.cursorOffset ? item.cursorOffset : 0);

    requestAnimationFrame(() => {
      if (!textareaRef.current) return;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(targetCursor, targetCursor);
      updateCursorMetrics(textareaRef.current);
      if (item.insertText.endsWith('::') || item.insertText.endsWith('(')) {
        evaluateIntelliSense(nextCode, targetCursor);
      }
    });
  };

  useEffect(() => {
    onSuggestionsChange(suggestions, selectedIndex, acceptSuggestion);
  }, [suggestions, selectedIndex, replaceRange]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = scrollTop;
    }
  };

  const insertTextAtCursor = (textToInsert: string, cursorBackOffset = 0) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart || 0;
    const end = ta.selectionEnd || 0;
    const nextCode = file.content.slice(0, start) + textToInsert + file.content.slice(end);
    pushHistory(nextCode);
    onChange(nextCode);

    const newPos = start + textToInsert.length + cursorBackOffset;
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(newPos, newPos);
      updateCursorMetrics(ta);
      evaluateIntelliSense(nextCode, newPos);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;
    const start = ta.selectionStart || 0;
    const end = ta.selectionEnd || 0;

    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toLowerCase();
      if (key === 's') {
        e.preventDefault();
        onSave();
        return;
      }
      if (key === 'enter') {
        e.preventDefault();
        onRun();
        return;
      }
      if (key === 'f' || key === 'h') {
        e.preventDefault();
        setShowSearchBar(true);
        return;
      }
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        const h = historyRef.current;
        if (h.index > 0) {
          h.index--;
          onChange(h.stack[h.index]);
        }
        return;
      }
      if (key === 'y' || (key === 'z' && e.shiftKey)) {
        e.preventDefault();
        const h = historyRef.current;
        if (h.index < h.stack.length - 1) {
          h.index++;
          onChange(h.stack[h.index]);
        }
        return;
      }
      if (key === '/') {
        // Toggle single-line comment `//`
        e.preventDefault();
        const lines = file.content.split('\n');
        const before = file.content.slice(0, start).split('\n');
        const lineIdx = before.length - 1;
        const currentLine = lines[lineIdx] || '';
        if (currentLine.trimStart().startsWith('//')) {
          lines[lineIdx] = currentLine.replace(/\/\/\s?/, '');
        } else {
          lines[lineIdx] = '// ' + currentLine;
        }
        const nextCode = lines.join('\n');
        pushHistory(nextCode);
        onChange(nextCode);
        return;
      }
    }

    // IntelliSense navigation when popup is open
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        acceptSuggestion(suggestions[selectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setSuggestions([]);
        return;
      }
    }

    // Tab indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const spaces = ' '.repeat(settings.tabSize);
      insertTextAtCursor(spaces);
      return;
    }

    // Smart Enter indentation
    if (e.key === 'Enter') {
      e.preventDefault();
      const before = file.content.slice(0, start);
      const after = file.content.slice(end);
      const currentLine = before.split('\n').pop() || '';
      const currentIndent = currentLine.match(/^\s*/)?.[0] || '';
      const trimmedLine = currentLine.trimEnd();
      const extraIndent =
        trimmedLine.endsWith('{') ||
        trimmedLine.endsWith(':') ||
        /^(if|for|while|else)\b.*[^{;]$/.test(trimmedLine.trim())
          ? ' '.repeat(settings.tabSize)
          : '';

      if (trimmedLine.endsWith('{') && after.trimStart().startsWith('}')) {
        // Expand `{|}` into indented block
        const insertStr = `\n${currentIndent}${extraIndent}\n${currentIndent}`;
        const nextCode = before + insertStr + after;
        pushHistory(nextCode);
        onChange(nextCode);
        const newPos = before.length + 1 + currentIndent.length + extraIndent.length;
        requestAnimationFrame(() => {
          ta.setSelectionRange(newPos, newPos);
          updateCursorMetrics(ta);
        });
        return;
      }

      insertTextAtCursor(`\n${currentIndent}${extraIndent}`);
      return;
    }

    // Auto-closing brackets & quotes
    if (settings.autoClosing && start === end) {
      const pairs: Record<string, string> = {
        '{': '}',
        '(': ')',
        '[': ']',
        '"': '"',
        "'": "'"
      };
      if (pairs[e.key]) {
        const nextChar = file.content[start];
        // Skip over closing quote if already there
        if ((e.key === '"' || e.key === "'") && nextChar === e.key) {
          e.preventDefault();
          ta.setSelectionRange(start + 1, start + 1);
          return;
        }
        e.preventDefault();
        insertTextAtCursor(e.key + pairs[e.key], -1);
        return;
      }
      if ([')', '}', ']'].includes(e.key) && file.content[start] === e.key) {
        e.preventDefault();
        ta.setSelectionRange(start + 1, start + 1);
        return;
      }
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart || 0;
    pushHistory(val);
    onChange(val);
    updateCursorMetrics(e.target);
    evaluateIntelliSense(val, cursor);
  };

  // Search & Replace handlers
  const handleFindNext = (direction: 1 | -1 = 1) => {
    if (!searchQuery || !textareaRef.current) return;
    const ta = textareaRef.current;
    const source = caseSensitive ? file.content : file.content.toLowerCase();
    const target = caseSensitive ? searchQuery : searchQuery.toLowerCase();

    let idx = -1;
    if (direction === 1) {
      idx = source.indexOf(target, ta.selectionEnd || 0);
      if (idx === -1) idx = source.indexOf(target, 0);
    } else {
      const from = Math.max(0, (ta.selectionStart || 0) - 1);
      idx = source.lastIndexOf(target, from);
      if (idx === -1) idx = source.lastIndexOf(target);
    }

    if (idx !== -1) {
      ta.focus();
      ta.setSelectionRange(idx, idx + searchQuery.length);
      updateCursorMetrics(ta);
    }
  };

  const handleReplaceCurrent = () => {
    if (!searchQuery || !textareaRef.current) return;
    const ta = textareaRef.current;
    const start = ta.selectionStart || 0;
    const end = ta.selectionEnd || 0;
    const selectedText = file.content.slice(start, end);
    const matches = caseSensitive
      ? selectedText === searchQuery
      : selectedText.toLowerCase() === searchQuery.toLowerCase();

    if (matches) {
      const nextCode = file.content.slice(0, start) + replaceQuery + file.content.slice(end);
      pushHistory(nextCode);
      onChange(nextCode);
      requestAnimationFrame(() => {
        ta.setSelectionRange(start, start + replaceQuery.length);
        handleFindNext(1);
      });
    } else {
      handleFindNext(1);
    }
  };

  const handleReplaceAll = () => {
    if (!searchQuery) return;
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, caseSensitive ? 'g' : 'gi');
    const nextCode = file.content.replace(regex, replaceQuery);
    pushHistory(nextCode);
    onChange(nextCode);
  };

  const lines = file.content.split('\n');
  const fileDiagnosticsMap = new Map<number, DiagnosticItem>();
  for (const d of diagnostics) {
    if (d.file === file.name && !fileDiagnosticsMap.has(d.line)) {
      fileDiagnosticsMap.set(d.line, d);
    }
  }

  const lineHeightPx = Math.round(settings.fontSize * 1.65);

  const tokenColorClass = (type: string) => {
    if (settings.theme === 'yusuf-light') {
      switch (type) {
        case 'keyword': return 'text-purple-700 font-semibold';
        case 'type': return 'text-teal-700 font-medium';
        case 'preprocessor': return 'text-pink-700 font-medium';
        case 'string': return 'text-emerald-700';
        case 'comment': return 'text-slate-400 italic';
        case 'number': return 'text-amber-700';
        case 'function': return 'text-blue-700';
        case 'operator': return 'text-slate-600';
        default: return 'text-slate-900';
      }
    }
    switch (type) {
      case 'keyword': return 'text-purple-400 font-medium';
      case 'type': return 'text-teal-300';
      case 'preprocessor': return 'text-pink-400';
      case 'string': return 'text-emerald-300';
      case 'comment': return 'text-slate-500 italic';
      case 'number': return 'text-amber-300';
      case 'function': return 'text-sky-300';
      case 'operator': return 'text-slate-300';
      default: return 'text-slate-100';
    }
  };

  const activeDiagnostic = fileDiagnosticsMap.get(cursorLine);

  return (
    <div className="relative flex flex-col flex-1 min-h-0 select-none overflow-hidden">
      {/* Search & Replace Bar */}
      {showSearchBar && (
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-slate-900/95 border-b border-slate-800 text-xs z-30">
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-md px-2 py-1">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className="bg-transparent text-slate-100 focus:outline-none w-32 sm:w-44"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setCaseSensitive(!caseSensitive)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                caseSensitive ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Case Sensitive (Aa)"
            >
              Aa
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleFindNext(-1)}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
              title="Previous"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleFindNext(1)}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
              title="Next"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-md px-2 py-1">
            <Replace className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              placeholder={t.replace}
              className="bg-transparent text-slate-100 focus:outline-none w-28 sm:w-36"
            />
          </div>
          <button
            type="button"
            onClick={handleReplaceCurrent}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium whitespace-nowrap"
          >
            {t.replace}
          </button>
          <button
            type="button"
            onClick={handleReplaceAll}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium whitespace-nowrap"
          >
            {t.replaceAll}
          </button>
          <button
            type="button"
            onClick={() => setShowSearchBar(false)}
            className="ml-auto p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Editor Canvas (Gutter + Highlighted Pre + Transparent Textarea) */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        {/* Line Numbers Gutter */}
        {settings.lineNumbers && (
          <div
            ref={gutterRef}
            className={`w-12 sm:w-14 shrink-0 overflow-hidden select-none py-3 text-right pr-3 font-mono tabular-nums border-r ${
              settings.theme === 'yusuf-light'
                ? 'bg-slate-100 border-slate-200 text-slate-400'
                : 'bg-[#090D16] border-slate-800/80 text-slate-500'
            }`}
            style={{ fontSize: `${settings.fontSize}px`, lineHeight: `${lineHeightPx}px` }}
          >
            {lines.map((_, i) => {
              const ln = i + 1;
              const diag = fileDiagnosticsMap.get(ln);
              const isCurrent = ln === cursorLine;
              return (
                <div
                  key={ln}
                  className={`relative flex items-center justify-end ${
                    isCurrent
                      ? settings.theme === 'yusuf-light'
                        ? 'text-slate-900 font-semibold'
                        : 'text-sky-400 font-semibold'
                      : ''
                  }`}
                  style={{ height: `${lineHeightPx}px` }}
                >
                  {diag && (
                    <span
                      className="w-2 h-2 rounded-full bg-rose-500 mr-1.5 shrink-0"
                      title={diag.message}
                    />
                  )}
                  <span>{ln}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Code Viewport */}
        <div className="relative flex-1 min-h-0 overflow-hidden">
          {/* Syntax Highlighted Mirror Layer */}
          <pre
            ref={preRef}
            aria-hidden="true"
            className={`absolute inset-0 m-0 py-3 px-4 font-mono pointer-events-none overflow-hidden ${
              settings.wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
            }`}
            style={{
              fontSize: `${settings.fontSize}px`,
              lineHeight: `${lineHeightPx}px`,
              tabSize: settings.tabSize
            }}
          >
            {lines.map((lineText, idx) => {
              const ln = idx + 1;
              const isCurrent = ln === cursorLine;
              const diag = fileDiagnosticsMap.get(ln);
              const tokens = tokenizeCppLine(lineText);

              return (
                <div
                  key={ln}
                  className={`relative ${
                    diag
                      ? 'bg-rose-500/10 underline decoration-wavy decoration-rose-500/80'
                      : isCurrent
                      ? settings.theme === 'yusuf-light'
                        ? 'bg-sky-500/10'
                        : 'bg-slate-800/45'
                      : ''
                  }`}
                  style={{ minHeight: `${lineHeightPx}px` }}
                >
                  {tokens.length === 0 ? (
                    '\u00A0'
                  ) : (
                    tokens.map((tok, tIdx) => (
                      <span key={tIdx} className={tokenColorClass(tok.type)}>
                        {tok.text}
                      </span>
                    ))
                  )}
                </div>
              );
            })}
          </pre>

          {/* Canonical Raw C++ Textarea Input Layer */}
          <textarea
            ref={textareaRef}
            value={file.content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            onClick={(e) => {
              updateCursorMetrics(e.currentTarget);
              evaluateIntelliSense(e.currentTarget.value, e.currentTarget.selectionStart || 0);
            }}
            onKeyUp={(e) => {
              if (['ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) {
                updateCursorMetrics(e.currentTarget);
              }
            }}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            wrap={settings.wordWrap ? 'soft' : 'off'}
            aria-label="C++ Code Editor"
            className={`absolute inset-0 w-full h-full m-0 py-3 px-4 font-mono bg-transparent text-transparent caret-sky-400 resize-none focus:outline-none overflow-auto selection:bg-sky-500/30 ${
              settings.wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
            }`}
            style={{
              fontSize: `${settings.fontSize}px`,
              lineHeight: `${lineHeightPx}px`,
              tabSize: settings.tabSize
            }}
          />

          {/* Function Signature Help Floating Banner */}
          {signatureHelp && (
            <div
              className="absolute z-30 max-w-md px-3 py-2 rounded-lg bg-slate-900/95 border border-sky-500/40 shadow-xl text-xs pointer-events-none"
              style={{
                top: Math.max(8, popupCoords.top - 48),
                left: popupCoords.left
              }}
            >
              <div className="font-mono text-slate-200">
                <span>{signatureHelp.functionName}(</span>
                {signatureHelp.parameters.map((param, idx) => (
                  <React.Fragment key={idx}>
                    <span
                      className={
                        idx === signatureHelp.activeParameter
                          ? 'text-sky-300 font-bold underline decoration-sky-400'
                          : 'text-slate-400'
                      }
                    >
                      {param}
                    </span>
                    {idx < signatureHelp.parameters.length - 1 ? ', ' : ''}
                  </React.Fragment>
                ))}
                <span>)</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{signatureHelp.documentation}</div>
            </div>
          )}

          {/* Floating IntelliSense Autocomplete Menu */}
          {suggestions.length > 0 && (
            <div
              className="absolute z-30 w-72 sm:w-80 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700/90 shadow-2xl overflow-hidden"
              style={{
                top: popupCoords.top + 20,
                left: popupCoords.left
              }}
            >
              <div className="max-h-52 overflow-y-auto divide-y divide-slate-800/60">
                {suggestions.map((item, idx) => {
                  const badge = KIND_BADGE[item.kind];
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={`${item.label}-${idx}`}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent losing textarea focus
                        acceptSuggestion(item);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-left text-xs font-mono transition-colors ${
                        isSelected
                          ? 'bg-sky-500/20 text-white'
                          : 'text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`px-1.5 py-0.2 text-[10px] rounded border uppercase tracking-wider shrink-0 ${badge.colorClass}`}
                        >
                          {badge.label}
                        </span>
                        <span className="truncate font-medium">{item.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 truncate ml-2 max-w-[110px]">
                        {item.detail}
                      </span>
                    </button>
                  );
                })}
              </div>
              {suggestions[selectedIndex] && (
                <div className="px-3 py-2 bg-slate-950/90 border-t border-slate-800 text-[11px] text-slate-300">
                  <div className="font-mono text-sky-300 truncate">
                    {suggestions[selectedIndex].detail}
                  </div>
                  <div className="text-slate-400 mt-0.5 line-clamp-2">
                    {suggestions[selectedIndex].documentation}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active Line Diagnostic Banner (if cursor is on an error line) */}
      {activeDiagnostic && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-950/80 border-t border-rose-500/30 text-rose-200 text-xs">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="font-semibold">{t.syntaxErrorTitle}</span>
          <span>·</span>
          <span className="font-mono">
            {t.lineLabel} {activeDiagnostic.line}
          </span>
          <span>·</span>
          <span className="truncate">{activeDiagnostic.message}</span>
        </div>
      )}

      {/* Mobile Touch Coding Symbol Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-[#090D16] border-t border-slate-800/90 overflow-x-auto no-scrollbar shrink-0">
        {MOBILE_SYMBOLS.map((sym) => (
          <button
            key={sym}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              if (sym === '#include') {
                insertTextAtCursor('#include <iostream>\n');
              } else {
                insertTextAtCursor(sym);
              }
            }}
            className="min-h-[36px] min-w-[36px] px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 active:bg-sky-500/30 text-slate-100 font-mono text-xs font-medium border border-slate-700/70 shrink-0 flex items-center justify-center transition-colors"
          >
            {sym}
          </button>
        ))}
      </div>
    </div>
  );
};
