// 템플릿 미리보기용 샘플 청첩장 (CONSTITUTION §3.5). 모든 섹션이 채워진 상태로 보여준다.
import type { ImageAsset, InvitationDoc, Section } from '../types/invitation';
import { createDoc } from './templates';
import { applyTemplate, samplePhoto, type DesignTemplate } from './designTemplates';

const GALLERY_COUNT = 6;
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

  return {
    ...doc,
    images,
    sections,
    core: {
      ...doc.core,
      hosts,
      venue: { name: '더채플앳청담', hall: '3층 그랜드홀', address: '서울 강남구 선릉로 757', tel: '' },
    },
  };
}
