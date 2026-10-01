import type {
  UntisCredentials,
  UntisSession,
  UntisLesson,
  UntisSubstitution,
  UntisHoliday,
} from '../types';

let rpcId = 1;

function getEndpoint(credentials: UntisCredentials): string {
  const school = credentials.school || 'gywa';
  const host = credentials.serverHost || 'gywa.webuntis.com';
  return `https://${host}/WebUntis/jsonrpc.do?school=${school}`;
}

async function rpc<T>(
  credentials: UntisCredentials,
  method: string,
  params: unknown,
  sessionId?: string
): Promise<T> {
  const endpoint = getEndpoint(credentials);
  const id = rpcId++;

  const body: Record<string, unknown> = {
    id,
    method,
    params,
    jsonrpc: '2.0',
  };

  if (sessionId) {
    body.session = sessionId;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const json = await response.json();

  if (json.error) {
    throw new Error(json.error.message || `Untis error code ${json.error.code}`);
  }

  return json.result as T;
}

export async function authenticate(
  credentials: UntisCredentials
): Promise<UntisSession> {
  const result = await rpc<{
    sessionId: string;
    personId: number;
    personType: number;
    klasseId?: number;
  untisMasterDataTimestamp?: number;
  displayName?: string;
  validUntil?: number;
  }>(credentials, 'authenticate', {
    user: credentials.username,
    password: credentials.password,
    client: 'SCHOOLPLANNER',
  });

  const validUntil = result.validUntil
    ? result.validUntil
    : Date.now() + 15 * 60 * 1000;

  return {
    sessionId: result.sessionId,
    personId: result.personId,
    personType: result.personType,
    displayName: result.displayName || credentials.username,
    validUntil,
  };
}

export async function logout(
  credentials: UntisCredentials,
  sessionId: string
): Promise<void> {
  try {
    await rpc(credentials, 'logout', {}, sessionId);
  } catch {
    // ignore
  }
}

export async function getTimetable(
  credentials: UntisCredentials,
  sessionId: string,
  elementId: number,
  elementType: number,
  startDate: string,
  endDate: string
): Promise<UntisLesson[]> {
  const result = await rpc<UntisLesson[]>(credentials, 'getTimetable', {
    options: {
      element: { id: elementId, type: elementType },
      startDate,
      endDate,
      showInfo: true,
      showSubstText: true,
      showLsText: true,
      showLsNumber: true,
      showStudentgroup: true,
      klasseFields: ['id', 'name', 'longname', 'externalkey'],
      roomFields: ['id', 'name', 'longname', 'externalkey'],
      subjectFields: ['id', 'name', 'longname', 'externalkey'],
      teacherFields: ['id', 'name', 'longname', 'externalkey'],
    },
  }, sessionId);

  return result || [];
}

export async function getSubstitutions(
  credentials: UntisCredentials,
  sessionId: string,
  startDate: string,
  endDate: string
): Promise<UntisSubstitution[]> {
  const result = await rpc<UntisSubstitution[]>(credentials, 'getSubstitutions', {
    options: {
      startDate,
      endDate,
    },
  }, sessionId);

  return result || [];
}

export async function getHolidays(
  credentials: UntisCredentials,
  sessionId: string
): Promise<UntisHoliday[]> {
  const result = await rpc<UntisHoliday[]>(credentials, 'getHolidays', {}, sessionId);
  return result || [];
}

export async function getCurrentSchoolYear(
  credentials: UntisCredentials,
  sessionId: string
): Promise<{ id: number; name: string; startDate: string; endDate: string }> {
  return rpc(credentials, 'getCurrentSchoolyear', {}, sessionId);
}

export async function getKlassen(
  credentials: UntisCredentials,
  sessionId: string
): Promise<{ id: number; name: string; longName: string }[]> {
  const result = await rpc<{ id: number; name: string; longName: string }[]>(
    credentials,
    'getKlassen',
    { schoolyearId: 0 },
    sessionId
  );
  return result || [];
}

// Helper: format date as YYYYMMDD
export function formatUntisDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

// Helper: format Untis time (HHMM) to readable
export function formatUntisTime(time: number): string {
  const str = String(time).padStart(4, '0');
  return `${str.slice(0, 2)}:${str.slice(2)}`;
}

// Helper: parse Untis date (YYYYMMDD) to Date
export function parseUntisDate(date: number): Date {
  const str = String(date);
  return new Date(
    parseInt(str.slice(0, 4)),
    parseInt(str.slice(4, 6)) - 1,
    parseInt(str.slice(6, 8))
  );
}
