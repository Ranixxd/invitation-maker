// 청첩장 UI 컴포넌트 (디자인 시스템 §3.6). 스타일은 ui.css, 값은 tokens.css의 토큰만 사용
import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { InvitationDoc } from '../../types/invitation';
import { HeartScribble } from './HeartScribble';
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
export function HeartMark() {
  return <HeartScribble className="ui-heart" />;
}

export function SectionHead({ title, desc, heart = false }: { title?: ReactNode; desc?: string; heart?: boolean }) {
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
}: {
  doc: InvitationDoc;
  label: string;
  onClose: () => void;
  children: ReactNode;
  /** true면 카드 없이 내용만 (라이트박스) */
  bare?: boolean;
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
        <div className={bare ? 'ui-modal-bare' : 'ui-modal-card'} onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
        <p className="ui-modal-hint">배경 눌러서 닫기</p>
      </div>
    </ThemePortal>,
    document.body,
  );
}
