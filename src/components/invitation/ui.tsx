// 청첩장 UI 컴포넌트 (디자인 시스템 §3.6). 스타일은 ui.css, 값은 tokens.css의 토큰만 사용
import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { InvitationDoc } from '../../types/invitation';
import { HeartCut } from './HeartCut';
import { ThemePortal } from './theme';

/* ---------- 아이콘 (lucide, 색은 currentColor) ---------- */
const icon = (d: ReactNode, size = 24) => (
  <svg className="ui-icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    {d}
  </svg>
);
export const IconPlus = () => icon(<path d="M5 12h14M12 5v14" />);
export const IconMinus = () => icon(<path d="M5 12h14" />);
export const IconChevronDown = () => icon(<path d="m6 9 6 6 6-6" />);
export const IconChevronLeft = () => icon(<path d="m15 18-6-6 6-6" />);
export const IconChevronRight = () => icon(<path d="m9 18 6-6-6-6" />);
export const IconMapPin = () =>
  icon(
    <>
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </>,
    14,
  );

/* ---------- 섹션 머리: (하트) 제목 · 설명 ---------- */
/** 손그림 꽃(꽃잎 다섯 · 줄기 · 잎 하나). 티켓 계열(템플릿2)에서 하트 대신 보인다 */
function FlowerDoodle() {
  return (
    <svg className="ui-flower" viewBox="0 0 32 36" aria-hidden>
      <path d="M16 9C13.8 5 15 2 16.8 2.4s1.6 3.6-.6 6.6" />
      <path d="M17.8 10.2C21 7.6 24.2 8 24.4 9.8c.2 2-3 2.8-6.4 1.6" />
      <path d="M17.4 12.6c2.2 2.8 2 5.8.2 6s-2.2-2.8-1.2-5.8" />
      <path d="M15.2 12.4c-2.6 2.6-5.6 2.8-6 1s2.4-2.8 5.4-2" />
      <path d="M14.6 9.8C11.4 8.6 10 6 11.4 4.8s3.6 1 4.2 4.2" />
      <circle cx="16.1" cy="10.9" r="1.7" />
      <path d="M16.4 19c-.4 5 .4 10-.8 15" />
      <path d="M16.2 27.4c2.4-2.4 6.2-2.6 7-1.6-1.6 2.2-4.6 2.8-7 1.6" />
    </svg>
  );
}

/** 점선 라인(블룸 계열 · 템플릿3의 대표 이미지): 반듯한 가로 점선 한 줄 */
function DashedLineDoodle() {
  return (
    <svg className="ui-dline" viewBox="0 0 80 4" aria-hidden>
      <path d="M2 2H78" />
    </svg>
  );
}

/** 섹션 구분 표시: 하트(기본) · 손그림 꽃(티켓 계열) · 점선 라인(블룸 계열). 모두 그리고 계열 CSS가 하나만 보여준다 */
export function HeartMark() {
  return (
    <>
      <HeartCut shape="a" className="ui-heart" />
      <FlowerDoodle />
      <DashedLineDoodle />
    </>
  );
}

/** 섹션 머리: 제목 위 오린 하트(섹션 구분 표시, 기본 켬) · 제목 · 설명 */
export function SectionHead({ title, desc, heart = true }: { title?: ReactNode; desc?: string; heart?: boolean }) {
  return (
    <header className="ui-head">
      {heart && <HeartMark />}
      {title && <h2 className="ui-title">{title}</h2>}
      {desc && <p className="ui-desc">{desc}</p>}
    </header>
  );
}

/* ---------- 버튼: primary(포인트 바탕) · inverse(크림 바탕) · chip(작은 테두리) ---------- */
type ButtonVariant = 'primary' | 'inverse' | 'chip';
export function Button({
  variant = 'primary',
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button type="button" className={`ui-btn ui-btn--${variant} ${className}`.trim()} {...rest} />;
}

/* ---------- 입력 필드: 레이블(+우측 보조) · 입력 · 도움말/오류 ---------- */
export function Field({
  label,
  aside,
  help,
  error,
  children,
}: {
  label: string;
  aside?: ReactNode;
  help?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="ui-field">
      <span className="ui-field-head">
        <span className="ui-label">{label}</span>
        {aside && <span className="ui-field-aside">{aside}</span>}
      </span>
      {children}
      {error ? (
        <span className="ui-field-error" role="alert">
          {error}
        </span>
      ) : (
        help && <span className="ui-field-help">{help}</span>
      )}
    </label>
  );
}

/* ---------- 선택(라디오) 알약: 기본 / card(위 작은 레이블 + 이름) ---------- */
export interface ChoiceOption<T extends string> {
  value: T;
  label: string;
  sub?: string;
}
export function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  variant = 'pill',
}: {
  label: string;
  value: T;
  options: ChoiceOption<T>[];
  onChange: (v: T) => void;
  variant?: 'pill' | 'card';
}) {
  return (
    <div className="ui-field">
      <span className="ui-field-head">
        <span className="ui-label">{label}</span>
      </span>
      <div className={`ui-choices ui-choices--${variant}`} role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            className={`ui-choice${value === o.value ? ' is-on' : ''}`}
            onClick={() => onChange(o.value)}
          >
            {o.sub ? (
              <>
                <span className="ui-choice-sub">{o.label}</span>
                <span className="ui-choice-main">{o.sub}</span>
              </>
            ) : (
              o.label
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- 숫자 스테퍼 ---------- */
export function Stepper({
  label,
  value,
  min,
  max,
  onChange,
  unit = '',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  unit?: string;
}) {
  return (
    <div className="ui-field">
      <span className="ui-field-head">
        <span className="ui-label">{label}</span>
      </span>
      <div className="ui-stepper">
        <button type="button" aria-label={`${label} 줄이기`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>
          <IconMinus />
        </button>
        <output aria-live="polite">
          {value}
          {unit}
        </output>
        <button type="button" aria-label={`${label} 늘리기`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>
          <IconPlus />
        </button>
      </div>
    </div>
  );
}

/* ---------- 정보 카드: 머리 · 구분선 · 내용 ---------- */
export function Divider() {
  return <hr className="ui-divider" />;
}
export function InfoCard({ head, children }: { head: ReactNode; children: ReactNode }) {
  return (
    <div className="ui-card">
      <div className="ui-card-head">{head}</div>
      <Divider />
      <div className="ui-card-body">{children}</div>
    </div>
  );
}

/* ---------- 모달: 흐린 배경 + 내용 + '배경 눌러서 닫기' (청첩장 밖 포털, 테마 토큰 유지) ---------- */
export function Modal({
  doc,
  label,
  onClose,
  children,
  bare = false,
  className = '',
}: {
  doc: InvitationDoc;
  label: string;
  onClose: () => void;
  children: ReactNode;
  /** true면 카드 없이 내용만 (라이트박스) */
  bare?: boolean;
  /** 카드에 더할 클래스 (간격 등 모달별 조정) */
  className?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <ThemePortal doc={doc}>
      <div className="ui-modal" role="dialog" aria-modal="true" aria-label={label} onClick={onClose}>
        <div className={`${bare ? 'ui-modal-bare' : 'ui-modal-card'} ${className}`.trim()} onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
        <p className="ui-modal-hint">배경 눌러서 닫기</p>
      </div>
    </ThemePortal>,
    document.body,
  );
}
