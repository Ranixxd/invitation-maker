import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 빌드 모드 (CONSTITUTION §9.5, §9.6)
// - 기본: 로컬 개발·일반 빌드
// - share: claude.ai 페이지 공유용 (상대 경로 자산, dist-share, 고정 파일명)
// - pages: GitHub Pages 배포용 (/invitation-maker/ 하위 경로)
const PAGES_BASE = '/invitation-maker/';

export default defineConfig(({ mode }) => {
  const share = mode === 'share';
  return {
    plugins: [react()],
    server: { port: 5173 },
    base: share ? './' : mode === 'pages' ? PAGES_BASE : '/',
    build: {
      outDir: share ? 'dist-share' : 'dist',
      ...(share && {
        rollupOptions: {
          output: { entryFileNames: 'assets/app.js', assetFileNames: 'assets/app[extname]' },
        },
      }),
    },
  };
});
