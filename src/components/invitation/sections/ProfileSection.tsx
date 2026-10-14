// 우리의 이야기: 타임라인만. 항목을 좌우 번갈아 놓고, 손그림 리본 선(작은 고리 포함)이 항목을 잇는다 (§4.1, §3.5)
// - 선은 각 날짜 글자의 실제 위치를 재서 계산한다 → 항목 수·글 길이·화면 폭이 바뀌어도 맞는다
// - 날짜 글자 앞에서 끊기고 뒤에서 다시 이어진다(글자를 가리지 않음)
// - 섹션이 화면에 들어오면 선이 위에서부터 그려진다(움직임 줄이기면 바로 다 그려진 상태)
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { SectionHead } from '../ui';
import { HeartScribble } from '../HeartScribble';

interface Anchor {
  l: number; // 날짜 글자 왼쪽
  r: number; // 오른쪽
  y: number; // 세로 가운데
}

const GAP = 10; // 선과 날짜 글자 사이
const LOOP_W = 34; // 고리 크기
const LOOP_H = 30;

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

    // 날짜 글자를 건너뛰고 반대편에서 다시
    let x = exit;
    d += ` M ${x} ${p.y}`;
    // 두 번째 항목마다 작은 고리
    if (i % 2 === 1) {
      d += ` C ${x + dir * LOOP_W} ${p.y - LOOP_H}, ${x - dir * (LOOP_W * 0.4)} ${p.y - LOOP_H}, ${x + dir * 10} ${p.y}`;
      x += dir * 10;
    }
    prev = { x, y: p.y, dir };
  });

  // 끝: 아래로 말려 내려가 하트로
  const end = { x: clamp(prev.x + prev.dir * 46), y: prev.y + 52 };
  d += ` C ${clamp(prev.x + prev.dir * 60)} ${prev.y}, ${clamp(prev.x + prev.dir * 60)} ${prev.y + 40}, ${end.x} ${end.y}`;
  return { d, end };
}

export function ProfileSection({ section, mode }: SectionProps<SectionOf<'profile'>>) {
  const { title, timeline } = section.data;
  const items = timeline.filter((t) => t.date || t.text);
  const listRef = useRef<HTMLOListElement>(null);
  const [geo, setGeo] = useState<{ w: number; h: number; d: string; end: { x: number; y: number } } | null>(null);
  const [drawn, setDrawn] = useState(false);
  const filterId = `story-rough-${useId().replace(/:/g, '')}`;

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
      setGeo({ w, h: ol.clientHeight, ...ribbonPath(anchors, w) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ol);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [items.length]);

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
        <SectionHead heart title={title} desc="우리의 타임라인을 채워 주세요" />
      </section>
    );
  }

  return (
    <section className="inv-block profile">
      <SectionHead heart title={title} />
      <ol ref={listRef} className={`story${drawn ? ' is-drawn' : ''}`}>
        {geo && (
          <svg className="story-ribbon" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} aria-hidden>
            <defs>
              {/* 손그림 느낌: 선을 살짝 흔든다 */}
              <filter id={filterId} x="-5%" y="-5%" width="110%" height="110%">
                <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" />
                <feDisplacementMap in="SourceGraphic" scale="3" />
              </filter>
            </defs>
            <path d={geo.d} pathLength={1} filter={`url(#${filterId})`} />
          </svg>
        )}
        {items.map((t, i) => (
          <li key={t.id} className={`story-item ${i % 2 ? 'is-right' : 'is-left'}`} style={{ gridRow: i + 1 }}>
            {t.date && <span className="story-date story-anchor">{t.date}</span>}
            {t.text && <span className={`story-text${t.date ? '' : ' story-anchor'}`}>{t.text}</span>}
          </li>
        ))}
        {/* 리본 끝의 작은 하트 (선이 다 그려진 뒤 나타남) */}
        {geo && (
          <span className="story-end" style={{ left: geo.end.x, top: geo.end.y }} aria-hidden>
            <HeartScribble className="story-end-heart" />
          </span>
        )}
      </ol>
    </section>
  );
}
