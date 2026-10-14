import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { HeartCut } from '../HeartCut';
import { dday, formatDotKo, monthMatrix, parseLocal, weekdayKo } from '../../../lib/date';

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
  // 예식 일자: 날짜·시간과 장소 요약이 제목 (§4.1)
  const venue = [doc.core.venue.name, doc.core.venue.hall].filter(Boolean).join(' ');

  return (
    <section className={`inv-block calendar is-${style}`}>
      <h2 className="ui-title cal-title">
        <span>{formatDotKo(date)}</span>
        {venue && <span>{venue}</span>}
      </h2>
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
