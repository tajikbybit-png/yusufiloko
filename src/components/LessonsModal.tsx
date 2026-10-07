import React, { useState } from 'react';
import { CppLesson, CppExample } from '../types/ide';
import { CPP_LESSONS, CPP_EXAMPLES } from '../data/lessonsAndTemplates';
import { TranslationDictionary } from '../data/i18n';
import {
  BookOpen,
  Code2,
  Play,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Terminal,
  Sparkles,
  Check
} from 'lucide-react';

interface LessonsModalProps {
  t: TranslationDictionary;
  onClose: () => void;
  onLoadCodeToProject: (title: string, files: Array<{ name: string; content: string }>, stdin?: string) => void;
}

export const LessonsModal: React.FC<LessonsModalProps> = ({
  t,
  onClose,
  onLoadCodeToProject
}) => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'exercises' | 'examples'>('lessons');
  const [selectedLesson, setSelectedLesson] = useState<CppLesson>(CPP_LESSONS[0]);
  const [editableCode, setEditableCode] = useState<string>(CPP_LESSONS[0].exampleCode);
  const [exerciseCode, setExerciseCode] = useState<string>(CPP_LESSONS[0].starterCode);
  const [runOutput, setRunOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'passed' | 'failed'>('idle');

  const handleSelectLesson = (lesson: CppLesson) => {
    setSelectedLesson(lesson);
    setEditableCode(lesson.exampleCode);
    setExerciseCode(lesson.starterCode);
    setRunOutput('');
    setVerificationStatus('idle');
  };

  const executeCodeSnippet = async (codeToRun: string, stdinData = '', checkAgainstExpected?: string) => {
    setIsRunning(true);
    setVerificationStatus('idle');
    try {
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: 'cpp',
          standard: 'c++17',
          files: [{ name: 'main.cpp', content: codeToRun }],
          stdin: stdinData
        })
      });
      const data = await response.json();
      const output = (data.stdout || data.stderr || '').trim();
      setRunOutput(output || '(Баромад холӣ аст)');

      if (checkAgainstExpected !== undefined) {
        const cleanActual = (data.stdout || '').trim().replace(/\r\n/g, '\n');
        const cleanExpected = checkAgainstExpected.trim().replace(/\r\n/g, '\n');
        if (data.success && cleanActual === cleanExpected) {
          setVerificationStatus('passed');
        } else {
          setVerificationStatus('failed');
        }
      }
    } catch {
      setRunOutput('Хатои пайвастшавӣ ба компилятор.');
      if (checkAgainstExpected !== undefined) {
        setVerificationStatus('failed');
      }
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F17]/95 backdrop-blur-md flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 h-14 bg-[#090D16] border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.close}</span>
          </button>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            {t.learnCpp} — {t.appName}
          </h2>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('lessons')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'lessons'
                ? 'bg-sky-500 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {t.lessons} (17)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('exercises')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'exercises'
                ? 'bg-sky-500 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {t.exercises}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('examples')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'examples'
                ? 'bg-sky-500 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {t.examples}
          </button>
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'examples' ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CPP_EXAMPLES.map((ex: CppExample) => (
              <div
                key={ex.id}
                className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>{ex.category}</span>
                    <span>·</span>
                    <span className="font-mono">{ex.files.map((f) => f.name).join(', ')}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{ex.title}</h3>
                  <p className="text-xs text-slate-300 mt-1">{ex.description}</p>
                  <pre className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-sky-200 overflow-x-auto max-h-40">
                    {ex.files[0].content}
                  </pre>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onLoadCodeToProject(ex.title, ex.files, ex.stdin);
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Code2 className="w-4 h-4" />
                  <span>{t.loadExampleToEditor}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Sidebar of 17 Tajik Lessons */}
          <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-slate-800 bg-[#090D16] overflow-y-auto shrink-0 max-h-44 md:max-h-full">
            <div className="p-2 space-y-1">
              {CPP_LESSONS.map((lesson) => {
                const isSelected = lesson.id === selectedLesson.id;
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => handleSelectLesson(lesson)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="font-mono text-[11px] text-slate-400 tabular-nums w-5">
                      {String(lesson.number).padStart(2, '0')}.
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate">{lesson.title}</div>
                      <div className="text-[10px] text-slate-500">{lesson.category}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lesson / Exercise Workspace */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <div className="text-xs text-sky-400 font-medium">
                  Дарси {selectedLesson.number} · {selectedLesson.category}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {selectedLesson.title}
                </h1>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  {selectedLesson.explanation}
                </p>

                <ul className="mt-3 space-y-1.5">
                  {selectedLesson.keyPoints.map((pt, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {activeTab === 'lessons' ? (
                <div className="space-y-4">
                  <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
                      <span className="text-xs font-mono text-slate-300">main.cpp (Намунаи таҳриршаванда)</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onLoadCodeToProject(
                              selectedLesson.title,
                              [{ name: 'main.cpp', content: editableCode }],
                              selectedLesson.stdinForTest
                            )
                          }
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                        >
                          {t.loadExampleToEditor}
                        </button>
                        <button
                          type="button"
                          disabled={isRunning}
                          onClick={() => executeCodeSnippet(editableCode, selectedLesson.stdinForTest || '')}
                          className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{isRunning ? t.statusCompiling : t.run}</span>
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={editableCode}
                      onChange={(e) => setEditableCode(e.target.value)}
                      spellCheck={false}
                      className="w-full h-52 p-4 bg-[#090D16] text-slate-100 font-mono text-xs focus:outline-none resize-y"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                      <div className="text-xs font-semibold text-slate-400 mb-2">
                        {t.expectedResult}:
                      </div>
                      <pre className="font-mono text-xs text-emerald-300 whitespace-pre-wrap">
                        {selectedLesson.expectedOutput}
                      </pre>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                      <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-sky-400" />
                        <span>{t.output}:</span>
                      </div>
                      <pre className="font-mono text-xs text-slate-100 whitespace-pre-wrap">
                        {runOutput || t.stdoutEmpty}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                /* Interactive Exercise Mode */
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-500/30">
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-300 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      <span>{t.exerciseTask} #{selectedLesson.number}</span>
                    </div>
                    <p className="text-sm text-slate-100 mt-1.5 font-medium">
                      {selectedLesson.exercisePrompt}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-950 border-b border-slate-800">
                      <span className="text-xs font-mono text-slate-300">exercise.cpp</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isRunning}
                          onClick={() =>
                            executeCodeSnippet(
                              exerciseCode,
                              selectedLesson.stdinForTest || '',
                              undefined
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-xs flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>{t.run}</span>
                        </button>
                        <button
                          type="button"
                          disabled={isRunning}
                          onClick={() =>
                            executeCodeSnippet(
                              exerciseCode,
                              selectedLesson.stdinForTest || '',
                              selectedLesson.expectedExerciseOutput
                            )
                          }
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t.checkAnswer}</span>
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={exerciseCode}
                      onChange={(e) => setExerciseCode(e.target.value)}
                      spellCheck={false}
                      className="w-full h-56 p-4 bg-[#090D16] text-slate-100 font-mono text-xs focus:outline-none resize-y"
                    />
                  </div>

                  {verificationStatus !== 'idle' && (
                    <div
                      className={`p-4 rounded-xl border flex items-center gap-3 ${
                        verificationStatus === 'passed'
                          ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                          : 'bg-rose-950/50 border-rose-500/40 text-rose-200'
                      }`}
                    >
                      {verificationStatus === 'passed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                      <div className="text-xs">
                        <div className="font-bold">
                          {verificationStatus === 'passed'
                            ? t.toastExercisePassed
                            : t.toastExerciseFailed}
                        </div>
                        <div className="mt-1 font-mono">
                          {t.expectedResult}: "{selectedLesson.expectedExerciseOutput}" | Натиҷаи шумо: "{runOutput}"
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
