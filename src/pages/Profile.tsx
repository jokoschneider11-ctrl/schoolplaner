import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FEDERAL_STATES, SCHOOL_TYPES } from '../types';
import type { UserProfile, UntisCredentials } from '../types';
import {
  SettingsIcon,
  HelpIcon,
  MailIcon,
  ChevronDownIcon,
  LogoutIcon,
  LockIcon,
  UserIcon,
  AlertIcon,
} from '../components/Icons';

const FAQ_ITEMS = [
  {
    q: 'Wie melde ich mich bei WebUntis an?',
    a: 'Gehe zu den Kontoeinstellungen und gib deinen WebUntis-Benutzernamen und dein Passwort ein. Die Anmeldedaten werden lokal auf deinem Gerät gespeichert und nicht an externe Server gesendet.',
  },
  {
    q: 'Warum wird mein Stundenplan nicht angezeigt?',
    a: 'Überprüfe, ob deine WebUntis-Anmeldedaten korrekt sind und du eine aktive Internetverbindung hast. Du kannst dich im Profil-Tab neu anmelden.',
  },
  {
    q: 'Wo werden meine Noten gespeichert?',
    a: 'Alle Noten und Fächer werden ausschließlich lokal in deinem Browser gespeichert. Es werden keine Daten an einen Server übertragen.',
  },
  {
    q: 'Wie sichere ich meine Daten?',
    a: 'Da alle Daten lokal gespeichert werden, solltest du regelmäßig ein Backup erstellen. Notiere dir wichtige Noten oder mache Screenshots. Beim Löschen der Browser-Daten gehen alle Informationen verloren.',
  },
  {
    q: 'Kann ich Dateien anhängen?',
    a: 'Ja, du kannst PDFs, Dokumente oder Fotos direkt an ein Fach anhängen. Diese werden lokal im Browser-Speicher (IndexedDB) abgelegt und nicht hochgeladen.',
  },
  {
    q: 'Wie ändere ich mein Bundesland?',
    a: 'Gehe zu den Profileinstellungen und wähle ein anderes Bundesland. Die Ferien werden automatisch aktualisiert.',
  },
];

export default function Profile() {
  const { settings, setProfile, setCredentials, loginUntis, logoutUntis, session, resetAll, refreshHolidays } = useApp();
  const [showAccount, setShowAccount] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showFaq, setShowFaq] = useState<number | null>(0);
  const [showReset, setShowReset] = useState(false);

  const [profile, setProfileState] = useState<UserProfile>(settings.profile);
  const [creds, setCreds] = useState<UntisCredentials>(
    settings.credentials || { username: '', password: '', school: 'gywa', serverHost: 'gywa.webuntis.com' }
  );

  const handleProfileSave = () => {
    setProfile(profile);
    setShowProfileEdit(false);
    refreshHolidays();
  };

  const handleCredsSave = async () => {
    setCredentials(creds);
    await loginUntis(creds);
    setShowAccount(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Profil</h1>

      {/* User Card */}
      <div className="card p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <UserIcon size={28} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 truncate">
              {session?.displayName || settings.credentials?.username || 'Nicht angemeldet'}
            </p>
            <p className="text-sm text-slate-400 truncate">
              {settings.profile.schoolType} · {settings.profile.classLevel || 'Keine Klasse'}
            </p>
          </div>
          <div
            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              session ? 'bg-success-500' : 'bg-slate-300'
            }`}
          />
        </div>
      </div>

      {/* Profile Settings */}
      <Section title="Profileinstellungen" icon={SettingsIcon}>
        <div className="space-y-3">
          <InfoRow label="Bundesland" value={settings.profile.federalState} />
          <InfoRow label="Klassenstufe" value={settings.profile.classLevel || '—'} />
          <InfoRow label="Schulart" value={settings.profile.schoolType} />
          <button
            onClick={() => {
              setProfileState(settings.profile);
              setShowProfileEdit(true);
            }}
            className="btn-secondary w-full text-sm py-2.5"
          >
            Profil bearbeiten
          </button>
        </div>
      </Section>

      {/* Account Management */}
      <Section title="Konto & WebUntis" icon={LockIcon}>
        <div className="space-y-3">
          <InfoRow
            label="Status"
            value={session ? 'Angemeldet' : 'Nicht angemeldet'}
            valueColor={session ? 'text-success-600' : 'text-warning-600'}
          />
          <InfoRow label="Schule" value={settings.credentials?.school || '—'} />
          <InfoRow label="Server" value={settings.credentials?.serverHost || '—'} />
          <div className="flex gap-2">
            <button
              onClick={() => setShowAccount(true)}
              className="btn-secondary flex-1 text-sm py-2.5"
            >
              Zugangsdaten ändern
            </button>
            {session && (
              <button
                onClick={logoutUntis}
                className="btn-danger py-2.5 px-3"
              >
                <LogoutIcon size={16} />
              </button>
            )}
          </div>
        </div>
      </Section>

      {/* Support */}
      <Section title="Hilfe & Support" icon={HelpIcon}>
        <div className="space-y-1">
          {FAQ_ITEMS.map((item, idx) => (
            <div key={idx} className="border-b border-slate-100 last:border-0">
              <button
                onClick={() => setShowFaq(showFaq === idx ? null : idx)}
                className="w-full py-3 flex items-center justify-between text-left"
              >
                <span className="text-sm font-medium text-slate-700 flex-1 pr-2">
                  {item.q}
                </span>
                <ChevronDownIcon
                  size={16}
                  className={`text-slate-400 transition-transform flex-shrink-0 ${
                    showFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {showFaq === idx && (
                <p className="text-sm text-slate-500 pb-3 leading-relaxed animate-fade-in">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
        <a
          href="mailto:support@schoolplaner.app?subject=Support%20Anfrage%20SchoolPlanner&body=Hallo%2C%0A%0Aich%20habe%20folgendes%20Anliegen%3A%0A%0A"
          className="btn-primary w-full mt-3"
        >
          <MailIcon size={18} />
          Support kontaktieren
        </a>
      </Section>

      {/* Danger Zone */}
      <Section title="Daten" icon={AlertIcon}>
        <button
          onClick={() => setShowReset(true)}
          className="btn-danger w-full text-sm py-2.5"
        >
          Alle Daten löschen
        </button>
      </Section>

      {/* App Info */}
      <div className="text-center mt-6">
        <p className="text-xs text-slate-400">SchoolPlanner v1.0.0</p>
        <p className="text-xs text-slate-300 mt-1">
          Lokal. Privat. Kostenlos.
        </p>
      </div>

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <Modal onClose={() => setShowProfileEdit(false)} title="Profil bearbeiten">
          <div className="space-y-4">
            <div>
              <label className="label">Bundesland</label>
              <select
                className="input-field"
                value={profile.federalStateCode}
                onChange={(e) => {
                  const state = FEDERAL_STATES.find((s) => s.code === e.target.value);
                  if (state) {
                    setProfileState({ ...profile, federalState: state.name, federalStateCode: state.code });
                  }
                }}
              >
                {FEDERAL_STATES.map((s) => (
                  <option key={s.code} value={s.code}>{s.name}</option>
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
                onChange={(e) => setProfileState({ ...profile, classLevel: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Schulart</label>
              <select
                className="input-field"
                value={profile.schoolType}
                onChange={(e) => setProfileState({ ...profile, schoolType: e.target.value })}
              >
                {SCHOOL_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <button onClick={handleProfileSave} className="btn-primary w-full">
              Speichern
            </button>
          </div>
        </Modal>
      )}

      {/* Account Edit Modal */}
      {showAccount && (
        <Modal onClose={() => setShowAccount(false)} title="WebUntis Zugangsdaten">
          <div className="space-y-4">
            <div>
              <label className="label">Benutzername</label>
              <div className="relative">
                <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  className="input-field pl-10"
                  placeholder="Benutzername"
                  value={creds.username}
                  onChange={(e) => setCreds({ ...creds, username: e.target.value })}
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
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Schule</label>
                <input
                  type="text"
                  className="input-field"
                  value={creds.school}
                  onChange={(e) => setCreds({ ...creds, school: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Server</label>
                <input
                  type="text"
                  className="input-field"
                  value={creds.serverHost}
                  onChange={(e) => setCreds({ ...creds, serverHost: e.target.value })}
                />
              </div>
            </div>
            <button onClick={handleCredsSave} className="btn-primary w-full">
              Speichern & Anmelden
            </button>
            <p className="text-xs text-slate-400 text-center">
              Deine Daten werden nur lokal gespeichert.
            </p>
          </div>
        </Modal>
      )}

      {/* Reset Confirmation */}
      {showReset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in p-6"
          onClick={() => setShowReset(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-error-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <AlertIcon size={24} className="text-error-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">
              Alle Daten löschen?
            </h3>
            <p className="text-sm text-slate-500 text-center mb-5">
              Alle Fächer, Noten, Anhänge und Einstellungen werden unwiderruflich gelöscht.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowReset(false)}
                className="btn-secondary flex-1"
              >
                Abbrechen
              </button>
              <button
                onClick={() => {
                  resetAll();
                  setShowReset(false);
                }}
                className="btn-danger flex-1 bg-error-500 text-white hover:bg-error-600"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-4 mb-3">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={18} className="text-slate-400" />
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function InfoRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-medium truncate ml-2 ${valueColor || 'text-slate-700'}`}>
        {value}
      </span>
    </div>
  );
}

function Modal({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto animate-slide-up safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
          >
            <ChevronDownIcon size={18} className="text-slate-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
