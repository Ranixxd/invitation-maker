import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { copyText } from '../../common/toast';
import { IconMapPin, InfoCard, SectionHead } from '../ui';

// v0.1: 지도 임베드 대신 외부 지도 링크 (CONSTITUTION §4.5)
function mapLinks(query: string) {
  const q = encodeURIComponent(query);
  return [
    { label: '카카오맵', href: `https://map.kakao.com/link/search/${q}` },
    { label: '네이버지도', href: `https://map.naver.com/p/search/${q}` },
    { label: '티맵', href: `tmap://search?name=${q}` },
  ];
}

export function LocationSection({ doc, section }: SectionProps<SectionOf<'location'>>) {
  const { title, subway, bus, car, showMapLinks } = section.data;
  const v = doc.core.venue;
  const transports = [
    { label: '지하철', text: subway },
    { label: '버스', text: bus },
    { label: '자가용', text: car },
  ].filter((t) => t.text.trim());

  return (
    <section className="inv-block location">
      <SectionHead title={title} desc={v.name ? undefined : '장소를 입력해 주세요'} />
      {v.name && (
        <div className="venue">
          <p className="venue-name">{[v.name, v.hall].filter(Boolean).join(' ')}</p>
          {/* 주소를 누르면 복사 */}
          {v.address && (
            <button type="button" className="venue-address" onClick={() => copyText(v.address, '주소가 복사되었습니다')}>
              <IconMapPin />
              {v.address}
            </button>
          )}
          {v.tel && (
            <a className="venue-tel" href={`tel:${v.tel}`}>
              Tel. {v.tel}
            </a>
          )}
        </div>
      )}
      {transports.length > 0 && (
        <div className="ui-col ui-stack">
          {transports.map((t) => (
            <InfoCard key={t.label} head={t.label}>
              {t.text}
            </InfoCard>
          ))}
        </div>
      )}
      {showMapLinks && (v.address || v.name) && (
        <div className="map-links">
          <p className="ui-caption">지도로 보기</p>
          <div className="map-links-row">
            {mapLinks(v.address || v.name).map((l) => (
              <a key={l.label} className="ui-btn ui-btn--chip" href={l.href} target="_blank" rel="noreferrer">
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
