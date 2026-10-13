// 청첩장 기본값의 유일한 정의 위치. CONSTITUTION §1.3, §3.4
import type { HostSide, InvitationDoc, Section, SectionType, Theme, ThemePreset } from '../types/invitation';
import { uid } from '../lib/id';
import { defaultSlug } from '../lib/slug';

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

/** 청첩장 기본 문구·구성 (§1.3: v0.2부터 결혼식 전용) */
export const WEDDING = {
  hostLabels: ['신랑', '신부'],
  defaultNames: ['김민준', '이서연'],
  title: (n: string[]) => `${n[0]} ♥ ${n[1]} 결혼합니다`,
  headline: 'We are getting married',
  greetingTitle: '소중한 분들을 초대합니다',
  greetingBody:
    '서로가 마주보며 다져온 사랑을\n이제 함께 한 곳을 바라보며\n걸어갈 수 있는 큰 사랑으로 키우고자 합니다.\n\n저희 두 사람이 사랑의 이름으로\n지켜나갈 수 있도록\n앞날을 축복해 주시면 감사하겠습니다.',
  parentsTitle: '혼주',
  accountTitle: '마음 전하실 곳',
  accountDescription: '참석이 어려우신 분들을 위해\n계좌번호를 기재하였습니다.\n너그러운 마음으로 양해 부탁드립니다.',
  guestbookTitle: '신랑/신부에게 할 말',
  guestbookDescription: '두 사람에게 축하의 한마디를 남겨주세요.',
};

const emptyParent = () => ({ name: '', phone: '', deceased: false });

function createHosts(): HostSide[] {
  return WEDDING.hostLabels.map((label, i) => ({
    id: uid('host'),
    label,
    name: WEDDING.defaultNames[i] ?? '',
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

export function createSections(hosts: HostSide[]): Section[] {
  const make = (type: SectionType): Section => {
    const base = { id: uid('sec'), enabled: true };
    switch (type) {
      case 'hero':
        return { ...base, type, data: { imageId: null, layout: 'full', headline: WEDDING.headline } };
      case 'greeting':
        return { ...base, type, data: { title: WEDDING.greetingTitle, body: WEDDING.greetingBody, showSignature: true } };
      case 'calendar':
        return { ...base, type, data: { showCalendar: true, showCountdown: true } };
      case 'gallery':
        return { ...base, type, data: { title: 'Gallery', imageIds: [], layout: 'grid' } };
      case 'parents':
        return { ...base, type, data: { title: WEDDING.parentsTitle, showContact: true } };
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
            title: WEDDING.accountTitle,
            description: WEDDING.accountDescription,
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
          data: { title: WEDDING.guestbookTitle, description: WEDDING.guestbookDescription },
        };
    }
  };
  return SECTION_ORDER.map(make);
}

export function createDoc(): InvitationDoc {
  const preset: ThemePreset = 'classic';
  const hosts = createHosts();
  const now = Date.now();
  const datetime = defaultDatetime();
  return {
    id: uid('doc'),
    version: DOC_VERSION,
    eventType: 'wedding',
    title: '',
    slug: defaultSlug(datetime),
    createdAt: now,
    updatedAt: now,
    theme: { preset, accent: THEME_PRESETS[preset].accent, font: THEME_PRESETS[preset].font },
    core: {
      hosts,
      datetime,
      venue: { name: '', hall: '', address: '', tel: '' },
    },
    images: {},
    sections: createSections(hosts),
  };
}

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: '히어로 (맨 위)',
  greeting: '인사말',
  calendar: '날짜',
  gallery: '갤러리',
  parents: '혼주',
  location: '찾아오는 길',
  account: '계좌번호',
  guestbook: '신랑/신부에게 할 말',
};
