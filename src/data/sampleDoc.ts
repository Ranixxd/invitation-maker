// 템플릿 미리보기용 샘플 청첩장 (CONSTITUTION §3.5). 모든 섹션이 채워진 상태로 보여준다.
import type { ImageAsset, InvitationDoc, Section } from '../types/invitation';
import { createDoc } from './templates';
import { applyTemplate, type DesignTemplate } from './designTemplates';
import { hashPassword, SAMPLE_PASSWORD } from '../lib/guestbook';
// 샘플 사진 (src/assets/samples/, §3.5) — 지금은 친구와 돌려 보는 단계라 짤 한 장을 모든 자리(히어로·추가·갤러리)에 쓴다.
// 원래 웨딩 샘플(wedding-hero-01.jpg)로 돌아가려면 이 import만 바꾸면 된다
import samplePhoto01 from '../assets/samples/sample-meme-01.jpg';

const GALLERY_COUNT = 9;
const SAMPLE_TIMELINE = [
  { date: '2019.03', text: '동아리에서 처음 만난 날' },
  { date: '2020.05', text: '연애 시작' },
  { date: '2026.06', text: '제주에서 프러포즈' },
  { date: '2027.01', text: '우리 결혼합니다' },
];
const SAMPLE_PARENTS = [
  { father: '김철수', mother: '박영희' },
  { father: '이정호', mother: '최미경' },
];

/** 방명록 예시 쪽지 (9개씩 넘겨보는 모습이 보이도록 11개, 비밀번호 SAMPLE_PASSWORD) */
const SAMPLE_GUESTBOOK: [string, string][] = [
  ['지훈', '민준아 결혼 진짜 축하해! 대학 때부터 봐온 사람으로서 너무 뿌듯하다. 행복하게 잘 살아라'],
  ['수아', '서연아 드레스 입은 모습 너무 기대돼. 언제나 지금처럼 웃으면서 살자!'],
  ['이모', '우리 서연이 예쁘게 잘 살거라. 두 사람의 앞날에 늘 좋은 일만 가득하길 바란다'],
  ['현우', '형 결혼 축하드려요. 신혼여행 사진 꼭 보여주세요'],
  ['예린', '세상에서 제일 예쁜 신부 될 거야. 사랑해 친구야'],
  ['김 팀장', '민준씨 결혼 축하합니다. 회사 걱정은 말고 푹 쉬다 와요'],
  ['다은', '두 사람 처음 만난 날 얘기 들었던 게 엊그제 같은데! 진심으로 축하해'],
  ['성민', '축가 연습 열심히 하고 있다. 기대해라'],
  ['하윤', '서연아 결혼 축하해! 늘 지금처럼 다정한 부부가 되길'],
  ['준호', '드디어 장가가는구나. 축하한다 친구야'],
  ['지민', '앞으로 함께 걸어갈 모든 날들을 응원해요'],
];

export function sampleDoc(t: DesignTemplate): InvitationDoc {
  const doc = applyTemplate(createDoc(), t);
  const hero: ImageAsset = {
    id: 'sample_photo_01',
    src: samplePhoto01,
    width: 736,
    height: 552,
    aspect: 736 / 552,
    luminance: 0.6,
    color: '#b9a39a',
  };
  const gallery: ImageAsset[] = Array.from({ length: GALLERY_COUNT }, (_, i) => ({ ...hero, id: `sample_gallery_${i + 1}` }));
  // 폴라로이드 추가 사진 2장: 샘플은 같은 사진(다른 id) — 실제 사진이 생기면 교체
  const heroExtras: ImageAsset[] = [1, 2].map((n) => ({ ...hero, id: `${hero.id}_${n}` }));
  const images = Object.fromEntries([hero, ...heroExtras, ...gallery].map((img) => [img.id, img]));

  const hosts = doc.core.hosts.map((h, i) => ({
    ...h,
    father: { ...h.father, name: SAMPLE_PARENTS[i]?.father ?? '' },
    mother: { ...h.mother, name: SAMPLE_PARENTS[i]?.mother ?? '' },
  }));

  const sections = doc.sections.map((s): Section => {
    switch (s.type) {
      case 'hero':
        return { ...s, data: { ...s.data, imageId: hero.id, extraImageIds: heroExtras.map((h) => h.id) } };
      case 'profile':
        return {
          ...s,
          data: {
            ...s.data,
            timeline: SAMPLE_TIMELINE.map((t, i) => ({ id: `sample_tl_${i}`, ...t })),
          },
        };
      case 'gallery':
        return { ...s, data: { ...s.data, imageIds: gallery.map((g) => g.id) } };
      case 'location':
        return {
          ...s,
          data: {
            ...s.data,
            subway: '7호선 청담역 9번 출구 도보 5분',
            bus: '간선 301, 342 / 지선 4318',
            car: '건물 내 주차장 2시간 무료',
          },
        };
      case 'guestbook':
        return {
          ...s,
          data: {
            ...s.data,
            seed: SAMPLE_GUESTBOOK.map(([name, text], i) => ({
              id: `sample_gb_${i}`,
              name,
              text,
              at: Date.UTC(2026, 8, 30 - i * 2, 3),
              pw: hashPassword(`sample_gb_${i}`, SAMPLE_PASSWORD),
            })),
          },
        };
      case 'account':
        return {
          ...s,
          data: {
            ...s.data,
            accounts: s.data.accounts.map((a) => ({ ...a, bank: '은행', number: '000-0000-0000' })),
          },
        };
      default:
        return s;
    }
  });

  return {
    ...doc,
    images,
    sections,
    // 템플릿 미리보기에는 스티커를 붙이지 않는다 (붙이기는 사용자가 편집기에서)
    stickers: [],
    core: {
      ...doc.core,
      hosts,
      venue: { name: '더채플앳청담', hall: '3층 그랜드홀', address: '서울 강남구 선릉로 757', tel: '' },
    },
  };
}
