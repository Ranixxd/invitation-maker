# 청첩장 메이커

모바일 청첩장을 만드는 반응형 웹 편집기 (초안). v0.2부터 결혼식 전용.

## 실행
```bash
npm install
npm run dev
```
http://localhost:5173 → 템플릿 선택 → 시작 방법 → 편집기 (저장 기능 없음: 새로고침하면 사라짐)

## 문서
- [헌법 (살아있는 마스터 문서)](docs/CONSTITUTION.md) — 현재 유효한 시스템 로직·정책
- [PRD 스냅샷](docs/prd/) — 시점별 설계 결정 히스토리

## 배포 (GitHub Pages)
**https://ranixxd.github.io/invitation-maker/**

`main`에 push하면 GitHub Actions가 자동으로 빌드·배포합니다(`.github/workflows/deploy-pages.yml`). 로컬에서 같은 빌드를 확인하려면:
```bash
npm run build:pages
```
자세한 내용은 [헌법 §9.6](docs/CONSTITUTION.md).

## 프로토타입 공유 (claude.ai 페이지)
```bash
npm run build:share
```
`dist-share/share.html`과 `dist-share/assets/`를 claude.ai 페이지로 게시합니다. 게시본은 비공개로 시작하고, 페이지의 Share 메뉴에서 공유합니다. 자세한 내용은 [헌법 §9.5](docs/CONSTITUTION.md).

- 현재 게시본: https://claude.ai/artifact/R6svBbnqni2Y8ftBmZttYi
