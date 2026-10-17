// 우리의 이야기: 타임라인만. 항목을 좌우 번갈아 놓고, 매끈한 리본 선이 항목을 잇는다 (§4.1, §3.5)
// - 선은 각 날짜 글자의 실제 위치를 재서 계산한다 → 항목 수·글 길이·화면 폭이 바뀌어도 맞는다
// - 날짜 글자 앞에서 끊기고 뒤에서 다시 이어진다(글자를 가리지 않음)
// - 섹션이 화면에 들어오면 선이 위에서부터 그려진다(움직임 줄이기면 바로 다 그려진 상태)
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { SectionHead } from '../ui';

interface Anchor {
  l: number; // 날짜 글자 왼쪽
  r: number; // 오른쪽
  y: number; // 세로 가운데
}

const GAP = 10; // 선과 날짜 글자 사이

/** 날짜 글자 위치들 → 리본 경로. 왼쪽 항목은 바깥(왼쪽)에서 들어와 안쪽(오른쪽)으로, 오른쪽 항목은 반대 */
function ribbonPath(pts: Anchor[], width: number) {
  const clamp = (x: number) => Math.min(width - 6, Math.max(6, x));
  let d = '';
  let prev = { x: 0, y: 0, dir: 1 };
  pts.forEach((p, i) => {
    const left = i % 2 === 0;
    const dir = left ? 1 : -1; // 날짜를 지나가는 방향(바깥 → 안쪽)
    const enter = left ? p.l - GAP : p.r + GAP;
    const exit = left ? p.r + GAP : p.l - GAP;

    if (i === 0) {
      // 시작: 바깥 가장자리 위쪽에서 흘러 들어온다
      const sx = left ? 0 : width;
      const sy = p.y - 44;
      d += `M ${sx} ${sy} C ${sx + dir * 40} ${sy}, ${enter - dir * 40} ${p.y}, ${enter} ${p.y}`;
    } else {
      // 이전 항목 출구에서 반대편 바깥으로 크게 휘어 돌아 이 항목 입구로
      const k1 = Math.max(50, Math.abs(enter - prev.x) * 0.7);
      const k2 = 70;
      d += ` C ${clamp(prev.x + prev.dir * k1)} ${prev.y}, ${clamp(enter - dir * k2)} ${p.y}, ${enter} ${p.y}`;
    }

    // 날짜 글자를 건너뛰고 반대편에서 다시 (마지막 날짜 뒤로는 선을 잇지 않는다)
    if (i < pts.length - 1) d += ` M ${exit} ${p.y}`;
    prev = { x: exit, y: p.y, dir };
  });

  return d;
}

/** 블룸 계열(템플릿3): 항목을 피해 빈 쪽으로 흐르는 가는 곡선(고리 없이 선만).
 *  ys = 항목 세로 가운데들(항목은 왼쪽부터 번갈아), 선은 항목 반대쪽 칸을 지나 항목 사이에서 반대편으로 크게 건너간다 */
function flowPath(ys: number[], width: number, height: number) {
  const side = (i: number) => (i % 2 === 0 ? width * 0.74 : width * 0.26); // 왼쪽 항목이면 선은 오른쪽 칸
  let x = side(0);
  let y = ys[0];
  // 시작: 왼쪽 가장자리 위에서 크게 휘어 들어온다
  let d = `M 0 ${y * 0.7} C ${width * 0.3} ${y * 0.1}, ${x + 50} ${y * 0.2}, ${x} ${y}`;
  ys.slice(1).forEach((ny, k) => {
    const nx = side(k + 1);
    const dy = ny - y;
    d += ` C ${x} ${y + dy * 0.75}, ${nx} ${ny - dy * 0.75}, ${nx} ${ny}`;
    x = nx;
    y = ny;
  });
  // 끝: 반대편 아래 가장자리로 흘러 나간다
  const ex = x > width / 2 ? 0 : width;
  d += ` C ${x} ${y + 60}, ${(x + ex) / 2} ${height - 10}, ${ex} ${height - 30}`;
  return d;
}

export function ProfileSection({ doc, section, mode }: SectionProps<SectionOf<'profile'>>) {
  const { title, timeline } = section.data;
  const items = timeline.filter((t) => t.date || t.text);
  const loop = doc.theme.family === 'bloom';
  const listRef = useRef<HTMLOListElement>(null);
  const [geo, setGeo] = useState<{ w: number; h: number; d: string } | null>(null);
  const [drawn, setDrawn] = useState(false);

  // 날짜 글자 위치 재기 (offset 기준: 템플릿 썸네일처럼 확대·축소된 화면에서도 정확)
  useLayoutEffect(() => {
    const ol = listRef.current;
    if (!ol) return;
    const measure = () => {
      // 목록(ol) 기준 위치: offsetParent를 거슬러 올라가며 더한다
      const offsetIn = (el: HTMLElement) => {
        let x = 0;
        let y = 0;
        for (let n: HTMLElement | null = el; n && n !== ol; n = n.offsetParent as HTMLElement | null) {
          x += n.offsetLeft;
          y += n.offsetTop;
        }
        return { x, y };
      };
      const anchors = Array.from(ol.querySelectorAll<HTMLElement>('.story-anchor')).map((el) => {
        const o = offsetIn(el);
        return { l: o.x, r: o.x + el.offsetWidth, y: o.y + el.offsetHeight / 2 };
      });
      if (!anchors.length) return;
      const w = ol.clientWidth;
      const h = ol.clientHeight;
      if (loop) {
        const ys = Array.from(ol.querySelectorAll<HTMLElement>('.story-item')).map((el) => offsetIn(el).y + el.offsetHeight / 2);
        setGeo({ w, h, d: flowPath(ys, w, h) });
      } else setGeo({ w, h, d: ribbonPath(anchors, w) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ol);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [items.length, loop]);

  // 화면에 들어오면 그리기
  useEffect(() => {
    const ol = listRef.current;
    if (!ol) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDrawn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(ol);
    return () => io.disconnect();
  }, [items.length]);

  // 내용이 없으면 하객 화면에서는 그리지 않고, 편집기에서는 안내 (§4.1)
  if (!items.length) {
    if (mode === 'view') return null;
    return (
      <section className="inv-block profile">
        <SectionHead title={title} desc="우리의 타임라인을 채워 주세요" />
      </section>
    );
  }

  return (
    <section className="inv-block profile">
      <SectionHead title={title} />
      <ol ref={listRef} className={`story${drawn ? ' is-drawn' : ''}`}>
        {geo && (
          <svg className="story-ribbon" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} aria-hidden>
            <path d={geo.d} pathLength={1} />
          </svg>
        )}
        {items.map((t, i) => (
          <li key={t.id} className={`story-item ${i % 2 ? 'is-right' : 'is-left'}`} style={{ gridRow: i + 1 }}>
            {t.date && <span className="story-date story-anchor">{t.date}</span>}
            {t.text && <span className={`story-text${t.date ? '' : ' story-anchor'}`}>{t.text}</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}
