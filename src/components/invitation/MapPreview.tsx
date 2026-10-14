// 지도 자리 그림: 카카오맵 연동 전까지 오시는 길에 두는 장식 지도 (plan.md 「카카오맵 연동」)
// 색은 토큰(currentColor·CSS 변수)만 써서 포인트 색이 바뀌어도 따라온다
export function MapPreview({ label }: { label: string }) {
  return (
    <div className="map-preview" role="img" aria-label={`${label} 위치 지도`}>
      <svg viewBox="0 0 300 180" preserveAspectRatio="xMidYMid slice" aria-hidden>
        {/* 강 */}
        <path className="map-river" d="M-10 140 C 60 120, 90 160, 160 138 S 260 110, 310 128" />
        {/* 큰 길 */}
        <path className="map-road map-road--main" d="M-10 70 L 310 92" />
        <path className="map-road map-road--main" d="M118 -10 L 140 190" />
        {/* 작은 길 */}
        <path className="map-road" d="M-10 30 L 120 40 L 310 28" />
        <path className="map-road" d="M40 -10 L 58 190" />
        <path className="map-road" d="M210 -10 L 222 190" />
        <path className="map-road" d="M140 120 L 310 150" />
        <path className="map-road" d="M-10 110 L 125 104" />
        {/* 블록 */}
        <rect className="map-block" x="66" y="44" width="44" height="20" rx="3" />
        <rect className="map-block" x="152" y="40" width="50" height="38" rx="3" />
        <rect className="map-block" x="232" y="98" width="52" height="30" rx="3" />
        <rect className="map-block" x="68" y="78" width="40" height="18" rx="3" />
      </svg>
      {/* 핀: 가운데 */}
      <svg className="map-pin" viewBox="0 0 24 32" aria-hidden>
        <path d="M12 31s10-9.6 10-18.5A10 10 0 0 0 2 12.5C2 21.4 12 31 12 31z" />
        <circle cx="12" cy="12.5" r="3.6" />
      </svg>
    </div>
  );
}
