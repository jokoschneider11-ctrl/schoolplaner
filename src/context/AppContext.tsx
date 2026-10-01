import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type {
  AppSettings,
  UntisCredentials,
  UserProfile,
  Subject,
  GradeEntry,
  UntisSession,
  Holiday,
} from '../types';
import {
  loadSettings,
  saveSettings,
  saveCredentials,
  saveProfile,
  saveSubjects,
  saveGrades,
  clearAllData,
  saveSession,
  getSession,
  clearSession,
  clearCredentials,
} from '../utils/storage';
import { authenticate, logout } from '../utils/untis';
import { fetchHolidays } from '../utils/holidays';

interface AppContextValue {
  settings: AppSettings;
  setCredentials: (creds: UntisCredentials) => void;
  setProfile: (profile: UserProfile) => void;
  setSubjects: (subjects: Subject[]) => void;
  setGrades: (grades: GradeEntry[]) => void;
  session: UntisSession | null;
  loginUntis: (creds: UntisCredentials) => Promise<boolean>;
  logoutUntis: () => void;
  clearCredentials: () => void;
  holidays: Holiday[];
  loadingHolidays: boolean;
  refreshHolidays: () => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [session, setSession] = useState<UntisSession | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loadingHolidays, setLoadingHolidays] = useState(false);

  const setCredentialsState = useCallback((creds: UntisCredentials) => {
    saveCredentials(creds);
    setSettings(loadSettings());
  }, []);

  const setProfileState = useCallback((profile: UserProfile) => {
    saveProfile(profile);
    setSettings(loadSettings());
  }, []);

  const setSubjectsState = useCallback((subjects: Subject[]) => {
    saveSubjects(subjects);
    setSettings(loadSettings());
  }, []);

  const setGradesState = useCallback((grades: GradeEntry[]) => {
    saveGrades(grades);
    setSettings(loadSettings());
  }, []);

  const loginUntis = useCallback(async (creds: UntisCredentials): Promise<boolean> => {
    try {
      const sess = await authenticate(creds);
      setSession(sess);
      saveSession(sess.sessionId);
      return true;
    } catch (err) {
      console.error('Untis login failed:', err);
      throw err;
    }
  }, []);

  const logoutUntis = useCallback(() => {
    if (settings.credentials && session) {
      logout(settings.credentials, session.sessionId).catch(() => {});
    }
    clearSession();
    setSession(null);
  }, [settings.credentials, session]);

  const clearCredentialsState = useCallback(() => {
    clearCredentials();
    clearSession();
    setSession(null);
    setSettings(loadSettings());
  }, []);

  const refreshHolidays = useCallback(async () => {
    setLoadingHolidays(true);
    try {
      const validFrom = '2026-01-01';
      const validTo = '2027-12-31';
      const data = await fetchHolidays(settings.profile.federalStateCode, validFrom, validTo);
      setHolidays(data);
    } catch (err) {
      console.error('Failed to load holidays:', err);
    } finally {
      setLoadingHolidays(false);
    }
  }, [settings.profile.federalStateCode]);

  const resetAll = useCallback(() => {
    clearAllData();
    setSettings(loadSettings());
    setSession(null);
    setHolidays([]);
  }, []);

  useEffect(() => {
    refreshHolidays();
  }, [refreshHolidays]);

  // Auto-login on startup if credentials exist
  useEffect(() => {
    if (settings.credentials && !session) {
      loginUntis(settings.credentials).catch(() => {
        // Silent fail on auto-login
      });
    }
  }, [settings.credentials, session, loginUntis]);

  const value: AppContextValue = {
    settings,
    setCredentials: setCredentialsState,
    setProfile: setProfileState,
    setSubjects: setSubjectsState,
    setGrades: setGradesState,
    session,
    loginUntis,
    logoutUntis,
    clearCredentials: clearCredentialsState,
    holidays,
    loadingHolidays,
    refreshHolidays,
    resetAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
