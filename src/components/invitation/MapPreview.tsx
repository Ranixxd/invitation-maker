// 지도 자리: 카카오맵 연동 전까지 영역만 잡아 둔다 (plan.md 「카카오맵 연동」)
export function MapPreview({ label }: { label: string }) {
  return (
    <div className="map-preview" role="img" aria-label={`${label} 위치 지도 (카카오맵 연동 예정)`}>
      <p className="ui-caption">(카카오맵 연동 예정)</p>
    </div>
  );
}
