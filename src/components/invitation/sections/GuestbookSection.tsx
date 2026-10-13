// 방명록: 남겨진 쪽지를 보드에 먼저 보여주고(9개씩), [남기기]로만 작성 (CONSTITUTION §4.4)
// - 하객 화면(/view): 섹션이 화면에 보이는 동안 하단에 떠 있는 [남기기] 버튼
// - 편집기·템플릿 미리보기: 섹션 안 [남기기] 버튼
// 서버 연동 전 데모: 메시지는 보는 사람의 브라우저(localStorage)에만 저장
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import type { GuestMessage, HostSide, SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { ThemePortal, useInvitationEnv } from '../theme';
import { toast } from '../../common/toast';

const NAME_MAX = 20;
const TEXT_MAX = 300;
export const NOTES_PER_PAGE = 9;
const key = (docId: string) => `guestbook:${docId}`;

function load(docId: string): GuestMessage[] {
  try {
    return JSON.parse(localStorage.getItem(key(docId)) || '[]');
  } catch {
    return [];
  }
}

/** 쪽지마다 일정한(새로고침해도 같은) 기울기·클립 여부 */
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
const tiltOf = (id: string) => ((hash(id) % 7) - 3) * 0.9; // -2.7° ~ 2.7°
const hasClip = (id: string) => hash(id) % 3 === 0;

const fmtDate = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

function Heart({ className = '' }: { className?: string }) {
  return (
    <svg className={`gb-heart ${className}`} viewBox="0 0 24 22" aria-hidden>
      <path d="M12 21C5 15.5 1.5 12 1.5 7.5 1.5 4 4 1.5 7.2 1.5c2 0 3.6 1 4.8 2.8 1.2-1.8 2.8-2.8 4.8-2.8 3.2 0 5.7 2.5 5.7 6 0 4.5-3.5 8-10.5 13.5z" />
    </svg>
  );
}

function Clip() {
  return (
    <svg className="gb-clip" viewBox="0 0 16 44" aria-hidden>
      <path d="M11 13V33a4.5 4.5 0 0 1-9 0V8a6 6 0 0 1 12 0v24a3 3 0 0 1-6 0V13" />
    </svg>
  );
}

const toLabel = (hosts: HostSide[], id: string) => {
  const h = hosts.find((x) => x.id === id);
  return h ? `${h.label} ${h.name}`.trim() : '';
};

export function GuestbookSection({ doc, section, mode }: SectionProps<SectionOf<'guestbook'>>) {
  const { title, description, seed = [] } = section.data;
  const hosts = doc.core.hosts;
  const { floatingActions } = useInvitationEnv();
  const [local, setLocal] = useState<GuestMessage[]>(() => load(doc.id));
  const [page, setPage] = useState(0);
  const [opened, setOpened] = useState<GuestMessage | null>(null);
  const [writing, setWriting] = useState(false);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => setLocal(load(doc.id)), [doc.id]);

  // 하객 화면: 섹션이 화면에 보이는 동안만 떠 있는 [남기기]
  useEffect(() => {
    if (!floatingActions || !sectionRef.current || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '0px 0px -15% 0px' });
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, [floatingActions]);

  // 내가 남긴 것(최신순) → 예시 쪽지(최신순)
  const messages = useMemo(() => [...local, ...[...seed].sort((a, b) => b.at - a.at)], [local, seed]);
  const pages = Math.max(1, Math.ceil(messages.length / NOTES_PER_PAGE));
  const current = Math.min(page, pages - 1);
  const visible = messages.slice(current * NOTES_PER_PAGE, (current + 1) * NOTES_PER_PAGE);

  const add = (m: GuestMessage) => {
    const next = [m, ...local];
    setLocal(next);
    try {
      localStorage.setItem(key(doc.id), JSON.stringify(next));
    } catch {
      /* 저장 실패해도 화면에는 표시 */
    }
    setPage(0);
    setWriting(false);
    toast('마음이 전달되었어요');
  };

  const writeButton = (
    <button type="button" className="inv-btn gb-write" onClick={() => setWriting(true)}>
      남기기
    </button>
  );

  return (
    <section ref={sectionRef} className="inv-block guestbook">
      <h2 className="inv-title">{title}</h2>
      {description && <p className="inv-desc">{description}</p>}

      <div className="gb-board">
        {visible.length === 0 ? (
          <p className="gb-empty">
            아직 남겨진 마음이 없어요
            <br />첫 번째 축하를 남겨주세요
          </p>
        ) : (
          <ul className="gb-notes">
            {visible.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  className="gb-note"
                  style={{ transform: `rotate(${tiltOf(m.id)}deg)` }}
                  onClick={() => setOpened(m)}
                  aria-label={`${m.name}님의 메시지 보기`}
                >
                  {hasClip(m.id) && <Clip />}
                  <span className="gb-note-to">
                    {toLabel(hosts, m.to) || '두 사람'}에게
                    <Heart />
                  </span>
                  <span className="gb-note-text">{m.text}</span>
                  <span className="gb-note-from">— {m.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pages > 1 && (
        <nav className="gb-pager" aria-label="방명록 페이지">
          <button type="button" aria-label="이전 페이지" disabled={current === 0} onClick={() => setPage(current - 1)}>
            ‹
          </button>
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              type="button"
              className={i === current ? 'is-on' : ''}
              aria-current={i === current ? 'page' : undefined}
              onClick={() => setPage(i)}
            >
              {i + 1}
            </button>
          ))}
          <button type="button" aria-label="다음 페이지" disabled={current === pages - 1} onClick={() => setPage(current + 1)}>
            ›
          </button>
        </nav>
      )}

      {/* 편집기·미리보기에서는 섹션 안에, 하객 화면에서는 떠 있는 버튼으로 */}
      {!floatingActions && <div className="gb-write-row">{writeButton}</div>}
      {floatingActions &&
        inView &&
        !writing &&
        !opened &&
        createPortal(
          <ThemePortal doc={doc}>
            <div className="gb-fab">{writeButton}</div>
          </ThemePortal>,
          document.body,
        )}

      {opened &&
        createPortal(
          <ThemePortal doc={doc}>
            <NoteModal message={opened} hosts={hosts} onClose={() => setOpened(null)} />
          </ThemePortal>,
          document.body,
        )}
      {writing &&
        createPortal(
          <ThemePortal doc={doc}>
            <WriteModal hosts={hosts} onCancel={() => setWriting(false)} onSubmit={add} demoNote={mode === 'preview'} />
          </ThemePortal>,
          document.body,
        )}
    </section>
  );
}

function useEscape(onClose: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
}

/** 쪽지 크게 보기 (레퍼런스: LOVE NOTE 카드) */
function NoteModal({ message, hosts, onClose }: { message: GuestMessage; hosts: HostSide[]; onClose: () => void }) {
  useEscape(onClose);
  return (
    <div className="gb-modal-root" role="dialog" aria-modal="true" aria-label="축하 쪽지" onClick={onClose}>
      <article className="gb-paper" onClick={(e) => e.stopPropagation()}>
        <Clip />
        <header className="gb-paper-head">
          <h3>축하 쪽지</h3>
          <Heart className="is-big" />
        </header>
        <dl className="gb-paper-row">
          <div>
            <dt>보내는 사람</dt>
            <dd>{message.name}</dd>
          </div>
          <div>
            <dt>받는 사람</dt>
            <dd>{toLabel(hosts, message.to) || '두 사람'}</dd>
          </div>
        </dl>
        <p className="gb-paper-text">{message.text}</p>
        <p className="gb-paper-sign">— {message.name}</p>
        <dl className="gb-paper-row is-foot">
          <div>
            <dt>남긴 날</dt>
            <dd>{fmtDate(message.at)}</dd>
          </div>
        </dl>
        <button type="button" className="inv-btn gb-paper-close" onClick={onClose}>
          닫기
        </button>
      </article>
    </div>
  );
}

/** 남기기: 종이 위에 쓰는 느낌의 작성 카드 */
function WriteModal({
  hosts,
  onCancel,
  onSubmit,
  demoNote,
}: {
  hosts: HostSide[];
  onCancel: () => void;
  onSubmit: (m: GuestMessage) => void;
  demoNote: boolean;
}) {
  useEscape(onCancel);
  const [to, setTo] = useState(hosts[0]?.id ?? '');
  const [name, setName] = useState('');
  const [text, setText] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) {
      toast('이름과 메시지를 입력해 주세요');
      return;
    }
    onSubmit({ id: `gb_${Date.now()}`, to, name: name.trim(), text: text.trim(), at: Date.now() });
  };

  return (
    <div className="gb-modal-root" role="dialog" aria-modal="true" aria-label="마음 남기기" onClick={onCancel}>
      <form className="gb-paper gb-write-form" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
        <header className="gb-paper-head">
          <h3>마음 남기기</h3>
          <Heart className="is-big" />
        </header>
        {hosts.length > 1 && (
          <div className="gb-to" role="radiogroup" aria-label="받는 사람">
            {hosts.map((h) => (
              <button
                key={h.id}
                type="button"
                role="radio"
                aria-checked={to === h.id}
                className={to === h.id ? 'is-on' : ''}
                onClick={() => setTo(h.id)}
              >
                {h.label}에게
              </button>
            ))}
          </div>
        )}
        <input value={name} maxLength={NAME_MAX} onChange={(e) => setName(e.target.value)} placeholder="이름" aria-label="이름" autoFocus />
        <textarea
          className="gb-write-text"
          value={text}
          maxLength={TEXT_MAX}
          onChange={(e) => setText(e.target.value)}
          placeholder="축하의 마음을 적어주세요"
          aria-label="메시지"
          rows={5}
        />
        <p className="gb-count">
          {text.length}/{TEXT_MAX}
        </p>
        {demoNote && <p className="gb-demo-note">미리보기에서 남긴 메시지는 이 브라우저에만 저장돼요</p>}
        <div className="gb-write-actions">
          <button type="button" className="inv-btn is-ghost" onClick={onCancel}>
            취소
          </button>
          <button type="submit" className="inv-btn">
            남기기
          </button>
        </div>
      </form>
    </div>
  );
}
