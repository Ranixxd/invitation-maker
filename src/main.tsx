import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import App from './App';
import './styles/global.css';

// 공유용 빌드(--mode share)는 URL 경로를 쓸 수 없는 환경(claude.ai 페이지)에서 돌므로 메모리 라우터 사용 (CONSTITUTION §9.5)
const Router = import.meta.env.VITE_ROUTER === 'memory' ? MemoryRouter : BrowserRouter;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
);
