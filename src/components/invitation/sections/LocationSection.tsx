import type { SectionOf } from '../../../types/invitation';
import type { SectionProps } from '../InvitationView';
import { InfoCard, SectionHead } from '../ui';
import { MapPreview } from '../MapPreview';

// 장소명 · 지도 자리 그림(카카오맵 연동 전, plan.md) · 교통편 · 외부 지도 링크 (CONSTITUTION §4.5)
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
          {v.tel && (
            <a className="venue-tel" href={`tel:${v.tel}`}>
              Tel. {v.tel}
            </a>
          )}
        </div>
      )}
      {v.name && (
        <div className="ui-col">
          <MapPreview label={v.name} />
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
