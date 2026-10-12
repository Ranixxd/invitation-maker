# CLAUDE.md

초대장(모바일 청첩장 등) 메이커. React 18 + TS + Vite.

## 반드시 지킬 것
- 현재 정책의 단일 진실 공급원: `docs/CONSTITUTION.md`. 정책/로직을 바꾸면 **같은 커밋에서** 해당 조항과 하단 개정 이력을 고친다.
- 의미 있는 설계는 `docs/prd/`에 새 PRD 스냅샷으로 남긴다. 기존 PRD 본문은 수정하지 않는다(`docs/prd/README.md`).
- 커밋 메시지는 CONSTITUTION §9.3 형식: `type(scope): 요약` + 본문에 주요 내용 + `Refs:`.

## 명령
- `npm run dev` — 개발 서버 (http://localhost:5173)
- `npm run build` — 타입체크 + 빌드
