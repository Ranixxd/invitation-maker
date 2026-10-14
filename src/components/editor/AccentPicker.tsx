// 포인트 색 바꾸기 (CONSTITUTION §3.6·§6.2). 디자인 중 편집기에서 바꿀 수 있는 유일한 값.
// 청첩장의 모든 색(연분홍 바탕·하트·리본·버튼·손글씨)은 이 색에서 파생되므로 하나만 바꾸면 전체가 따라온다.
import { useState } from 'react';
import type { InvitationDoc } from '../../types/invitation';
import type { EditorAction } from '../../store/editorReducer';
import { getTemplate } from '../../data/designTemplates';
import { THEME_PRESETS } from '../../data/templates';
import { isHex, readableAccent } from '../../lib/color';
import { PanelSection } from '../common/fields';

/** 추천 색: 청첩장 톤(크림 바탕 + 크림 글자 버튼에서 모두 읽히는 진한 색) */
const ACCENT_PRESETS = [
  { name: '버건디', hex: '#870505' },
  { name: '로즈', hex: '#a3445e' },
  { name: '테라코타', hex: '#a34a28' },
  { name: '브라운', hex: '#6e4a2f' },
  { name: '세이지', hex: '#4f6645' },
  { name: '네이비', hex: '#24426e' },
  { name: '라벤더', hex: '#5e4f8f' },
  { name: '차콜', hex: '#3a3536' },
];

export function AccentPicker({ doc, dispatch }: { doc: InvitationDoc; dispatch: (a: EditorAction) => void }) {
  const current = doc.theme.accent.toLowerCase();
  const cream = THEME_PRESETS[doc.theme.preset]?.bg ?? '#fcfcf4';
  const base = getTemplate(doc.templateId)?.accent;
  const [adjusted, setAdjusted] = useState(false);

  const presets = base && !ACCENT_PRESETS.some((p) => p.hex === base.toLowerCase()) ? [{ name: '템플릿 기본', hex: base.toLowerCase() }, ...ACCENT_PRESETS] : ACCENT_PRESETS;
  const isCustom = !presets.some((p) => p.hex === current);

  const apply = (hex: string) => {
    if (!isHex(hex)) return;
    const next = readableAccent(hex.toLowerCase(), cream);
    setAdjusted(next !== hex.toLowerCase());
    dispatch({ type: 'UPDATE_THEME', patch: { accent: next } });
  };

  return (
    <PanelSection title="포인트 색">
      <div className="accent-swatches" role="radiogroup" aria-label="추천 포인트 색">
        {presets.map((p) => (
          <button
            key={p.hex}
            type="button"
            role="radio"
            aria-checked={current === p.hex}
            className={`accent-swatch${current === p.hex ? ' is-on' : ''}`}
            style={{ background: p.hex }}
            title={p.name}
            aria-label={p.name}
            onClick={() => apply(p.hex)}
          />
        ))}
        <label className={`accent-swatch accent-custom${isCustom ? ' is-on' : ''}`} title="직접 고르기" style={isCustom ? { background: current } : undefined}>
          <input type="color" value={current} onChange={(e) => apply(e.target.value)} aria-label="포인트 색 직접 고르기" />
          {!isCustom && <span aria-hidden>+</span>}
        </label>
      </div>
      <p className="field-hint">
        {adjusted ? '고른 색이 너무 밝아서, 버튼 글자가 잘 보이도록 조금 어둡게 맞췄어요' : '하트·제목·버튼·연한 배경까지 이 색 하나로 바뀌어요'}
      </p>
    </PanelSection>
  );
}
