// 초대장 도메인 모델. CONSTITUTION §3 참조.

/** v0.2부터 결혼식 전용 (CONSTITUTION §1.3). 확장 여지를 위해 필드는 유지 */
export type EventType = 'wedding';

export type ThemePreset = 'classic' | 'modern' | 'romantic' | 'mono' | 'cream' | 'violet';
export type ThemeFont = 'serif' | 'sans';

/** 디자인 시스템 (§3.6): 스타일 계열 · 모양 */
export type ThemeFamily = 'basic' | 'editorial' | 'ticket' | 'bloom';
export type ThemeShape = 'round' | 'square';

export interface Theme {
  /** 색 구성(팔레트) 키 */
  preset: ThemePreset;
  accent: string; // #rrggbb
  font: ThemeFont;
  family: ThemeFamily;
  shape: ThemeShape;
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

export type HeroLayout = 'full' | 'frame' | 'arch' | 'polaroid' | 'cover' | 'unfold';
/** 예식 일자 표시 방식: 월 달력 / 앞뒤 하루를 포함한 3일 띠(하트 표시) — 템플릿이 결정 */
export type CalendarStyle = 'month' | 'strip' | 'ticket';
/** grid 격자 / slide(예전 값, 격자와 같음) / carousel 하트 글자 띠 앞 가로로 넘기는 사진 (템플릿3) */
export type GalleryLayout = 'grid' | 'slide' | 'carousel';

export interface HeroData {
  imageId: string | null;
  /** 폴라로이드 레이아웃의 추가 사진(최대 2장). 대표 사진과 합쳐 최대 3장 */
  extraImageIds?: string[];
  layout: HeroLayout;
  headline: string;
  /** 폴라로이드 레이아웃의 영문 필기체 문구 (기본 'Our Wedding Day') */
  script?: string;
  /** 배경음악: 히어로 하단 재생 바. src가 없으면 재생 모습만(연결 전) */
  music?: { title: string; src?: string };
}
export interface GreetingData {
  title: string;
  body: string;
}
/** 신랑·신부 소개 (혼주는 작게) */
export interface CoupleData {
  showParents: boolean;
  showContact: boolean;
}
export interface TimelineItem {
  id: string;
  date: string; // 자유 형식 (예: 2019.03)
  text: string;
}
/** 우리의 이야기: 타임라인 */
export interface ProfileData {
  title: string;
  timeline: TimelineItem[];
}
/** 예식 일자: 날짜·시간·D-day */
export interface CalendarData {
  showCalendar: boolean;
  showCountdown: boolean;
  style: CalendarStyle;
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
/** 방명록 메시지 */
export interface GuestMessage {
  id: string;
  name: string;
  text: string;
  at: number;
  /** 비밀번호 해시(작성·삭제용, lib/guestbook.ts) */
  pw?: string;
}
export interface GuestbookData {
  title: string;
  description: string;
  /** 템플릿 미리보기용 예시 메시지(샘플 청첩장에만). 실제 메시지는 서버 연동 전까지 보는 사람의 브라우저에 저장 */
  seed?: GuestMessage[];
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

export type StickerShape = 'circle' | 'heart' | 'star' | 'clover' | 'square';
export type StickerMotion = 'none' | 'bounce' | 'float' | 'spin' | 'pulse' | 'wiggle';
export type StickerSize = 'sm' | 'md' | 'lg';
/** 종류(재질 효과): 기본·스티커(흰 테두리)·마스킹 테이프·골판지·폴라로이드 */
export type StickerKind = 'plain' | 'sticker' | 'tape' | 'cardboard' | 'polaroid';

/** 사진 조정: 프레임 안에서 사진 확대·이동. ox·oy는 프레임 크기 대비 %, scale은 1~3 */
export interface StickerCrop {
  scale: number;
  ox: number;
  oy: number;
}

/** 내 사진을 프레임 모양으로 잘라 섹션 위에 붙인 스티커. 위치는 섹션 안 비율(%) */
export interface Sticker {
  id: string;
  sectionId: string;
  imageId: string;
  shape: StickerShape;
  motion: StickerMotion;
  size: StickerSize;
  kind: StickerKind;
  crop: StickerCrop;
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
