import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getNextHoliday, daysUntil } from '../utils/holidays';
import { formatUntisDate, formatUntisTime, getTimetable, parseUntisDate } from '../utils/untis';
import type { UntisLesson } from '../types';
import { calculateOverallGPA, formatAverage } from '../utils/grades';
import { isToday } from '../utils/date';
import { ClockIcon, MapPinIcon, AlertIcon, ChartIcon, BookIcon, CalendarIcon } from '../components/Icons';

export default function Home() {
  const navigate = useNavigate();
  const { settings, session, holidays, loadingHolidays } = useApp();
  const [todaysLessons, setTodaysLessons] = useState<UntisLesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [lessonError, setLessonError] = useState('');

  const nextHoliday = useMemo(() => getNextHoliday(holidays), [holidays]);
  const daysLeft = nextHoliday ? daysUntil(nextHoliday) : null;

  const overallGPA = useMemo(
    () => calculateOverallGPA(settings.subjects, settings.grades),
    [settings.subjects, settings.grades]
  );

  useEffect(() => {
    if (!session || !settings.credentials) return;

    const fetchToday = async () => {
      setLoadingLessons(true);
      setLessonError('');
      try {
        const today = formatUntisDate(new Date());
        const lessons = await getTimetable(
          settings.credentials!,
          session.sessionId,
          session.personId,
          session.personType,
          today,
          today
        );
        setTodaysLessons(lessons);
      } catch (err) {
        setLessonError('Stundenplan konnte nicht geladen werden.');
        console.error(err);
      } finally {
        setLoadingLessons(false);
      }
    };

    fetchToday();
  }, [session, settings.credentials]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 11) return 'Guten Morgen';
    if (h < 17) return 'Hallo';
    return 'Guten Abend';
  }, []);

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-4">
      {/* Header */}
      <div className="mb-5">
        <p className="text-slate-400 text-sm">{greeting}</p>
        <h1 className="text-2xl font-bold text-slate-900">
          {session?.displayName || settings.credentials?.username || 'Schüler'}
        </h1>
      </div>

      {/* Holiday Ticker */}
      {nextHoliday && daysLeft !== null && (
        <div
          className="rounded-2xl p-4 mb-4 relative overflow-hidden animate-slide-up cursor-pointer"
          style={{
            background: daysLeft <= 7
              ? 'linear-gradient(135deg, #1bb452, #0f9342)'
              : daysLeft <= 30
              ? 'linear-gradient(135deg, #3377ff, #1d54f5)'
              : 'linear-gradient(135deg, #ff7d0a, #f06000)',
          }}
          onClick={() => navigate('/calendar')}
        >
          <div className="relative z-10">
            <p className="text-white/80 text-xs font-medium uppercase tracking-wide">
              Nächste Ferien
            </p>
            <p className="text-white text-lg font-bold mt-1">{nextHoliday.name}</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-white text-3xl font-bold">{daysLeft}</span>
              <span className="text-white/80 text-sm">
                {daysLeft === 1 ? 'Tag' : 'Tage'} bis zu den Ferien
              </span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-20">
            <CalendarIcon size={100} className="text-white" />
          </div>
        </div>
      )}

      {loadingHolidays && !nextHoliday && (
        <div className="skeleton h-24 rounded-2xl mb-4" />
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => navigate('/grades')}
          className="card p-4 text-left active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
              <ChartIcon size={16} className="text-brand-600" />
            </div>
            <span className="text-xs text-slate-500 font-medium">Notenschnitt</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {formatAverage(overallGPA)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {settings.subjects.length} Fächer
          </p>
        </button>

        <button
          onClick={() => navigate('/timetable')}
          className="card p-4 text-left active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
              <BookIcon size={16} className="text-accent-600" />
            </div>
            <span className="text-xs text-slate-500 font-medium">Heute</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {todaysLessons.length}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {todaysLessons.length === 1 ? 'Stunde' : 'Stunden'}
          </p>
        </button>
      </div>

      {/* Today's Schedule */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900">Heutiger Stundenplan</h2>
          <button
            onClick={() => navigate('/timetable')}
            className="text-sm text-brand-600 font-medium"
          >
            Alle
          </button>
        </div>

        {loadingLessons && (
          <div className="space-y-2">
            <div className="skeleton h-20 rounded-xl" />
            <div className="skeleton h-20 rounded-xl" />
            <div className="skeleton h-20 rounded-xl" />
          </div>
        )}

        {lessonError && !loadingLessons && (
          <div className="card p-4 text-center">
            <AlertIcon size={24} className="text-warning-500 mx-auto mb-2" />
            <p className="text-sm text-slate-500">{lessonError}</p>
          </div>
        )}

        {!loadingLessons && !lessonError && todaysLessons.length === 0 && (
          <div className="card p-6 text-center">
            <p className="text-sm text-slate-400">
              Heute keine Stunden. Enjoy deinen freien Tag!
            </p>
          </div>
        )}

        {!loadingLessons && todaysLessons.length > 0 && (
          <div className="space-y-2">
            {todaysLessons
              .sort((a, b) => a.startTime - b.startTime)
              .map((lesson) => {
                const subject = settings.subjects.find(
                  (s) => s.untisSubject === lesson.subject
                );
                const color = subject?.color || '#94a3b8';
                const isCancelled = lesson.code === 'cancelled' || lesson.code === 'irregular';
                const hasSub = !!lesson.substText || !!lesson.info;

                return (
                  <div
                    key={lesson.id}
                    className={`card p-3 flex items-center gap-3 ${
                      isCancelled ? 'opacity-60' : ''
                    }`}
                  >
                    <div
                      className="w-1.5 h-12 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <p
                          className="font-semibold text-sm truncate"
                          style={{ color: isCancelled ? '#94a3b8' : color }}
                        >
                          {lesson.subjectLong || lesson.subject || '—'}
                        </p>
                        {isCancelled && (
                          <span className="text-[10px] bg-error-100 text-error-600 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                            Entfall
                          </span>
                        )}
                        {hasSub && (
                          <span className="text-[10px] bg-warning-100 text-warning-700 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                            Vertretung
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <ClockIcon size={12} />
                          {formatUntisTime(lesson.startTime)} - {formatUntisTime(lesson.endTime)}
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <MapPinIcon size={12} className="flex-shrink-0" />
                          <span className="truncate">{lesson.room || '—'}</span>
                        </span>
                      </div>
                      {lesson.substText && (
                        <p className="text-xs text-warning-600 mt-1 truncate">
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
    </div>
  );
}
