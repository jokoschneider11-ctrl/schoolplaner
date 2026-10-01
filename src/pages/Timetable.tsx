import { useEffect, useState, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  formatUntisDate,
  formatUntisTime,
  getTimetable,
  getSubstitutions,
  parseUntisDate,
} from '../utils/untis';
import type { UntisLesson, UntisSubstitution } from '../types';
import { getWeekDays, isToday, getWeekNumber } from '../utils/date';
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, MapPinIcon, AlertIcon } from '../components/Icons';
import { Link } from 'react-router-dom';

const DAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];

export default function Timetable() {
  const { settings, session } = useApp();
  const [weekOffset, setWeekOffset] = useState(0);
  const [lessons, setLessons] = useState<UntisLesson[]>([]);
  const [substitutions, setSubstitutions] = useState<UntisSubstitution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const weekStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const weekNum = useMemo(() => getWeekNumber(weekStart), [weekStart]);

  const fetchData = useCallback(async () => {
    if (!session || !settings.credentials) {
      setError('Bitte melde dich bei WebUntis an, um den Stundenplan zu sehen.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const start = formatUntisDate(weekDays[0]);
      const end = formatUntisDate(weekDays[4]);

      const [lessonData, subData] = await Promise.all([
        getTimetable(
          settings.credentials,
          session.sessionId,
          session.personId,
          session.personType,
          start,
          end
        ),
        getSubstitutions(settings.credentials, session.sessionId, start, end).catch(() => []),
      ]);

      setLessons(lessonData);
      setSubstitutions(subData);
    } catch (err) {
      setError('Stundenplan konnte nicht geladen werden.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [session, settings.credentials, weekDays]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const lessonsByDay = useMemo(() => {
    const map: Record<number, UntisLesson[]> = {};
    for (let i = 0; i < 5; i++) map[i] = [];
    for (const lesson of lessons) {
      const date = parseUntisDate(lesson.date);
      const dayIdx = weekDays.findIndex((d) => isToday(d) === isToday(date) && d.toDateString() === date.toDateString());
      if (dayIdx >= 0) {
        map[dayIdx].push(lesson);
      }
    }
    for (const key of Object.keys(map)) {
      map[+key].sort((a, b) => a.startTime - b.startTime);
    }
    return map;
  }, [lessons, weekDays]);

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setWeekOffset((w) => w - 1)}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
        >
          <ChevronLeftIcon size={20} className="text-slate-600" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-slate-900">
            KW {weekNum}
          </h1>
          <p className="text-xs text-slate-400">
            {weekDays[0].toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })} -{' '}
            {weekDays[4].toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
          </p>
        </div>
        <button
          onClick={() => setWeekOffset((w) => w + 1)}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
        >
          <ChevronRightIcon size={20} className="text-slate-600" />
        </button>
      </div>

      {weekOffset !== 0 && (
        <button
          onClick={() => setWeekOffset(0)}
          className="text-sm text-brand-600 font-medium mb-3 w-full text-center"
        >
          Zur aktuellen Woche
        </button>
      )}

      {error && (
        <div className="card p-4 text-center mb-4">
          <AlertIcon size={24} className="text-warning-500 mx-auto mb-2" />
          <p className="text-sm text-slate-500">{error}</p>
          {!session && (
            <Link to="/profile" className="btn-primary mt-3 text-sm inline-block">
              Zu den Einstellungen
            </Link>
          )}
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {weekDays.map((day, dayIdx) => {
            const dayLessons = lessonsByDay[dayIdx] || [];
            const isCurrentDay = isToday(day);

            return (
              <div key={dayIdx}>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                      isCurrentDay ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="text-[10px] font-medium leading-none">
                      {DAY_LABELS[dayIdx]}
                    </span>
                    <span className="text-sm font-bold leading-none mt-0.5">
                      {day.getDate()}
                    </span>
                  </div>
                  <h2 className="text-sm font-semibold text-slate-700">
                    {day.toLocaleDateString('de-DE', { weekday: 'long' })}
                  </h2>
                </div>

                {dayLessons.length === 0 ? (
                  <div className="card p-3 ml-12">
                    <p className="text-xs text-slate-400">Keine Stunden</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 ml-12">
                    {dayLessons.map((lesson) => {
                      const subject = settings.subjects.find(
                        (s) => s.untisSubject === lesson.subject
                      );
                      const color = subject?.color || '#94a3b8';
                      const isCancelled = lesson.code === 'cancelled' || lesson.code === 'irregular';
                      const hasSub = !!lesson.substText || !!lesson.info;

                      return (
                        <div
                          key={lesson.id}
                          className={`card p-2.5 flex items-center gap-2.5 ${
                            isCancelled ? 'opacity-50' : ''
                          }`}
                        >
                          <div
                            className="w-1 h-10 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="flex items-center gap-1.5">
                              <p
                                className="font-semibold text-xs truncate break-anywhere"
                                style={{ color: isCancelled ? '#94a3b8' : color }}
                              >
                                {lesson.subjectLong || lesson.subject || '—'}
                              </p>
                              {isCancelled && (
                                <span className="text-[9px] bg-error-100 text-error-600 px-1 py-0.5 rounded-full font-medium flex-shrink-0">
                                  Entfall
                                </span>
                              )}
                              {hasSub && (
                                <span className="text-[9px] bg-warning-100 text-warning-700 px-1 py-0.5 rounded-full font-medium flex-shrink-0">
                                  Vert.
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                              <span className="flex items-center gap-0.5">
                                <ClockIcon size={10} />
                                {formatUntisTime(lesson.startTime)}
                              </span>
                              <span className="flex items-center gap-0.5 truncate">
                                <MapPinIcon size={10} className="flex-shrink-0" />
                                <span className="truncate break-anywhere">{lesson.room || '—'}</span>
                              </span>
                              {lesson.teacher && (
                                <span className="truncate break-anywhere">{lesson.teacher}</span>
                              )}
                            </div>
                            {lesson.substText && (
                              <p className="text-[10px] text-warning-600 mt-0.5 truncate break-anywhere">
                                {lesson.substText}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
