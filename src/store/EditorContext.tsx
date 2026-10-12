import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import type { InvitationDoc, SectionOf, SectionType } from '../types/invitation';
import { editorReducer, type EditorAction } from './editorReducer';
import { loadDraft, saveDraft } from '../lib/storage';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
export type LoadStatus = 'loading' | 'ready';

interface EditorCtx {
  doc: InvitationDoc | null;
  dispatch: (a: EditorAction) => void;
  loadStatus: LoadStatus;
  saveStatus: SaveStatus;
  /** 새 문서로 교체하고 즉시 저장 */
  startNew: (doc: InvitationDoc) => Promise<void>;
}

const Ctx = createContext<EditorCtx | null>(null);

const AUTOSAVE_DELAY = 600; // §7.1

export function EditorProvider({ children }: { children: ReactNode }) {
  const [doc, dispatch] = useReducer(editorReducer, null);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('loading');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const lastSaved = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;
    loadDraft().then((d) => {
      if (!alive) return;
      if (d) {
        lastSaved.current = d.updatedAt;
        dispatch({ type: 'LOAD', doc: d });
      }
      setLoadStatus('ready');
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!doc || doc.updatedAt === lastSaved.current) return;
    setSaveStatus('saving');
    const t = setTimeout(() => {
      saveDraft(doc)
        .then(() => {
          lastSaved.current = doc.updatedAt;
          setSaveStatus('saved');
        })
        .catch((e) => {
          console.error(e);
          setSaveStatus('error');
        });
    }, AUTOSAVE_DELAY);
    return () => clearTimeout(t);
  }, [doc]);

  const startNew = useCallback(async (next: InvitationDoc) => {
    lastSaved.current = next.updatedAt;
    dispatch({ type: 'LOAD', doc: next });
    try {
      await saveDraft(next);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }, []);

  return <Ctx.Provider value={{ doc, dispatch, loadStatus, saveStatus, startNew }}>{children}</Ctx.Provider>;
}

export function useEditor() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useEditor must be used inside EditorProvider');
  return ctx;
}

export function findSection<K extends SectionType>(doc: InvitationDoc, type: K): SectionOf<K> | undefined {
  return doc.sections.find((s) => s.type === type) as SectionOf<K> | undefined;
}
