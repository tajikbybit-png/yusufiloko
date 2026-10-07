export type LanguageCode = 'tg' | 'ru' | 'en';
export type ThemeMode = 'yusuf-dark' | 'yusuf-light' | 'midnight' | 'high-contrast';
export type CppStandard = 'c++17' | 'c++20' | 'c++23';
export type OptimizationLevel = '-O0' | '-O2' | '-O3';

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  language: 'cpp' | 'h';
  content: string;
  updatedAt: number;
  isUnsaved?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  templateId: string;
  createdAt: number;
  updatedAt: number;
  files: ProjectFile[];
  stdin?: string;
}

export interface EditorSettings {
  fontSize: number;
  fontFamily: 'JetBrains Mono' | 'Fira Code' | 'monospace';
  tabSize: 2 | 4;
  insertSpaces: boolean;
  wordWrap: boolean;
  lineNumbers: boolean;
  bracketMatching: boolean;
  autoClosing: boolean;
  intelliSense: boolean;
  diagnostics: boolean;
  cppStandard: CppStandard;
  optimization: OptimizationLevel;
  warnings: boolean;
  theme: ThemeMode;
  autosave: boolean;
  formatOnSave: boolean;
  confirmBeforeDelete: boolean;
  confirmUnsavedClose: boolean;
}

export type ExecutionStatus =
  | 'ready'
  | 'compiling'
  | 'compiled_success'
  | 'running'
  | 'completed'
  | 'compile_error'
  | 'runtime_error'
  | 'timeout'
  | 'stopped';

export interface CompileResult {
  success: boolean;
  phase?: string;
  stdout: string;
  stderr: string;
  compilerOutput?: string;
  exitCode: number;
  timeMs: number;
  timestamp: number;
}

export interface DiagnosticItem {
  id: string;
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning';
  message: string;
  code: string;
}

export type SuggestionKind =
  | 'variable'
  | 'function'
  | 'class'
  | 'method'
  | 'namespace'
  | 'keyword'
  | 'snippet'
  | 'type';

export interface AutocompleteItem {
  label: string;
  insertText: string;
  kind: SuggestionKind;
  detail: string;
  documentation: string;
  signature?: string;
  cursorOffset?: number; // offset from end of inserted text
  priority: number;
}

export interface SignatureHelpInfo {
  functionName: string;
  signature: string;
  parameters: string[];
  activeParameter: number;
  documentation: string;
}

export interface CppLesson {
  id: string;
  number: number;
  title: string;
  category: string;
  explanation: string;
  keyPoints: string[];
  exampleCode: string;
  expectedOutput: string;
  exercisePrompt: string;
  starterCode: string;
  expectedExerciseOutput: string;
  stdinForTest?: string;
}

export interface CppExample {
  id: string;
  title: string;
  description: string;
  category: string;
  files: Array<{ name: string; content: string }>;
  stdin?: string;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}
