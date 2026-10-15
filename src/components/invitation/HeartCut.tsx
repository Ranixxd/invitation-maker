// 종이를 가위로 오린 듯한 하트: 짧은 직선 마디 · 좌우 비대칭 · 가위 자국 (청첩장 공용 장식)
// 색은 CSS(.heart-cut): 기본 포인트색, 섹션 문맥에 따라 바뀐다. 모양 두 가지를 섞어 손으로 오린 느낌을 낸다
// 도트 계열에서는 같은 자리에 동그라미가 그려진다(.inv--fam-dots)
const CUT_HEARTS = {
  // 오른쪽 아래에 가위로 잘못 자른 홈
  a: 'M10.8 21.4 7.9 18.6 4.6 15.3 2.3 12.1 1 8.6 1.4 5.2 3.2 2.4 6.2 1 9.1 1.5 10.9 3.4 12.1 5.8 13.6 3.9 15.9 2.6 18.7 2.4 21.2 3.8 22.6 6.4 22.4 9.4 21.1 11.9 18.6 14.7 16.4 16.6 15.1 16.2 14.4 17.8 12.6 19.7Z',
  // 오른쪽 볼록이 더 크고 꼭짓점이 오른쪽으로 쏠림
  b: 'M12.4 20.9 10.6 19.6 7.2 17.1 4.1 14.1 2.4 11.4 1.6 8.2 2.3 5.1 3.9 3 6.4 1.9 8.5 2.1 10.2 3.3 11.3 4.9 11.9 6.6 12.6 4.3 14.1 2.5 16.6 1.3 19.3 1.6 21.4 3.3 22.5 6.1 22.2 9.3 20.7 12.2 18.3 14.9 15.7 17.4 13.9 19.3Z',
};
export type HeartCutShape = keyof typeof CUT_HEARTS;

export function HeartCut({ shape = 'a', className = '' }: { shape?: HeartCutShape; className?: string }) {
  return (
    <svg className={`heart-cut ${className}`} viewBox="0 0 24 22" aria-hidden>
      <path className="hc-heart" d={CUT_HEARTS[shape]} />
      {/* 도트 계열(러브 레터)은 하트 대신 동그라미 (CSS로 둘 중 하나만 보인다) */}
      <circle className="hc-dot" cx="12" cy="11" r="10" />
    </svg>
  );
}
