// 템플릿 미리보기용 샘플 청첩장 (CONSTITUTION §3.5). 모든 섹션이 채워진 상태로 보여준다.
import type { ImageAsset, InvitationDoc, Section, Sticker } from '../types/invitation';
import { createDoc } from './templates';
import { applyTemplate, samplePhoto, type DesignTemplate } from './designTemplates';
import { DEFAULT_CROP } from '../lib/stickers';

const GALLERY_COUNT = 6;
const SAMPLE_PROFILE = [
  { mbti: 'ENFJ', intro: '주말마다 새로운 빵집을 찾아다녀요' },
  { mbti: 'INFP', intro: '그 빵집 리스트를 정리하는 사람' },
];
const SAMPLE_TIMELINE = [
  { date: '2019.03', text: '동아리에서 처음 만난 날' },
  { date: '2020.05', text: '연애 시작' },
  { date: '2026.06', text: '제주에서 프러포즈' },
];
const SAMPLE_PARENTS = [
  { father: '김철수', mother: '박영희' },
  { father: '이정호', mother: '최미경' },
];

/** 방명록 예시 쪽지 (9개씩 넘겨보는 모습이 보이도록 11개) — to: 0 신랑 / 1 신부 */
const SAMPLE_GUESTBOOK: [number, string, string][] = [
  [0, '지훈', '민준아 결혼 진짜 축하해! 대학 때부터 봐온 사람으로서 너무 뿌듯하다. 행복하게 잘 살아라'],
  [1, '수아', '서연아 드레스 입은 모습 너무 기대돼. 언제나 지금처럼 웃으면서 살자!'],
  [1, '이모', '우리 서연이 예쁘게 잘 살거라. 두 사람의 앞날에 늘 좋은 일만 가득하길 바란다'],
  [0, '현우', '형 결혼 축하드려요. 신혼여행 사진 꼭 보여주세요'],
  [1, '예린', '세상에서 제일 예쁜 신부 될 거야. 사랑해 친구야'],
  [0, '김 팀장', '민준씨 결혼 축하합니다. 회사 걱정은 말고 푹 쉬다 와요'],
  [1, '다은', '두 사람 처음 만난 날 얘기 들었던 게 엊그제 같은데! 진심으로 축하해'],
  [0, '성민', '축가 연습 열심히 하고 있다. 기대해라'],
  [1, '하윤', '서연아 결혼 축하해! 늘 지금처럼 다정한 부부가 되길'],
  [0, '준호', '드디어 장가가는구나. 축하한다 친구야'],
  [1, '지민', '앞으로 함께 걸어갈 모든 날들을 응원해요'],
];

export function sampleDoc(t: DesignTemplate): InvitationDoc {
  const doc = applyTemplate(createDoc(), t);
  const hero = samplePhoto(t, 0);
  const gallery: ImageAsset[] = Array.from({ length: GALLERY_COUNT }, (_, i) => samplePhoto(t, i + 1));
  const images = Object.fromEntries([hero, ...gallery].map((img) => [img.id, img]));

  const hosts = doc.core.hosts.map((h, i) => ({
    ...h,
    father: { ...h.father, name: SAMPLE_PARENTS[i]?.father ?? '' },
    mother: { ...h.mother, name: SAMPLE_PARENTS[i]?.mother ?? '' },
  }));

  const sections = doc.sections.map((s): Section => {
    switch (s.type) {
      case 'hero':
        return { ...s, data: { ...s.data, imageId: hero.id } };
      case 'profile':
        return {
          ...s,
          data: {
            ...s.data,
            people: hosts.map((h, i) => ({ hostId: h.id, ...SAMPLE_PROFILE[i] })),
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
            seed: SAMPLE_GUESTBOOK.map(([to, name, text], i) => ({
              id: `sample_gb_${i}`,
              to: hosts[to]?.id ?? hosts[0].id,
              name,
              text,
              at: Date.UTC(2026, 8, 30 - i * 2, 3),
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

  // 붙이기 예시: 신랑·신부 섹션 오른쪽 위에 하트 스티커 (§4.10)
  const couple = sections.find((x) => x.type === 'couple');
  const stickers: Sticker[] = couple
    ? [{ id: 'sample_sticker', sectionId: couple.id, imageId: gallery[0].id, shape: 'heart', kind: 'sticker', crop: DEFAULT_CROP, motion: 'bounce', size: 'sm', x: 86, y: 16 }]
    : [];

  return {
    ...doc,
    images,
    sections,
    stickers,
    core: {
      ...doc.core,
      hosts,
      venue: { name: '더채플앳청담', hall: '3층 그랜드홀', address: '서울 강남구 선릉로 757', tel: '' },
    },
  };
}
