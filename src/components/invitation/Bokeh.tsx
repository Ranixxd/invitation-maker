import type { CSSProperties } from 'react';

// 반짝이 보케: 밝은 심 + 빛 번짐 점들이 히어로 전체에 흩어져, 천천히 떠오르며 반짝인다 (장식, CONSTITUTION §3.5)
// 배치는 고정 시드로 만들어 렌더마다 같다. 움직임은 transform·opacity만 써서 가볍다. 색은 크림 토큰(.spark)

interface Spark {
  x: number; // %
  y: number; // %
  core: number; // 밝은 심 지름(px)
  glow: boolean; // 큰 빛 번짐
  rise: number; // 떠오르는 주기(s)
  twinkle: number; // 반짝임 주기(s)
  delay: number; // s (음수: 이미 진행 중인 상태로 시작)
  drift: number; // 좌우 흔들림(px)
}

/** 고정 시드 난수 (mulberry32) */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COUNT = 70;
const SPARKS: Spark[] = (() => {
  const r = seeded(20270116);
  return Array.from({ length: COUNT }, () => {
    const glow = r() < 0.22; // 약 1/5은 크게 번지는 빛
    return {
      x: r() * 100,
      y: r() * 100,
      core: glow ? 3.5 + r() * 2.5 : 1.2 + r() * 2.3,
      glow,
      rise: 14 + r() * 12,
      twinkle: 2.2 + r() * 3.4,
      delay: -r() * 26,
      drift: (r() - 0.5) * 24,
    };
  });
})();

export function Bokeh() {
  return (
    <div className="bokeh" aria-hidden>
      {SPARKS.map((s, i) => {
        // 빛 번짐까지 포함한 점 크기: 일반 점은 심의 4배, 큰 빛은 9배
        const size = s.core * (s.glow ? 9 : 4);
        return (
          <span
            key={i}
            className="spark-float"
            style={
              {
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: size,
                height: size,
                animationDuration: `${s.rise}s`,
                animationDelay: `${s.delay}s`,
                '--drift': `${s.drift}px`,
              } as CSSProperties
            }
          >
            <span
              className={`spark${s.glow ? ' is-glow' : ''}`}
              style={
                {
                  animationDuration: `${s.twinkle}s`,
                  animationDelay: `${s.delay / 3}s`,
                  '--core': `${(100 / (s.glow ? 9 : 4)).toFixed(1)}%`,
                } as CSSProperties
              }
            />
          </span>
        );
      })}
    </div>
  );
}
