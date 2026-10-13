// 라우팅 (CONSTITUTION 제2장): 템플릿 목록 → 템플릿 미리보기 → 시작 방법 → (쉽게 시작) → 편집기
import { Navigate, Route, Routes } from 'react-router-dom';
import { EditorProvider } from './store/EditorContext';
import { ToastHost } from './components/common/toast';
import TemplateSelect from './pages/TemplateSelect';
import TemplateDetail from './pages/TemplateDetail';
import StartChoice from './pages/StartChoice';
import QuickStart from './pages/QuickStart';
import Editor from './pages/Editor';
import View from './pages/View';

export default function App() {
  return (
    <EditorProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/templates" replace />} />
        <Route path="/templates" element={<TemplateSelect />} />
        <Route path="/templates/:id" element={<TemplateDetail />} />
        <Route path="/start" element={<StartChoice />} />
        <Route path="/quick" element={<QuickStart />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/view" element={<View />} />
        <Route path="*" element={<Navigate to="/templates" replace />} />
      </Routes>
      <ToastHost />
    </EditorProvider>
  );
}
