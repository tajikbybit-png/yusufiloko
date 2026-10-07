import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AutocompleteItem,
  CompileResult,
  DiagnosticItem,
  EditorSettings,
  ExecutionStatus,
  LanguageCode,
  Project,
  ProjectFile,
  ToastNotification
} from './types/ide';
import { translations } from './data/i18n';
import { createInitialProjects, PROJECT_TEMPLATES } from './data/lessonsAndTemplates';
import {
  exportProjectAsZip,
  importProjectFromZip,
  loadLanguage,
  loadProjectsFromDB,
  loadSettings,
  loadWorkspaceState,
  sanitizeFileName,
  saveLanguage,
  saveProjectsToDB,
  saveSettings,
  saveWorkspaceState
} from './utils/storage';
import {
  formatCppCode,
  parseCompilerErrors,
  runRealtimeDiagnostics
} from './utils/cppEngine';
import { CppEditor } from './components/CppEditor';
import { BottomPanels } from './components/BottomPanels';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LessonsModal } from './components/LessonsModal';
import {
  AboutModal,
  CommandPaletteModal,
  NewProjectModal,
  SettingsModal
} from './components/Modals';
import {
  Play,
  Square,
  Save,
  FolderOpen,
  FilePlus,
  FileCode2,
  Trash2,
  Copy,
  Download,
  Upload,
  Settings,
  BookOpen,
  Menu,
  X,
  Search,
  Sparkles,
  Home,
  Info,
  Edit3
} from 'lucide-react';

export function App() {
  // Localization (Default: Tajik 'tg')
  const [language, setLanguage] = useState<LanguageCode>(() => loadLanguage());
  const t = translations[language];

  // Settings
  const [settings, setSettings] = useState<EditorSettings>(() => loadSettings());

  // Projects & Workspace State (Synchronously seeded so UI renders on frame 0 even if IndexedDB is blocked)
  const [initialSeeds] = useState<Project[]>(() => createInitialProjects());
  const [projects, setProjects] = useState<Project[]>(initialSeeds);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    () => initialSeeds[0]?.id || null
  );
  const [activeFileId, setActiveFileId] = useState<string | null>(
    () => initialSeeds[0]?.files[0]?.id || null
  );
  const [openTabIds, setOpenTabIds] = useState<string[]>(() =>
    initialSeeds[0]?.files[0]?.id ? [initialSeeds[0].files[0].id] : []
  );
  const [showWelcome, setShowWelcome] = useState<boolean>(false);

  // Mobile Drawers & Modals
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLessonsModal, setShowLessonsModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);

  // Inline File Creation / Renaming Modal state
  const [filePromptMode, setFilePromptMode] = useState<
    | null
    | { type: 'new-file' }
    | { type: 'rename-file'; fileId: string; currentName: string }
    | { type: 'rename-project'; projectId: string; currentName: string }
  >(null);
  const [promptInputVal, setPromptInputVal] = useState('');

  // Unsaved file close confirmation
  const [unsavedCloseTargetId, setUnsavedCloseTargetId] = useState<string | null>(null);

  // Delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<
    | null
    | { type: 'file'; fileId: string; name: string }
    | { type: 'project'; projectId: string; name: string }
  >(null);

  // Editor & Compiler State
  const [cursorMetrics, setCursorMetrics] = useState({ line: 1, col: 1, chars: 0 });
  const [bottomTab, setBottomTab] = useState<'output' | 'input' | 'errors' | 'terminal'>('output');
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>('ready');
  const [compileResult, setCompileResult] = useState<CompileResult | null>(null);
  const [compilerDiagnostics, setCompilerDiagnostics] = useState<DiagnosticItem[]>([]);
  const [externalJumpLine, setExternalJumpLine] = useState<{ line: number; timestamp: number } | null>(null);

  // Right IntelliSense Sidebar State
  const [liveSuggestions, setLiveSuggestions] = useState<{
    items: AutocompleteItem[];
    selectedIndex: number;
    onAccept: (item: AutocompleteItem) => void;
  }>({ items: [], selectedIndex: 0, onAccept: () => {} });

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const zipInputRef = useRef<HTMLInputElement | null>(null);

  const addToast = (type: ToastNotification['type'], message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-2), { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3200);
  };

  // Load persisted projects from IndexedDB on mount
  useEffect(() => {
    loadProjectsFromDB().then((loaded) => {
      setProjects(loaded);
      const savedWorkspace = loadWorkspaceState();
      if (savedWorkspace && savedWorkspace.activeProjectId) {
        const foundProj = loaded.find((p) => p.id === savedWorkspace.activeProjectId) || loaded[0];
        if (foundProj) {
          setActiveProjectId(foundProj.id);
          const validTabs = savedWorkspace.openTabIds.filter((tid) =>
            foundProj.files.some((f) => f.id === tid)
          );
          const tabsToUse = validTabs.length > 0 ? validTabs : [foundProj.files[0].id];
          setOpenTabIds(tabsToUse);
          setActiveFileId(
            foundProj.files.some((f) => f.id === savedWorkspace.activeFileId)
              ? savedWorkspace.activeFileId
              : tabsToUse[0]
          );
          setShowWelcome(Boolean(savedWorkspace.showWelcome));
          return;
        }
      }
      // First-time launch: open the default project ready to run immediately
      if (loaded.length > 0) {
        const first = loaded[0];
        setActiveProjectId(first.id);
        setOpenTabIds([first.files[0].id]);
        setActiveFileId(first.files[0].id);
        setShowWelcome(false);
      }
    });
  }, []);

  // Persist workspace state whenever project/tabs change
  useEffect(() => {
    if (!activeProjectId) return;
    saveWorkspaceState({
      activeProjectId,
      activeFileId,
      openTabIds,
      showWelcome
    });
  }, [activeProjectId, activeFileId, openTabIds, showWelcome]);

  // Global keyboard shortcut for Command Palette (Ctrl+Shift+P)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) || null,
    [projects, activeProjectId]
  );

  const activeFile = useMemo(
    () => activeProject?.files.find((f) => f.id === activeFileId) || activeProject?.files[0] || null,
    [activeProject, activeFileId]
  );

  // Combine real-time syntax diagnostics + compiler stderr diagnostics
  const allDiagnostics = useMemo(() => {
    if (!activeProject) return [];
    const realtime: DiagnosticItem[] = [];
    if (settings.diagnostics) {
      for (const f of activeProject.files) {
        realtime.push(...runRealtimeDiagnostics(f.name, f.content));
      }
    }
    return [...compilerDiagnostics, ...realtime];
  }, [activeProject, settings.diagnostics, compilerDiagnostics]);

  const handleUpdateSettings = (partial: Partial<EditorSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  };

  const handleChangeLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    saveLanguage(lang);
  };

  const updateActiveFileContent = (newContent: string) => {
    if (!activeProject || !activeFile) return;
    setCompilerDiagnostics([]); // Clear stale compiler errors while editing

    setProjects((prev) => {
      const next = prev.map((proj) => {
        if (proj.id !== activeProject.id) return proj;
        return {
          ...proj,
          updatedAt: Date.now(),
          files: proj.files.map((f) =>
            f.id === activeFile.id
              ? {
                  ...f,
                  content: newContent,
                  updatedAt: Date.now(),
                  isUnsaved: !settings.autosave
                }
              : f
          )
        };
      });
      if (settings.autosave) {
        saveProjectsToDB(next);
      }
      return next;
    });
  };

  const handleSaveProject = () => {
    if (!activeProject) return;
    setProjects((prev) => {
      const next = prev.map((proj) => {
        if (proj.id !== activeProject.id) return proj;
        return {
          ...proj,
          updatedAt: Date.now(),
          files: proj.files.map((f) => ({
            ...f,
            content:
              settings.formatOnSave && f.id === activeFile?.id
                ? formatCppCode(f.content, settings.tabSize)
                : f.content,
            isUnsaved: false
          }))
        };
      });
      saveProjectsToDB(next);
      return next;
    });
    addToast('success', t.toastProjectSaved);
  };

  const handleFormatActiveFile = () => {
    if (!activeFile) return;
    const formatted = formatCppCode(activeFile.content, settings.tabSize);
    updateActiveFileContent(formatted);
    addToast('info', t.toastFormatted);
  };

  const handleRunOrStop = async () => {
    if (executionStatus === 'compiling' || executionStatus === 'running') {
      // Stop running compilation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setExecutionStatus('stopped');
      return;
    }

    if (!activeProject || activeProject.files.length === 0) return;

    // Auto-save before compiling
    saveProjectsToDB(projects);

    setExecutionStatus('compiling');
    setBottomTab('output');
    setCompilerDiagnostics([]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: 'cpp',
          standard: settings.cppStandard,
          optimization: settings.optimization,
          warnings: settings.warnings,
          files: activeProject.files.map((f) => ({
            name: f.name,
            content: f.content
          })),
          stdin: activeProject.stdin || ''
        }),
        signal: controller.signal
      });

      const data = await response.json();
      const result: CompileResult = {
        success: Boolean(data.success),
        phase: data.phase,
        stdout: data.stdout || '',
        stderr: data.stderr || '',
        compilerOutput: data.compilerOutput || '',
        exitCode: data.exitCode ?? 0,
        timeMs: data.timeMs ?? 0,
        timestamp: Date.now()
      };

      setCompileResult(result);

      if (result.stderr) {
        const parsedErrs = parseCompilerErrors(
          result.stderr,
          activeFile?.name || 'main.cpp'
        );
        setCompilerDiagnostics(parsedErrs);
      }

      if (result.success) {
        setExecutionStatus('completed');
        addToast('success', t.toastCompileSuccess);
      } else if (data.phase === 'timeout') {
        setExecutionStatus('timeout');
        addToast('error', t.statusTimeout);
      } else if (data.phase === 'runtime_error') {
        setExecutionStatus('runtime_error');
        addToast('error', t.statusRuntimeError);
      } else {
        setExecutionStatus('compile_error');
        addToast('error', t.toastCompileFailed);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setExecutionStatus('stopped');
      } else {
        setExecutionStatus('compile_error');
        setCompileResult({
          success: false,
          stdout: '',
          stderr: 'Ҳангоми пайвастшавӣ ба сервери компилятор хато ба вуҷуд омад.',
          exitCode: 1,
          timeMs: 0,
          timestamp: Date.now()
        });
        addToast('error', t.toastCompileFailed);
      }
    }
  };

  // Project Management Handlers
  const handleCreateProject = (name: string, templateId: string) => {
    const tpl =
      PROJECT_TEMPLATES.find((item) => item.id === templateId) || PROJECT_TEMPLATES[0];
    const now = Date.now();
    const newFiles: ProjectFile[] = tpl.files.map((f, idx) => ({
      id: `file-${now}-${idx}`,
      name: f.name,
      path: f.name,
      language: f.name.endsWith('.h') || f.name.endsWith('.hpp') ? 'h' : 'cpp',
      content: f.content,
      updatedAt: now
    }));

    const newProj: Project = {
      id: `proj-${now}`,
      name,
      description: tpl.description,
      templateId: tpl.id,
      createdAt: now,
      updatedAt: now,
      stdin: tpl.stdin || '',
      files: newFiles
    };

    const nextProjects = [newProj, ...projects];
    setProjects(nextProjects);
    saveProjectsToDB(nextProjects);
    setActiveProjectId(newProj.id);
    setOpenTabIds([newFiles[0].id]);
    setActiveFileId(newFiles[0].id);
    setShowNewProjectModal(false);
    setShowWelcome(false);
    setCompileResult(null);
    addToast('success', t.toastProjectSaved);
  };

  const handleSelectProject = (projectId: string) => {
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;
    setActiveProjectId(target.id);
    const firstFileId = target.files[0]?.id || null;
    setOpenTabIds(firstFileId ? [firstFileId] : []);
    setActiveFileId(firstFileId);
    setShowWelcome(false);
    setCompileResult(null);
    setCompilerDiagnostics([]);
    setMobileDrawerOpen(false);
  };

  const handleDuplicateProject = (projectId: string) => {
    const source = projects.find((p) => p.id === projectId);
    if (!source) return;
    const now = Date.now();
    const copyFiles = source.files.map((f, i) => ({
      ...f,
      id: `file-dup-${now}-${i}`,
      updatedAt: now
    }));
    const dupProj: Project = {
      ...source,
      id: `proj-dup-${now}`,
      name: `${source.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
      files: copyFiles
    };
    const next = [dupProj, ...projects];
    setProjects(next);
    saveProjectsToDB(next);
    addToast('success', t.toastProjectSaved);
  };

  const handleDeleteProjectConfirm = (projectId: string) => {
    const target = projects.find((p) => p.id === projectId);
    if (!target || projects.length <= 1) return;
    if (settings.confirmBeforeDelete) {
      setDeleteTarget({ type: 'project', projectId, name: target.name });
    } else {
      executeDeleteProject(projectId);
    }
  };

  const executeDeleteProject = (projectId: string) => {
    const remaining = projects.filter((p) => p.id !== projectId);
    if (remaining.length === 0) return;
    setProjects(remaining);
    saveProjectsToDB(remaining);
    if (activeProjectId === projectId) {
      handleSelectProject(remaining[0].id);
    }
    setDeleteTarget(null);
  };

  // File Management Handlers
  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filePromptMode || !activeProject) return;

    if (filePromptMode.type === 'new-file') {
      const safeName = sanitizeFileName(promptInputVal);
      if (!safeName) return;
      if (activeProject.files.some((f) => f.name.toLowerCase() === safeName.toLowerCase())) {
        addToast('warning', 'Файл бо чунин ном аллакай мавҷуд аст.');
        return;
      }
      const now = Date.now();
      const isHeader = safeName.endsWith('.h') || safeName.endsWith('.hpp');
      const newFile: ProjectFile = {
        id: `file-${now}`,
        name: safeName,
        path: safeName,
        language: isHeader ? 'h' : 'cpp',
        content: isHeader
          ? `#pragma once\n\n// ${safeName}\n`
          : `#include <iostream>\n\n// ${safeName}\n`,
        updatedAt: now
      };

      const nextProjects = projects.map((p) =>
        p.id === activeProject.id
          ? { ...p, updatedAt: now, files: [...p.files, newFile] }
          : p
      );
      setProjects(nextProjects);
      saveProjectsToDB(nextProjects);
      setOpenTabIds((prev) => (prev.includes(newFile.id) ? prev : [...prev, newFile.id]));
      setActiveFileId(newFile.id);
      setFilePromptMode(null);
      addToast('success', t.toastFileCreated);
    } else if (filePromptMode.type === 'rename-file') {
      const safeName = sanitizeFileName(promptInputVal);
      if (!safeName) return;
      if (
        activeProject.files.some(
          (f) => f.id !== filePromptMode.fileId && f.name.toLowerCase() === safeName.toLowerCase()
        )
      ) {
        addToast('warning', 'Файл бо чунин ном аллакай мавҷуд аст.');
        return;
      }
      const nextProjects = projects.map((p) =>
        p.id === activeProject.id
          ? {
              ...p,
              files: p.files.map((f) =>
                f.id === filePromptMode.fileId
                  ? {
                      ...f,
                      name: safeName,
                      path: safeName,
                      language: safeName.endsWith('.h') || safeName.endsWith('.hpp') ? 'h' : 'cpp'
                    }
                  : f
              )
            }
          : p
      );
      setProjects(nextProjects);
      saveProjectsToDB(nextProjects);
      setFilePromptMode(null);
    } else if (filePromptMode.type === 'rename-project') {
      const trimmed = promptInputVal.trim();
      if (!trimmed) return;
      const nextProjects = projects.map((p) =>
        p.id === filePromptMode.projectId ? { ...p, name: trimmed, updatedAt: Date.now() } : p
      );
      setProjects(nextProjects);
      saveProjectsToDB(nextProjects);
      setFilePromptMode(null);
    }
  };

  const handleDeleteFileRequest = (fileId: string) => {
    if (!activeProject || activeProject.files.length <= 1) return;
    const targetFile = activeProject.files.find((f) => f.id === fileId);
    if (!targetFile) return;
    if (settings.confirmBeforeDelete) {
      setDeleteTarget({ type: 'file', fileId, name: targetFile.name });
    } else {
      executeDeleteFile(fileId);
    }
  };

  const executeDeleteFile = (fileId: string) => {
    if (!activeProject || activeProject.files.length <= 1) return;
    const nextFiles = activeProject.files.filter((f) => f.id !== fileId);
    const nextProjects = projects.map((p) =>
      p.id === activeProject.id ? { ...p, files: nextFiles, updatedAt: Date.now() } : p
    );
    setProjects(nextProjects);
    saveProjectsToDB(nextProjects);

    const nextTabs = openTabIds.filter((tid) => tid !== fileId);
    const ensuredTabs = nextTabs.length > 0 ? nextTabs : [nextFiles[0].id];
    setOpenTabIds(ensuredTabs);
    if (activeFileId === fileId) {
      setActiveFileId(ensuredTabs[0]);
    }
    setDeleteTarget(null);
    addToast('info', t.toastFileDeleted);
  };

  const handleCloseTab = (fileId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (openTabIds.length <= 1) return;
    const targetFile = activeProject?.files.find((f) => f.id === fileId);
    if (targetFile?.isUnsaved && settings.confirmUnsavedClose) {
      setUnsavedCloseTargetId(fileId);
      return;
    }
    forceCloseTab(fileId);
  };

  const forceCloseTab = (fileId: string) => {
    const nextTabs = openTabIds.filter((id) => id !== fileId);
    if (nextTabs.length === 0 && activeProject) {
      nextTabs.push(activeProject.files[0].id);
    }
    setOpenTabIds(nextTabs);
    if (activeFileId === fileId) {
      setActiveFileId(nextTabs[nextTabs.length - 1]);
    }
    setUnsavedCloseTargetId(null);
  };

  const handleImportZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const importedProject = await importProjectFromZip(file);
      const next = [importedProject, ...projects];
      setProjects(next);
      saveProjectsToDB(next);
      setActiveProjectId(importedProject.id);
      setOpenTabIds([importedProject.files[0].id]);
      setActiveFileId(importedProject.files[0].id);
      setShowWelcome(false);
      addToast('success', t.toastProjectImported);
    } catch (err) {
      addToast(
        'error',
        err instanceof Error ? err.message : 'Хато ҳангоми воридоти архиви .zip'
      );
    } finally {
      e.target.value = '';
    }
  };

  const handleExportActiveProject = async () => {
    if (!activeProject) return;
    await exportProjectAsZip(activeProject);
    addToast('success', t.toastProjectExported);
  };

  const handleLoadCodeSnippet = (
    title: string,
    files: Array<{ name: string; content: string }>,
    stdin?: string
  ) => {
    const now = Date.now();
    const projFiles: ProjectFile[] = files.map((f, idx) => ({
      id: `file-ex-${now}-${idx}`,
      name: f.name,
      path: f.name,
      language: f.name.endsWith('.h') || f.name.endsWith('.hpp') ? 'h' : 'cpp',
      content: f.content,
      updatedAt: now
    }));
    const newProj: Project = {
      id: `proj-ex-${now}`,
      name: title,
      templateId: 'example',
      createdAt: now,
      updatedAt: now,
      stdin: stdin || '',
      files: projFiles
    };
    const next = [newProj, ...projects];
    setProjects(next);
    saveProjectsToDB(next);
    setActiveProjectId(newProj.id);
    setOpenTabIds([projFiles[0].id]);
    setActiveFileId(projFiles[0].id);
    setShowWelcome(false);
    setCompileResult(null);
  };

  const handleJumpToDiagnostic = (fileName: string, line: number) => {
    if (!activeProject) return;
    const found =
      activeProject.files.find((f) => f.name === fileName) || activeProject.files[0];
    if (found) {
      if (!openTabIds.includes(found.id)) {
        setOpenTabIds((prev) => [...prev, found.id]);
      }
      setActiveFileId(found.id);
      setExternalJumpLine({ line, timestamp: Date.now() });
    }
  };

  const statusText = useMemo(() => {
    switch (executionStatus) {
      case 'compiling': return t.statusCompiling;
      case 'compiled_success': return t.statusCompiledSuccess;
      case 'running': return t.statusRunning;
      case 'completed': return t.statusCompleted;
      case 'compile_error': return t.statusCompileError;
      case 'runtime_error': return t.statusRuntimeError;
      case 'timeout': return t.statusTimeout;
      case 'stopped': return t.statusStopped;
      default: return t.statusReady;
    }
  }, [executionStatus, t]);

  const themeRootClasses = useMemo(() => {
    switch (settings.theme) {
      case 'yusuf-light':
        return 'bg-slate-50 text-slate-900';
      case 'midnight':
        return 'bg-[#05070B] text-slate-100';
      case 'high-contrast':
        return 'bg-black text-white';
      default:
        return 'bg-[#0B0F17] text-slate-100';
    }
  }, [settings.theme]);

  const isRunningOrCompiling =
    executionStatus === 'compiling' || executionStatus === 'running';

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden ${themeRootClasses}`}>
      {/* Hidden File Input for .zip Import */}
      <input
        ref={zipInputRef}
        type="file"
        accept=".zip"
        onChange={handleImportZipChange}
        className="hidden"
      />

      {/* TOP NAVIGATION BAR (Strict 3-Zone Contract: Brand | Nav Links | Primary Actions) */}
      <header className="flex items-center justify-between px-3 sm:px-5 h-12 bg-[#090D16] border-b border-slate-800/90 shrink-0 z-30">
        {/* Zone 1: Single Brand Wordmark (with mobile drawer toggle on small viewports) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            aria-label="Open Project Explorer"
          >
            <Menu className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowWelcome(false)}
            className="text-sm sm:text-base font-bold tracking-tight text-white font-mono whitespace-nowrap"
          >
            &lt;/&gt; YUSUF CODE
          </button>
        </div>

        {/* Zone 2: Clean 1-2 Word Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-300">
          <button
            type="button"
            onClick={() => setShowWelcome(true)}
            className={`hover:text-white transition-colors whitespace-nowrap ${
              showWelcome ? 'text-sky-400 font-semibold' : ''
            }`}
          >
            {t.home}
          </button>
          <button
            type="button"
            onClick={() => setShowNewProjectModal(true)}
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            {t.project}
          </button>
          <button
            type="button"
            onClick={() => {
              setPromptInputVal('utils.cpp');
              setFilePromptMode({ type: 'new-file' });
            }}
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            {t.files}
          </button>
          <button
            type="button"
            onClick={handleSaveProject}
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            {t.save}
          </button>
          <button
            type="button"
            onClick={() => setShowLessonsModal(true)}
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            {t.lessons}
          </button>
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            {t.settings}
          </button>
        </nav>

        {/* Zone 3: 1-2 Primary Actions (Run/Stop + Command Palette/Settings) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLessonsModal(true)}
            className="md:hidden p-2 rounded-lg bg-slate-800/80 text-slate-200 hover:text-white"
            title={t.lessons}
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
            title={t.settings}
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleRunOrStop}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              isRunningOrCompiling
                ? 'bg-rose-500 hover:bg-rose-400 text-white'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            {isRunningOrCompiling ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{t.stop}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t.run}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* WORKSPACE BODY */}
      {showWelcome ? (
        <WelcomeScreen
          projects={projects}
          activeProjectId={activeProjectId}
          t={t}
          onNewProject={() => setShowNewProjectModal(true)}
          onOpenProject={handleSelectProject}
          onDeleteProject={handleDeleteProjectConfirm}
          onDuplicateProject={handleDuplicateProject}
          onImportProjectClick={() => zipInputRef.current?.click()}
          onOpenLessons={() => setShowLessonsModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
          onLoadExample={handleLoadCodeSnippet}
          onContinueCoding={() => setShowWelcome(false)}
        />
      ) : (
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          {/* LEFT SIDEBAR: Project & File Explorer (Desktop static, Mobile drawer) */}
          <aside
            className={`${
              mobileDrawerOpen
                ? 'fixed inset-y-0 left-0 z-50 w-72 flex'
                : 'hidden lg:flex lg:w-60'
            } flex-col bg-[#090D16] border-r border-slate-800/90 shrink-0 select-none`}
          >
            {/* Active Project Selector Header */}
            <div className="p-3 border-b border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {t.project}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowNewProjectModal(true)}
                    className="p-1 rounded hover:bg-slate-800 text-sky-400"
                    title={t.newProject}
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                  </button>
                  {activeProject && (
                    <button
                      type="button"
                      onClick={() => {
                        setPromptInputVal(activeProject.name);
                        setFilePromptMode({
                          type: 'rename-project',
                          projectId: activeProject.id,
                          currentName: activeProject.name
                        });
                      }}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                      title={t.renameProject}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleExportActiveProject}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                    title={t.exportProject}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => zipInputRef.current?.click()}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                    title={t.importProject}
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                  {mobileDrawerOpen && (
                    <button
                      type="button"
                      onClick={() => setMobileDrawerOpen(false)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <select
                value={activeProjectId || ''}
                onChange={(e) => handleSelectProject(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    📁 {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Files List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {t.files} ({activeProject?.files.length || 0})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPromptInputVal('utils.cpp');
                    setFilePromptMode({ type: 'new-file' });
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 text-[11px] font-medium"
                >
                  <FilePlus className="w-3 h-3" />
                  <span>+</span>
                </button>
              </div>

              {activeProject?.files.map((file) => {
                const isSelected = file.id === activeFile?.id;
                const hasError = allDiagnostics.some((d) => d.file === file.name);
                return (
                  <div
                    key={file.id}
                    className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-sky-500/15 text-sky-300 font-semibold border border-sky-500/30'
                        : 'text-slate-300 hover:bg-slate-800/70'
                    }`}
                    onClick={() => {
                      if (!openTabIds.includes(file.id)) {
                        setOpenTabIds((prev) => [...prev, file.id]);
                      }
                      setActiveFileId(file.id);
                      setMobileDrawerOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileCode2
                        className={`w-4 h-4 shrink-0 ${
                          file.name.endsWith('.h') || file.name.endsWith('.hpp')
                            ? 'text-purple-400'
                            : 'text-sky-400'
                        }`}
                      />
                      <span className="truncate font-mono">{file.name}</span>
                      {file.isUnsaved && (
                        <span className="text-amber-400 text-[10px]">●</span>
                      )}
                      {hasError && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      )}
                    </div>

                    <div
                      className="flex items-center gap-1 opacity-80 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setPromptInputVal(file.name);
                          setFilePromptMode({
                            type: 'rename-file',
                            fileId: file.id,
                            currentName: file.name
                          });
                        }}
                        className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                        title={t.renameFile}
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      {(activeProject?.files.length || 0) > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteFileRequest(file.id)}
                          className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-rose-400"
                          title={t.deleteFile}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sidebar Footer Quick Actions */}
            <div className="p-2.5 border-t border-slate-800/80 space-y-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  setShowWelcome(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800"
              >
                <Home className="w-3.5 h-3.5 text-sky-400" />
                <span>{t.home}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  setShowAboutModal(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800"
              >
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.about}</span>
              </button>
            </div>
          </aside>

          {/* Mobile Backdrop for Drawer */}
          {mobileDrawerOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setMobileDrawerOpen(false)}
            />
          )}

          {/* CENTER + BOTTOM WORKSPACE */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            {/* Upper Row: Editor + Right IntelliSense Panel */}
            <div className="flex-1 flex min-h-0 overflow-hidden">
              {/* Editor Column */}
              <div className="flex-1 flex flex-col min-w-0 min-h-0">
                {/* Editor File Tabs + Toolbar */}
                <div className="flex items-center justify-between px-2 h-9 bg-[#090D16] border-b border-slate-800/80 shrink-0">
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {openTabIds.map((tabId) => {
                      const f = activeProject?.files.find((item) => item.id === tabId);
                      if (!f) return null;
                      const isActive = f.id === activeFile?.id;
                      return (
                        <div
                          key={f.id}
                          onClick={() => setActiveFileId(f.id)}
                          className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-mono cursor-pointer border-t-2 transition-colors whitespace-nowrap ${
                            isActive
                              ? 'bg-[#0B0F17] border-sky-400 text-white font-semibold'
                              : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span>
                            {f.isUnsaved ? '● ' : ''}
                            {f.name}
                          </span>
                          {openTabIds.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => handleCloseTab(f.id, e)}
                              className="p-0.5 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-200"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Editor Tools */}
                  <div className="flex items-center gap-1 shrink-0 pl-2">
                    <button
                      type="button"
                      onClick={() => setShowSearchBar((prev) => !prev)}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                      title={`${t.search} (Ctrl+F)`}
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleFormatActiveFile}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                      title={t.formatCode}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProject}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                      title={`${t.save} (Ctrl+S)`}
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* C++ Editor Instance */}
                {activeFile && activeProject && (
                  <CppEditor
                    file={activeFile}
                    projectFiles={activeProject.files}
                    settings={settings}
                    diagnostics={allDiagnostics}
                    t={t}
                    onChange={updateActiveFileContent}
                    onSave={handleSaveProject}
                    onRun={handleRunOrStop}
                    onCursorChange={(line, col, chars) =>
                      setCursorMetrics({ line, col, chars })
                    }
                    onSuggestionsChange={(items, selectedIndex, onAccept) =>
                      setLiveSuggestions({ items, selectedIndex, onAccept })
                    }
                    externalJumpLine={externalJumpLine}
                    showSearchBar={showSearchBar}
                    setShowSearchBar={setShowSearchBar}
                  />
                )}
              </div>

              {/* RIGHT SIDEBAR: Dedicated Desktop IntelliSense Inspector Panel */}
              <aside className="hidden xl:flex xl:w-64 flex-col bg-[#090D16] border-l border-slate-800/90 shrink-0 select-none">
                <div className="px-3.5 py-2.5 border-b border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">
                    {t.intelliSenseTitle}
                  </span>
                  <span className="font-mono text-[10px] text-sky-400">C++</span>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
                  {liveSuggestions.items.length === 0 ? (
                    <div className="space-y-3 text-slate-400 leading-relaxed">
                      <p>{t.intelliSenseEmpty}</p>
                      <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1.5 font-mono text-[11px]">
                        <div className="text-sky-300">std::cout / std::cin</div>
                        <div className="text-emerald-300">std::vector&lt;int&gt;</div>
                        <div className="text-purple-300">std::string</div>
                        <div className="text-amber-300">std::sort()</div>
                      </div>
                    </div>
                  ) : (
                    liveSuggestions.items.map((item, idx) => (
                      <button
                        key={`${item.label}-${idx}`}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          liveSuggestions.onAccept(item);
                        }}
                        className={`w-full p-2.5 rounded-lg text-left border transition-colors ${
                          idx === liveSuggestions.selectedIndex
                            ? 'bg-sky-500/15 border-sky-500/40 text-white'
                            : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold text-sky-300 truncate">
                            {item.label}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase">
                            {item.kind}
                          </span>
                        </div>
                        <div className="font-mono text-[10px] text-slate-400 truncate mt-0.5">
                          {item.detail}
                        </div>
                        <div className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                          {item.documentation}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </aside>
            </div>

            {/* BOTTOM PANELS: Output, Input (stdin), Errors, Controlled Terminal */}
            <div className="h-48 sm:h-56 shrink-0">
              <BottomPanels
                activeTab={bottomTab}
                setActiveTab={setBottomTab}
                compileResult={compileResult}
                executionStatus={executionStatus}
                stdin={activeProject?.stdin || ''}
                onStdinChange={(val) => {
                  if (!activeProject) return;
                  const next = projects.map((p) =>
                    p.id === activeProject.id ? { ...p, stdin: val } : p
                  );
                  setProjects(next);
                  saveProjectsToDB(next);
                }}
                diagnostics={allDiagnostics}
                projectFiles={activeProject?.files || []}
                t={t}
                onClearOutput={() => setCompileResult(null)}
                onCopyOutput={() => {
                  if (!compileResult) return;
                  navigator.clipboard.writeText(
                    compileResult.stdout || compileResult.stderr || ''
                  );
                  addToast('info', t.toastCopied);
                }}
                onJumpToError={handleJumpToDiagnostic}
                onRunProgram={handleRunOrStop}
                onFormatCode={handleFormatActiveFile}
              />
            </div>
          </div>
        </div>
      )}

      {/* STATUS BAR (Clean unboxed metadata with typographic separators · and tabular-nums) */}
      <footer className="flex items-center justify-between px-3 sm:px-5 h-7 bg-[#070A12] border-t border-slate-800/90 text-[11px] text-slate-400 font-mono tabular-nums shrink-0 select-none">
        <div className="flex items-center gap-2 truncate">
          <span className="uppercase font-semibold text-sky-400">
            {settings.cppStandard}
          </span>
          <span aria-hidden="true">·</span>
          <span className="hidden sm:inline">UTF-8</span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span>
            {t.lineLabel} {cursorMetrics.line}, {t.colLabel} {cursorMetrics.col}
          </span>
          <span aria-hidden="true" className="hidden md:inline">·</span>
          <span className="hidden md:inline">
            {t.spacesLabel}: {settings.tabSize}
          </span>
          <span aria-hidden="true" className="hidden lg:inline">·</span>
          <span className="hidden lg:inline">
            {t.charsLabel}: {cursorMetrics.chars}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`w-2 h-2 rounded-full ${
              executionStatus === 'compile_error' || executionStatus === 'runtime_error'
                ? 'bg-rose-500'
                : executionStatus === 'compiling' || executionStatus === 'running'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-emerald-400'
            }`}
          />
          <span className="font-sans font-medium text-slate-200">{statusText}</span>
        </div>
      </footer>

      {/* TOAST NOTIFICATIONS */}
      <div className="fixed bottom-10 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-2.5 rounded-xl border shadow-xl text-xs font-medium backdrop-blur-md transition-all ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/40 text-amber-200'
                : 'bg-slate-900/95 border-sky-500/40 text-slate-100'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* MODALS */}
      {showNewProjectModal && (
        <NewProjectModal
          t={t}
          onClose={() => setShowNewProjectModal(false)}
          onCreate={handleCreateProject}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          language={language}
          t={t}
          onUpdateSettings={handleUpdateSettings}
          onChangeLanguage={handleChangeLanguage}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {showLessonsModal && (
        <LessonsModal
          t={t}
          onClose={() => setShowLessonsModal(false)}
          onLoadCodeToProject={handleLoadCodeSnippet}
        />
      )}

      {showCommandPalette && (
        <CommandPaletteModal
          t={t}
          onClose={() => setShowCommandPalette(false)}
          actions={{
            onNewProject: () => setShowNewProjectModal(true),
            onNewFile: () => {
              setPromptInputVal('utils.cpp');
              setFilePromptMode({ type: 'new-file' });
            },
            onSave: handleSaveProject,
            onRun: handleRunOrStop,
            onFormat: handleFormatActiveFile,
            onSearch: () => setShowSearchBar(true),
            onSettings: () => setShowSettingsModal(true),
            onLessons: () => setShowLessonsModal(true),
            onExport: handleExportActiveProject,
            onImport: () => zipInputRef.current?.click()
          }}
        />
      )}

      {showAboutModal && (
        <AboutModal t={t} onClose={() => setShowAboutModal(false)} />
      )}

      {/* New File / Rename Prompt Modal */}
      {filePromptMode && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handlePromptSubmit}
            className="w-full max-w-md rounded-2xl bg-[#0F172A] border border-slate-800 shadow-2xl p-6 space-y-4 text-xs"
          >
            <h3 className="text-sm font-bold text-white">
              {filePromptMode.type === 'new-file'
                ? t.newFile
                : filePromptMode.type === 'rename-file'
                ? t.renameFile
                : t.renameProject}
            </h3>
            <div>
              <label className="block text-slate-400 mb-1.5">
                {filePromptMode.type === 'rename-project' ? t.projectName : t.fileName}:
              </label>
              <input
                type="text"
                value={promptInputVal}
                onChange={(e) => setPromptInputVal(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-sky-400"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFilePromptMode(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold"
              >
                {t.confirm}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0F172A] border border-slate-800 shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">{t.confirmDeleteTitle}</h3>
            <p className="text-slate-300 leading-relaxed">
              {t.confirmDeleteMessage} ({deleteTarget.name})
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteTarget.type === 'file') {
                    executeDeleteFile(deleteTarget.fileId);
                  } else {
                    executeDeleteProject(deleteTarget.projectId);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-semibold"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Confirmation Modal */}
      {unsavedCloseTargetId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0F172A] border border-slate-800 shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">{t.unsavedChangesTitle}</h3>
            <p className="text-slate-300 leading-relaxed">{t.unsavedChangesMessage}</p>
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUnsavedCloseTargetId(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => forceCloseTab(unsavedCloseTargetId)}
                className="px-3.5 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30"
              >
                {t.closeWithoutSaving}
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSaveProject();
                  forceCloseTab(unsavedCloseTargetId);
                }}
                className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold"
              >
                {t.saveAndClose}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
