// ===== Core Types =====

export interface UntisCredentials {
  username: string;
  password: string;
  school: string;
  serverHost: string;
}

export interface UserProfile {
  federalState: string;
  federalStateCode: string;
  classLevel: string;
  schoolType: string;
}

export interface UntisSession {
  sessionId: string;
  personId: number;
  personType: number;
  displayName: string;
  validUntil: number;
}

export interface UntisLesson {
  id: number;
  date: number;
  startTime: number;
  endTime: number;
  subject: string;
  subjectLong: string;
  teacher: string;
  teacherLong: string;
  room: string;
  roomLong: string;
  classes: string;
  code?: string;
  info?: string;
  substText?: string;
  statflags?: string;
  elementId: number;
  elementType: number;
}

export interface UntisSubstitution {
  date: number;
  startTime: number;
  endTime: number;
  subject: string;
  teacher: string;
  room: string;
  classes: string;
  type: string;
  text: string;
  elementId: number;
  elementType: number;
}

export interface UntisHoliday {
  id: number;
  name: string;
  longName: string;
  startDate: number;
  endDate: number;
}

// ===== Grade Types =====

export type GradeModifier = '+' | '' | '-' | null;

export interface GradeEntry {
  id: string;
  subjectId: string;
  value: number;
  modifier: GradeModifier;
  categoryId: string;
  date: string;
  note: string;
  pointSystem: boolean;
}

export interface GradeCategory {
  id: string;
  name: string;
  weight: number;
}

export interface Subject {
  id: string;
  name: string;
  untisSubject: string;
  color: string;
  categories: GradeCategory[];
  pointSystem: boolean;
}

// ===== Holiday Types =====

export interface Holiday {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  type: 'public' | 'school';
  subdivisionCode: string;
}

// ===== File Attachment Types =====

export interface Attachment {
  id: string;
  subjectId: string;
  name: string;
  type: string;
  size: number;
  data?: string;
  createdAt: string;
  linkedToExamDate?: string;
}

// ===== Settings =====

export interface AppSettings {
  credentials: UntisCredentials | null;
  profile: UserProfile;
  subjects: Subject[];
  grades: GradeEntry[];
  theme: 'light' | 'dark';
}

// ===== Federal States =====

export const FEDERAL_STATES = [
  { name: 'Baden-Württemberg', code: 'DE-BW' },
  { name: 'Bayern', code: 'DE-BY' },
  { name: 'Berlin', code: 'DE-BE' },
  { name: 'Brandenburg', code: 'DE-BB' },
  { name: 'Bremen', code: 'DE-HB' },
  { name: 'Hamburg', code: 'DE-HH' },
  { name: 'Hessen', code: 'DE-HE' },
  { name: 'Mecklenburg-Vorpommern', code: 'DE-MV' },
  { name: 'Niedersachsen', code: 'DE-NI' },
  { name: 'Nordrhein-Westfalen', code: 'DE-NW' },
  { name: 'Rheinland-Pfalz', code: 'DE-RP' },
  { name: 'Saarland', code: 'DE-SL' },
  { name: 'Sachsen', code: 'DE-SN' },
  { name: 'Sachsen-Anhalt', code: 'DE-ST' },
  { name: 'Schleswig-Holstein', code: 'DE-SH' },
  { name: 'Thüringen', code: 'DE-TH' },
];

export const SCHOOL_TYPES = [
  'Gymnasium',
  'Realschule',
  'Hauptschule',
  'Gesamtschule',
  'Mittelschule',
  'Waldorfschule',
  'Berufsschule',
  'Andere',
];

export const SUBJECT_COLORS = [
  '#3377ff', '#ff7d0a', '#1bb452', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316',
  '#14b8a6', '#6366f1', '#eab308', '#10b981', '#f43f5e',
];
