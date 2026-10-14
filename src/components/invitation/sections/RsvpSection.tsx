// 참석 여부(RSVP). 서버 연동 전 데모: 응답은 보는 사람의 브라우저에만 저장 (§4.7)
import { useState, type FormEvent } from 'react';
import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { toast } from '../../common/toast';
import { Button, ChoiceGroup, Field, SectionHead, Stepper } from '../ui';

type Attend = 'yes' | 'no';
type Meal = 'yes' | 'no' | 'unsure';

interface Reply {
  side: string; // hostId
  name: string;
  attend: Attend;
  count: number;
  meal: Meal;
  at: number;
}

const key = (docId: string) => `rsvp:${docId}`;
const NAME_MAX = 20;
const COUNT_MAX = 10;

function loadReply(docId: string): Reply | null {
  try {
    return JSON.parse(localStorage.getItem(key(docId)) || 'null');
  } catch {
    return null;
  }
}

export function RsvpSection({ doc, section }: SectionProps<SectionOf<'rsvp'>>) {
  const { title, description, askCount, askMeal } = section.data;
  const hosts = doc.core.hosts;
  const [sent, setSent] = useState<Reply | null>(() => loadReply(doc.id));
  const [side, setSide] = useState(hosts[0]?.id ?? '');
  const [name, setName] = useState('');
  const [attend, setAttend] = useState<Attend>('yes');
  const [count, setCount] = useState(1);
  const [meal, setMeal] = useState<Meal>('yes');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('성함을 입력해 주세요');
      return;
    }
    const reply: Reply = { side, name: name.trim(), attend, count: attend === 'yes' ? count : 0, meal, at: Date.now() };
    try {
      localStorage.setItem(key(doc.id), JSON.stringify(reply));
    } catch {
      /* 저장 실패해도 화면에는 반영 */
    }
    setSent(reply);
    toast('참석 여부가 전달되었어요');
  };

  return (
    <section className="inv-block rsvp">
      <SectionHead title={title} desc={description} />

      {sent ? (
        <div className="ui-col rsvp-done">
          <p className="ui-body">
            <b>{sent.name}</b>님, {sent.attend === 'yes' ? `${sent.count}명 참석으로` : '불참으로'} 전달되었어요.
          </p>
          <Button variant="chip" onClick={() => setSent(null)}>
            다시 보내기
          </Button>
        </div>
      ) : (
        <form className="ui-col ui-form" onSubmit={submit}>
          {hosts.length > 1 && (
            <ChoiceGroup
              label="어느 쪽 하객이신가요?"
              variant="card"
              value={side}
              options={hosts.map((h) => ({ value: h.id, label: h.label, sub: h.name || h.label }))}
              onChange={setSide}
            />
          )}
          <Field label="성함">
            <input className="ui-input" value={name} maxLength={NAME_MAX} onChange={(e) => setName(e.target.value)} placeholder="성함을 입력해 주세요" />
          </Field>
          <ChoiceGroup
            label="참석 여부"
            value={attend}
            options={[
              { value: 'yes', label: '참석' },
              { value: 'no', label: '불참' },
            ]}
            onChange={setAttend}
          />
          {attend === 'yes' && askCount && <Stepper label="참석 인원" value={count} min={1} max={COUNT_MAX} onChange={setCount} />}
          {attend === 'yes' && askMeal && (
            <ChoiceGroup
              label="식사 여부"
              value={meal}
              options={[
                { value: 'yes', label: '식사 함' },
                { value: 'no', label: '안 함' },
                { value: 'unsure', label: '미정' },
              ]}
              onChange={setMeal}
            />
          )}
          <Button type="submit">참석 여부 전달하기</Button>
        </form>
      )}
    </section>
  );
}
