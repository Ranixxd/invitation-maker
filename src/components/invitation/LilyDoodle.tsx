// 선 그림 백합 (템플릿3 블룸 계열의 포인트 이미지). 색은 currentColor, 선 굵기는 크기와 관계없이 일정(CSS)
// 꽃잎 여섯 장(끝이 살짝 말림) · 수술 · 줄기 · 잎 하나
const CX = 60;
const CY = 52;

/** 꽃잎: [각도, 길이, 폭] — 조금씩 달라야 손으로 그린 느낌 */
const PETALS: [number, number, number][] = [
  [-8, 40, 12],
  [52, 35, 10],
  [112, 38, 11],
  [172, 30, 9],
  [232, 34, 10],
  [292, 38, 11],
];
/** 수술: [각도, 길이] */
const STAMENS: [number, number][] = [
  [18, 22],
  [74, 19],
  [128, 23],
  [196, 17],
  [250, 21],
  [318, 20],
];

const petal = (l: number, w: number) =>
  `M0 0C${-w} ${-l * 0.3} ${-w * 0.8} ${-l * 0.75} 0 ${-l}C${w * 0.8} ${-l * 0.75} ${w} ${-l * 0.3} 0 0` +
  `M0 ${-l}q${w * 0.45} -2 ${w * 0.6} 3` + // 끝이 바깥으로 살짝 말림
  `M0 -5Q${w * 0.18} ${-l * 0.5} 0 ${-l * 0.86}`; // 가운데 잎맥

export function LilyDoodle({ className = '' }: { className?: string }) {
  return (
    <svg className={`lily ${className}`.trim()} viewBox="0 0 120 140" aria-hidden>
      <path d="M61 84C63 100 56 116 62 139" />
      <path d="M60 106C72 98 88 98 97 89C87 104 73 110 60 106Z" />
      <path d="M61 108C72 104 82 100 92 93" />
      {PETALS.map(([a, l, w], i) => (
        <path key={i} d={petal(l, w)} transform={`translate(${CX} ${CY}) rotate(${a})`} />
      ))}
      {STAMENS.map(([a, l], i) => (
        <g key={i} transform={`translate(${CX} ${CY}) rotate(${a})`}>
          <path d={`M0 0Q2 ${-l * 0.5} 0 ${-l}`} />
          <ellipse cx="0" cy={-l - 2} rx="1.3" ry="2.6" />
        </g>
      ))}
    </svg>
  );
}
