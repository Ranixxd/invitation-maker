// 공유용 빌드 결과(dist-share/index.html)를 claude.ai 페이지 형식으로 변환한다.
// 페이지는 게시 시 문서 골격(<!doctype>, <html>, <head>, <body>)으로 감싸지므로 그 태그들을 걷어낸다.
import { readFileSync, writeFileSync } from 'node:fs';

const src = readFileSync('dist-share/index.html', 'utf8');
const head = src.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? '';
const body = src.match(/<body>([\s\S]*?)<\/body>/)?.[1] ?? '';

const keep = head
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !/^<meta (charset|name="viewport")/.test(l)); // 골격이 charset·viewport를 넣는다

writeFileSync('dist-share/share.html', [...keep, body.trim()].join('\n') + '\n');
console.log('dist-share/share.html 생성');
