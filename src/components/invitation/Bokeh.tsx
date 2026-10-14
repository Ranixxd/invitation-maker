import type { CSSProperties } from 'react';

// 보케: 흐릿한 빛망울이 아래에서 위로 천천히 떠오른다 (장식, CONSTITUTION §3.5)
// 위치·크기·속도는 고정 값이라 렌더마다 같다. 색·블러는 CSS 토큰(.bokeh)
const DOTS: { x: number; size: number; dur: number; delay: number; drift: number }[] = [
  { x: 6, size: 14, dur: 13, delay: 0, drift: 12 },
  { x: 14, size: 26, dur: 17, delay: -6, drift: -10 },
  { x: 23, size: 8, dur: 11, delay: -3, drift: 8 },
  { x: 31, size: 18, dur: 15, delay: -9, drift: -14 },
  { x: 40, size: 10, dur: 12, delay: -1, drift: 10 },
  { x: 48, size: 30, dur: 19, delay: -12, drift: 6 },
  { x: 56, size: 12, dur: 14, delay: -5, drift: -8 },
  { x: 63, size: 22, dur: 16, delay: -2, drift: 14 },
  { x: 71, size: 9, dur: 10, delay: -7, drift: -6 },
  { x: 78, size: 16, dur: 13, delay: -11, drift: 10 },
  { x: 86, size: 28, dur: 18, delay: -4, drift: -12 },
  { x: 93, size: 11, dur: 12, delay: -8, drift: 8 },
  { x: 10, size: 20, dur: 15, delay: -13, drift: -8 },
  { x: 27, size: 12, dur: 12, delay: -10, drift: 12 },
  { x: 44, size: 16, dur: 14, delay: -7, drift: -10 },
  { x: 60, size: 8, dur: 10, delay: -9, drift: 6 },
  { x: 75, size: 24, dur: 16, delay: -14, drift: -12 },
  { x: 89, size: 14, dur: 13, delay: -3, drift: 10 },
];

export function Bokeh() {
  return (
    <div className="bokeh" aria-hidden>
      {DOTS.map((d, i) => (
        <span
          key={i}
          style={
            {
              left: `${d.x}%`,
              width: d.size,
              height: d.size,
              animationDuration: `${d.dur}s`,
              animationDelay: `${d.delay}s`,
              '--drift': `${d.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
