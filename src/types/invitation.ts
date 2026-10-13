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
}
/** 신랑·신부 소개 (혼주는 작게) */
export interface CoupleData {
  title: string;
  showParents: boolean;
  showContact: boolean;
}
export interface ProfilePerson {
  hostId: string;
  mbti: string;
  intro: string;
}
export interface TimelineItem {
  id: string;
  date: string; // 자유 형식 (예: 2019.03)
  text: string;
}
/** 신랑·신부 추가 정보: MBTI·한 줄 소개·타임라인 */
export interface ProfileData {
  title: string;
  people: ProfilePerson[];
  timeline: TimelineItem[];
}
/** 예식 일자: 장소 요약·날짜·시간·D-day */
export interface CalendarData {
  showCalendar: boolean;
  showCountdown: boolean;
}
export interface GalleryData {
  title: string;
  imageIds: string[];
  layout: GalleryLayout;
}
/** 참석 여부(RSVP) */
export interface RsvpData {
  title: string;
  description: string;
  askCount: boolean;
  askMeal: boolean;
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
/** 게스트 스냅: 하객이 찍은 사진 모으기 (기본 꺼짐) */
export interface SnapData {
  title: string;
  description: string;
}
/** 마무리 멘트 */
export interface ClosingData {
  body: string;
  showNames: boolean;
}
/** 브랜드 소개: 편집할 값 없음, 항상 마지막·숨김 불가 (§4.9) */
export type BrandData = Record<string, never>;

export interface SectionDataMap {
  hero: HeroData;
  greeting: GreetingData;
  couple: CoupleData;
  profile: ProfileData;
  calendar: CalendarData;
  gallery: GalleryData;
  rsvp: RsvpData;
  account: AccountData;
  guestbook: GuestbookData;
  location: LocationData;
  snap: SnapData;
  closing: ClosingData;
  brand: BrandData;
}

export type SectionType = keyof SectionDataMap;

export type Section = {
  [K in SectionType]: { id: string; type: K; enabled: boolean; data: SectionDataMap[K] };
}[SectionType];

export type SectionOf<K extends SectionType> = Extract<Section, { type: K }>;

// ---- 붙이기(스티커) ---- (CONSTITUTION §4.10)

export type StickerShape = 'circle' | 'heart' | 'star' | 'clover';
export type StickerMotion = 'none' | 'bounce' | 'float' | 'spin' | 'pulse' | 'wiggle';
export type StickerSize = 'sm' | 'md' | 'lg';

/** 내 사진을 프레임 모양으로 잘라 섹션 위에 붙인 스티커. 위치는 섹션 안 비율(%) */
export interface Sticker {
  id: string;
  sectionId: string;
  imageId: string;
  shape: StickerShape;
  motion: StickerMotion;
  size: StickerSize;
  x: number; // 0~100, 섹션 너비 기준 중심 x
  y: number; // 0~100, 섹션 높이 기준 중심 y
}

export interface InvitationDoc {
  id: string;
  version: number;
  eventType: EventType;
  /** 시작 시 고른 디자인 템플릿 id (§3.5) */
  templateId?: string;
  /** 청첩장 제목. 빈 문자열이면 신랑·신부 이름으로 자동 생성 (§6.6) */
  title: string;
  /** 공유 링크 경로(<사이트>/i/<slug>). 생성 시 자동, 사용자 수정 가능 (§6.6) */
  slug: string;
  createdAt: number;
  updatedAt: number;
  theme: Theme;
  core: Core;
  images: Record<string, ImageAsset>;
  sections: Section[];
  stickers: Sticker[];
}
