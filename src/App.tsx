// 라우팅 (CONSTITUTION 제2장)
import { Navigate, Route, Routes } from 'react-router-dom';
import { EditorProvider } from './store/EditorContext';
import { ToastHost } from './components/common/toast';
import Home from './pages/Home';
import StartChoice from './pages/StartChoice';
import QuickStart from './pages/QuickStart';
import Editor from './pages/Editor';
import View from './pages/View';

export default function App() {
  return (
    <EditorProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/start" element={<StartChoice />} />
        <Route path="/quick" element={<QuickStart />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/view" element={<View />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastHost />
    </EditorProvider>
  );
}
