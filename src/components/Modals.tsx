import React, { useState } from 'react';
import {
  CppStandard,
  EditorSettings,
  LanguageCode,
  OptimizationLevel,
  ThemeMode
} from '../types/ide';
import { TranslationDictionary } from '../data/i18n';
import { PROJECT_TEMPLATES } from '../data/lessonsAndTemplates';
import {
  X,
  Command,
  FolderPlus,
  FilePlus,
  Save,
  Play,
  Search,
  Settings,
  Download,
  Upload,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface SettingsModalProps {
  settings: EditorSettings;
  language: LanguageCode;
  t: TranslationDictionary;
  onUpdateSettings: (partial: Partial<EditorSettings>) => void;
  onChangeLanguage: (lang: LanguageCode) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  language,
  t,
  onUpdateSettings,
  onChangeLanguage,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0F172A] border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        <div className="flex items-center justify-between px-6 py-4 bg-[#090D16] border-b border-slate-800">
          <h2 className="text-base font-bold text-white">{t.settingsTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Appearance & Language */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              {t.appearanceSection}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium block">{t.languageLabel}</label>
                <select
                  value={language}
                  onChange={(e) => onChangeLanguage(e.target.value as LanguageCode)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  <option value="tg">🇹🇯 Тоҷикӣ (Асосӣ)</option>
                  <option value="ru">🇷🇺 Русский</option>
                  <option value="en">🇬🇧 English</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium block">{t.themeLabel}</label>
                <select
                  value={settings.theme}
                  onChange={(e) => onUpdateSettings({ theme: e.target.value as ThemeMode })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  <option value="yusuf-dark">YUSUF Dark (Торик)</option>
                  <option value="midnight">Midnight (Шабона)</option>
                  <option value="high-contrast">High Contrast (Контрасти баланд)</option>
                  <option value="yusuf-light">YUSUF Light (Равшан)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Editor Settings */}
          <section className="space-y-3 pt-4 border-t border-slate-800/80">
            <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              {t.editorSection}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium block">
                  {t.fontSizeLabel}: {settings.fontSize}px
                </label>
                <input
                  type="range"
                  min={12}
                  max={22}
                  value={settings.fontSize}
                  onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) })}
                  className="w-full accent-sky-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium block">{t.tabSizeLabel}</label>
                <select
                  value={settings.tabSize}
                  onChange={(e) => onUpdateSettings({ tabSize: Number(e.target.value) as 2 | 4 })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
                >
                  <option value={4}>4 фосила (Стандартӣ)</option>
                  <option value={2}>2 фосила</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {[
                { key: 'intelliSense', label: t.intelliSenseToggleLabel },
                { key: 'diagnostics', label: t.diagnosticsToggleLabel },
                { key: 'lineNumbers', label: t.lineNumbersLabel },
                { key: 'autoClosing', label: t.autoClosingLabel },
                { key: 'wordWrap', label: t.wordWrapLabel },
                { key: 'autosave', label: t.autosaveLabel },
                { key: 'formatOnSave', label: t.formatOnSaveLabel }
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 cursor-pointer"
                >
                  <span className="text-slate-200">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(settings[item.key as keyof EditorSettings])}
                    onChange={(e) =>
                      onUpdateSettings({ [item.key]: e.target.checked } as Partial<EditorSettings>)
                    }
                    className="w-4 h-4 accent-sky-400 rounded"
                  />
                </label>
              ))}
            </div>
          </section>

          {/* Compiler Settings */}
          <section className="space-y-3 pt-4 border-t border-slate-800/80">
            <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              {t.compilerSection}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium block">{t.cppStandardLabel}</label>
                <select
                  value={settings.cppStandard}
                  onChange={(e) =>
                    onUpdateSettings({ cppStandard: e.target.value as CppStandard })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono"
                >
                  <option value="c++17">C++17 (ISO/IEC 14882:2017)</option>
                  <option value="c++20">C++20 (ISO/IEC 14882:2020)</option>
                  <option value="c++23">C++23 (Experimental)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium block">{t.optimizationLabel}</label>
                <select
                  value={settings.optimization}
                  onChange={(e) =>
                    onUpdateSettings({ optimization: e.target.value as OptimizationLevel })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono"
                >
                  <option value="-O0">-O0 (Бе оптимизатсия)</option>
                  <option value="-O2">-O2 (Суръати мутавозин)</option>
                  <option value="-O3">-O3 (Ҳадди аксар)</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        <div className="px-6 py-3 bg-[#090D16] border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};

interface NewProjectModalProps {
  t: TranslationDictionary;
  onClose: () => void;
  onCreate: (name: string, templateId: string) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ t, onClose, onCreate }) => {
  const [name, setName] = useState('MyProject');
  const [templateId, setTemplateId] = useState(PROJECT_TEMPLATES[0].id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), templateId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl bg-[#0F172A] border border-slate-800 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 bg-[#090D16] border-b border-slate-800">
          <h2 className="text-base font-bold text-white">{t.newProject}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">{t.projectName}:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-sky-400"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-2">{t.projectTemplate}:</label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {PROJECT_TEMPLATES.map((tpl) => (
                <label
                  key={tpl.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    templateId === tpl.id
                      ? 'bg-sky-500/15 border-sky-500/50 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="template"
                    checked={templateId === tpl.id}
                    onChange={() => setTemplateId(tpl.id)}
                    className="mt-1 accent-sky-400"
                  />
                  <div>
                    <div className="font-semibold text-xs">{tpl.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{tpl.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-[#090D16] border-t border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs"
          >
            {t.createProject}
          </button>
        </div>
      </form>
    </div>
  );
};

interface CommandPaletteModalProps {
  t: TranslationDictionary;
  onClose: () => void;
  actions: {
    onNewProject: () => void;
    onNewFile: () => void;
    onSave: () => void;
    onRun: () => void;
    onFormat: () => void;
    onSearch: () => void;
    onSettings: () => void;
    onLessons: () => void;
    onExport: () => void;
    onImport: () => void;
  };
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  t,
  onClose,
  actions
}) => {
  const [query, setQuery] = useState('');

  const commands = [
    { id: 'run', label: t.run, shortcut: 'Ctrl+Enter', icon: Play, action: actions.onRun },
    { id: 'save', label: t.save, shortcut: 'Ctrl+S', icon: Save, action: actions.onSave },
    { id: 'format', label: t.formatCode, shortcut: 'Shift+Alt+F', icon: Sparkles, action: actions.onFormat },
    { id: 'new-file', label: t.newFile, shortcut: 'Ctrl+N', icon: FilePlus, action: actions.onNewFile },
    { id: 'new-proj', label: t.newProject, shortcut: '', icon: FolderPlus, action: actions.onNewProject },
    { id: 'search', label: t.search, shortcut: 'Ctrl+F', icon: Search, action: actions.onSearch },
    { id: 'lessons', label: t.learnCpp, shortcut: '', icon: BookOpen, action: actions.onLessons },
    { id: 'export', label: t.exportProject, shortcut: '', icon: Download, action: actions.onExport },
    { id: 'import', label: t.importProject, shortcut: '', icon: Upload, action: actions.onImport },
    { id: 'settings', label: t.settings, shortcut: 'Ctrl+,', icon: Settings, action: actions.onSettings }
  ];

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[#0F172A] border border-slate-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 px-4 py-3 bg-[#090D16] border-b border-slate-800">
          <Command className="w-4 h-4 text-sky-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`${t.commandPalette}...`}
            className="flex-1 bg-transparent text-white text-xs focus:outline-none"
            autoFocus
          />
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 p-1.5">
          {filtered.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.id}
                type="button"
                onClick={() => {
                  onClose();
                  cmd.action();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-sky-500/15 text-slate-200 hover:text-white text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-sky-400" />
                  <span className="font-medium">{cmd.label}</span>
                </div>
                {cmd.shortcut && (
                  <span className="font-mono text-[10px] text-slate-400">
                    {cmd.shortcut}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface AboutModalProps {
  t: TranslationDictionary;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ t, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#0F172A] border border-slate-800 shadow-2xl p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center mx-auto text-sky-400 font-mono font-bold text-xl">
          &lt;/&gt;
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{t.appName}</h2>
          <p className="text-xs text-sky-400 font-medium mt-0.5">{t.appSubtitle}</p>
          <p className="text-xs text-slate-400 mt-1 font-mono">Версия: 1.0.0 · C++17 / C++20 / C++23</p>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Муҳити муосир барои омӯзиш, навиштан ва иҷрои барномаҳои C++ бо дастгирии пурраи забони тоҷикӣ, IntelliSense, ташхиси хатоҳо дар вақти воқеӣ ва компилятори воқеии GCC.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
