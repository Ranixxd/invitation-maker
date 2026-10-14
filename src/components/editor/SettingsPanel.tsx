// 기본 정보 = core (CONSTITUTION §3.2). 여러 섹션이 함께 쓰는 사실을 한 곳에서 편집 + 포인트 색(§6.2 유일한 디자인 편집)
import type { HostSide, InvitationDoc, Parent } from '../../types/invitation';
import type { EditorAction } from '../../store/editorReducer';
import { PanelSection, TextField, Toggle } from '../common/fields';
import { AccentPicker } from './AccentPicker';

interface Props {
  doc: InvitationDoc;
  dispatch: (a: EditorAction) => void;
}

export function VenueFields({ doc, dispatch }: Props) {
  const v = doc.core.venue;
  const set = (patch: Partial<typeof v>) => dispatch({ type: 'UPDATE_CORE', patch: { venue: { ...v, ...patch } } });
  return (
    <div className="form-grid">
      <TextField label="장소 이름" placeholder="예) 더채플앳청담" value={v.name} onChange={(name) => set({ name })} />
      <TextField label="홀 / 층" placeholder="예) 3층 그랜드홀" value={v.hall} onChange={(hall) => set({ hall })} />
      <TextField label="주소" placeholder="예) 서울 강남구 선릉로 757" value={v.address} onChange={(address) => set({ address })} />
      <TextField label="장소 전화번호" type="tel" inputMode="tel" value={v.tel} onChange={(tel) => set({ tel })} />
    </div>
  );
}

function ParentFields({ role, parent, onChange }: { role: string; parent: Parent; onChange: (p: Parent) => void }) {
  return (
    <div className="parent-fields">
      <TextField label={`${role} 성함`} value={parent.name} onChange={(name) => onChange({ ...parent, name })} />
      <TextField label={`${role} 연락처`} type="tel" inputMode="tel" value={parent.phone} onChange={(phone) => onChange({ ...parent, phone })} />
      <Toggle label="고인 표시 (故)" checked={parent.deceased} onChange={(deceased) => onChange({ ...parent, deceased })} />
    </div>
  );
}

function HostFields({ host, dispatch, parentsLabel }: { host: HostSide; dispatch: Props['dispatch']; parentsLabel: string }) {
  const set = (patch: Partial<HostSide>) => dispatch({ type: 'UPDATE_HOST', hostId: host.id, patch });
  return (
    <PanelSection title={`${host.label}측`}>
      <div className="form-grid">
        <TextField label={`${host.label} 이름`} value={host.name} onChange={(name) => set({ name })} />
        <TextField label={`${host.label} 연락처`} type="tel" inputMode="tel" placeholder="010-0000-0000" value={host.phone} onChange={(phone) => set({ phone })} />
      </div>
      <details className="sub-details" open={!!(host.father.name || host.mother.name)}>
        <summary>{parentsLabel}</summary>
        <ParentFields role="아버지" parent={host.father} onChange={(father) => set({ father })} />
        <ParentFields role="어머니" parent={host.mother} onChange={(mother) => set({ mother })} />
      </details>
    </PanelSection>
  );
}

export function SettingsPanel({ doc, dispatch }: Props) {
  return (
    <div className="panel-body">
      <AccentPicker doc={doc} dispatch={dispatch} />
      <PanelSection title="예식 일시">
        <TextField
          label="일시"
          type="datetime-local"
          value={doc.core.datetime}
          onChange={(datetime) => dispatch({ type: 'UPDATE_CORE', patch: { datetime } })}
          hint="히어로·날짜 섹션에 함께 반영돼요"
        />
      </PanelSection>
      {doc.core.hosts.map((h) => (
        <HostFields key={h.id} host={h} dispatch={dispatch} parentsLabel="혼주 (부모님)" />
      ))}
      <PanelSection title="장소">
        <VenueFields doc={doc} dispatch={dispatch} />
      </PanelSection>
    </div>
  );
}
