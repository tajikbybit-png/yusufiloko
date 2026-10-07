import JSZip from 'jszip';
import { EditorSettings, LanguageCode, Project, ProjectFile } from '../types/ide';
import { createInitialProjects } from '../data/lessonsAndTemplates';

const DB_NAME = 'YusufCodeIDEDB';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';
const LS_SETTINGS_KEY = 'yusuf_code_settings_v1';
const LS_LANG_KEY = 'yusuf_code_lang_v1';
const LS_ACTIVE_STATE_KEY = 'yusuf_code_active_state_v1';

export const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: 14,
  fontFamily: 'JetBrains Mono',
  tabSize: 4,
  insertSpaces: true,
  wordWrap: false,
  lineNumbers: true,
  bracketMatching: true,
  autoClosing: true,
  intelliSense: true,
  diagnostics: true,
  cppStandard: 'c++17',
  optimization: '-O2',
  warnings: true,
  theme: 'yusuf-dark',
  autosave: true,
  formatOnSave: false,
  confirmBeforeDelete: true,
  confirmUnsavedClose: true
};

export interface PersistedWorkspaceState {
  activeProjectId: string | null;
  activeFileId: string | null;
  openTabIds: string[];
  showWelcome: boolean;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const timer = setTimeout(() => {
      reject(new Error('IndexedDB timeout'));
    }, 1200);

    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
          db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => {
        clearTimeout(timer);
        resolve(req.result);
      };
      req.onerror = () => {
        clearTimeout(timer);
        reject(req.error);
      };
      req.onblocked = () => {
        clearTimeout(timer);
        reject(new Error('IndexedDB blocked'));
      };
    } catch (err) {
      clearTimeout(timer);
      reject(err);
    }
  });
}

export async function loadProjectsFromDB(): Promise<Project[]> {
  try {
    const backup = localStorage.getItem('yusuf_code_projects_backup');
    const parsedBackup = backup ? (JSON.parse(backup) as Project[]) : null;

    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_PROJECTS, 'readonly');
      const store = tx.objectStore(STORE_PROJECTS);
      const req = store.getAll();
      req.onsuccess = async () => {
        const list = (req.result as Project[]) || [];
        if (list.length === 0) {
          const seeded = parsedBackup && parsedBackup.length > 0 ? parsedBackup : createInitialProjects();
          await saveProjectsToDB(seeded);
          resolve(seeded);
        } else {
          list.sort((a, b) => b.updatedAt - a.updatedAt);
          resolve(list);
        }
      };
      req.onerror = () => resolve(parsedBackup || createInitialProjects());
    });
  } catch {
    try {
      const backup = localStorage.getItem('yusuf_code_projects_backup');
      if (backup) {
        const parsed = JSON.parse(backup) as Project[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return createInitialProjects();
  }
}

export async function saveProjectsToDB(projects: Project[]): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_PROJECTS, 'readwrite');
    const store = tx.objectStore(STORE_PROJECTS);
    store.clear();
    for (const proj of projects) {
      store.put(proj);
    }
  } catch {
    // Fallback to localStorage if IndexedDB is restricted
    try {
      localStorage.setItem('yusuf_code_projects_backup', JSON.stringify(projects));
    } catch {
      // ignore quota errors
    }
  }
}

export function loadSettings(): EditorSettings {
  try {
    const raw = localStorage.getItem(LS_SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: EditorSettings): void {
  try {
    localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function loadLanguage(): LanguageCode {
  try {
    const saved = localStorage.getItem(LS_LANG_KEY);
    if (saved === 'tg' || saved === 'ru' || saved === 'en') {
      return saved;
    }
    return 'tg'; // Tajik is mandatory default
  } catch {
    return 'tg';
  }
}

export function saveLanguage(lang: LanguageCode): void {
  try {
    localStorage.setItem(LS_LANG_KEY, lang);
  } catch {
    // ignore
  }
}

export function loadWorkspaceState(): PersistedWorkspaceState | null {
  try {
    const raw = localStorage.getItem(LS_ACTIVE_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveWorkspaceState(state: PersistedWorkspaceState): void {
  try {
    localStorage.setItem(LS_ACTIVE_STATE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

const ALLOWED_EXTENSIONS = ['.cpp', '.h', '.hpp', '.cc', '.cxx', '.txt'];

export function sanitizeFileName(rawName: string): string | null {
  const cleaned = rawName.replace(/\\/g, '/').split('/').pop()?.trim() || '';
  if (!cleaned || cleaned.startsWith('.') || /[<>:"/\\|?*]/.test(cleaned)) {
    return null;
  }
  const hasAllowedExt = ALLOWED_EXTENSIONS.some((ext) => cleaned.toLowerCase().endsWith(ext));
  if (!hasAllowedExt) {
    return `${cleaned}.cpp`;
  }
  return cleaned;
}

export async function exportProjectAsZip(project: Project): Promise<void> {
  const zip = new JSZip();
  const folderName = project.name.replace(/[^A-Za-z0-9_\u0400-\u04FF-]/g, '_') || 'MyProject';
  const folder = zip.folder(folderName);

  if (folder) {
    for (const file of project.files) {
      folder.file(file.name, file.content);
    }
    if (project.stdin) {
      folder.file('stdin.txt', project.stdin);
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${folderName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importProjectFromZip(zipFile: File): Promise<Project> {
  const zip = await JSZip.loadAsync(zipFile);
  const files: ProjectFile[] = [];
  let stdin = '';
  const now = Date.now();

  const entries = Object.values(zip.files);
  for (const entry of entries) {
    if (entry.dir) continue;
    // Prevent unsafe path traversal
    if (entry.name.includes('..')) continue;

    const baseName = entry.name.split('/').pop() || '';
    if (!baseName || baseName.startsWith('.')) continue;

    if (baseName.toLowerCase() === 'stdin.txt') {
      stdin = await entry.async('string');
      continue;
    }

    const safeName = sanitizeFileName(baseName);
    if (!safeName) continue;

    const isCppOrHeader = ['.cpp', '.h', '.hpp', '.cc', '.cxx'].some((ext) =>
      safeName.toLowerCase().endsWith(ext)
    );
    if (!isCppOrHeader) continue;

    const content = await entry.async('string');
    if (content.length > 128 * 1024) continue; // Skip oversized files

    // Avoid duplicate filenames
    if (!files.some((f) => f.name === safeName)) {
      files.push({
        id: `file-imp-${now}-${files.length}`,
        name: safeName,
        path: safeName,
        language: safeName.endsWith('.h') || safeName.endsWith('.hpp') ? 'h' : 'cpp',
        content,
        updatedAt: now
      });
    }
  }

  if (files.length === 0) {
    throw new Error('Дар дохили архиви .zip ягон файли дурусти C++ (.cpp, .h) ёфт нашуд.');
  }

  const projectName = zipFile.name.replace(/\.zip$/i, '') || 'ImportedProject';
  return {
    id: `proj-imp-${now}`,
    name: projectName,
    description: 'Лоиҳаи аз архиви .zip воридшуда',
    templateId: 'imported',
    createdAt: now,
    updatedAt: now,
    stdin,
    files
  };
}
