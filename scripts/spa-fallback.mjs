// GitHub Pages는 SPA 경로(/invitation-maker/templates/...)를 모르므로 없는 경로 요청에 404.html을 돌려준다.
// index.html을 404.html로 복사해 두면 새로고침·직접 링크에서도 앱이 뜨고, 라우터가 경로를 처리한다. (CONSTITUTION §9.6)
import { copyFileSync } from 'node:fs';

copyFileSync('dist/index.html', 'dist/404.html');
console.log('dist/404.html 생성 (SPA 폴백)');
