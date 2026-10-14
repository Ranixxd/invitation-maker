import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { copyText } from '../../common/toast';
import { Button, IconChevronDown, InfoCard, SectionHead } from '../ui';

// 그룹별 펼침(기본 펼침, 눌러서 접기) + 복사 (CONSTITUTION §4.3)
export function AccountSection({ doc, section }: SectionProps<SectionOf<'account'>>) {
  const { title, description, accounts } = section.data;
  const groups = doc.core.hosts
    .map((h) => ({ host: h, items: accounts.filter((a) => a.hostId === h.id && (a.bank || a.number)) }))
    .filter((g) => g.items.length);

  return (
    <section className="inv-block account">
      <SectionHead title={title} desc={groups.length ? description : '계좌 정보를 입력해 주세요'} />
      {groups.length > 0 && (
        <div className="ui-col account-groups">
          {groups.map(({ host, items }) => (
            <details key={host.id} className="ui-disclosure" open>
              <summary>
                {host.label}측 계좌번호
                <IconChevronDown />
              </summary>
              <div className="ui-stack">
                {items.map((a) => (
                  <InfoCard
                    key={a.id}
                    head={
                      <>
                        <span className="ui-card-label">{a.relation}</span> {a.holder}
                      </>
                    }
                  >
                    <div className="ui-card-row">
                      <span>
                        {a.bank} {a.number}
                      </span>
                      <Button variant="chip" onClick={() => copyText(`${a.bank} ${a.number}`.trim(), '계좌번호가 복사되었습니다')}>
                        복사
                      </Button>
                    </div>
                  </InfoCard>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
