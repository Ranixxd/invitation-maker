// 방명록: 남겨진 쪽지를 먼저 보여주고(9개씩), [방명록 남기기]로만 작성. 작성·삭제는 비밀번호 필수 (CONSTITUTION §4.4)
// - 버튼은 어디서나 섹션 안(쪽지 보드 아래)에 둔다
// 서버 연동 전 데모: 메시지는 보는 사람의 브라우저(localStorage)에만 저장
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import type { GuestMessage, InvitationDoc, SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { toast } from '../../common/toast';
import { checkPassword, hashPassword, PW_MAX, PW_MIN } from '../../../lib/guestbook';
import { Button, Divider, Field, Modal, SectionHead } from '../ui';
import { formatShortDot } from '../../../lib/date';
import { HeartCut } from '../HeartCut';

const NAME_MAX = 20;
const TEXT_MAX = 300;
export const NOTES_PER_PAGE = 9;
/** 쪽지 수: 티켓 계열은 가로 쪽지 5개, 블룸 계열은 2열 카드 6개 */
const perPage = (doc: InvitationDoc) =>
  doc.theme.family === 'ticket' || doc.theme.family === 'lookbook' ? 5 : doc.theme.family === 'bloom' ? 6 : NOTES_PER_PAGE;
const key = (docId: string) => `guestbook:${docId}`;

function load(docId: string): GuestMessage[] {
  try {
    return JSON.parse(localStorage.getItem(key(docId)) || '[]');
  } catch {
    return [];
  }
}

/** 쪽지마다 일정한(새로고침해도 같은) 기울기: 크기는 id 해시(1.2°~3.8°), 방향은 이웃끼리 번갈아 */
function hash(s: string) {
  let h = 0x811c9dc5; // FNV-1a: 비슷한 id(sample_gb_0, _1…)도 고르게 흩어진다
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  return h >>> 0;
}
const tiltOf = (id: string, index: number) => {
  const h = hash(id);
  const size = 1.2 + (h % 27) / 10; // 1.2 ~ 3.8
  // 3열 격자에서 이웃(가로·세로)이 서로 반대로 기울도록 체크무늬 + 해시로 가끔 뒤집기
  const checker = ((index % 3) + Math.floor(index / 3)) % 2 === 0 ? 1 : -1; // (열 + 행) 짝홀
  const flip = (h >>> 8) % 5 === 0 ? -1 : 1;
  return size * checker * flip;
};

const fmtDate = formatShortDot;

export function GuestbookSection({ doc, section, mode }: SectionProps<SectionOf<'guestbook'>>) {
  const { title, description, seed = [] } = section.data;
  const [local, setLocal] = useState<GuestMessage[]>(() => load(doc.id));
  const [page, setPage] = useState(0);
  const [opened, setOpened] = useState<GuestMessage | null>(null);
  const [writing, setWriting] = useState(false);
  // 지운 예시 쪽지 (예시는 문서 데이터라 화면에서만 숨긴다)
  const [hiddenSeeds, setHiddenSeeds] = useState<string[]>([]);

  useEffect(() => setLocal(load(doc.id)), [doc.id]);

  // 내가 남긴 것(최신순) → 예시 쪽지(최신순)
  const messages = useMemo(
    () => [...local, ...seed.filter((m) => !hiddenSeeds.includes(m.id)).sort((a, b) => b.at - a.at)],
    [local, seed, hiddenSeeds],
  );
  const per = perPage(doc);
  const pages = Math.max(1, Math.ceil(messages.length / per));
  const current = Math.min(page, pages - 1);
  const visible = messages.slice(current * per, (current + 1) * per);

  const save = (next: GuestMessage[]) => {
    setLocal(next);
    try {
      localStorage.setItem(key(doc.id), JSON.stringify(next));
    } catch {
      /* 저장 실패해도 화면에는 표시 */
    }
  };

  const add = (m: GuestMessage) => {
    save([m, ...local]);
    setPage(0);
    setWriting(false);
    toast('마음이 전달되었어요');
  };

  const remove = (m: GuestMessage) => {
    if (local.some((x) => x.id === m.id)) save(local.filter((x) => x.id !== m.id));
    else setHiddenSeeds((h) => [...h, m.id]);
    setOpened(null);
    toast('방명록을 삭제했어요');
  };

  const writeButton = (
    <Button variant="primary" className="gb-write" onClick={() => setWriting(true)}>
      방명록 남기기
    </Button>
  );

  return (
    <section className="inv-block guestbook">
      <SectionHead title={title} desc={description} />

      {visible.length === 0 ? (
        <p className="gb-empty">
          아직 남겨진 마음이 없어요
          <br />첫 번째 축하를 남겨주세요
        </p>
      ) : (
        <ul className="gb-notes">
          {visible.map((m, i) => (
            <li key={m.id}>
              <button
                type="button"
                className="gb-note"
                style={{ '--tilt': `${tiltOf(m.id, i).toFixed(2)}deg` } as CSSProperties}
                onClick={() => setOpened(m)}
                aria-label={`${m.name}님의 방명록 보기`}
              >
                <span className="gb-note-name">
                  <span>{m.name}</span>
                  <HeartCut shape={i % 2 ? 'b' : 'a'} />
                </span>
                <Divider />
                <span className="gb-note-text">{m.text}</span>
                <span className="gb-note-date">{fmtDate(m.at)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav className="gb-pager" aria-label="방명록 페이지">
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
        </nav>
      )}

      <div className="ui-col">{writeButton}</div>

      {opened && <DetailModal doc={doc} message={opened} onClose={() => setOpened(null)} onDelete={() => remove(opened)} />}
      {writing && <WriteModal doc={doc} onClose={() => setWriting(false)} onSubmit={add} demoNote={mode === 'preview'} />}
    </section>
  );
}

/** 방명록 상세: 이름 · 내용 · 날짜 + [삭제] → 비밀번호 확인 */
function DetailModal({
  doc,
  message,
  onClose,
  onDelete,
}: {
  doc: InvitationDoc;
  message: GuestMessage;
  onClose: () => void;
  onDelete: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');

  const confirmDelete = (e: FormEvent) => {
    e.preventDefault();
    if (!pw) {
      setError('비밀번호를 입력해 주세요.');
      return;
    }
    if (!checkPassword(message.id, pw, message.pw)) {
      setError('비밀번호가 올바르지 않습니다.');
      return;
    }
    onDelete();
  };

  return (
    <Modal doc={doc} label={`${message.name}님의 방명록`} onClose={onClose} className="gb-detail">
      <p className="gb-detail-name">
        <span>{message.name}</span>
        <HeartCut shape="a" />
      </p>
      <Divider />
      <p className="gb-detail-text">{message.text}</p>
      <p className="ui-caption">{fmtDate(message.at)}</p>
      {deleting ? (
        <form className="ui-form" onSubmit={confirmDelete}>
          <Field label="작성 시 입력한 비밀번호" error={error}>
            <input
              className="ui-input"
              type="password"
              value={pw}
              maxLength={PW_MAX}
              onChange={(e) => {
                setPw(e.target.value);
                setError('');
              }}
              autoComplete="off"
              autoFocus
            />
          </Field>
          <Button variant="chip" type="submit">
            삭제
          </Button>
        </form>
      ) : (
        <Button variant="chip" onClick={() => setDeleting(true)}>
          삭제
        </Button>
      )}
    </Modal>
  );
}

/** 방명록 남기기: 성함 · 내용 · 비밀번호 */
function WriteModal({
  doc,
  onClose,
  onSubmit,
  demoNote,
}: {
  doc: InvitationDoc;
  onClose: () => void;
  onSubmit: (m: GuestMessage) => void;
  demoNote: boolean;
}) {
  const [name, setName] = useState('');
  const [pw, setPw] = useState('');
  const [text, setText] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) {
      toast('성함과 내용을 입력해 주세요');
      return;
    }
    if (pw.length < PW_MIN) {
      toast(`비밀번호를 ${PW_MIN}자 이상 입력해 주세요`);
      return;
    }
    const id = `gb_${Date.now()}`;
    onSubmit({ id, name: name.trim(), text: text.trim(), at: Date.now(), pw: hashPassword(id, pw) });
  };

  return (
    <Modal doc={doc} label="방명록 남기기" onClose={onClose}>
      <form className="ui-form" onSubmit={submit}>
        <h3 className="gb-write-title">방명록 남기기</h3>
        <Field label="성함">
          <input className="ui-input" value={name} maxLength={NAME_MAX} onChange={(e) => setName(e.target.value)} autoFocus />
        </Field>
        <Field
          label="내용"
          aside={
            <>
              {text.length}/{TEXT_MAX}
            </>
          }
        >
          <textarea className="ui-input ui-textarea" value={text} maxLength={TEXT_MAX} onChange={(e) => setText(e.target.value)} />
        </Field>
        <Field label="비밀번호" help="삭제할 때 필요해요.">
          <input
            className="ui-input"
            type="password"
            value={pw}
            maxLength={PW_MAX}
            onChange={(e) => setPw(e.target.value)}
            autoComplete="new-password"
          />
        </Field>
        {demoNote && <p className="ui-caption">미리보기에서 남긴 방명록은 이 브라우저에만 저장돼요</p>}
        <Button type="submit">남기기</Button>
      </form>
    </Modal>
  );
}
