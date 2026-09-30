import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { isDateInHoliday, daysUntil } from '../utils/holidays';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '../components/Icons';

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];
const DAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export default function Calendar() {
  const { holidays, loadingHolidays } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startOffset = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();

    const calendarDays: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) calendarDays.push(null);
    for (let i = 1; i <= totalDays; i++) {
      calendarDays.push(new Date(year, month, i));
    }
    while (calendarDays.length % 7 !== 0) calendarDays.push(null);

    return calendarDays;
  }, [currentMonth]);

  const upcomingHolidays = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return holidays
      .filter((h) => new Date(h.endDate) >= now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [holidays]);

  const selectedHoliday = selectedDate ? isDateInHoliday(selectedDate, holidays) : null;

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Kalender</h1>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() =>
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
          }
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
        >
          <ChevronLeftIcon size={20} className="text-slate-600" />
        </button>
        <h2 className="text-base font-bold text-slate-900">
          {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button
          onClick={() =>
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
          }
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
        >
          <ChevronRightIcon size={20} className="text-slate-600" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="card p-3 mb-4">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_NAMES.map((day) => (
            <div key={day} className="text-center text-[11px] font-semibold text-slate-400 py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, idx) => {
            if (!date) return <div key={idx} />;

            const holiday = isDateInHoliday(date, holidays);
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(date)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative ${
                  isSelected ? 'ring-2 ring-brand-500' : ''
                } ${
                  holiday
                    ? holiday.type === 'school'
                      ? 'bg-success-100 text-success-700'
                      : 'bg-accent-100 text-accent-700'
                    : isToday
                    ? 'bg-brand-600 text-white'
                    : isWeekend
                    ? 'text-slate-400 bg-slate-50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="font-medium">{date.getDate()}</span>
                {holiday && (
                  <div
                    className="w-1 h-1 rounded-full mt-0.5"
                    style={{
                      backgroundColor: holiday.type === 'school' ? '#0f9342' : '#f06000',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-success-100" />
          <span>Schulferien</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-accent-100" />
          <span>Gesetzlicher Feiertag</span>
        </div>
      </div>

      {/* Selected Date Info */}
      {selectedDate && (
        <div className="card p-4 mb-4 animate-scale-in">
          <p className="text-sm font-semibold text-slate-900">
            {selectedDate.toLocaleDateString('de-DE', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
          {selectedHoliday ? (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    selectedHoliday.type === 'school' ? 'bg-success-500' : 'bg-accent-500'
                  }`}
                />
                <span className="text-sm text-slate-600">{selectedHoliday.name}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(selectedHoliday.startDate).toLocaleDateString('de-DE')} -{' '}
                {new Date(selectedHoliday.endDate).toLocaleDateString('de-DE')}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-1">Kein Feiertag oder Ferien</p>
          )}
        </div>
      )}

      {/* Upcoming Holidays */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-2">Anstehende Ferien & Feiertage</h3>
        {loadingHolidays && upcomingHolidays.length === 0 && (
          <div className="space-y-2">
            <div className="skeleton h-16 rounded-xl" />
            <div className="skeleton h-16 rounded-xl" />
          </div>
        )}
        {!loadingHolidays && upcomingHolidays.length === 0 && (
          <div className="card p-4 text-center">
            <CalendarIcon size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Keine Ferien in Sicht.</p>
          </div>
        )}
        <div className="space-y-2">
          {upcomingHolidays.slice(0, 8).map((holiday) => {
            const days = daysUntil(holiday);
            return (
              <div key={holiday.id} className="card p-3 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    holiday.type === 'school'
                      ? 'bg-success-100 text-success-600'
                      : 'bg-accent-100 text-accent-600'
                  }`}
                >
                  <CalendarIcon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {holiday.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(holiday.startDate).toLocaleDateString('de-DE', {
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    -{' '}
                    {new Date(holiday.endDate).toLocaleDateString('de-DE', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  {days > 0 ? (
                    <>
                      <p className="text-lg font-bold text-slate-900">{days}</p>
                      <p className="text-[10px] text-slate-400">Tage</p>
                    </>
                  ) : (
                    <span className="text-xs bg-success-100 text-success-700 px-2 py-1 rounded-full font-medium">
                      Aktuell
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
