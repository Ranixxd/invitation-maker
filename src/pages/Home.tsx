// 홈은 본 개발 전 플레이스홀더 (CONSTITUTION §1.4)
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <main className="home">
      <div className="home-inner">
        <p className="eyebrow">모바일 청첩장 · 돌잔치 · 파티 초대장</p>
        <h1>
          사진 몇 장이면
          <br />
          초대장이 완성돼요
        </h1>
        <p className="lead">사진을 올리면 틀을 잡아드리고, 세세한 부분은 편집기에서 마음껏 다듬을 수 있어요.</p>
        <Link to="/start" className="btn btn-primary btn-lg">
          초대장 만들기
        </Link>
        <p className="field-hint">홈 화면은 준비 중입니다.</p>
      </div>
    </main>
  );
}
