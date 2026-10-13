// 1단계: 템플릿 목록. 카드를 누르면 미리보기(/templates/:id)로 (CONSTITUTION §1.2, §3.5)
import { Link } from 'react-router-dom';
import { DESIGN_TEMPLATES } from '../data/designTemplates';
import { TemplatePreview } from '../components/common/TemplatePreview';
import { AppHeader } from '../components/common/shared';

export default function TemplateSelect() {
  return (
    <main className="tpl-page">
      <AppHeader />

      <div className="tpl-inner">
        <h1>템플릿을 골라주세요</h1>
        <p className="lead">분위기와 레이아웃을 먼저 정해요. 눌러서 미리 볼 수 있어요.</p>

        {/* 미리보기 안에 링크(지도 버튼 등)가 있어 링크 안에 넣을 수 없으므로, 제목 링크를 카드 전체로 늘린다 */}
        <ul className="tpl-grid">
          {DESIGN_TEMPLATES.map((t) => (
            <li key={t.id} className="tpl-card">
              <TemplatePreview template={t} />
              <span className="tpl-meta">
                <Link to={`/templates/${t.id}`} className="tpl-link">
                  <b>{t.name}</b>
                </Link>
                <span>{t.tagline}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
