import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { copyText } from '../../common/toast';

// 그룹별 접힘 + 복사 (CONSTITUTION §4.3)
export function AccountSection({ doc, section }: SectionProps<SectionOf<'account'>>) {
  const { title, description, accounts } = section.data;
  const groups = doc.core.hosts
    .map((h) => ({ host: h, items: accounts.filter((a) => a.hostId === h.id && (a.bank || a.number)) }))
    .filter((g) => g.items.length);

  return (
    <section className="inv-block account">
      <h2 className="inv-title">{title}</h2>
      {description && <p className="inv-desc">{description}</p>}
      {groups.length === 0 ? (
        <p className="inv-muted">계좌 정보를 입력해 주세요</p>
      ) : (
        groups.map(({ host, items }) => (
          <details key={host.id} className="account-group">
            <summary>{host.label}측 계좌번호</summary>
            <ul>
              {items.map((a) => (
                <li key={a.id}>
                  <div>
                    <p className="account-who">
                      {a.relation} <b>{a.holder}</b>
                    </p>
                    <p className="account-num">
                      {a.bank} {a.number}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inv-chip"
                    onClick={() => copyText(`${a.bank} ${a.number}`.trim(), '계좌번호가 복사되었습니다')}
                  >
                    복사
                  </button>
                </li>
              ))}
            </ul>
          </details>
        ))
      )}
    </section>
  );
}
