// 공용 아이콘

/** 붙이기(스티커) 아이콘: 웃는 얼굴 + 더하기. 모바일 [붙이기]·데스크탑 패널 머리 공통 (§4.10) */
export function StickerPlusIcon({ size = 20 }: { size?: number }) {
  return (
    <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden width={size} height={size}>
      <path d="M20 12a8 8 0 1 1-8-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8.5 14.5c.9 1.2 2.1 1.8 3.5 1.8s2.6-.6 3.5-1.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="9" cy="10" r="1.2" fill="currentColor" />
      <circle cx="15" cy="10" r="1.2" fill="currentColor" />
      <path d="M19 2v6M16 5h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
