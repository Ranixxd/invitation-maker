import type { InvitationDoc, ThemePreset } from '../../types/invitation';
import type { EditorAction } from '../../store/editorReducer';
import { THEME_PRESETS } from '../../data/templates';
import { accentFrom } from '../../lib/quickStart';
import { PanelSection, Segmented } from '../common/fields';

export function ThemePanel({ doc, dispatch }: { doc: InvitationDoc; dispatch: (a: EditorAction) => void }) {
  const t = doc.theme;
  const photoColors = Array.from(new Set(Object.values(doc.images).map((i) => accentFrom(i.color, t.preset)))).slice(0, 8);

  return (
    <div className="panel-body">
      <PanelSection title="분위기">
        <div className="preset-cards">
          {(Object.keys(THEME_PRESETS) as ThemePreset[]).map((p) => {
            const def = THEME_PRESETS[p];
            return (
              <button
                key={p}
                type="button"
                className={`preset-card${t.preset === p ? ' is-on' : ''}`}
                aria-pressed={t.preset === p}
                onClick={() => dispatch({ type: 'UPDATE_THEME', patch: { preset: p, font: def.font } })}
                style={{ background: def.bg, color: def.text }}
              >
                <span style={{ fontFamily: def.font === 'serif' ? "'Gowun Batang', serif" : 'inherit' }}>Aa 가나</span>
                <i style={{ background: def.accent }} />
                <b>{def.label}</b>
              </button>
            );
          })}
        </div>
      </PanelSection>

      <PanelSection title="포인트 색">
        <div className="color-row">
          <label className="color-input">
            <input type="color" value={t.accent} onChange={(e) => dispatch({ type: 'UPDATE_THEME', patch: { accent: e.target.value } })} />
            <span>{t.accent}</span>
          </label>
          <button
            type="button"
            className="btn btn-ghost sm"
            onClick={() => dispatch({ type: 'UPDATE_THEME', patch: { accent: THEME_PRESETS[t.preset].accent } })}
          >
            기본색
          </button>
        </div>
        {photoColors.length > 0 && (
          <>
            <p className="field-hint">내 사진에서 뽑은 색</p>
            <div className="swatch-row">
              {photoColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`swatch-btn${c === t.accent ? ' is-on' : ''}`}
                  style={{ background: c }}
                  aria-label={`포인트 색 ${c}`}
                  onClick={() => dispatch({ type: 'UPDATE_THEME', patch: { accent: c } })}
                />
              ))}
            </div>
          </>
        )}
      </PanelSection>

      <PanelSection title="글꼴">
        <Segmented
          label="본문 글꼴"
          value={t.font}
          options={[
            { value: 'serif', label: '명조 (고운바탕)' },
            { value: 'sans', label: '고딕 (노토산스)' },
          ]}
          onChange={(font) => dispatch({ type: 'UPDATE_THEME', patch: { font } })}
        />
      </PanelSection>
    </div>
  );
}
