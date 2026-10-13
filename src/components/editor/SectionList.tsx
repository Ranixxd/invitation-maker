// 섹션 목록: 선택 · 표시 토글 · 드래그 앤 드롭 순서 변경 (CONSTITUTION §6.7, §4.2)
// HTML5 DnD는 터치에서 동작하지 않으므로 포인터 이벤트로 직접 구현한다.
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import type { InvitationDoc } from '../../types/invitation';
import { isPinned, PINNED_LAST, SECTION_LABELS } from '../../data/templates';
import type { EditorAction } from '../../store/editorReducer';

export type Selection = 'settings' | string; // string = section id

interface Props {
  doc: InvitationDoc;
  selected: Selection;
  onSelect: (s: Selection) => void;
  dispatch: (a: EditorAction) => void;
  /** 기본 정보 항목 표시 (모바일 구성 시트는 툴바에 따로 있으므로 숨김) */
  showBasics?: boolean;
}

interface Drag {
  id: string;
  from: number;
  to: number;
  dy: number;
}

export function SectionList({ doc, selected, onSelect, dispatch, showBasics = true }: Props) {
  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  const rects = useRef<{ top: number; height: number }[]>([]);
  const startY = useRef(0);
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);

  const setDragBoth = (d: Drag | null) => {
    dragRef.current = d;
    setDrag(d);
  };

  const onHandleDown = (e: PointerEvent, id: string, index: number) => {
    e.preventDefault();
    rects.current = doc.sections.map((s) => {
      const r = rowRefs.current.get(s.id)?.getBoundingClientRect();
      return { top: r?.top ?? 0, height: r?.height ?? 0 };
    });
    startY.current = e.clientY;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* 캡처 불가 환경 무시 */
    }
    setDragBoth({ id, from: index, to: index, dy: 0 });
  };

  const onHandleMove = (e: PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dy = e.clientY - startY.current;
    const r = rects.current[d.from];
    const center = r.top + r.height / 2 + dy;
    // 끌고 있는 항목을 뺀 나머지 중 중심이 위에 있는 항목 수 = 새 위치 (히어로 자리 0은 불가)
    let to = 0;
    rects.current.forEach((o, j) => {
      if (j !== d.from && o.top + o.height / 2 < center) to++;
    });
    // 고정 섹션 자리(맨 앞 히어로, 맨 뒤 브랜드)로는 들어갈 수 없다 (§4.2)
    const last = doc.sections.length - 1;
    const hi = doc.sections[last]?.type === PINNED_LAST ? last - 1 : last;
    setDragBoth({ ...d, dy, to: Math.min(Math.max(1, to), hi) });
  };

  const onHandleUp = () => {
    const d = dragRef.current;
    if (!d) return;
    if (d.to !== d.from) dispatch({ type: 'REORDER_SECTION', sectionId: d.id, toIndex: d.to });
    setDragBoth(null);
  };

  const onHandleKey = (e: KeyboardEvent, id: string, index: number) => {
    const dir = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
    if (!dir) return;
    e.preventDefault();
    dispatch({ type: 'REORDER_SECTION', sectionId: id, toIndex: index + dir });
  };

  /** 드래그 중 다른 항목이 비켜나는 거리 */
  const shiftFor = (j: number): number => {
    if (!drag || j === drag.from) return 0;
    const h = rects.current[drag.from]?.height ?? 0;
    const gap = 2;
    if (drag.from < j && j <= drag.to) return -(h + gap);
    if (drag.to <= j && j < drag.from) return h + gap;
    return 0;
  };

  return (
    <nav className={`section-list${drag ? ' is-dragging' : ''}`} aria-label="초대장 구성">
      {showBasics && (
        <ul>
          <li>
            <button type="button" className={`list-item${selected === 'settings' ? ' is-on' : ''}`} onClick={() => onSelect('settings')}>
              <span className="list-icon" aria-hidden>📋</span>
              <span className="list-name">기본 정보</span>
              <span className="list-desc">이름·날짜·장소·혼주</span>
            </button>
          </li>
        </ul>
      )}
      <p className="list-caption">섹션 (끌어서 순서를 바꿀 수 있어요)</p>
      <ul>
        {doc.sections.map((s, i) => {
          const pinned = isPinned(s.type);
          const label = SECTION_LABELS[s.type];
          const isDragged = drag?.id === s.id;
          return (
            <li
              key={s.id}
              ref={(el) => {
                if (el) rowRefs.current.set(s.id, el);
                else rowRefs.current.delete(s.id);
              }}
              className={`section-row${isDragged ? ' is-dragged' : ''}`}
              style={drag ? { transform: `translateY(${isDragged ? drag.dy : shiftFor(i)}px)` } : undefined}
            >
              <button type="button" className={`list-item${selected === s.id ? ' is-on' : ''}`} onClick={() => onSelect(s.id)}>
                <span className="list-num">{i + 1}</span>
                <span className="list-name">{label}</span>
                {pinned && <span className="list-badge">고정</span>}
              </button>
              {!pinned && (
                <span className="row-actions">
                  <input
                    type="checkbox"
                    role="switch"
                    className="switch sm"
                    aria-label={`${label} ${s.enabled ? '숨기기' : '보이기'}`}
                    checked={s.enabled}
                    onChange={() => dispatch({ type: 'TOGGLE_SECTION', sectionId: s.id })}
                  />
                  <button
                    type="button"
                    className="drag-handle"
                    aria-label={`${label} 순서 변경 (끌거나 위·아래 방향키)`}
                    onPointerDown={(e) => onHandleDown(e, s.id, i)}
                    onPointerMove={onHandleMove}
                    onPointerUp={onHandleUp}
                    onPointerCancel={onHandleUp}
                    onKeyDown={(e) => onHandleKey(e, s.id, i)}
                  >
                    <span aria-hidden>⠿</span>
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
