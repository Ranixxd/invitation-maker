// 쉽게 시작: 기본 정보 + 사진을 한 페이지에서 입력 → 바로 편집기 (CONSTITUTION §5)
import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import type { ImageAsset } from '../types/invitation';
import { defaultDatetime, WEDDING } from '../data/templates';
import { getTemplate } from '../data/designTemplates';
import { filesToAssets, MAX_UPLOAD_PER_BATCH } from '../lib/image';
import { buildFromQuickStart, pickHero } from '../lib/quickStart';
import { useEditor } from '../store/EditorContext';
import { AppHeader, PhotoDrop } from '../components/common/shared';
import { Field, TextField } from '../components/common/fields';
import { toast } from '../components/common/toast';
import { BackLink } from './StartChoice';

export default function QuickStart() {
  const navigate = useNavigate();
  const { startNew } = useEditor();
  const [params] = useSearchParams();
  const template = getTemplate(params.get('template'));
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [busy, setBusy] = useState(false);
  const [names, setNames] = useState<string[]>(() => WEDDING.hostLabels.map(() => ''));
  const [datetime, setDatetime] = useState(defaultDatetime());
  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const heroId = useMemo(() => pickHero(images)?.id, [images]);

  if (!template) return <Navigate to="/templates" replace />;

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

  const submit = () => {
    startNew(buildFromQuickStart({ template, images, names, datetime, venue: { name: venueName, address } }));
    navigate('/editor');
  };

  return (
    <main className="wizard">
      <AppHeader left={<BackLink to={`/start?template=${template.id}`} label="시작 방법 선택으로" />} />

      <div className="wizard-body">
        <section className="wizard-step">
          <h1>기본 정보를 입력해주세요</h1>
          <p className="lead">비워둬도 괜찮아요. 편집기에서 채울 수 있어요.</p>

          <div className="form-grid">
            <div className="form-grid two">
              {WEDDING.hostLabels.map((label, i) => (
                <TextField
                  key={label}
                  label={`${label} 이름`}
                  placeholder={WEDDING.defaultNames[i]}
                  value={names[i] ?? ''}
                  onChange={(v) => setNames((prev) => prev.map((n, j) => (j === i ? v : n)))}
                />
              ))}
            </div>
            <TextField label="일시" type="datetime-local" value={datetime} onChange={setDatetime} />
            <TextField label="장소 이름" placeholder="예) 더채플앳청담" value={venueName} onChange={setVenueName} />
            <TextField label="주소" placeholder="예) 서울 강남구 선릉로 757" value={address} onChange={setAddress} />

            <Field label="사진" hint={`대표 사진과 갤러리에 자동으로 배치돼요 (최대 ${MAX_UPLOAD_PER_BATCH}장)`}>
              <PhotoDrop onFiles={addFiles} busy={busy} />
            </Field>
            {images.length > 0 && (
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
            )}
          </div>
        </section>
      </div>

      <footer className="flow-foot">
        <button type="button" className="btn btn-primary btn-lg" disabled={busy} onClick={submit}>
          편집 시작하기
        </button>
      </footer>
    </main>
  );
}
