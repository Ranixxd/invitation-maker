import { useEffect, useState, type FormEvent } from 'react';
import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { toast } from '../../common/toast';

// v0.1 데모: 보는 사람의 localStorage에만 저장 (CONSTITUTION §4.4)
interface Message {
  id: string;
  to: string; // hostId
  name: string;
  text: string;
  at: number;
}

const NAME_MAX = 20;
const TEXT_MAX = 300;
const key = (docId: string) => `guestbook:${docId}`;

function load(docId: string): Message[] {
  try {
    return JSON.parse(localStorage.getItem(key(docId)) || '[]');
  } catch {
    return [];
  }
}

export function GuestbookSection({ doc, section }: SectionProps<SectionOf<'guestbook'>>) {
  const { title, description } = section.data;
  const hosts = doc.core.hosts;
  const [messages, setMessages] = useState<Message[]>(() => load(doc.id));
  const [to, setTo] = useState(hosts[0]?.id ?? '');
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => setMessages(load(doc.id)), [doc.id]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) {
      toast('이름과 메시지를 입력해 주세요');
      return;
    }
    const next = [{ id: String(Date.now()), to, name: name.trim(), text: text.trim(), at: Date.now() }, ...messages];
    setMessages(next);
    try {
      localStorage.setItem(key(doc.id), JSON.stringify(next));
    } catch {
      /* 저장 실패해도 화면에는 표시 */
    }
    setText('');
    toast('메시지가 전달되었습니다');
  };

  const visible = showAll ? messages : messages.slice(0, 3);
  const hostLabel = (id: string) => {
    const h = hosts.find((x) => x.id === id);
    return h ? h.name || h.label : '';
  };

  return (
    <section className="inv-block guestbook">
      <h2 className="inv-title">{title}</h2>
      {description && <p className="inv-desc">{description}</p>}
      <form className="gb-form" onSubmit={submit}>
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
        <input
          value={name}
          maxLength={NAME_MAX}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
          aria-label="이름"
        />
        <textarea
          value={text}
          maxLength={TEXT_MAX}
          onChange={(e) => setText(e.target.value)}
          placeholder="축하 메시지를 남겨주세요"
          aria-label="메시지"
          rows={3}
        />
        <button type="submit" className="inv-btn">
          남기기
        </button>
      </form>
      {messages.length > 0 && (
        <ul className="gb-list">
          {visible.map((m) => (
            <li key={m.id}>
              <p className="gb-meta">
                <b>{m.name}</b>
                {hosts.length > 1 && <span> → {hostLabel(m.to)}</span>}
              </p>
              <p className="gb-text">{m.text}</p>
            </li>
          ))}
        </ul>
      )}
      {messages.length > 3 && (
        <button type="button" className="inv-chip gb-more" onClick={() => setShowAll((v) => !v)}>
          {showAll ? '접기' : `더 보기 (${messages.length - 3})`}
        </button>
      )}
    </section>
  );
}
