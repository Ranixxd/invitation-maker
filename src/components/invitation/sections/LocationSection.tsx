import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { copyText } from '../../common/toast';

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
      <p className="inv-eyebrow">LOCATION</p>
      <h2 className="inv-title">{title}</h2>
      {v.name ? (
        <p className="venue-name">
          {v.name}
          {v.hall && <span> {v.hall}</span>}
        </p>
      ) : (
        <p className="inv-muted">장소를 입력해 주세요</p>
      )}
      {v.address && (
        <p className="venue-address">
          {v.address}
          <button type="button" className="inv-chip" onClick={() => copyText(v.address, '주소가 복사되었습니다')}>
            복사
          </button>
        </p>
      )}
      {v.tel && (
        <p className="venue-tel">
          <a href={`tel:${v.tel}`}>Tel. {v.tel}</a>
        </p>
      )}
      {showMapLinks && (v.address || v.name) && (
        <div className="map-links">
          {mapLinks(v.address || v.name).map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
              {l.label}
            </a>
          ))}
        </div>
      )}
      {transports.length > 0 && (
        <dl className="transport">
          {transports.map((t) => (
            <div key={t.label}>
              <dt>{t.label}</dt>
              <dd>{t.text}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
