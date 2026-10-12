// 편집 상태 저장소. v0.4: 저장 기능 없음 — 문서는 메모리에만 존재 (CONSTITUTION §7)
import { createContext, useCallback, useContext, useReducer, type ReactNode } from 'react';
import type { InvitationDoc, SectionOf, SectionType } from '../types/invitation';
import { editorReducer, type EditorAction } from './editorReducer';

interface EditorCtx {
  doc: InvitationDoc | null;
  dispatch: (a: EditorAction) => void;
  /** 새 문서로 교체 */
  startNew: (doc: InvitationDoc) => void;
}

const Ctx = createContext<EditorCtx | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [doc, dispatch] = useReducer(editorReducer, null);
  const startNew = useCallback((next: InvitationDoc) => dispatch({ type: 'LOAD', doc: next }), []);
  return <Ctx.Provider value={{ doc, dispatch, startNew }}>{children}</Ctx.Provider>;
}

export function useEditor() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useEditor must be used inside EditorProvider');
  return ctx;
}

export function findSection<K extends SectionType>(doc: InvitationDoc, type: K): SectionOf<K> | undefined {
  return doc.sections.find((s) => s.type === type) as SectionOf<K> | undefined;
}

/** 저장이 없으므로, 편집 중 페이지를 벗어나면 내용이 사라진다는 경고 (§7.1) */
export const LEAVE_CONFIRM = '편집 중인 내용은 저장되지 않아요. 나가면 모두 사라집니다. 나갈까요?';
