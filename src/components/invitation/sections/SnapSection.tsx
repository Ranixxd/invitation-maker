// 게스트 스냅: 하객이 찍은 사진 올리기. 기본 꺼짐, 필요한 사람만 켬 (§4.8)
// 서버 연동 전 데모: 올린 사진은 이 화면에만 잠깐 보이고 어디에도 저장되지 않는다.
import { useRef, useState } from 'react';
import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { toast } from '../../common/toast';

const MAX_SNAPS = 10;

export function SnapSection({ section }: SectionProps<SectionOf<'snap'>>) {
  const { title, description } = section.data;
  const input = useRef<HTMLInputElement>(null);
  const [urls, setUrls] = useState<string[]>([]);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const picked = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, MAX_SNAPS - urls.length)
      .map((f) => URL.createObjectURL(f));
    if (!picked.length) return;
    setUrls((prev) => [...prev, ...picked]);
    toast(`사진 ${picked.length}장을 올렸어요`);
  };

  return (
    <section className="inv-block snap">
      <h2 className="inv-title">{title}</h2>
      {description && <p className="inv-desc">{description}</p>}
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
      <button type="button" className="inv-btn" onClick={() => input.current?.click()} disabled={urls.length >= MAX_SNAPS}>
        사진 올리기
      </button>
      {urls.length > 0 && (
        <ul className="snap-grid">
          {urls.map((u) => (
            <li key={u}>
              <img src={u} alt="" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
