import type { Holiday } from '../types';

const PUBLIC_HOLIDAYS_BASE = 'https://api.openholidaysapi.org/PublicHolidays';
const SCHOOL_HOLIDAYS_BASE = 'https://api.openholidaysapi.org/SchoolHolidays';

// Static fallback for NRW holidays 2026-2027
const NRW_FALLBACK: Holiday[] = [
  { id: 'fb-nw-1', name: 'Neujahr', startDate: '2026-01-01', endDate: '2026-01-01', type: 'public', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-2', name: 'Karfreitag', startDate: '2026-04-03', endDate: '2026-04-03', type: 'public', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-3', name: 'Ostermontag', startDate: '2026-04-06', endDate: '2026-04-06', type: 'public', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-4', name: 'Tag der Arbeit', startDate: '2026-05-01', endDate: '2026-05-01', type: 'public', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-5', name: 'Christi Himmelfahrt', startDate: '2026-05-14', endDate: '2026-05-14', type: 'public', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-6', name: 'Pfingstmontag', startDate: '2026-05-25', endDate: '2026-05-25', type: 'public', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-7', name: 'Fronleichnam', startDate: '2026-06-04', endDate: '2026-06-04', type: 'public', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-8', name: 'Tag der Deutschen Einheit', startDate: '2026-10-03', endDate: '2026-10-03', type: 'public', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-9', name: 'Allerheiligen', startDate: '2026-11-01', endDate: '2026-11-01', type: 'public', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-10', name: '1. Weihnachtstag', startDate: '2026-12-25', endDate: '2026-12-25', type: 'public', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-11', name: '2. Weihnachtstag', startDate: '2026-12-26', endDate: '2026-12-26', type: 'public', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-12', name: 'Neujahr', startDate: '2027-01-01', endDate: '2027-01-01', type: 'public', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-13', name: 'Karfreitag', startDate: '2027-03-26', endDate: '2027-03-26', type: 'public', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-14', name: 'Ostermontag', startDate: '2027-03-29', endDate: '2027-03-29', type: 'public', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-15', name: 'Tag der Arbeit', startDate: '2027-05-01', endDate: '2027-05-01', type: 'public', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-16', name: 'Christi Himmelfahrt', startDate: '2027-05-06', endDate: '2027-05-06', type: 'public', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-17', name: 'Pfingstmontag', startDate: '2027-05-17', endDate: '2027-05-17', type: 'public', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-18', name: 'Fronleichnam', startDate: '2027-05-27', endDate: '2027-05-27', type: 'public', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-19', name: 'Tag der Deutschen Einheit', startDate: '2027-10-03', endDate: '2027-10-03', type: 'public', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-20', name: 'Allerheiligen', startDate: '2027-11-01', endDate: '2027-11-01', type: 'public', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-21', name: '1. Weihnachtstag', startDate: '2027-12-25', endDate: '2027-12-25', type: 'public', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-22', name: '2. Weihnachtstag', startDate: '2027-12-26', endDate: '2027-12-26', type: 'public', subdivisionCode: 'DE-NW' },
  // School holidays NRW
  { id: 'fb-nw-s1', name: 'Osterferien', startDate: '2026-03-30', endDate: '2026-04-10', type: 'school', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-s2', name: 'Pfingstferien', startDate: '2026-05-26', endDate: '2026-06-02', type: 'school', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-s3', name: 'Sommerferien', startDate: '2026-07-14', endDate: '2026-08-24', type: 'school', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-s4', name: 'Herbstferien', startDate: '2026-10-05', endDate: '2026-10-17', type: 'school', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-s5', name: 'Weihnachtsferien', startDate: '2026-12-21', endDate: '2027-01-05', type: 'school', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-s6', name: 'Osterferien', startDate: '2027-03-22', endDate: '2027-04-02', type: 'school', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-s7', name: 'Pfingstferien', startDate: '2027-05-18', endDate: '2027-05-28', type: 'school', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-s8', name: 'Sommerferien', startDate: '2027-07-07', endDate: '2027-08-17', type: 'school', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-s9', name: 'Herbstferien', startDate: '2027-10-11', endDate: '2027-10-22', type: 'school', subdivisionCode: 'DE-NW' },
  { id: 'fb-nw-s10', name: 'Weihnachtsferien', startDate: '2027-12-22', endDate: '2028-01-07', type: 'school', subdivisionCode: 'DE-NW' },
];

export async function fetchHolidays(
  subdivisionCode: string,
  validFrom: string,
  validTo: string
): Promise<Holiday[]> {
  const holidays: Holiday[] = [];

  try {
    const publicUrl = `${PUBLIC_HOLIDAYS_BASE}?countryIsoCode=DE&subdivisionCode=${subdivisionCode}&validFrom=${validFrom}&validTo=${validTo}`;
    const publicResp = await fetch(publicUrl);
    if (publicResp.ok) {
      const publicData = await publicResp.json();
      for (const item of publicData) {
        holidays.push({
          id: `pub-${item.id || item.name}`,
          name: item.name?.[0]?.text || item.name || 'Public Holiday',
          startDate: item.startDate,
          endDate: item.endDate,
          type: 'public',
          subdivisionCode,
        });
      }
    }
  } catch {
    // ignore
  }

  try {
    const schoolUrl = `${SCHOOL_HOLIDAYS_BASE}?countryIsoCode=DE&subdivisionCode=${subdivisionCode}&validFrom=${validFrom}&validTo=${validTo}`;
    const schoolResp = await fetch(schoolUrl);
    if (schoolResp.ok) {
      const schoolData = await schoolResp.json();
      for (const item of schoolData) {
        holidays.push({
          id: `sch-${item.id || item.name}`,
          name: item.name?.[0]?.text || item.name || 'School Holiday',
          startDate: item.startDate,
          endDate: item.endDate,
          type: 'school',
          subdivisionCode,
        });
      }
    }
  } catch {
    // ignore
  }

  if (holidays.length === 0) {
    return NRW_FALLBACK.filter(
      (h) => h.subdivisionCode === 'DE-NW' || subdivisionCode === 'DE-NW'
    );
  }

  return holidays;
}

export function getFallbackHolidays(subdivisionCode: string): Holiday[] {
  if (subdivisionCode === 'DE-NW') return NRW_FALLBACK;
  return NRW_FALLBACK; // fallback always NRW
}

export function getNextHoliday(holidays: Holiday[], from: Date = new Date()): Holiday | null {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const upcoming = holidays
    .filter((h) => new Date(h.startDate) >= today)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return upcoming[0] || null;
}

export function daysUntil(holiday: Holiday, from: Date = new Date()): number {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const target = new Date(holiday.startDate);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isDateInHoliday(date: Date, holidays: Holiday[]): Holiday | null {
  const dateStr = date.toISOString().slice(0, 10);
  for (const h of holidays) {
    if (dateStr >= h.startDate && dateStr <= h.endDate) return h;
  }
  return null;
}
