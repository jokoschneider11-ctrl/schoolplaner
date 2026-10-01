import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { Subject, GradeEntry, GradeCategory, GradeModifier } from '../types';
import { SUBJECT_COLORS } from '../types';
import { getDefaultCategories } from '../utils/grades';
import {
  calculateSubjectAverage,
  calculateOverallGPA,
  formatGrade,
  formatAverage,
  gradeToNumber,
} from '../utils/grades';
import { uid, formatFileSize } from '../utils/date';
import { getAttachments, saveAttachment, deleteAttachment, getAttachmentFile } from '../utils/fileStorage';
import type { Attachment } from '../types';
import {
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  CloseIcon,
  EditIcon,
  PaperclipIcon,
  FileIcon,
  ChartIcon,
} from '../components/Icons';

export default function Grades() {
  const { settings, setSubjects, setGrades } = useApp();
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddGrade, setShowAddGrade] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectAttachments, setSubjectAttachments] = useState<Record<string, Attachment[]>>({});

  const overallGPA = useMemo(
    () => calculateOverallGPA(settings.subjects, settings.grades),
    [settings.subjects, settings.grades]
  );

  const loadAttachments = async (subjectId: string) => {
    const atts = await getAttachments(subjectId);
    setSubjectAttachments((prev) => ({ ...prev, [subjectId]: atts }));
  };

  const toggleSubject = (id: string) => {
    if (expandedSubject === id) {
      setExpandedSubject(null);
    } else {
      setExpandedSubject(id);
      loadAttachments(id);
    }
  };

  const addSubject = (subject: Subject) => {
    setSubjects([...settings.subjects, subject]);
    setShowAddSubject(false);
  };

  const updateSubject = (subject: Subject) => {
    setSubjects(settings.subjects.map((s) => (s.id === subject.id ? subject : s)));
    setEditingSubject(null);
  };

  const deleteSubject = (id: string) => {
    setSubjects(settings.subjects.filter((s) => s.id !== id));
    setGrades(settings.grades.filter((g) => g.subjectId !== id));
    setExpandedSubject(null);
  };

  const addGrade = (grade: GradeEntry) => {
    setGrades([...settings.grades, grade]);
    setShowAddGrade(null);
  };

  const deleteGrade = (id: string) => {
    setGrades(settings.grades.filter((g) => g.id !== id));
  };

  const handleFileUpload = async (subjectId: string, files: FileList) => {
    for (const file of Array.from(files)) {
      await saveAttachment({
        subjectId,
        name: file.name,
        type: file.type,
        size: file.size,
        file,
      });
    }
    loadAttachments(subjectId);
  };

  const handleDeleteAttachment = async (subjectId: string, attId: string) => {
    await deleteAttachment(attId);
    loadAttachments(subjectId);
  };

  const handleDownloadAttachment = async (attId: string, name: string) => {
    const blob = await getAttachmentFile(attId);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Noten</h1>
          <p className="text-sm text-slate-400">
            {settings.subjects.length} {settings.subjects.length === 1 ? 'Fach' : 'Fächer'}
          </p>
        </div>
        <button
          onClick={() => setShowAddSubject(true)}
          className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center active:scale-90 transition-transform shadow-sm shadow-brand-600/20 flex-shrink-0"
        >
          <PlusIcon size={22} />
        </button>
      </div>

      {/* Overall GPA */}
      <div className="card p-4 mb-4 bg-gradient-to-br from-brand-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <ChartIcon size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 font-medium">Gesamtdurchschnitt</p>
            <p className="text-3xl font-bold text-slate-900">
              {formatAverage(overallGPA)}
            </p>
          </div>
        </div>
      </div>

      {/* Subjects */}
      {settings.subjects.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <ChartIcon size={28} className="text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-700 mb-1">Keine Fächer</h3>
          <p className="text-sm text-slate-400 mb-4">
            Füge dein erstes Fach hinzu, um Noten zu verwalten.
          </p>
          <button
            onClick={() => setShowAddSubject(true)}
            className="btn-primary"
          >
            <PlusIcon size={18} />
            Fach hinzufügen
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {settings.subjects.map((subject) => {
            const avg = calculateSubjectAverage(subject, settings.grades);
            const subjectGrades = settings.grades.filter((g) => g.subjectId === subject.id);
            const isExpanded = expandedSubject === subject.id;
            const atts = subjectAttachments[subject.id] || [];

            return (
              <div key={subject.id} className="card overflow-hidden">
                <button
                  onClick={() => toggleSubject(subject.id)}
                  className="w-full p-4 flex items-center gap-3 text-left active:bg-slate-50 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: subject.color + '20' }}
                  >
                    <span
                      className="text-sm font-bold"
                      style={{ color: subject.color }}
                    >
                      {subject.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate break-anywhere">
                      {subject.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {subjectGrades.length} {subjectGrades.length === 1 ? 'Note' : 'Noten'}
                      {atts.length > 0 && ` · ${atts.length} Datei${atts.length > 1 ? 'en' : ''}`}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className="text-lg font-bold"
                      style={{ color: subject.color }}
                    >
                      {formatAverage(avg, subject.pointSystem)}
                    </p>
                  </div>
                  <ChevronDownIcon
                    size={18}
                    className={`text-slate-400 transition-transform flex-shrink-0 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-100 animate-fade-in">
                    {/* Grade List */}
                    {subjectGrades.length > 0 && (
                      <div className="space-y-1.5 mt-3">
                        {subjectGrades
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((grade) => {
                            const cat = subject.categories.find((c) => c.id === grade.categoryId);
                            return (
                              <div
                                key={grade.id}
                                className="flex items-center gap-3 py-2 px-3 rounded-xl bg-slate-50"
                              >
                                <div
                                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                                  style={{ backgroundColor: subject.color }}
                                >
                                  {formatGrade(grade)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-slate-700 break-anywhere">
                                    {cat?.name || 'Allgemein'}
                                  </p>
                                  <p className="text-[11px] text-slate-400 break-anywhere">
                                    {new Date(grade.date).toLocaleDateString('de-DE')}
                                    {grade.note && ` · ${grade.note}`}
                                  </p>
                                </div>
                                <button
                                  onClick={() => deleteGrade(grade.id)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-error-500 hover:bg-error-50 transition-colors flex-shrink-0"
                                >
                                  <TrashIcon size={16} />
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    )}

                    {subjectGrades.length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-4">
                        Noch keine Noten in diesem Fach.
                      </p>
                    )}

                    {/* Categories */}
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 mb-2">Kategorien & Gewichtung</p>
                      <div className="space-y-1">
                        {subject.categories.map((cat) => (
                          <div key={cat.id} className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">{cat.name}</span>
                            <span className="text-slate-400 font-medium">{cat.weight}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Attachments */}
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 mb-2">Materialien</p>
                      {atts.length > 0 && (
                        <div className="space-y-1 mb-2">
                          {atts.map((att) => (
                            <div
                              key={att.id}
                              className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-slate-50"
                            >
                              <FileIcon size={14} className="text-slate-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-700 truncate break-anywhere">
                                  {att.name}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {formatFileSize(att.size)}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDownloadAttachment(att.id, att.name)}
                                className="text-xs text-brand-600 font-medium flex-shrink-0 px-2"
                              >
                                Öffnen
                              </button>
                              <button
                                onClick={() => handleDeleteAttachment(subject.id, att.id)}
                                className="text-slate-400 hover:text-error-500 flex-shrink-0"
                              >
                                <TrashIcon size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <label className="flex items-center gap-2 text-xs text-brand-600 font-medium cursor-pointer">
                        <PaperclipIcon size={14} />
                        Datei anhängen
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleFileUpload(subject.id, e.target.files);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => setShowAddGrade(subject.id)}
                        className="btn-secondary flex-1 text-sm py-2.5"
                      >
                        <PlusIcon size={16} />
                        Note
                      </button>
                      <button
                        onClick={() => setEditingSubject(subject)}
                        className="btn-secondary py-2.5 px-3"
                      >
                        <EditIcon size={16} />
                      </button>
                      <button
                        onClick={() => deleteSubject(subject.id)}
                        className="btn-danger py-2.5 px-3"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Subject Modal */}
      {(showAddSubject || editingSubject) && (
        <SubjectModal
          subject={editingSubject}
          onClose={() => {
            setShowAddSubject(false);
            setEditingSubject(null);
          }}
          onSave={(subject) => {
            if (editingSubject) {
              updateSubject(subject);
            } else {
              addSubject(subject);
            }
          }}
        />
      )}

      {/* Add Grade Modal */}
      {showAddGrade && (
        <GradeModal
          subjectId={showAddGrade}
          subjects={settings.subjects}
          onClose={() => setShowAddGrade(null)}
          onSave={addGrade}
        />
      )}
    </div>
  );
}

// ===== Subject Modal =====
function SubjectModal({
  subject,
  onClose,
  onSave,
}: {
  subject: Subject | null;
  onClose: () => void;
  onSave: (subject: Subject) => void;
}) {
  const [name, setName] = useState(subject?.name || '');
  const [untisSubject, setUntisSubject] = useState(subject?.untisSubject || '');
  const [color, setColor] = useState(subject?.color || SUBJECT_COLORS[0]);
  const [pointSystem, setPointSystem] = useState(subject?.pointSystem || false);
  const [categories, setCategories] = useState<GradeCategory[]>(
    subject?.categories || getDefaultCategories()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: subject?.id || uid(),
      name: name.trim(),
      untisSubject: untisSubject.trim(),
      color,
      pointSystem,
      categories,
    });
  };

  return (
    <Modal onClose={onClose} title={subject ? 'Fach bearbeiten' : 'Neues Fach'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Fachname</label>
          <input
            type="text"
            className="input-field"
            placeholder="z.B. Mathematik"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Untis-Kürzel (optional)</label>
          <input
            type="text"
            className="input-field"
            placeholder="z.B. M"
            value={untisSubject}
            onChange={(e) => setUntisSubject(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Farbe</label>
          <div className="flex flex-wrap gap-2">
            {SUBJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-9 h-9 rounded-xl transition-all ${
                  color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <div>
          <label className="label">Notensystem</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPointSystem(false)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                !pointSystem
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              Noten (1-6)
            </button>
            <button
              type="button"
              onClick={() => setPointSystem(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pointSystem
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              Punkte (0-15)
            </button>
          </div>
        </div>
        <div>
          <label className="label">Kategorien & Gewichtung (%)</label>
          <div className="space-y-2">
            {categories.map((cat, idx) => (
              <div key={cat.id} className="flex items-center gap-2">
                <input
                  type="text"
                  className="input-field flex-1"
                  value={cat.name}
                  onChange={(e) => {
                    const updated = [...categories];
                    updated[idx] = { ...cat, name: e.target.value };
                    setCategories(updated);
                  }}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="input-field w-20 text-center"
                  value={cat.weight}
                  onChange={(e) => {
                    const updated = [...categories];
                    updated[idx] = { ...cat, weight: parseInt(e.target.value) || 0 };
                    setCategories(updated);
                  }}
                />
                {categories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setCategories(categories.filter((_, i) => i !== idx))}
                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-error-500 flex-shrink-0"
                  >
                    <TrashIcon size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setCategories([
                  ...categories,
                  { id: uid(), name: 'Neue Kategorie', weight: 0 },
                ])
              }
              className="text-sm text-brand-600 font-medium flex items-center gap-1"
            >
              <PlusIcon size={14} />
              Kategorie hinzufügen
            </button>
          </div>
        </div>
        <button type="submit" className="btn-primary w-full">
          Speichern
        </button>
      </form>
    </Modal>
  );
}

// ===== Grade Modal =====
function GradeModal({
  subjectId,
  subjects,
  onClose,
  onSave,
}: {
  subjectId: string;
  subjects: Subject[];
  onClose: () => void;
  onSave: (grade: GradeEntry) => void;
}) {
  const subject = subjects.find((s) => s.id === subjectId)!;
  const [value, setValue] = useState(subject.pointSystem ? 10 : 2);
  const [modifier, setModifier] = useState<GradeModifier>(null);
  const [categoryId, setCategoryId] = useState(subject.categories[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: uid(),
      subjectId,
      value,
      modifier: subject.pointSystem ? null : modifier,
      categoryId,
      date,
      note: note.trim(),
      pointSystem: subject.pointSystem,
    });
  };

  return (
    <Modal onClose={onClose} title="Note hinzufügen">
      <form onSubmit={handleSubmit} className="space-y-4">
        {subject.pointSystem ? (
          <div>
            <label className="label">Punkte (0-15)</label>
            <input
              type="range"
              min="0"
              max="15"
              value={value}
              onChange={(e) => setValue(parseInt(e.target.value))}
              className="w-full accent-brand-600"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-400">0</span>
              <span className="text-2xl font-bold text-brand-600">{value}</span>
              <span className="text-xs text-slate-400">15</span>
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="label">Note</label>
              <div className="grid grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setValue(n)}
                    className={`py-3 rounded-xl text-lg font-bold transition-all ${
                      value === n
                        ? 'bg-brand-600 text-white scale-105'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Tendenz</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '−', value: '-' as GradeModifier },
                  { label: '○', value: '' as GradeModifier },
                  { label: '+', value: '+' as GradeModifier },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setModifier(opt.value)}
                    className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                      modifier === opt.value
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {opt.label === '○' ? 'Glatt' : opt.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        <div>
          <label className="label">Kategorie</label>
          <select
            className="input-field"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {subject.categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.weight}%)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Datum</label>
          <input
            type="date"
            className="input-field"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Notiz (optional)</label>
          <input
            type="text"
            className="input-field"
            placeholder="z.B. Klausur, Test, etc."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <div className="card p-3 bg-slate-50">
          <p className="text-xs text-slate-500 text-center">
            Entspricht: <span className="font-bold text-slate-700">
              {subject.pointSystem
                ? `${value} Punkte`
                : `${value}${modifier || ''} = ${gradeToNumber({ id: '', subjectId, value, modifier, categoryId, date, note, pointSystem: false })}`}
            </span>
          </p>
        </div>
        <button type="submit" className="btn-primary w-full">
          Note speichern
        </button>
      </form>
    </Modal>
  );
}

// ===== Reusable Modal =====
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
            <CloseIcon size={18} className="text-slate-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
