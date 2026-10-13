// 쉽게 시작 v2 (규칙 기반). 디자인은 템플릿이, 사진 배치는 여기서 결정. CONSTITUTION §5
import type { ImageAsset, InvitationDoc, Venue } from '../types/invitation';
import { createDoc } from '../data/templates';
import { defaultSlug } from './slug';
import { applyTemplate, type DesignTemplate } from '../data/designTemplates';

export interface QuickStartInput {
  template: DesignTemplate;
  images: ImageAsset[];
  names: string[];
  datetime: string;
  venue: Pick<Venue, 'name' | 'address'>;
}

/** §5.3 대표 사진 점수 */
export function heroScore(img: ImageAsset, index: number): number {
  const a = img.aspect;
  const shape = a >= 0.6 && a <= 0.85 ? 1 : a < 0.95 ? 0.5 : a <= 1.05 ? 0.3 : 0;
  const light = Math.max(0, 1 - Math.abs(img.luminance - 0.55) * 1.5);
  const order = index === 0 ? 0.3 : 0;
  return shape + light + order;
}

export function pickHero(images: ImageAsset[]): ImageAsset | null {
  let best: ImageAsset | null = null;
  let bestScore = -Infinity;
  images.forEach((img, i) => {
    const s = heroScore(img, i);
    if (s > bestScore) {
      best = img;
      bestScore = s;
    }
  });
  return best;
}

export function buildFromQuickStart(input: QuickStartInput): InvitationDoc {
  const doc = applyTemplate(createDoc(), input.template);

  doc.core.hosts.forEach((h, i) => {
    const name = input.names[i]?.trim();
    if (name) h.name = name;
  });
  if (input.datetime) {
    doc.core.datetime = input.datetime;
    doc.slug = defaultSlug(input.datetime);
  }
  doc.core.venue = { ...doc.core.venue, ...input.venue };

  for (const img of input.images) doc.images[img.id] = img;

  const hero = pickHero(input.images);
  const rest = input.images.filter((i) => i !== hero);

  doc.sections = doc.sections.map((s) => {
    switch (s.type) {
      case 'hero':
        return {
          ...s,
          data: { ...s.data, imageId: hero?.id ?? null },
        };
      case 'gallery':
        return {
          ...s,
          data: { ...s.data, imageIds: rest.map((i) => i.id) },
        };
      case 'account':
        return {
          ...s,
          data: {
            ...s.data,
            accounts: s.data.accounts.map((a) => {
              const host = doc.core.hosts.find((h) => h.id === a.hostId);
              return host && a.relation === host.label ? { ...a, holder: host.name } : a;
            }),
          },
        };
      default:
        return s;
    }
  });
  return doc;
}
