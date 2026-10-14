// 초대장 렌더러. 편집기 미리보기와 /view가 공용으로 사용 (CONSTITUTION §6.3)
import { useEffect, useRef, type ReactNode } from 'react';
import type { InvitationDoc, Section } from '../../types/invitation';
import { InvitationEnv, themeClasses, themeVars } from './theme';
import { HeroSection } from './sections/HeroSection';
import { GreetingSection } from './sections/GreetingSection';
import { CoupleSection } from './sections/CoupleSection';
import { ProfileSection } from './sections/ProfileSection';
import { CalendarSection } from './sections/CalendarSection';
import { GallerySection } from './sections/GallerySection';
import { RsvpSection } from './sections/RsvpSection';
import { AccountSection } from './sections/AccountSection';
import { GuestbookSection } from './sections/GuestbookSection';
import { LocationSection } from './sections/LocationSection';
import { SnapSection } from './sections/SnapSection';
import { ClosingSection } from './sections/ClosingSection';
import { BrandSection } from './sections/BrandSection';
import { PlacingHitArea, StickerOverlay, type StickerEdit } from './StickerLayer';
import './tokens.css';
import './ui.css';
import './invitation.css';

export type RenderMode = 'view' | 'preview';

export interface SectionProps<S extends Section = Section> {
  doc: InvitationDoc;
  section: S;
  mode: RenderMode;
}

function renderSection(doc: InvitationDoc, section: Section, mode: RenderMode) {
  const p = { doc, mode };
  switch (section.type) {
    case 'hero':
      return <HeroSection {...p} section={section} />;
    case 'greeting':
      return <GreetingSection {...p} section={section} />;
    case 'couple':
      return <CoupleSection {...p} section={section} />;
    case 'profile':
      return <ProfileSection {...p} section={section} />;
    case 'calendar':
      return <CalendarSection {...p} section={section} />;
    case 'gallery':
      return <GallerySection {...p} section={section} />;
    case 'rsvp':
      return <RsvpSection {...p} section={section} />;
    case 'account':
      return <AccountSection {...p} section={section} />;
    case 'guestbook':
      return <GuestbookSection {...p} section={section} />;
    case 'location':
      return <LocationSection {...p} section={section} />;
    case 'snap':
      return <SnapSection {...p} section={section} />;
    case 'closing':
      return <ClosingSection {...p} section={section} />;
    case 'brand':
      return <BrandSection {...p} section={section} />;
  }
}

export { themeVars } from './theme';

interface Props {
  doc: InvitationDoc;
  mode?: RenderMode;
  selectedSectionId?: string | null;
  onSectionClick?: (sectionId: string) => void;
  /** 선택 섹션으로 자동 스크롤 (모바일 편집기는 스크롤이 곧 선택이므로 끔) */
  autoScroll?: boolean;
  /** 섹션 위에 겹쳐 그릴 편집 UI (모바일 [섹션 편집] 버튼) */
  renderOverlay?: (section: Section) => ReactNode;
  /** 붙이기: 위치 정하기 중인 스티커 */
  stickerEdit?: StickerEdit | null;
  /** 떠 있는 버튼(방명록 남기기 등) 허용 — 실제 하객 화면(/view)에서만 true */
  floatingActions?: boolean;
  /** 편집기에서 붙어 있는 스티커를 눌렀을 때 */
  onStickerClick?: (stickerId: string) => void;
}

export function InvitationView({
  doc,
  mode = 'view',
  selectedSectionId,
  onSectionClick,
  autoScroll = true,
  renderOverlay,
  stickerEdit,
  onStickerClick,
  floatingActions = false,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  // 편집기에서 섹션을 고르면 미리보기도 그 섹션으로 스크롤
  useEffect(() => {
    if (mode !== 'preview' || !selectedSectionId || !autoScroll) return;
    const el = rootRef.current?.querySelector<HTMLElement>(`[data-section-id="${selectedSectionId}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [mode, selectedSectionId, autoScroll]);

  // 하객 화면: 스크롤 등장 애니메이션
  useEffect(() => {
    if (mode !== 'view' || !rootRef.current) return;
    const els = rootRef.current.querySelectorAll('.inv-section');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [mode, doc.sections]);

  return (
    <InvitationEnv.Provider value={{ floatingActions }}>
    <div ref={rootRef} className={`inv inv--${mode} ${themeClasses(doc)}`} style={themeVars(doc)}>
      {doc.sections
        .filter((s) => s.enabled)
        .map((s) => (
          <div
            key={s.id}
            data-section-id={s.id}
            className={`inv-section inv-section--${s.type}${selectedSectionId === s.id ? ' is-selected' : ''}${
              stickerEdit?.sticker.sectionId === s.id ? ' is-placing' : ''
            }`}
            onClickCapture={onSectionClick ? () => onSectionClick(s.id) : undefined}
          >
            {renderSection(doc, s, mode)}
            {stickerEdit?.sticker.sectionId === s.id && <PlacingHitArea edit={stickerEdit} sectionId={s.id} />}
            {renderOverlay?.(s)}
          </div>
        ))}
      {/* 스티커는 섹션에 잘리지 않도록 최상단 레이어에 (§4.10) */}
      <StickerOverlay doc={doc} mode={mode} rootRef={rootRef} edit={stickerEdit} onStickerClick={onStickerClick} />
    </div>
    </InvitationEnv.Provider>
  );
}
