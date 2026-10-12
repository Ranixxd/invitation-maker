// 2단계: 시작 방법 선택 — 쉽게 시작 / 바로 편집 (CONSTITUTION §1.2)
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useEditor } from '../store/EditorContext';
import { createDoc } from '../data/templates';
import { applyTemplate, getTemplate } from '../data/designTemplates';
import { TemplatePreview } from '../components/common/TemplatePreview';

export function FlowSteps({ current }: { current: 0 | 1 | 2 }) {
  return (
    <ol className="flow-steps" aria-label="진행 단계">
      {['템플릿', '시작 방법', '편집'].map((s, i) => (
        <li key={s} className={i === current ? 'is-current' : i < current ? 'is-done' : ''} aria-current={i === current ? 'step' : undefined}>
          {s}
        </li>
      ))}
    </ol>
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
      <header className="flow-head">
        <Link to={`/templates?selected=${template.id}`} className="icon-btn" aria-label="템플릿 선택으로">
          ←
        </Link>
        <FlowSteps current={1} />
      </header>

      <div className="start-inner">
        <div className="chosen-tpl">
          <div className="chosen-thumb">
            <TemplatePreview template={template} />
          </div>
          <div>
            <p className="field-hint">선택한 템플릿</p>
            <b className="chosen-name">{template.name}</b>
            <p className="field-hint">{template.tagline}</p>
            <Link to={`/templates?selected=${template.id}`} className="link-btn">
              템플릿 바꾸기
            </Link>
          </div>
        </div>

        <h1>어떻게 시작할까요?</h1>
        <p className="lead">어떤 방법으로 시작해도 편집기에서 모두 바꿀 수 있어요.</p>

        <div className="choice-grid">
          <Link to={`/quick?template=${template.id}`} className="choice-card choice-card--primary">
            <span className="choice-badge">추천</span>
            <span className="choice-icon" aria-hidden>
              ✨
            </span>
            <h2>쉽게 시작</h2>
            <p>사진과 이름·날짜만 알려주세요. 대표 사진을 고르고 갤러리까지 채워서 템플릿에 맞춰 드려요.</p>
            <span className="choice-cta">사진으로 시작하기 →</span>
          </Link>

          <button type="button" className="choice-card" onClick={startBlank}>
            <span className="choice-icon" aria-hidden>
              🛠️
            </span>
            <h2>바로 편집</h2>
            <p>템플릿을 그대로 열고 처음부터 직접 채워요.</p>
            <span className="choice-cta">편집기 열기 →</span>
          </button>
        </div>
      </div>
    </main>
  );
}
