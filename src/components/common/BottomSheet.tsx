// 모바일 바텀시트 (CONSTITUTION §6.5). 헤더를 아래로 끌어 닫기, Esc/배경 탭으로 닫기
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

const CLOSE_DRAG_PX = 110;

export function BottomSheet({ open, title, onClose, children }: Props) {
  const [dragY, setDragY] = useState(0);
  const startY = useRef<number | null>(null);
  const dragRef = useRef(0); // 렌더 사이에도 최신 드래그 거리를 읽기 위해 ref로 보관
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) setDragY(0);
  }, [open]);

  const onDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    startY.current = e.clientY;
    dragRef.current = 0;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* 캡처 불가 환경 무시 */
    }
  };
  const onMove = (e: PointerEvent) => {
    if (startY.current === null) return;
    dragRef.current = Math.max(0, e.clientY - startY.current);
    setDragY(dragRef.current);
  };
  const onUp = () => {
    if (startY.current === null) return;
    startY.current = null;
    if (dragRef.current > CLOSE_DRAG_PX) onClose();
    setDragY(0); // 인라인 transform 해제 → 닫힘이면 아래로, 아니면 제자리로 트랜지션
    dragRef.current = 0;
  };

  return (
    <div className={`sheet-root${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <div className="sheet-backdrop" onClick={onClose} />
      <div
        ref={panelRef}
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        style={dragY ? { transform: `translateY(${dragY}px)`, transition: 'none' } : undefined}
      >
        <header className="sheet-head" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <span className="sheet-grabber" aria-hidden />
          <h2>{title}</h2>
          <button type="button" className="sheet-close" aria-label="닫기" onClick={onClose}>
            ✕
          </button>
        </header>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}
