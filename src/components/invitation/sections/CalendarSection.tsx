import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { dday, formatKo, monthMatrix, parseLocal } from '../../../lib/date';

const HEAD = ['일', '월', '화', '수', '목', '금', '토'];

export function CalendarSection({ doc, section }: SectionProps<SectionOf<'calendar'>>) {
  const date = parseLocal(doc.core.datetime);
  if (!date) {
    return (
      <section className="inv-block">
        <p className="inv-muted">날짜를 입력해 주세요</p>
      </section>
    );
  }
  const { showCalendar, showCountdown } = section.data;
  const rows = monthMatrix(date.getFullYear(), date.getMonth());
  const left = dday(date);
  const names = doc.core.hosts.map((h) => h.name || h.label).join(' ♥ ');
  const [what, josa] =
    doc.eventType === 'wedding' ? ['결혼식', '이'] : doc.eventType === 'first-birthday' ? ['돌잔치', '가'] : ['파티', '가'];

  return (
    <section className="inv-block calendar">
      <p className="inv-eyebrow">{doc.eventType === 'wedding' ? 'WEDDING DAY' : 'SAVE THE DATE'}</p>
      <h2 className="inv-title">{formatKo(date)}</h2>
      {showCalendar && (
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
              {names}의 {what}{josa} <b>{left}일</b> 남았습니다
            </>
          ) : left === 0 ? (
            <>오늘은 {names}의 {what} 날입니다</>
          ) : (
            <>{names}의 {what}{josa} {-left}일 지났습니다</>
          )}
        </p>
      )}
    </section>
  );
}
