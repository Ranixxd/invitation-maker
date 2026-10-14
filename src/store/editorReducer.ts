// 모든 문서 변경은 이 리듀서를 거친다. 섹션 규칙(§4.2)을 여기서 강제한다. CONSTITUTION §6.4
import type {
  Sticker,
  Core,
  HostSide,
  ImageAsset,
  InvitationDoc,
  Section,
  SectionDataMap,
  SectionType,
  Theme,
} from '../types/invitation';
import { GALLERY_MAX, MAX_IMAGES_PER_DOC } from '../lib/image';
import { isPinned, PINNED_FIRST, PINNED_LAST } from '../data/templates';
import { MAX_STICKERS_PER_SECTION } from '../lib/stickers';

export type EditorAction =
  | { type: 'LOAD'; doc: InvitationDoc }
  | { type: 'SET_PUBLISH'; patch: Partial<Pick<InvitationDoc, 'title' | 'slug'>> }
  | { type: 'UPDATE_THEME'; patch: Partial<Theme> }
  | { type: 'UPDATE_CORE'; patch: Partial<Pick<Core, 'datetime' | 'venue'>> }
  | { type: 'UPDATE_HOST'; hostId: string; patch: Partial<Omit<HostSide, 'id'>> }
  | { type: 'UPDATE_SECTION'; sectionType: SectionType; patch: Partial<SectionDataMap[SectionType]> }
  | { type: 'TOGGLE_SECTION'; sectionId: string }
  | { type: 'REORDER_SECTION'; sectionId: string; toIndex: number }
  /** target 'pool': 섹션에 넣지 않고 올린 사진 목록에만 추가 (스티커용) */
  | { type: 'ADD_IMAGES'; images: ImageAsset[]; target: 'hero' | 'hero-extra' | 'gallery' | 'pool' }
  | { type: 'REMOVE_IMAGE'; imageId: string }
  | { type: 'ADD_STICKER'; sticker: Sticker }
  | { type: 'UPDATE_STICKER'; stickerId: string; patch: Partial<Omit<Sticker, 'id'>> }
  | { type: 'REMOVE_STICKER'; stickerId: string };

/** 히어로 폴라로이드 추가 사진 최대 개수 (대표 사진 포함 3장) */
export const HERO_EXTRA_MAX = 2;

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
  if (action.type === 'LOAD')
    return { ...action.doc, sections: normalizeSections(action.doc.sections), stickers: action.doc.stickers ?? [] };
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
        if (action.target === 'hero-extra' && s.type === 'hero')
          return { ...s, data: { ...s.data, extraImageIds: [...(s.data.extraImageIds ?? []), ...added.map((a) => a.id)].slice(0, HERO_EXTRA_MAX) } };
        if (action.target === 'gallery' && s.type === 'gallery')
          return { ...s, data: { ...s.data, imageIds: [...s.data.imageIds, ...added.map((a) => a.id)].slice(0, GALLERY_MAX) } };
        return s;
      });
      return touch(doc, { images, sections });
    }

    case 'REMOVE_IMAGE': {
      const images = { ...doc.images };
      delete images[action.imageId];
      const sections = doc.sections.map((s): Section => {
        if (s.type === 'hero')
          return {
            ...s,
            data: {
              ...s.data,
              imageId: s.data.imageId === action.imageId ? null : s.data.imageId,
              extraImageIds: (s.data.extraImageIds ?? []).filter((id) => id !== action.imageId),
            },
          };
        if (s.type === 'gallery')
          return { ...s, data: { ...s.data, imageIds: s.data.imageIds.filter((id) => id !== action.imageId) } };
        return s;
      });
      // 이 사진을 쓰는 스티커도 함께 제거 (§4.10)
      const stickers = doc.stickers.filter((st) => st.imageId !== action.imageId);
      return touch(doc, { images, sections, stickers });
    }

    case 'ADD_STICKER': {
      const { sticker } = action;
      const section = doc.sections.find((s) => s.id === sticker.sectionId);
      // 브랜드 소개에는 붙일 수 없고, 섹션당 최대 개수 제한 (§4.10)
      if (!section || section.type === PINNED_LAST || !doc.images[sticker.imageId]) return state;
      if (doc.stickers.filter((st) => st.sectionId === sticker.sectionId).length >= MAX_STICKERS_PER_SECTION) return state;
      return touch(doc, { stickers: [...doc.stickers, sticker] });
    }

    case 'UPDATE_STICKER':
      return touch(doc, {
        stickers: doc.stickers.map((st) => (st.id === action.stickerId ? { ...st, ...action.patch } : st)),
      });

    case 'REMOVE_STICKER':
      return touch(doc, { stickers: doc.stickers.filter((st) => st.id !== action.stickerId) });
  }
}
