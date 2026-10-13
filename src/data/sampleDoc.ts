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
