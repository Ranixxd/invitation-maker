import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { HeartScribble } from '../HeartScribble';
import { dday, formatKo, monthMatrix, parseLocal, weekdayKo } from '../../../lib/date';

const HEAD = ['일', '월', '화', '수', '목', '금', '토'];
const MARQUEE_REPEAT = 6;

/** 손으로 그린 듯한 하트 동그라미 (3일 띠의 예식일 표시) */

/** 앞뒤 하루를 포함한 3일 띠 + SAVE THE DATE 흐르는 글자 (템플릿 calendarStyle = 'strip') */
function DayStrip({ date }: { date: Date }) {
  const days = [-1, 0, 1].map((off) => {
    const d = new Date(date);
    d.setDate(d.getDate() + off);
    return { off, d };
  });
  const row = Array.from({ length: MARQUEE_REPEAT }, (_, i) => <span key={i}>SAVE THE DATE</span>);
  return (
    <>
      <div className="cal-strip" role="img" aria-label={`${date.getMonth() + 1}월 ${date.getDate()}일 ${weekdayKo(date)}요일`}>
        {days.map(({ off, d }) => (
          <div key={off} className={`cal-strip-day${off === 0 ? ' is-day' : ''}`}>
            <span className="cal-strip-wd">{weekdayKo(d)}요일</span>
            <span className="cal-strip-num">
              {d.getDate()}
              {off === 0 && <HeartScribble className="cal-heart" />}
            </span>
          </div>
        ))}
      </div>
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
    </>
  );
}

export function CalendarSection({ doc, section }: SectionProps<SectionOf<'calendar'>>) {
  const date = parseLocal(doc.core.datetime);
  if (!date) {
    return (
      <section className="inv-block">
        <p className="inv-muted">날짜를 입력해 주세요</p>
      </section>
    );
  }
  const { showCalendar, showCountdown, style = 'month' } = section.data;
  const rows = monthMatrix(date.getFullYear(), date.getMonth());
  const left = dday(date);
  // 이름 사이 하트: 기본 계열 '♥' 글자, 에디토리얼 계열은 크레용 하트 이미지 (CSS로 전환)
  const names = doc.core.hosts.map((h, i) => (
    <span key={h.id}>
      {i > 0 && (
        <>
          {' '}
          <span className="countdown-heart-text">♥</span>
          <HeartScribble className="countdown-heart" />{' '}
        </>
      )}
      {h.name || h.label}
    </span>
  ));
  // 예식 일자: 장소 요약·날짜·시간·D-day (§4.1)
  const venue = [doc.core.venue.name, doc.core.venue.hall].filter(Boolean).join(' ');

  return (
    <section className={`inv-block calendar is-${style}`}>
      <h2 className="inv-title cal-title">{formatKo(date)}</h2>
      {venue && <p className="cal-venue">{venue}</p>}
      {showCalendar && style === 'strip' && <DayStrip date={date} />}
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
    </section>
  );
}
