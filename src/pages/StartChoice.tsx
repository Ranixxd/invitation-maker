// 2단계: 시작 방법 선택 — 쉽게 시작 / 바로 편집 (CONSTITUTION §1.2)
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useEditor } from '../store/EditorContext';
import { createDoc } from '../data/templates';
import { applyTemplate, getTemplate } from '../data/designTemplates';
import { AppHeader } from '../components/common/shared';

export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="icon-btn" aria-label={label}>
      ←
    </Link>
  );
}

export default function StartChoice() {
  const { startNew } = useEditor();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const template = getTemplate(params.get('template'));

  if (!template) return <Navigate to="/templates" replace />;

  const startBlank = () => {
    startNew(applyTemplate(createDoc(), template));
    navigate('/editor');
  };

  return (
    <main className="start">
      <AppHeader left={<BackLink to={`/templates/${template.id}`} label="템플릿 미리보기로" />} />

      <div className="start-inner">
        <h1>어떻게 시작할까요?</h1>
        <p className="lead">어떤 방법으로 시작해도 편집기에서 모두 바꿀 수 있어요.</p>

        <div className="choice-grid">
          <Link to={`/quick?template=${template.id}`} className="choice-card choice-card--primary">
            <span className="choice-badge">추천</span>
            <span className="choice-icon" aria-hidden>
              ✨
            </span>
            <h2>쉽게 시작</h2>
            <p>기본 사진과 정보를 입력해서 간단하게 청첩장을 만들어요.</p>
          </Link>

          <button type="button" className="choice-card" onClick={startBlank}>
            <span className="choice-icon" aria-hidden>
              🛠️
            </span>
            <h2>바로 편집</h2>
            <p>템플릿을 그대로 열고 처음부터 직접 채워요.</p>
          </button>
        </div>
      </div>
    </main>
  );
}
