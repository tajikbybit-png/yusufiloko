import React from 'react';
import { Project } from '../types/ide';
import { TranslationDictionary } from '../data/i18n';
import { CPP_EXAMPLES } from '../data/lessonsAndTemplates';
import {
  FolderPlus,
  FolderOpen,
  BookOpen,
  Settings,
  Code2,
  Play,
  Upload,
  Trash2,
  Copy
} from 'lucide-react';

interface WelcomeScreenProps {
  projects: Project[];
  activeProjectId: string | null;
  t: TranslationDictionary;
  onNewProject: () => void;
  onOpenProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (projectId: string) => void;
  onImportProjectClick: () => void;
  onOpenLessons: () => void;
  onOpenSettings: () => void;
  onLoadExample: (title: string, files: Array<{ name: string; content: string }>, stdin?: string) => void;
  onContinueCoding: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  projects,
  activeProjectId,
  t,
  onNewProject,
  onOpenProject,
  onDeleteProject,
  onDuplicateProject,
  onImportProjectClick,
  onOpenLessons,
  onOpenSettings,
  onLoadExample,
  onContinueCoding
}) => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#0B0F17] p-4 sm:p-8 select-none">
      <div className="max-w-5xl mx-auto space-y-8 py-4">
        {/* Hero Identity Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 font-mono font-bold text-2xl shrink-0 shadow-lg shadow-sky-950/50">
              &lt;/&gt;
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {t.appName}
              </h1>
              <p className="text-sm sm:text-base text-sky-400 font-semibold mt-0.5">
                {t.appSubtitle}
              </p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                {t.appTagline}
              </p>
            </div>
          </div>

          {activeProjectId && (
            <button
              type="button"
              onClick={onContinueCoding}
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shrink-0 shadow-lg shadow-emerald-950/40"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t.continueCoding}</span>
            </button>
          )}
        </div>

        {/* Primary Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <button
            type="button"
            onClick={onNewProject}
            className="flex items-center gap-3.5 p-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-left transition-colors"
          >
            <FolderPlus className="w-5 h-5 shrink-0" />
            <div>
              <div className="text-sm">+ {t.newProject}</div>
              <div className="text-[11px] text-slate-900/80 font-medium">
                Console App, OOP, Empty
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={onImportProjectClick}
            className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-semibold text-left transition-colors"
          >
            <Upload className="w-5 h-5 text-sky-400 shrink-0" />
            <div>
              <div className="text-sm">{t.openProject}</div>
              <div className="text-[11px] text-slate-400 font-normal">
                {t.importProject}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenLessons}
            className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-semibold text-left transition-colors"
          >
            <BookOpen className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-sm">{t.learnCpp}</div>
              <div className="text-[11px] text-slate-400 font-normal">
                17 дарс ва машқҳои интерактивӣ
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-semibold text-left transition-colors"
          >
            <Settings className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-sm">{t.settings}</div>
              <div className="text-[11px] text-slate-400 font-normal">
                C++17/20/23 · Забон · Мавзӯъ
              </div>
            </div>
          </button>
        </div>

        {/* Recent Projects & Quick Examples */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Recent Projects (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <h2 className="text-sm font-bold text-slate-200 tracking-wide">
              {t.recentProjects}
            </h2>
            {projects.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400">
                {t.noRecentProjects}
              </div>
            ) : (
              <div className="space-y-2.5">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="group flex items-center justify-between p-4 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => onOpenProject(proj.id)}
                      className="flex items-start gap-3.5 text-left flex-1 min-w-0"
                    >
                      <FolderOpen className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-white truncate">
                          {proj.name}
                        </div>
                        {proj.description && (
                          <div className="text-xs text-slate-400 truncate mt-0.5">
                            {proj.description}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1.5 font-mono">
                          <span>{proj.files.map((f) => f.name).join(', ')}</span>
                          <span>·</span>
                          <span>{proj.files.length} файл</span>
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-1 ml-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onDuplicateProject(proj.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        title={t.duplicateProject}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {projects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteProject(proj.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                          title={t.deleteProject}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ready-made Examples (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-200 tracking-wide">
              {t.quickExamples}
            </h2>
            <div className="space-y-2.5">
              {CPP_EXAMPLES.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => onLoadExample(ex.title, ex.files, ex.stdin)}
                  className="w-full flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-sky-500/40 text-left transition-colors"
                >
                  <Code2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-100">{ex.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {ex.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
