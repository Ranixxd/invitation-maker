// 1-1단계: 템플릿 미리보기 → 이 템플릿으로 시작하기 (CONSTITUTION §1.2, §3.5)
import { useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { getTemplate } from '../data/designTemplates';
import { sampleDoc } from '../data/sampleDoc';
import { AppHeader, PhoneFrame } from '../components/common/shared';
import { InvitationView } from '../components/invitation/InvitationView';
import { BackLink } from './StartChoice';

export default function TemplateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const template = getTemplate(id);
  const doc = useMemo(() => (template ? sampleDoc(template) : null), [template]);

  if (!template || !doc) return <Navigate to="/templates" replace />;

  return (
    <main className="tpl-detail">
      <AppHeader left={<BackLink to="/templates" label="템플릿 목록으로" />} />

      <div className="tpl-detail-body">
        <div className="tpl-detail-info">
          <h1>{template.name}</h1>
          <p className="lead">{template.tagline}</p>
          <p className="field-hint">샘플 사진과 이름으로 보여드려요. 내 정보는 다음 단계에서 넣어요.</p>
        </div>
        <div className="tpl-detail-preview">
          <PhoneFrame>
            <InvitationView doc={doc} mode="view" />
          </PhoneFrame>
        </div>
      </div>

      <footer className="flow-foot">
        <button type="button" className="btn btn-primary btn-lg" onClick={() => navigate(`/start?template=${template.id}`)}>
          이 템플릿으로 시작하기
        </button>
      </footer>
    </main>
  );
}
