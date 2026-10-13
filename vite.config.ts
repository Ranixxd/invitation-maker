import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const share = mode === 'share';
  return {
    plugins: [react()],
    server: { port: 5173 },
    // 공유용 빌드: 상대 경로 자산, 별도 출력 폴더, 고정 파일명(재게시 때 같은 경로를 덮어쓰도록) (CONSTITUTION §9.5)
    base: share ? './' : '/',
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
