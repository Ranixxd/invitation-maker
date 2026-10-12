// 쉽게 시작 마법사: 사진 → 기본 정보 → 결과 (CONSTITUTION §5)
import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import type { ImageAsset, InvitationDoc } from '../types/invitation';
import { defaultDatetime, WEDDING } from '../data/templates';
import { getTemplate } from '../data/designTemplates';
import { filesToAssets, MAX_UPLOAD_PER_BATCH } from '../lib/image';
import { buildFromQuickStart, heroPhotoAccent, pickHero } from '../lib/quickStart';
import { useEditor } from '../store/EditorContext';
import { PhoneFrame, PhotoDrop } from '../components/common/shared';
import { TextField } from '../components/common/fields';
import { InvitationView } from '../components/invitation/InvitationView';
import { toast } from '../components/common/toast';

const STEPS = ['사진', '기본 정보', '완성'];

export default function QuickStart() {
  const navigate = useNavigate();
  const { startNew } = useEditor();
  const [params] = useSearchParams();
  const template = getTemplate(params.get('template'));
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [busy, setBusy] = useState(false);
  const [names, setNames] = useState<string[]>(() => WEDDING.hostLabels.map(() => ''));
  const [datetime, setDatetime] = useState(defaultDatetime());
  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const [result, setResult] = useState<InvitationDoc | null>(null);

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
    if (!template) return;
    setResult(buildFromQuickStart({ template, images, names, datetime, venue: { name: venueName, address } }));
    setStep(2);
  };

  const finish = () => {
    if (!result) return;
    startNew({ ...result, updatedAt: Date.now() });
    navigate('/editor');
  };

  const heroId = useMemo(() => pickHero(images)?.id, [images]);

  const canNext = step === 0 ? images.length > 0 && !busy : true;

  if (!template) return <Navigate to="/templates" replace />;

  return (
    <main className="wizard">
      <header className="wizard-head">
        <Link to={`/start?template=${template.id}`} className="icon-btn" aria-label="시작 방법 선택으로">
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

      <div className={`wizard-body${step === 2 ? ' is-result' : ''}`}>
        {step === 0 && (
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

        {step === 1 && (
          <section className="wizard-step">
            <h1>기본 정보를 알려주세요</h1>
            <p className="lead">비워둬도 괜찮아요. 편집기에서 언제든 채울 수 있어요.</p>
            <div className="form-grid">
              {WEDDING.hostLabels.map((label, i) => (
                <TextField
                  key={label}
                  label={`${label} 이름`}
                  placeholder={WEDDING.defaultNames[i]}
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

        {step === 2 && result && (
          <QuickResult result={result} onChange={setResult} />
        )}
      </div>

      <footer className="wizard-foot">
        {step > 0 && (
          <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)}>
            이전
          </button>
        )}
        {step === 0 && (
          <button type="button" className="btn btn-primary" disabled={!canNext} onClick={() => setStep(step + 1)}>
            다음
          </button>
        )}
        {step === 1 && (
          <button type="button" className="btn btn-primary" onClick={generate}>
            ✨ 틀 잡기
          </button>
        )}
        {step === 2 && (
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
  const template = getTemplate(result.templateId);
  const templateAccent = template?.accent ?? result.theme.accent;
  const photoAccent = heroPhotoAccent(result);
  const setAccent = (accent: string) => onChange({ ...result, theme: { ...result.theme, accent } });

  return (
    <section className="result">
      <div className="result-info">
        <h1>틀을 잡았어요!</h1>
        <p className="lead">아래 내용은 편집기에서 모두 바꿀 수 있어요.</p>
        <ul className="result-list">
          <li>
            <b>템플릿</b>
            <span>{template?.name ?? '-'}</span>
          </li>
          <li>
            <b>대표 사진</b>
            <span>
              {heroImg ? `${heroImg.aspect < 1 ? '세로' : '가로'} 사진 중 비율과 밝기가 가장 알맞은 사진을 골랐어요` : '사진 없음'}
            </span>
          </li>
          <li>
            <b>갤러리</b>
            <span>{galleryCount ? `나머지 ${galleryCount}장을 올린 순서대로 넣었어요` : '나머지 사진이 없어 숨겼어요'}</span>
          </li>
        </ul>
        {photoAccent && (
          <>
            <h2 className="sub-title">포인트 색</h2>
            <div className="preset-row">
              {[
                { label: '템플릿 색', color: templateAccent },
                { label: '사진에서 뽑은 색', color: photoAccent },
              ].map((c) => (
                <button
                  key={c.label}
                  type="button"
                  className={`preset-chip${result.theme.accent === c.color ? ' is-on' : ''}`}
                  onClick={() => setAccent(c.color)}
                >
                  <i style={{ background: c.color, borderColor: c.color }} />
                  {c.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="result-preview">
        <PhoneFrame>
          <InvitationView doc={result} mode="preview" />
        </PhoneFrame>
      </div>
    </section>
  );
}
