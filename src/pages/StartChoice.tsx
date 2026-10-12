// 시작 방식 선택 (CONSTITUTION §1.2)
import { Link, useNavigate } from 'react-router-dom';
import { useEditor } from '../store/EditorContext';
import { createDoc } from '../data/templates';

export function confirmOverwrite(hasDraft: boolean) {
  return !hasDraft || window.confirm('작성 중인 초대장이 있어요. 새로 시작하면 기존 초안은 사라집니다. 계속할까요?');
}

export default function StartChoice() {
  const { doc, startNew, loadStatus } = useEditor();
  const navigate = useNavigate();

  const startBlank = async () => {
    if (!confirmOverwrite(!!doc)) return;
    await startNew(createDoc());
    navigate('/editor');
  };

  return (
    <main className="start">
      <header className="start-head">
        <Link to="/" className="logo">
          초대장 메이커
        </Link>
      </header>
      <div className="start-inner">
        <h1>어떻게 시작할까요?</h1>
        <p className="lead">어떤 방법으로 시작해도 나중에 편집기에서 모두 바꿀 수 있어요.</p>

        {loadStatus === 'ready' && doc && (
          <div className="draft-banner">
            <div>
              <b>작성 중인 초대장이 있어요</b>
              <p>{doc.title}</p>
            </div>
            <Link to="/editor" className="btn btn-secondary">
              이어서 편집
            </Link>
          </div>
        )}

        <div className="choice-grid">
          <Link to="/quick" className="choice-card choice-card--primary">
            <span className="choice-badge">추천</span>
            <span className="choice-icon" aria-hidden>
              ✨
            </span>
            <h2>쉽게 시작</h2>
            <p>사진만 올려주세요. 대표 사진, 갤러리 배치, 어울리는 색까지 자동으로 틀을 잡아드려요.</p>
            <span className="choice-cta">사진으로 시작하기 →</span>
          </Link>

          <button type="button" className="choice-card" onClick={startBlank}>
            <span className="choice-icon" aria-hidden>
              🛠️
            </span>
            <h2>편집기에서 바로 시작</h2>
            <p>기본 청첩장 템플릿을 열고 처음부터 직접 구성해요.</p>
            <span className="choice-cta">편집기 열기 →</span>
          </button>
        </div>
      </div>
    </main>
  );
}
