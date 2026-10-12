// 행사 종류별 기본값의 유일한 정의 위치. CONSTITUTION §1.3, §3.4
import type {
  EventType,
  HostSide,
  InvitationDoc,
  Section,
  SectionType,
  Theme,
  ThemePreset,
} from '../types/invitation';
import { uid } from '../lib/id';

export const DOC_VERSION = 1;

export const SECTION_ORDER: SectionType[] = [
  'hero',
  'greeting',
  'calendar',
  'gallery',
  'parents',
  'location',
  'account',
  'guestbook',
];

export interface ThemePresetDef {
  label: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  font: Theme['font'];
}

export const THEME_PRESETS: Record<ThemePreset, ThemePresetDef> = {
  classic: {
    label: '클래식',
    bg: '#fbf8f3',
    surface: '#f3ede3',
    text: '#3d3a36',
    muted: '#8b847b',
    accent: '#8a6d4b',
    font: 'serif',
  },
  modern: {
    label: '모던',
    bg: '#ffffff',
    surface: '#f4f4f5',
    text: '#1d1d1f',
    muted: '#86868b',
    accent: '#2f2f33',
    font: 'sans',
  },
  romantic: {
    label: '로맨틱',
    bg: '#fff7f6',
    surface: '#fbeceb',
    text: '#4a3a3d',
    muted: '#a08c8f',
    accent: '#b9687a',
    font: 'serif',
  },
};

interface EventPreset {
  label: string;
  description: string;
  hostLabels: string[];
  defaultNames: string[];
  title: (names: string[]) => string;
  headline: string;
  greetingTitle: string;
  greetingBody: string;
  parentsTitle: string;
  accountTitle: string;
  accountDescription: string;
  guestbookTitle: (labels: string[]) => string;
  guestbookDescription: string;
  /** 이 행사 종류에서 기본 숨김 처리할 섹션 */
  hiddenByDefault: SectionType[];
}

export const EVENT_PRESETS: Record<EventType, EventPreset> = {
  wedding: {
    label: '결혼식',
    description: '모바일 청첩장',
    hostLabels: ['신랑', '신부'],
    defaultNames: ['김민준', '이서연'],
    title: (n) => `${n[0]} ♥ ${n[1]} 결혼합니다`,
    headline: 'We are getting married',
    greetingTitle: '소중한 분들을 초대합니다',
    greetingBody:
      '서로가 마주보며 다져온 사랑을\n이제 함께 한 곳을 바라보며\n걸어갈 수 있는 큰 사랑으로 키우고자 합니다.\n\n저희 두 사람이 사랑의 이름으로\n지켜나갈 수 있도록\n앞날을 축복해 주시면 감사하겠습니다.',
    parentsTitle: '혼주',
    accountTitle: '마음 전하실 곳',
    accountDescription: '참석이 어려우신 분들을 위해\n계좌번호를 기재하였습니다.\n너그러운 마음으로 양해 부탁드립니다.',
    guestbookTitle: (l) => `${l.join('/')}에게 할 말`,
    guestbookDescription: '두 사람에게 축하의 한마디를 남겨주세요.',
    hiddenByDefault: [],
  },
  'first-birthday': {
    label: '돌잔치',
    description: '첫 생일 초대장',
    hostLabels: ['아기'],
    defaultNames: ['김하율'],
    title: (n) => `${n[0]}의 첫 번째 생일`,
    headline: 'Happy 1st Birthday',
    greetingTitle: '첫 생일에 초대합니다',
    greetingBody:
      '사랑으로 키운 저희 아이가\n어느덧 첫 번째 생일을 맞이하였습니다.\n\n귀한 걸음 하시어\n아이의 앞날을 함께 축복해 주세요.',
    parentsTitle: '부모님',
    accountTitle: '마음 전하실 곳',
    accountDescription: '축하의 마음을 전해주셔서 감사합니다.',
    guestbookTitle: () => '축하 메시지',
    guestbookDescription: '아이에게 축하의 한마디를 남겨주세요.',
    hiddenByDefault: ['account'],
  },
  party: {
    label: '파티·모임',
    description: '생일, 집들이, 송년회 등',
    hostLabels: ['호스트'],
    defaultNames: ['김지우'],
    title: (n) => `${n[0]}의 파티에 초대합니다`,
    headline: "You're invited",
    greetingTitle: '함께해 주세요',
    greetingBody: '즐거운 시간을 함께 나누고 싶어\n소중한 분들을 초대합니다.\n\n편한 마음으로 와 주세요!',
    parentsTitle: '연락처',
    accountTitle: '회비 안내',
    accountDescription: '',
    guestbookTitle: () => '한마디 남기기',
    guestbookDescription: '호스트에게 한마디 남겨주세요.',
    hiddenByDefault: ['parents', 'account'],
  },
};

const emptyParent = () => ({ name: '', phone: '', deceased: false });

function createHosts(eventType: EventType): HostSide[] {
  const p = EVENT_PRESETS[eventType];
  return p.hostLabels.map((label, i) => ({
    id: uid('host'),
    label,
    name: p.defaultNames[i] ?? '',
    phone: '',
    father: emptyParent(),
    mother: emptyParent(),
  }));
}

/** 약 3개월 뒤 토요일 12:30 */
export function defaultDatetime(now = new Date()): string {
  const d = new Date(now);
  d.setDate(d.getDate() + 90);
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T12:30`;
}

export function createSections(eventType: EventType, hosts: HostSide[]): Section[] {
  const p = EVENT_PRESETS[eventType];
  const labels = hosts.map((h) => h.label);
  const make = (type: SectionType): Section => {
    const base = { id: uid('sec'), enabled: !p.hiddenByDefault.includes(type) };
    switch (type) {
      case 'hero':
        return { ...base, type, enabled: true, data: { imageId: null, layout: 'full', headline: p.headline } };
      case 'greeting':
        return { ...base, type, data: { title: p.greetingTitle, body: p.greetingBody, showSignature: true } };
      case 'calendar':
        return { ...base, type, data: { showCalendar: true, showCountdown: true } };
      case 'gallery':
        return { ...base, type, data: { title: 'Gallery', imageIds: [], layout: 'grid' } };
      case 'parents':
        return { ...base, type, data: { title: p.parentsTitle, showContact: true } };
      case 'location':
        return {
          ...base,
          type,
          data: { title: '오시는 길', subway: '', bus: '', car: '', showMapLinks: true },
        };
      case 'account':
        return {
          ...base,
          type,
          data: {
            title: p.accountTitle,
            description: p.accountDescription,
            accounts: hosts.map((h) => ({
              id: uid('acc'),
              hostId: h.id,
              relation: h.label,
              holder: h.name,
              bank: '',
              number: '',
            })),
          },
        };
      case 'guestbook':
        return {
          ...base,
          type,
          data: { title: p.guestbookTitle(labels), description: p.guestbookDescription },
        };
    }
  };
  return SECTION_ORDER.map(make);
}

export function createDoc(eventType: EventType): InvitationDoc {
  const p = EVENT_PRESETS[eventType];
  const preset: ThemePreset = eventType === 'wedding' ? 'classic' : eventType === 'party' ? 'modern' : 'romantic';
  const hosts = createHosts(eventType);
  const now = Date.now();
  return {
    id: uid('doc'),
    version: DOC_VERSION,
    eventType,
    title: p.title(hosts.map((h) => h.name)),
    createdAt: now,
    updatedAt: now,
    theme: { preset, accent: THEME_PRESETS[preset].accent, font: THEME_PRESETS[preset].font },
    core: {
      hosts,
      datetime: defaultDatetime(),
      venue: { name: '', hall: '', address: '', tel: '' },
    },
    images: {},
    sections: createSections(eventType, hosts),
  };
}

/** 스키마 버전 마이그레이션 (§3.4). 현재 v1만 존재. */
export function migrateDoc(doc: InvitationDoc): InvitationDoc {
  if (doc.version === DOC_VERSION) return doc;
  return { ...doc, version: DOC_VERSION };
}

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: '히어로 (맨 위)',
  greeting: '인사말',
  calendar: '날짜',
  gallery: '갤러리',
  parents: '혼주 · 가족',
  location: '찾아오는 길',
  account: '계좌번호',
  guestbook: '축하 메시지',
};

export function sectionLabel(type: SectionType, eventType: EventType): string {
  if (type === 'guestbook' && eventType === 'wedding') return '신랑/신부에게 할 말';
  if (type === 'parents' && eventType === 'wedding') return '혼주';
  return SECTION_LABELS[type];
}
