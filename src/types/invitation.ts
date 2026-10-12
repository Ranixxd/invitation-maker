// 초대장 도메인 모델. CONSTITUTION §3 참조.

/** v0.2부터 결혼식 전용 (CONSTITUTION §1.3). 확장 여지를 위해 필드는 유지 */
export type EventType = 'wedding';

export type ThemePreset = 'classic' | 'modern' | 'romantic';
export type ThemeFont = 'serif' | 'sans';

export interface Theme {
  preset: ThemePreset;
  accent: string; // #rrggbb
  font: ThemeFont;
}

export interface Parent {
  name: string;
  phone: string;
  deceased: boolean;
}

/** 주최자 한 측(신랑측/신부측/아기/호스트). §3.2 공통 사실 */
export interface HostSide {
  id: string;
  label: string; // '신랑', '신부', '아기', '호스트'
  name: string;
  phone: string;
  father: Parent;
  mother: Parent;
}

export interface Venue {
  name: string;
  hall: string;
  address: string;
  tel: string;
}

export interface Core {
  hosts: HostSide[];
  datetime: string; // 'YYYY-MM-DDTHH:mm' (로컬 시간)
  venue: Venue;
}

export interface ImageAsset {
  id: string;
  src: string; // data URL
  width: number;
  height: number;
  aspect: number;
  luminance: number;
  color: string; // #rrggbb
}

// ---- 섹션 ----

export type HeroLayout = 'full' | 'frame' | 'arch';
export type GalleryLayout = 'grid' | 'slide';

export interface HeroData {
  imageId: string | null;
  layout: HeroLayout;
  headline: string;
}
export interface GreetingData {
  title: string;
  body: string;
  showSignature: boolean;
}
export interface CalendarData {
  showCalendar: boolean;
  showCountdown: boolean;
}
export interface GalleryData {
  title: string;
  imageIds: string[];
  layout: GalleryLayout;
}
export interface ParentsData {
  title: string;
  showContact: boolean;
}
export interface LocationData {
  title: string;
  subway: string;
  bus: string;
  car: string;
  showMapLinks: boolean;
}
export interface BankAccount {
  id: string;
  hostId: string; // 어느 측 그룹인지
  relation: string; // '신랑', '신랑 아버지' 등
  holder: string;
  bank: string;
  number: string;
}
export interface AccountData {
  title: string;
  description: string;
  accounts: BankAccount[];
}
export interface GuestbookData {
  title: string;
  description: string;
}

export interface SectionDataMap {
  hero: HeroData;
  greeting: GreetingData;
  calendar: CalendarData;
  gallery: GalleryData;
  parents: ParentsData;
  location: LocationData;
  account: AccountData;
  guestbook: GuestbookData;
}

export type SectionType = keyof SectionDataMap;

export type Section = {
  [K in SectionType]: { id: string; type: K; enabled: boolean; data: SectionDataMap[K] };
}[SectionType];

export type SectionOf<K extends SectionType> = Extract<Section, { type: K }>;

export interface InvitationDoc {
  id: string;
  version: number;
  eventType: EventType;
  /** 시작 시 고른 디자인 템플릿 id (§3.5). 이후 테마를 바꿔도 기록용으로 남는다 */
  templateId?: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  theme: Theme;
  core: Core;
  images: Record<string, ImageAsset>;
  sections: Section[];
}
