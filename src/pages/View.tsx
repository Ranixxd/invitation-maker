// 하객 시점 미리보기 (CONSTITUTION 제2장)
import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useEditor } from '../store/EditorContext';
import { InvitationView } from '../components/invitation/InvitationView';
import { THEME_PRESETS } from '../data/templates';

export default function View() {
  const { doc, loadStatus } = useEditor();

  useEffect(() => {
    if (doc) document.title = doc.title;
    return () => {
      document.title = '초대장 메이커';
    };
  }, [doc]);

  if (loadStatus === 'loading') return <div className="center-msg">불러오는 중…</div>;
  if (!doc) return <Navigate to="/start" replace />;

  return (
    <div className="view-page" style={{ background: THEME_PRESETS[doc.theme.preset].surface }}>
      <Link to="/editor" className="view-back">
        ← 편집으로
      </Link>
      <InvitationView doc={doc} mode="view" />
    </div>
  );
}
