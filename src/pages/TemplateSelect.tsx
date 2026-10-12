// 1단계: 템플릿 선택 (CONSTITUTION §1.2, §3.5)
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DESIGN_TEMPLATES, getTemplate } from '../data/designTemplates';
import { TemplatePreview } from '../components/common/TemplatePreview';
import { AppHeader } from '../components/common/shared';

export default function TemplateSelect() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [selected, setSelected] = useState<string | null>(getTemplate(params.get('selected'))?.id ?? null);
  const chosen = getTemplate(selected);

  return (
    <main className="tpl-page">
      <AppHeader />

      <div className="tpl-inner">
        <h1>템플릿을 골라주세요</h1>
        <p className="lead">분위기와 레이아웃을 먼저 정해요.</p>

        <ul className="tpl-grid" role="radiogroup" aria-label="템플릿">
          {DESIGN_TEMPLATES.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                role="radio"
                aria-checked={selected === t.id}
                className={`tpl-card${selected === t.id ? ' is-on' : ''}`}
                onClick={() => setSelected(t.id)}
                onDoubleClick={() => navigate(`/start?template=${t.id}`)}
              >
                <TemplatePreview template={t} />
                <span className="tpl-meta">
                  <b>{t.name}</b>
                  <span>{t.tagline}</span>
                </span>
                {selected === t.id && (
                  <span className="tpl-check" aria-hidden>
                    ✓
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <footer className="flow-foot">
        <button
          type="button"
          className="btn btn-primary btn-lg"
          disabled={!chosen}
          onClick={() => chosen && navigate(`/start?template=${chosen.id}`)}
        >
          {chosen ? '이 템플릿으로 시작하기' : '템플릿을 선택해 주세요'}
        </button>
      </footer>
    </main>
  );
}
