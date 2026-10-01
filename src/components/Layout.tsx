import { NavLink, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { HomeIcon, CalendarIcon, ChartIcon, BookIcon, UserIcon } from './Icons';

const navItems = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/timetable', label: 'Plan', icon: BookIcon },
  { path: '/grades', label: 'Noten', icon: ChartIcon },
  { path: '/calendar', label: 'Kalender', icon: CalendarIcon },
  { path: '/profile', label: 'Profil', icon: UserIcon },
];

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
<<<<<<< HEAD
      <main className="flex-1 pb-20 overflow-x-hidden">
=======
      <main className="flex-1 pb-20 safe-bottom overflow-x-hidden">
>>>>>>> f7a41313dc415e6f01cf2d737457bd4412f0d8bc
        <div key={location.pathname} className="animate-fade-in">
          {children}
        </div>
      </main>

<<<<<<< HEAD
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-bottom shadow-lg">
        <div className="max-w-md mx-auto flex items-stretch h-16">
=======
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-bottom">
        <div className="max-w-md mx-auto flex items-stretch">
>>>>>>> f7a41313dc415e6f01cf2d737457bd4412f0d8bc
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'text-brand-600' : 'text-slate-400'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={22}
                      className={isActive ? 'text-brand-600' : 'text-slate-400'}
                    />
                    <span className="text-[11px] font-medium leading-none">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
