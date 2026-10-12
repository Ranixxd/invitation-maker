// 로컬 초안 저장소 (IndexedDB). CONSTITUTION §7.1
import type { InvitationDoc } from '../types/invitation';
import { migrateDoc } from '../data/templates';

const DB_NAME = 'invitation-maker';
const STORE = 'drafts';
const CURRENT_KEY = 'current';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const t = db.transaction(STORE, mode);
      const req = fn(t.objectStore(STORE));
      t.oncomplete = () => resolve(req.result);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
  } finally {
    db.close();
  }
}

export async function loadDraft(): Promise<InvitationDoc | null> {
  try {
    const doc = await tx<InvitationDoc | undefined>('readonly', (s) => s.get(CURRENT_KEY));
    return doc ? migrateDoc(doc) : null;
  } catch (e) {
    console.warn('초안 불러오기 실패', e);
    return null;
  }
}

export async function saveDraft(doc: InvitationDoc): Promise<void> {
  await tx('readwrite', (s) => s.put(doc, CURRENT_KEY));
}

export async function clearDraft(): Promise<void> {
  await tx('readwrite', (s) => s.delete(CURRENT_KEY));
}
