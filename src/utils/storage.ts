import type {
  AppSettings,
  UntisCredentials,
  UserProfile,
  Subject,
  GradeEntry,
} from '../types';

const STORAGE_KEY = 'schoolplanner_data';
const SESSION_KEY = 'schoolplanner_untis_session';

const DEFAULT_PROFILE: UserProfile = {
  federalState: 'Nordrhein-Westfalen',
  federalStateCode: 'DE-NW',
  classLevel: '',
  schoolType: 'Gymnasium',
};

const DEFAULT_SETTINGS: AppSettings = {
  credentials: null,
  profile: DEFAULT_PROFILE,
  subjects: [],
  grades: [],
  theme: 'light',
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function saveCredentials(credentials: UntisCredentials): void {
  const settings = loadSettings();
  settings.credentials = credentials;
  saveSettings(settings);
}

export function saveProfile(profile: UserProfile): void {
  const settings = loadSettings();
  settings.profile = profile;
  saveSettings(settings);
}

export function saveSubjects(subjects: Subject[]): void {
  const settings = loadSettings();
  settings.subjects = subjects;
  saveSettings(settings);
}

export function saveGrades(grades: GradeEntry[]): void {
  const settings = loadSettings();
  settings.grades = grades;
  saveSettings(settings);
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export function saveSession(session: string): void {
  localStorage.setItem(SESSION_KEY, session);
}

export function getSession(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function hasCredentials(): boolean {
  return loadSettings().credentials !== null;
}
