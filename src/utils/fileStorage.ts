import type { Attachment } from '../types';

const DB_NAME = 'schoolplanner_files';
const STORE_NAME = 'attachments';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('subjectId', 'subjectId', { unique: false });
      }
    };
  });

  return dbPromise;
}

export async function saveAttachment(
  attachment: Omit<Attachment, 'id' | 'createdAt'> & { file: File }
): Promise<Attachment> {
  const db = await openDB();
  const id = `att_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const createdAt = new Date().toISOString();

  const record: Attachment & { file: File } = {
    ...attachment,
    id,
    createdAt,
    file: attachment.file,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(record);
    request.onsuccess = () =>
      resolve({ id, subjectId: attachment.subjectId, name: attachment.name, type: attachment.type, size: attachment.size, createdAt, linkedToExamDate: attachment.linkedToExamDate });
    request.onerror = () => reject(request.error);
  });
}

export async function getAttachments(subjectId?: string): Promise<Attachment[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const results = request.result as (Attachment & { file: File })[];
      const filtered = subjectId ? results.filter((r) => r.subjectId === subjectId) : results;
      resolve(
        filtered.map((r) => ({
          id: r.id,
          subjectId: r.subjectId,
          name: r.name,
          type: r.type,
          size: r.size,
          createdAt: r.createdAt,
          linkedToExamDate: r.linkedToExamDate,
        }))
      );
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getAttachmentFile(id: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => {
      const result = request.result as (Attachment & { file: File }) | undefined;
      resolve(result?.file ?? null);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteAttachment(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getStorageEstimate(): Promise<{ usage: number; quota: number } | null> {
  if (navigator.storage && navigator.storage.estimate) {
    const est = await navigator.storage.estimate();
    return { usage: est.usage ?? 0, quota: est.quota ?? 0 };
  }
  return null;
}
