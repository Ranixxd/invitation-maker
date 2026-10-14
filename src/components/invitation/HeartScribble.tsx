// 손그림 하트 (SVG 선). 히어로·예식 일자 하이라이트·섹션 머리 공용
// 선 색·굵기는 CSS(.heart-scribble)에서: 기본 포인트색, 굵기는 크기와 상관없이 px로 유지
export function HeartScribble({ className }: { className: string }) {
  return (
    <svg className={`heart-scribble ${className}`} viewBox="0 0 120 110" aria-hidden>
      <path d="M60 101C26 76 8 55 14 32 19 12 44 6 58 28 66 6 92 1 104 20 116 42 98 70 57 103" />
      <path d="M52 98C80 82 108 60 106 34" />
    </svg>
  );
}
