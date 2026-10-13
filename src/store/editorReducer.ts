// 모든 문서 변경은 이 리듀서를 거친다. 섹션 규칙(§4.2)을 여기서 강제한다. CONSTITUTION §6.4
import type {
  Core,
  HostSide,
  ImageAsset,
  InvitationDoc,
  Section,
  SectionDataMap,
  SectionType,
  Theme,
} from '../types/invitation';
import { MAX_IMAGES_PER_DOC } from '../lib/image';
import { isPinned, PINNED_FIRST, PINNED_LAST } from '../data/templates';

export type EditorAction =
  | { type: 'LOAD'; doc: InvitationDoc }
  | { type: 'SET_PUBLISH'; patch: Partial<Pick<InvitationDoc, 'title' | 'slug'>> }
  | { type: 'UPDATE_THEME'; patch: Partial<Theme> }
  | { type: 'UPDATE_CORE'; patch: Partial<Pick<Core, 'datetime' | 'venue'>> }
  | { type: 'UPDATE_HOST'; hostId: string; patch: Partial<Omit<HostSide, 'id'>> }
  | { type: 'UPDATE_SECTION'; sectionType: SectionType; patch: Partial<SectionDataMap[SectionType]> }
  | { type: 'TOGGLE_SECTION'; sectionId: string }
  | { type: 'REORDER_SECTION'; sectionId: string; toIndex: number }
  | { type: 'ADD_IMAGES'; images: ImageAsset[]; target: 'hero' | 'gallery' }
  | { type: 'REMOVE_IMAGE'; imageId: string };

export type EditorState = InvitationDoc | null;

function touch(doc: InvitationDoc, patch: Partial<InvitationDoc>): InvitationDoc {
  return { ...doc, ...patch, updatedAt: Date.now() };
}

function mapSection(doc: InvitationDoc, type: SectionType, fn: (s: Section) => Section): Section[] {
  return doc.sections.map((s) => (s.type === type ? fn(s) : s));
}

/** 히어로는 항상 0번 (§4.2-2). 로드된 문서도 보정한다. */
/** 고정 섹션 보정: 히어로는 맨 앞, 브랜드 소개는 맨 뒤, 둘 다 항상 켜짐 (§4.2). 로드된 문서도 보정한다. */
export function normalizeSections(sections: Section[]): Section[] {
  const seen = new Set<SectionType>();
  const unique = sections.filter((s) => (seen.has(s.type) ? false : (seen.add(s.type), true)));
  const first = unique.find((s) => s.type === PINNED_FIRST);
  const last = unique.find((s) => s.type === PINNED_LAST);
  const middle = unique.filter((s) => !isPinned(s.type));
  return [
    ...(first ? [{ ...first, enabled: true }] : []),
    ...middle,
    ...(last ? [{ ...last, enabled: true }] : []),
  ];
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  if (action.type === 'LOAD') return { ...action.doc, sections: normalizeSections(action.doc.sections) };
  if (!state) return state;
  const doc = state;

  switch (action.type) {
    case 'SET_PUBLISH':
      return touch(doc, action.patch);

    case 'UPDATE_THEME':
      return touch(doc, { theme: { ...doc.theme, ...action.patch } });

    case 'UPDATE_CORE':
      return touch(doc, { core: { ...doc.core, ...action.patch } });

    case 'UPDATE_HOST':
      return touch(doc, {
        core: {
          ...doc.core,
          hosts: doc.core.hosts.map((h) => (h.id === action.hostId ? { ...h, ...action.patch } : h)),
        },
      });

    case 'UPDATE_SECTION':
      return touch(doc, {
        sections: mapSection(doc, action.sectionType, (s) => ({ ...s, data: { ...s.data, ...action.patch } }) as Section),
      });

    case 'TOGGLE_SECTION':
      return touch(doc, {
        sections: doc.sections.map((s) =>
          s.id === action.sectionId && !isPinned(s.type) ? { ...s, enabled: !s.enabled } : s,
        ),
      });

    case 'REORDER_SECTION': {
      const from = doc.sections.findIndex((s) => s.id === action.sectionId);
      // 고정 섹션은 이동 금지, 고정 자리(맨 앞·맨 뒤)로도 이동 금지 (§4.2-2)
      if (from < 0 || isPinned(doc.sections[from].type)) return state;
      const lo = doc.sections[0]?.type === PINNED_FIRST ? 1 : 0;
      const hi = doc.sections.length - 1 - (doc.sections[doc.sections.length - 1]?.type === PINNED_LAST ? 1 : 0);
      const to = Math.min(Math.max(action.toIndex, lo), hi);
      if (from === to) return state;
      const next = [...doc.sections];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return touch(doc, { sections: next });
    }

    case 'ADD_IMAGES': {
      const room = MAX_IMAGES_PER_DOC - Object.keys(doc.images).length;
      const added = action.images.slice(0, Math.max(0, room));
      if (!added.length) return state;
      const images = { ...doc.images };
      for (const img of added) images[img.id] = img;
      const sections = doc.sections.map((s): Section => {
        if (action.target === 'hero' && s.type === 'hero') return { ...s, data: { ...s.data, imageId: added[0].id } };
        if (action.target === 'gallery' && s.type === 'gallery')
          return { ...s, data: { ...s.data, imageIds: [...s.data.imageIds, ...added.map((a) => a.id)] } };
        return s;
      });
      return touch(doc, { images, sections });
    }

    case 'REMOVE_IMAGE': {
      const images = { ...doc.images };
      delete images[action.imageId];
      const sections = doc.sections.map((s): Section => {
        if (s.type === 'hero' && s.data.imageId === action.imageId) return { ...s, data: { ...s.data, imageId: null } };
        if (s.type === 'gallery')
          return { ...s, data: { ...s.data, imageIds: s.data.imageIds.filter((id) => id !== action.imageId) } };
        return s;
      });
      return touch(doc, { images, sections });
    }
  }
}
