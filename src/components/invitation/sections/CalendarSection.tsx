import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { HeartCut } from '../HeartCut';
import { SectionHead } from '../ui';
import { dday, formatDateKo, monthMatrix, parseLocal, weekdayKo } from '../../../lib/date';

const HEAD = ['일', '월', '화', '수', '목', '금', '토'];
const MARQUEE_REPEAT = 6;

/** 예식일이 있는 한 주(월~일) 띠. 예식일은 오린 하트 위에 흰 숫자 (템플릿 calendarStyle = 'strip') */
const WEEK_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
function WeekStrip({ date }: { date: Date }) {
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7)); // 월요일 시작
  const days = WEEK_LABELS.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { label, d, isDay: d.toDateString() === date.toDateString() };
  });
  return (
    <div className="cal-strip" role="img" aria-label={`${date.getMonth() + 1}월 ${date.getDate()}일 ${weekdayKo(date)}요일`}>
      {days.map(({ label, d, isDay }) => (
        <div key={label} className={`cal-strip-day${isDay ? ' is-day' : ''}`}>
          <span className="cal-strip-wd">{label}</span>
          <span className="cal-strip-num">
            {isDay && <HeartCut shape="b" className="cal-heart" />}
            <span className="cal-strip-n">{d.getDate()}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/** 티켓: 종이 카드에 예식일이 있는 한 주(월~일 7칸), 예식일은 손으로 그린 동그라미 (calendarStyle = 'ticket') */
function Ticket({ date }: { date: Date }) {
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7)); // 월요일 시작 (템플릿1 한 주 띠와 같음)
  const days = WEEK_LABELS.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { label, d, isDay: d.toDateString() === date.toDateString() };
  });
  return (
    <div className="cal-ticket" role="img" aria-label={`${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${weekdayKo(date)}요일`}>
      <p className="cal-ticket-head">
        <span>
          {date.getMonth() + 1}월 {date.getDate()}일
        </span>
        <span>{date.getFullYear()}</span>
      </p>
      <div className="cal-ticket-days">
        {days.map(({ label, d, isDay }) => (
          <div key={label} className={`cal-ticket-day${isDay ? ' is-day' : ''}`}>
            <span className="cal-ticket-wd">{label}</span>
            <span className="cal-ticket-n">
              {d.getDate()}
              {isDay && (
                <svg className="cal-ticket-circle" viewBox="0 0 64 52" aria-hidden>
                  <path d="M35 7C19 4 5 13 5 27c0 13 13 21 27 20 15-1 27-10 26-23C57 12 46 5 31 6c-6 1-11 3-14 7" />
                  <path d="M50 4.5c1.5-2.5 5-2 5 .8 0 2.4-3.4 4.4-5 6-1.6-1.6-5-3.6-5-6 0-2.8 3.5-3.3 5-.8z" />
                </svg>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 좌우로 흐르는 SAVE THE DATE 두 줄 (장식) */
function SaveTheDate() {
  const row = Array.from({ length: MARQUEE_REPEAT }, (_, i) => <span key={i}>SAVE THE DATE</span>);
  return (
    <div className="save-marquee" aria-hidden>
      <div className="save-row">
        <div className="save-track">
          {row}
          {row}
        </div>
      </div>
      <div className="save-row is-reverse">
        <div className="save-track">
          {row}
          {row}
        </div>
      </div>
    </div>
  );
}

export function CalendarSection({ doc, section }: SectionProps<SectionOf<'calendar'>>) {
  const date = parseLocal(doc.core.datetime);
  if (!date) {
    return (
      <section className="inv-block">
        <p className="ui-desc">날짜를 입력해 주세요</p>
      </section>
    );
  }
  const { showCalendar, showCountdown, style = 'month' } = section.data;
  const rows = monthMatrix(date.getFullYear(), date.getMonth());
  const left = dday(date);
  const names = doc.core.hosts.map((h) => h.name || h.label).join(' · ');

  return (
    <section className={`inv-block calendar is-${style}`}>
      {/* 예식 일자: 날짜·시간이 제목 (§4.1) */}
      {style === 'ticket' ? <h2 className="cal-ticket-title">{formatDateKo(date)}</h2> : <SectionHead title={formatDateKo(date)} />}
      {showCalendar && style === 'ticket' && <Ticket date={date} />}
      {showCalendar && style === 'strip' && <WeekStrip date={date} />}
      {showCalendar && style === 'month' && (
        <table className="cal" aria-label={`${date.getFullYear()}년 ${date.getMonth() + 1}월 달력`}>
          <caption>{date.getMonth() + 1}월</caption>
          <thead>
            <tr>
              {HEAD.map((d, i) => (
                <th key={d} className={i === 0 ? 'sun' : i === 6 ? 'sat' : ''}>
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((d, j) => (
                  <td key={j} className={[j === 0 ? 'sun' : '', d === date.getDate() ? 'is-day' : ''].join(' ')}>
                    {d && <span>{d}</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showCountdown && (
        <p className="countdown">
          {left > 0 ? (
            <>
              {names}의 결혼식이 <b>{left}일</b> 남았습니다
            </>
          ) : left === 0 ? (
            <>오늘은 {names}의 결혼식 날입니다</>
          ) : (
            <>{names}의 결혼식이 {-left}일 지났습니다</>
          )}
        </p>
      )}
      {showCalendar && style === 'strip' && <SaveTheDate />}
    </section>
  );
}
