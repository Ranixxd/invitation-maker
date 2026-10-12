// 쉽게 시작 마법사: 종류 → 사진 → 기본 정보 → 결과 (CONSTITUTION §5)
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { EventType, ImageAsset, InvitationDoc, ThemePreset } from '../types/invitation';
import { defaultDatetime, EVENT_PRESETS, THEME_PRESETS } from '../data/templates';
import { filesToAssets, MAX_UPLOAD_PER_BATCH } from '../lib/image';
import { applyPreset, buildFromQuickStart, pickHero } from '../lib/quickStart';
import { useEditor } from '../store/EditorContext';
import { EventTypePicker, PhoneFrame, PhotoDrop } from '../components/common/shared';
import { TextField } from '../components/common/fields';
import { InvitationView } from '../components/invitation/InvitationView';
import { toast } from '../components/common/toast';
import { confirmOverwrite } from './StartChoice';

const STEPS = ['행사 종류', '사진', '기본 정보', '완성'];

export default function QuickStart() {
  const navigate = useNavigate();
  const { doc: existing, startNew } = useEditor();
  const [step, setStep] = useState(0);
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [busy, setBusy] = useState(false);
  const [names, setNames] = useState<string[]>([]);
  const [datetime, setDatetime] = useState(defaultDatetime());
  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const [result, setResult] = useState<InvitationDoc | null>(null);

  const preset = eventType ? EVENT_PRESETS[eventType] : null;

  const addFiles = async (files: File[]) => {
    const room = MAX_UPLOAD_PER_BATCH - images.length;
    if (room <= 0) {
      toast(`사진은 최대 ${MAX_UPLOAD_PER_BATCH}장까지 올릴 수 있어요`);
      return;
    }
    setBusy(true);
    const assets = await filesToAssets(files, room);
    setImages((prev) => [...prev, ...assets]);
    setBusy(false);
    if (files.length > room) toast(`최대 ${MAX_UPLOAD_PER_BATCH}장까지만 추가했어요`);
  };

  const generate = () => {
    if (!eventType) return;
    setResult(
      buildFromQuickStart({ eventType, images, names, datetime, venue: { name: venueName, address } }),
    );
    setStep(3);
  };

  const finish = async () => {
    if (!result || !confirmOverwrite(!!existing)) return;
    await startNew({ ...result, updatedAt: Date.now() });
    navigate('/editor');
  };

  const heroId = useMemo(() => pickHero(images)?.id, [images]);

  const canNext = step === 0 ? !!eventType : step === 1 ? images.length > 0 && !busy : true;

  return (
    <main className="wizard">
      <header className="wizard-head">
        <Link to="/start" className="icon-btn" aria-label="시작 화면으로">
          ←
        </Link>
        <ol className="stepper" aria-label="진행 단계">
          {STEPS.map((s, i) => (
            <li key={s} className={i === step ? 'is-current' : i < step ? 'is-done' : ''} aria-current={i === step ? 'step' : undefined}>
              <span>{i + 1}</span>
              <em>{s}</em>
            </li>
          ))}
        </ol>
      </header>

      <div className={`wizard-body${step === 3 ? ' is-result' : ''}`}>
        {step === 0 && (
          <section className="wizard-step">
            <h1>어떤 초대장을 만들까요?</h1>
            <EventTypePicker
              value={eventType}
              onChange={(t) => {
                setEventType(t);
                setNames(EVENT_PRESETS[t].hostLabels.map(() => ''));
              }}
            />
          </section>
        )}

        {step === 1 && (
          <section className="wizard-step">
            <h1>사진을 올려주세요</h1>
            <p className="lead">
              밝기와 비율을 보고 대표 사진을 고르고, 나머지는 갤러리에 배치해요. (최대 {MAX_UPLOAD_PER_BATCH}장)
            </p>
            <PhotoDrop onFiles={addFiles} busy={busy} />
            {images.length > 0 && (
              <>
                <p className="field-hint">
                  {images.length}장 · <span className="tag">대표</span> 표시는 지금 기준 추천 대표 사진이에요
                </p>
                <ul className="thumb-grid">
                  {images.map((img) => (
                    <li key={img.id}>
                      <img src={img.src} alt="" />
                      {img.id === heroId && <span className="tag tag-on-img">대표</span>}
                      <button
                        type="button"
                        className="thumb-remove"
                        aria-label="사진 빼기"
                        onClick={() => setImages((prev) => prev.filter((p) => p.id !== img.id))}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}

        {step === 2 && preset && (
          <section className="wizard-step">
            <h1>기본 정보를 알려주세요</h1>
            <p className="lead">비워둬도 괜찮아요. 편집기에서 언제든 채울 수 있어요.</p>
            <div className="form-grid">
              {preset.hostLabels.map((label, i) => (
                <TextField
                  key={label}
                  label={`${label} 이름`}
                  placeholder={preset.defaultNames[i]}
                  value={names[i] ?? ''}
                  onChange={(v) => setNames((prev) => prev.map((n, j) => (j === i ? v : n)))}
                />
              ))}
              <TextField label="일시" type="datetime-local" value={datetime} onChange={setDatetime} />
              <TextField label="장소 이름" placeholder="예) 더채플앳청담" value={venueName} onChange={setVenueName} />
              <TextField label="주소" placeholder="예) 서울 강남구 선릉로 757" value={address} onChange={setAddress} />
            </div>
          </section>
        )}

        {step === 3 && result && (
          <QuickResult result={result} onChange={setResult} />
        )}
      </div>

      <footer className="wizard-foot">
        {step > 0 && (
          <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)}>
            이전
          </button>
        )}
        {step < 2 && (
          <button type="button" className="btn btn-primary" disabled={!canNext} onClick={() => setStep(step + 1)}>
            다음
          </button>
        )}
        {step === 2 && (
          <button type="button" className="btn btn-primary" onClick={generate}>
            ✨ 틀 잡기
          </button>
        )}
        {step === 3 && (
          <button type="button" className="btn btn-primary" onClick={finish}>
            편집기에서 다듬기 →
          </button>
        )}
      </footer>
    </main>
  );
}

function QuickResult({ result, onChange }: { result: InvitationDoc; onChange: (d: InvitationDoc) => void }) {
  const hero = result.sections.find((s) => s.type === 'hero');
  const gallery = result.sections.find((s) => s.type === 'gallery');
  const heroImg = hero?.type === 'hero' && hero.data.imageId ? result.images[hero.data.imageId] : null;
  const galleryCount = gallery?.type === 'gallery' ? gallery.data.imageIds.length : 0;
  const galleryLayout = gallery?.type === 'gallery' && gallery.data.layout === 'grid' ? '격자형' : '슬라이드형';

  return (
    <section className="result">
      <div className="result-info">
        <h1>틀을 잡았어요!</h1>
        <p className="lead">아래 내용은 편집기에서 모두 바꿀 수 있어요.</p>
        <ul className="result-list">
          <li>
            <b>대표 사진</b>
            <span>
              {heroImg
                ? `${heroImg.aspect < 1 ? '세로' : '가로'} 사진 중 밝기가 알맞은 사진을 골라 ${heroImg.aspect < 1 ? '전체 화면' : '액자형'}으로 배치했어요`
                : '사진 없음'}
            </span>
          </li>
          <li>
            <b>갤러리</b>
            <span>{galleryCount ? `${galleryCount}장 · ${galleryLayout}` : '나머지 사진이 없어 숨겼어요'}</span>
          </li>
          <li>
            <b>추천 색</b>
            <span className="swatch-row">
              <i className="swatch" style={{ background: result.theme.accent }} />
              대표 사진의 색감에서 뽑았어요
            </span>
          </li>
        </ul>
        <h2 className="sub-title">다른 분위기로 바꿔보기</h2>
        <div className="preset-row">
          {(Object.keys(THEME_PRESETS) as ThemePreset[]).map((p) => (
            <button
              key={p}
              type="button"
              className={`preset-chip${result.theme.preset === p ? ' is-on' : ''}`}
              onClick={() => onChange(applyPreset(result, p))}
            >
              <i style={{ background: THEME_PRESETS[p].bg, borderColor: THEME_PRESETS[p].accent }} />
              {THEME_PRESETS[p].label}
            </button>
          ))}
        </div>
      </div>
      <div className="result-preview">
        <PhoneFrame>
          <InvitationView doc={result} mode="preview" />
        </PhoneFrame>
      </div>
    </section>
  );
}
