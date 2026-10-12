// 템플릿 카드용 축소 미리보기. 실제 렌더러를 375px 폭으로 그린 뒤 카드 폭에 맞춰 축소
import { useEffect, useMemo, useRef, useState } from 'react';
import type { InvitationDoc } from '../../types/invitation';
import { createDoc } from '../../data/templates';
import { applyTemplate, sampleHeroImage, type DesignTemplate } from '../../data/designTemplates';
import { InvitationView } from '../invitation/InvitationView';

const BASE_WIDTH = 375;

export function sampleDoc(t: DesignTemplate): InvitationDoc {
  const doc = applyTemplate(createDoc(), t);
  const img = sampleHeroImage(t);
  return {
    ...doc,
    images: { [img.id]: img },
    sections: doc.sections.map((s) => (s.type === 'hero' ? { ...s, data: { ...s.data, imageId: img.id } } : s)),
  };
}

export function TemplatePreview({ template }: { template: DesignTemplate }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.45);
  const doc = useMemo(() => sampleDoc(template), [template]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / BASE_WIDTH));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={box} className="tpl-preview" aria-hidden>
      <div className="tpl-preview-inner" style={{ width: BASE_WIDTH, transform: `scale(${scale})` }}>
        <InvitationView doc={doc} mode="preview" autoScroll={false} />
      </div>
    </div>
  );
}
