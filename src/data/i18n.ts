import { LanguageCode } from '../types/ide';

export interface TranslationDictionary {
  appName: string;
  appSubtitle: string;
  appTagline: string;
  // Navigation & Menus
  home: string;
  project: string;
  files: string;
  save: string;
  run: string;
  stop: string;
  settings: string;
  output: string;
  input: string;
  errors: string;
  terminal: string;
  search: string;
  replace: string;
  replaceAll: string;
  lessons: string;
  exercises: string;
  examples: string;
  help: string;
  about: string;
  formatCode: string;
  commandPalette: string;

  // Home Screen
  newProject: string;
  openProject: string;
  learnCpp: string;
  recentProjects: string;
  noRecentProjects: string;
  quickExamples: string;
  continueCoding: string;

  // Project & File Actions
  createProject: string;
  projectName: string;
  projectTemplate: string;
  renameProject: string;
  deleteProject: string;
  duplicateProject: string;
  importProject: string;
  exportProject: string;
  newFile: string;
  fileName: string;
  renameFile: string;
  deleteFile: string;
  duplicateFile: string;
  confirmDeleteTitle: string;
  confirmDeleteMessage: string;
  unsavedChangesTitle: string;
  unsavedChangesMessage: string;
  saveAndClose: string;
  closeWithoutSaving: string;
  cancel: string;
  confirm: string;
  create: string;
  close: string;

  // Execution States
  statusReady: string;
  statusCompiling: string;
  statusCompiledSuccess: string;
  statusRunning: string;
  statusCompleted: string;
  statusCompileError: string;
  statusRuntimeError: string;
  statusTimeout: string;
  statusStopped: string;

  // Panels
  intelliSenseTitle: string;
  intelliSenseEmpty: string;
  stdinPlaceholder: string;
  stdinHelper: string;
  stdoutEmpty: string;
  noErrorsFound: string;
  clearOutput: string;
  copyOutput: string;
  exitCodeLabel: string;
  execTimeLabel: string;
  terminalWelcome: string;
  terminalPromptHelp: string;

  // Diagnostics
  syntaxErrorTitle: string;
  lineLabel: string;
  colLabel: string;
  spacesLabel: string;
  charsLabel: string;

  // Settings
  settingsTitle: string;
  editorSection: string;
  compilerSection: string;
  appearanceSection: string;
  behaviorSection: string;
  languageLabel: string;
  fontSizeLabel: string;
  tabSizeLabel: string;
  wordWrapLabel: string;
  lineNumbersLabel: string;
  autoClosingLabel: string;
  intelliSenseToggleLabel: string;
  diagnosticsToggleLabel: string;
  cppStandardLabel: string;
  optimizationLabel: string;
  warningsLabel: string;
  themeLabel: string;
  autosaveLabel: string;
  formatOnSaveLabel: string;

  // Notifications
  toastProjectSaved: string;
  toastFileCreated: string;
  toastFileDeleted: string;
  toastCompileSuccess: string;
  toastCompileFailed: string;
  toastUnsavedWarning: string;
  toastCopied: string;
  toastFormatted: string;
  toastProjectExported: string;
  toastProjectImported: string;
  toastExercisePassed: string;
  toastExerciseFailed: string;

  // Lessons & Exercises
  loadExampleToEditor: string;
  startExercise: string;
  checkAnswer: string;
  expectedResult: string;
  lessonExplanation: string;
  exerciseTask: string;
}

export const translations: Record<LanguageCode, TranslationDictionary> = {
  tg: {
    appName: 'YUSUF CODE',
    appSubtitle: 'IDE-и мобилӣ барои C++',
    appTagline: 'Муҳити касбии барномасозӣ барои омӯзиш, навиштан ва иҷрои барномаҳои C++',

    home: 'Асосӣ',
    project: 'Лоиҳа',
    files: 'Файлҳо',
    save: 'Сабт кардан',
    run: 'Иҷро кардан',
    stop: 'Қатъ кардан',
    settings: 'Танзимот',
    output: 'Натиҷа',
    input: 'Вуруд',
    errors: 'Хатоҳо',
    terminal: 'Терминал',
    search: 'Ҷустуҷӯ',
    replace: 'Иваз кардан',
    replaceAll: 'Иваз кардани ҳама',
    lessons: 'Дарсҳо',
    exercises: 'Машқҳо',
    examples: 'Намунаҳо',
    help: 'Кӯмак',
    about: 'Дар бораи барнома',
    formatCode: 'Формат кардани код',
    commandPalette: 'Палитраи фармонҳо',

    newProject: 'Лоиҳаи нав',
    openProject: 'Кушодани лоиҳа',
    learnCpp: 'Омӯхтани C++',
    recentProjects: 'Лоиҳаҳои охирин',
    noRecentProjects: 'Ҳоло лоиҳае нест. Лоиҳаи навро оғоз кунед.',
    quickExamples: 'Намунаҳои омодаи C++',
    continueCoding: 'Идома додани кор',

    createProject: 'Сохтани лоиҳа',
    projectName: 'Номи лоиҳа',
    projectTemplate: 'Шаблони лоиҳа',
    renameProject: 'Иваз кардани номи лоиҳа',
    deleteProject: 'Нест кардани лоиҳа',
    duplicateProject: 'Нусхабардории лоиҳа',
    importProject: 'Воридоти лоиҳа (.zip)',
    exportProject: 'Содироти лоиҳа (.zip)',
    newFile: 'Файли нав',
    fileName: 'Номи файл (масалан: utils.cpp ё student.h)',
    renameFile: 'Тағйири номи файл',
    deleteFile: 'Нест кардани файл',
    duplicateFile: 'Нусхабардории файл',
    confirmDeleteTitle: 'Тасдиқи нест кардан',
    confirmDeleteMessage: 'Оё шумо مطمئن ҳастед, ки мехоҳед ин элемент-ро нест кунед? Ин амалро барқарор кардан ғайриимкон аст.',
    unsavedChangesTitle: 'Тағйирот сабт нашудааст',
    unsavedChangesMessage: 'Дар ин файл тағйироти сабтнашуда мавҷуд аст. Пеш аз бастан чӣ кор кардан мехоҳед?',
    saveAndClose: 'Сабт кардан',
    closeWithoutSaving: 'Сабт накарда бастан',
    cancel: 'Бекор кардан',
    confirm: 'Тасдиқ кардан',
    create: 'Сохтан',
    close: 'Бастан',

    statusReady: 'Омода',
    statusCompiling: 'Компилятсия...',
    statusCompiledSuccess: 'Компилятсия бомуваффақият анҷом ёфт',
    statusRunning: 'Иҷро шуда истодааст...',
    statusCompleted: 'Иҷро анҷом ёфт',
    statusCompileError: 'Хатои компилятсия',
    statusRuntimeError: 'Хатои иҷро',
    statusTimeout: 'Вақт тамом шуд',
    statusStopped: 'Қатъ карда шуд',

    intelliSenseTitle: 'Пешниҳодҳои IntelliSense',
    intelliSenseEmpty: 'Ҳангоми навиштани код (масалан std:: ё номи тағйирёбанда) пешниҳодҳои интеллектуалӣ дар ин ҷо пайдо мешаванд.',
    stdinPlaceholder: 'Маълумоти вурудиро (stdin) дар ин ҷо ворид кунед...\nМасалан:\nНасим\n19',
    stdinHelper: 'Ҳар як сатр ба std::cin ё getline() равона мешавад.',
    stdoutEmpty: 'Барномаро иҷро кунед (▶ Иҷро кардан), то натиҷаи онро дар ин ҷо бубинед.',
    noErrorsFound: 'Ягон хатои синтаксисӣ ё компилятсия ёфт нашуд.',
    clearOutput: 'Тоза кардан',
    copyOutput: 'Нусхабардорӣ',
    exitCodeLabel: 'Коди баромад',
    execTimeLabel: 'Вақти иҷро',
    terminalWelcome: 'YUSUF CODE Терминали идорашавандаи C++ (v1.0.0)',
    terminalPromptHelp: 'Фармонҳои дастрас: build, run, clear, files, status, version, help',

    syntaxErrorTitle: 'Хатои синтаксисӣ',
    lineLabel: 'Сатр',
    colLabel: 'Сутун',
    spacesLabel: 'Фосилаҳо',
    charsLabel: 'Аломатҳо',

    settingsTitle: 'Танзимоти муҳити YUSUF CODE',
    editorSection: 'Муҳаррири код',
    compilerSection: 'Компилятори C++',
    appearanceSection: 'Намуди зоҳирӣ ва забон',
    behaviorSection: 'Рафтори система',
    languageLabel: 'Забони интерфейс',
    fontSizeLabel: 'Андозаи ҳарф (px)',
    tabSizeLabel: 'Андозаи Tab (фосила)',
    wordWrapLabel: 'Шикастани сатрҳои дароз (Word Wrap)',
    lineNumbersLabel: 'Нишон додани рақами сатрҳо',
    autoClosingLabel: 'Худкор пӯшидани қавсҳо ва нохунакҳо',
    intelliSenseToggleLabel: 'Фаъол кардани C++ IntelliSense',
    diagnosticsToggleLabel: 'Ташхиси хатоҳо дар вақти воқеӣ',
    cppStandardLabel: 'Стандарти C++',
    optimizationLabel: 'Сатҳи оптимизатсия',
    warningsLabel: 'Огоҳиҳои компилятор (-Wall)',
    themeLabel: 'Мавзӯи рангӣ (Theme)',
    autosaveLabel: 'Сабти худкор (Autosave)',
    formatOnSaveLabel: 'Формат кардани код ҳангоми сабт',

    toastProjectSaved: '✓ Лоиҳа сабт шуд',
    toastFileCreated: '✓ Файл сохта шуд',
    toastFileDeleted: '✓ Файл нест карда шуд',
    toastCompileSuccess: '✓ Компилятсия бомуваффақият анҷом ёфт',
    toastCompileFailed: '❌ Компилятсия ноком шуд',
    toastUnsavedWarning: '⚠ Тағйирот сабт нашудааст',
    toastCopied: '✓ Ба ҳофиза нусхабардорӣ шуд',
    toastFormatted: '✓ Коди C++ формат карда шуд',
    toastProjectExported: '✓ Лоиҳа дар формати .zip содир шуд',
    toastProjectImported: '✓ Лоиҳа бомуваффақият ворид карда шуд',
    toastExercisePassed: '✓ Офарин! Ҷавоби машқ дуруст аст!',
    toastExerciseFailed: '❌ Натиҷа бо ҷавоби интизоршуда мувофиқат намекунад',

    loadExampleToEditor: 'Кушодан дар муҳаррир',
    startExercise: 'Ҳал кардани машқ дар муҳаррир',
    checkAnswer: 'Санҷидани ҷавоб',
    expectedResult: 'Натиҷаи интизоршуда',
    lessonExplanation: 'Шарҳи мавзӯъ',
    exerciseTask: 'Супориши машқ'
  },
  ru: {
    appName: 'YUSUF CODE',
    appSubtitle: 'Мобильная IDE для C++',
    appTagline: 'Профессиональная среда разработки для изучения, написания и запуска программ C++',

    home: 'Главная',
    project: 'Проект',
    files: 'Файлы',
    save: 'Сохранить',
    run: 'Запустить',
    stop: 'Остановить',
    settings: 'Настройки',
    output: 'Вывод',
    input: 'Ввод',
    errors: 'Ошибки',
    terminal: 'Терминал',
    search: 'Поиск',
    replace: 'Заменить',
    replaceAll: 'Заменить все',
    lessons: 'Уроки',
    exercises: 'Упражнения',
    examples: 'Примеры',
    help: 'Помощь',
    about: 'О программе',
    formatCode: 'Форматировать код',
    commandPalette: 'Палитра команд',

    newProject: 'Новый проект',
    openProject: 'Открыть проект',
    learnCpp: 'Изучать C++',
    recentProjects: 'Недавние проекты',
    noRecentProjects: 'Проектов пока нет. Создайте новый проект.',
    quickExamples: 'Готовые примеры C++',
    continueCoding: 'Продолжить работу',

    createProject: 'Создать проект',
    projectName: 'Название проекта',
    projectTemplate: 'Шаблон проекта',
    renameProject: 'Переименовать проект',
    deleteProject: 'Удалить проект',
    duplicateProject: 'Дублировать проект',
    importProject: 'Импорт проекта (.zip)',
    exportProject: 'Экспорт проекта (.zip)',
    newFile: 'Новый файл',
    fileName: 'Имя файла (например: utils.cpp или student.h)',
    renameFile: 'Переименовать файл',
    deleteFile: 'Удалить файл',
    duplicateFile: 'Дублировать файл',
    confirmDeleteTitle: 'Подтверждение удаления',
    confirmDeleteMessage: 'Вы уверены, что хотите удалить этот элемент? Это действие нельзя отменить.',
    unsavedChangesTitle: 'Несохраненные изменения',
    unsavedChangesMessage: 'В файле есть несохраненные изменения. Что сделать перед закрытием?',
    saveAndClose: 'Сохранить',
    closeWithoutSaving: 'Закрыть без сохранения',
    cancel: 'Отмена',
    confirm: 'Подтвердить',
    create: 'Создать',
    close: 'Закрыть',

    statusReady: 'Готово',
    statusCompiling: 'Компиляция...',
    statusCompiledSuccess: 'Компиляция успешно завершена',
    statusRunning: 'Выполняется...',
    statusCompleted: 'Выполнение завершено',
    statusCompileError: 'Ошибка компиляции',
    statusRuntimeError: 'Ошибка выполнения',
    statusTimeout: 'Превышено время ожидания',
    statusStopped: 'Остановлено',

    intelliSenseTitle: 'Подсказки IntelliSense',
    intelliSenseEmpty: 'Начните вводить код (например std:: или имя переменной) для отображения подсказок.',
    stdinPlaceholder: 'Введите входные данные (stdin)...\nНапример:\nНасим\n19',
    stdinHelper: 'Каждая строка передается в std::cin или getline().',
    stdoutEmpty: 'Запустите программу (▶ Запустить), чтобы увидеть результат.',
    noErrorsFound: 'Синтаксических ошибок или ошибок компиляции не обнаружено.',
    clearOutput: 'Очистить',
    copyOutput: 'Копировать',
    exitCodeLabel: 'Код возврата',
    execTimeLabel: 'Время',
    terminalWelcome: 'YUSUF CODE Управляемый терминал C++ (v1.0.0)',
    terminalPromptHelp: 'Доступные команды: build, run, clear, files, status, version, help',

    syntaxErrorTitle: 'Синтаксическая ошибка',
    lineLabel: 'Стр',
    colLabel: 'Стлб',
    spacesLabel: 'Пробелы',
    charsLabel: 'Символы',

    settingsTitle: 'Настройки YUSUF CODE',
    editorSection: 'Редактор кода',
    compilerSection: 'Компилятор C++',
    appearanceSection: 'Внешний вид и язык',
    behaviorSection: 'Поведение системы',
    languageLabel: 'Язык интерфейса',
    fontSizeLabel: 'Размер шрифта (px)',
    tabSizeLabel: 'Размер табуляции',
    wordWrapLabel: 'Перенос длинных строк (Word Wrap)',
    lineNumbersLabel: 'Показывать номера строк',
    autoClosingLabel: 'Автозакрытие скобок и кавычек',
    intelliSenseToggleLabel: 'Включить C++ IntelliSense',
    diagnosticsToggleLabel: 'Диагностика ошибок в реальном времени',
    cppStandardLabel: 'Стандарт C++',
    optimizationLabel: 'Уровень оптимизации',
    warningsLabel: 'Предупреждения компилятора (-Wall)',
    themeLabel: 'Цветовая тема',
    autosaveLabel: 'Автосохранение',
    formatOnSaveLabel: 'Форматировать при сохранении',

    toastProjectSaved: '✓ Проект сохранен',
    toastFileCreated: '✓ Файл создан',
    toastFileDeleted: '✓ Файл удален',
    toastCompileSuccess: '✓ Компиляция успешно завершена',
    toastCompileFailed: '❌ Ошибка компиляции',
    toastUnsavedWarning: '⚠ Изменения не сохранены',
    toastCopied: '✓ Скопировано в буфер обмена',
    toastFormatted: '✓ Код C++ отформатирован',
    toastProjectExported: '✓ Проект экспортирован в .zip',
    toastProjectImported: '✓ Проект успешно импортирован',
    toastExercisePassed: '✓ Отлично! Задание решено верно!',
    toastExerciseFailed: '❌ Вывод не совпадает с ожидаемым результатом',

    loadExampleToEditor: 'Открыть в редакторе',
    startExercise: 'Решить упражнение в редакторе',
    checkAnswer: 'Проверить ответ',
    expectedResult: 'Ожидаемый результат',
    lessonExplanation: 'Объяснение темы',
    exerciseTask: 'Задание упражнения'
  },
  en: {
    appName: 'YUSUF CODE',
    appSubtitle: 'Mobile C++ IDE',
    appTagline: 'Professional development environment for learning, writing, and running C++ programs',

    home: 'Home',
    project: 'Project',
    files: 'Files',
    save: 'Save',
    run: 'Run',
    stop: 'Stop',
    settings: 'Settings',
    output: 'Output',
    input: 'Input',
    errors: 'Errors',
    terminal: 'Terminal',
    search: 'Search',
    replace: 'Replace',
    replaceAll: 'Replace All',
    lessons: 'Lessons',
    exercises: 'Exercises',
    examples: 'Examples',
    help: 'Help',
    about: 'About',
    formatCode: 'Format Code',
    commandPalette: 'Command Palette',

    newProject: 'New Project',
    openProject: 'Open Project',
    learnCpp: 'Learn C++',
    recentProjects: 'Recent Projects',
    noRecentProjects: 'No recent projects yet. Create a new project to begin.',
    quickExamples: 'Ready-made C++ Examples',
    continueCoding: 'Continue Coding',

    createProject: 'Create Project',
    projectName: 'Project Name',
    projectTemplate: 'Project Template',
    renameProject: 'Rename Project',
    deleteProject: 'Delete Project',
    duplicateProject: 'Duplicate Project',
    importProject: 'Import Project (.zip)',
    exportProject: 'Export Project (.zip)',
    newFile: 'New File',
    fileName: 'File Name (e.g., utils.cpp or student.h)',
    renameFile: 'Rename File',
    deleteFile: 'Delete File',
    duplicateFile: 'Duplicate File',
    confirmDeleteTitle: 'Confirm Delete',
    confirmDeleteMessage: 'Are you sure you want to delete this item? This action cannot be undone.',
    unsavedChangesTitle: 'Unsaved Changes',
    unsavedChangesMessage: 'This file has unsaved changes. What would you like to do before closing?',
    saveAndClose: 'Save',
    closeWithoutSaving: 'Close Without Saving',
    cancel: 'Cancel',
    confirm: 'Confirm',
    create: 'Create',
    close: 'Close',

    statusReady: 'Ready',
    statusCompiling: 'Compiling...',
    statusCompiledSuccess: 'Compilation Succeeded',
    statusRunning: 'Running...',
    statusCompleted: 'Execution Finished',
    statusCompileError: 'Compilation Error',
    statusRuntimeError: 'Runtime Error',
    statusTimeout: 'Timed Out',
    statusStopped: 'Stopped',

    intelliSenseTitle: 'IntelliSense Suggestions',
    intelliSenseEmpty: 'Start typing C++ code (e.g. std:: or a variable name) to see context-aware suggestions.',
    stdinPlaceholder: 'Enter program input (stdin) here...\nExample:\nNasim\n19',
    stdinHelper: 'Each line is piped directly to std::cin or getline().',
    stdoutEmpty: 'Run the program (▶ Run) to see real compiler output here.',
    noErrorsFound: 'No syntax or compiler errors detected.',
    clearOutput: 'Clear',
    copyOutput: 'Copy',
    exitCodeLabel: 'Exit Code',
    execTimeLabel: 'Time',
    terminalWelcome: 'YUSUF CODE Controlled C++ Terminal (v1.0.0)',
    terminalPromptHelp: 'Available commands: build, run, clear, files, status, version, help',

    syntaxErrorTitle: 'Syntax Error',
    lineLabel: 'Ln',
    colLabel: 'Col',
    spacesLabel: 'Spaces',
    charsLabel: 'Chars',

    settingsTitle: 'YUSUF CODE Settings',
    editorSection: 'Code Editor',
    compilerSection: 'C++ Compiler',
    appearanceSection: 'Appearance & Language',
    behaviorSection: 'System Behavior',
    languageLabel: 'Interface Language',
    fontSizeLabel: 'Font Size (px)',
    tabSizeLabel: 'Tab Size (spaces)',
    wordWrapLabel: 'Word Wrap',
    lineNumbersLabel: 'Show Line Numbers',
    autoClosingLabel: 'Auto-Close Brackets & Quotes',
    intelliSenseToggleLabel: 'Enable C++ IntelliSense',
    diagnosticsToggleLabel: 'Real-Time Diagnostics',
    cppStandardLabel: 'C++ Standard',
    optimizationLabel: 'Optimization Level',
    warningsLabel: 'Compiler Warnings (-Wall)',
    themeLabel: 'Color Theme',
    autosaveLabel: 'Autosave',
    formatOnSaveLabel: 'Format on Save',

    toastProjectSaved: '✓ Project saved',
    toastFileCreated: '✓ File created',
    toastFileDeleted: '✓ File deleted',
    toastCompileSuccess: '✓ Compilation succeeded',
    toastCompileFailed: '❌ Compilation failed',
    toastUnsavedWarning: '⚠ Unsaved changes',
    toastCopied: '✓ Copied to clipboard',
    toastFormatted: '✓ C++ code formatted',
    toastProjectExported: '✓ Project exported as .zip',
    toastProjectImported: '✓ Project imported successfully',
    toastExercisePassed: '✓ Great job! Exercise output matches!',
    toastExerciseFailed: '❌ Output does not match expected result',

    loadExampleToEditor: 'Open in Editor',
    startExercise: 'Solve Exercise in Editor',
    checkAnswer: 'Check Answer',
    expectedResult: 'Expected Result',
    lessonExplanation: 'Lesson Explanation',
    exerciseTask: 'Exercise Task'
  }
};
