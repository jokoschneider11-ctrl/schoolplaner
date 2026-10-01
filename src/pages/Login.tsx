import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { UntisCredentials, UserProfile } from '../types';
import { FEDERAL_STATES, SCHOOL_TYPES } from '../types';
import { LockIcon, UserIcon, CheckIcon, BookIcon } from '../components/Icons';

export default function Login() {
  const { setCredentials, setProfile, loginUntis } = useApp();
  const [step, setStep] = useState<'credentials' | 'profile' | 'done'>('credentials');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [creds, setCreds] = useState<UntisCredentials>({
    username: '',
    password: '',
    school: 'gywa',
    serverHost: 'gywa.webuntis.com',
  });

  const [profile, setProfileState] = useState<UserProfile>({
    federalState: 'Nordrhein-Westfalen',
    federalStateCode: 'DE-NW',
    classLevel: '',
    schoolType: 'Gymnasium',
  });

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setCredentials(creds);
    const success = await loginUntis(creds);
    setLoading(false);
    if (success) {
      setStep('profile');
    } else {
      setError('Login fehlgeschlagen. Bitte überprüfe deine Angaben. Du kannst trotzdem fortfahren.');
      setStep('profile');
    }
  };

  const handleProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(profile);
    setStep('done');
  };

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex items-center justify-center p-6">
        <div className="card p-8 max-w-sm w-full text-center animate-scale-in">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckIcon size={32} className="text-success-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Alles bereit!</h2>
          <p className="text-slate-600 text-sm mb-6">
            Dein Schulplaner ist eingerichtet und einsatzbereit.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary w-full"
          >
            Los geht's
          </button>
        </div>
      </div>
    );
  }

  if (step === 'profile') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex items-center justify-center p-6">
        <div className="card p-6 max-w-sm w-full animate-slide-up">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Profil einrichten</h2>
          <p className="text-slate-500 text-sm mb-5">
            Wähle dein Bundesland und deine Schulart.
          </p>
          <form onSubmit={handleProfile} className="space-y-4">
            <div>
              <label className="label">Bundesland</label>
              <select
                className="input-field"
                value={profile.federalStateCode}
                onChange={(e) => {
                  const state = FEDERAL_STATES.find((s) => s.code === e.target.value);
                  if (state) {
                    setProfileState({
                      ...profile,
                      federalState: state.name,
                      federalStateCode: state.code,
                    });
                  }
                }}
              >
                {FEDERAL_STATES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Klassenstufe</label>
              <input
                type="text"
                className="input-field"
                placeholder="z.B. 8a"
                value={profile.classLevel}
                onChange={(e) =>
                  setProfileState({ ...profile, classLevel: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">Schulart</label>
              <select
                className="input-field"
                value={profile.schoolType}
                onChange={(e) =>
                  setProfileState({ ...profile, schoolType: e.target.value })
                }
              >
                {SCHOOL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary w-full">
              Fertig
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex items-center justify-center p-6">
      <div className="card p-6 max-w-sm w-full animate-slide-up">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-600/20">
            <BookIcon size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">SchoolPlanner</h1>
          <p className="text-slate-500 text-sm mt-1">
            Dein digitaler Schulplaner mit Noten, Stundenplan und Ferien.
          </p>
        </div>

        <form onSubmit={handleCredentials} className="space-y-4">
          <div>
            <label className="label">WebUntis Benutzername</label>
            <div className="relative">
              <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Benutzername"
                value={creds.username}
                onChange={(e) => setCreds({ ...creds, username: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Passwort</label>
            <div className="relative">
              <LockIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                className="input-field pl-10"
                placeholder="Passwort"
                value={creds.password}
                onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Schule</label>
              <input
                type="text"
                className="input-field"
                placeholder="gywa"
                value={creds.school}
                onChange={(e) => setCreds({ ...creds, school: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Server</label>
              <input
                type="text"
                className="input-field"
                placeholder="gywa.webuntis.com"
                value={creds.serverHost}
                onChange={(e) => setCreds({ ...creds, serverHost: e.target.value })}
              />
            </div>
          </div>

          {error && (
            <div className="bg-warning-50 text-warning-700 text-sm rounded-xl p-3 border border-warning-200">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verbinde...
              </>
            ) : (
              'Anmelden'
            )}
          </button>

          <p className="text-xs text-slate-400 text-center leading-relaxed">
            Deine Zugangsdaten werden ausschließlich lokal auf deinem Gerät gespeichert.
            Sie werden niemals an einen externen Server gesendet.
          </p>
        </form>
      </div>
    </div>
  );
}
