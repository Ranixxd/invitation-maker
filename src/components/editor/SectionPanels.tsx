// 섹션별 내용 편집 폼 (CONSTITUTION §4). 디자인(레이아웃·테마)은 템플릿이 결정하므로 다루지 않는다(§6.2)
import { useState } from 'react';
import type { BankAccount, InvitationDoc, Section, SectionDataMap, SectionOf, SectionType } from '../../types/invitation';
import type { EditorAction } from '../../store/editorReducer';
import { PanelSection, TextArea, TextField, Toggle } from '../common/fields';
import { PhotoDrop } from '../common/shared';
import { toast } from '../common/toast';
import { filesToAssets, MAX_IMAGES_PER_DOC } from '../../lib/image';
import { uid } from '../../lib/id';
import { VenueFields } from './SettingsPanel';

interface PanelProps<K extends SectionType> {
  doc: InvitationDoc;
  section: SectionOf<K>;
  dispatch: (a: EditorAction) => void;
  goSettings: () => void;
}

function useUpdate<K extends SectionType>(type: K, dispatch: (a: EditorAction) => void) {
  return (patch: Partial<SectionDataMap[K]>) => dispatch({ type: 'UPDATE_SECTION', sectionType: type, patch });
}

function useImageUpload(doc: InvitationDoc, dispatch: (a: EditorAction) => void, target: 'hero' | 'gallery') {
  const [busy, setBusy] = useState(false);
  const upload = async (files: File[]) => {
    const room = MAX_IMAGES_PER_DOC - Object.keys(doc.images).length;
    if (room <= 0) {
      toast(`사진은 초대장당 최대 ${MAX_IMAGES_PER_DOC}장이에요`);
      return;
    }
    setBusy(true);
    const assets = await filesToAssets(target === 'hero' ? files.slice(0, 1) : files, room);
    setBusy(false);
    if (assets.length) dispatch({ type: 'ADD_IMAGES', images: assets, target });
  };
  return { busy, upload };
}

const SettingsLink = ({ onClick, children }: { onClick: () => void; children: string }) => (
  <button type="button" className="link-btn" onClick={onClick}>
    {children} →
  </button>
);

// ---------------- hero ----------------
function HeroPanel({ doc, section, dispatch }: PanelProps<'hero'>) {
  const set = useUpdate('hero', dispatch);
  const { busy, upload } = useImageUpload(doc, dispatch, 'hero');
  const current = section.data.imageId ? doc.images[section.data.imageId] : null;
  const others = Object.values(doc.images).filter((i) => i.id !== section.data.imageId);
  return (
    <div className="panel-body">
      <PanelSection title="대표 사진">
        {current ? <img className="hero-thumb" src={current.src} alt="현재 대표 사진" /> : <p className="field-hint">아직 대표 사진이 없어요</p>}
        <PhotoDrop onFiles={upload} busy={busy} compact>
          <p className="field-hint">새 사진으로 바꾸기</p>
        </PhotoDrop>
        {others.length > 0 && (
          <>
            <p className="field-hint">올린 사진 중에서 고르기</p>
            <div className="pick-grid">
              {others.map((img) => (
                <button key={img.id} type="button" className="pick-item" onClick={() => set({ imageId: img.id })} aria-label="이 사진을 대표로">
                  <img src={img.src} alt="" />
                </button>
              ))}
            </div>
          </>
        )}
      </PanelSection>
      <PanelSection title="문구">
        <TextField label="헤드라인" value={section.data.headline} onChange={(headline) => set({ headline })} maxLength={40} />
      </PanelSection>
    </div>
  );
}

// ---------------- greeting ----------------
const GREETING_SAMPLES = [
  '서로가 마주보며 다져온 사랑을\n이제 함께 한 곳을 바라보며\n걸어갈 수 있는 큰 사랑으로 키우고자 합니다.\n\n저희 두 사람이 사랑의 이름으로\n지켜나갈 수 있도록\n앞날을 축복해 주시면 감사하겠습니다.',
  '봄의 꽃처럼 따뜻하고\n여름의 바다처럼 깊은 마음으로\n서로를 아끼며 살겠습니다.\n\n귀한 걸음 하시어\n저희의 새로운 시작을 축복해 주세요.',
  '평생을 같이하고 싶은 사람을 만났습니다.\n\n서로 아껴주고 이해하며\n사랑 베풀며 살고 싶습니다.\n\n오셔서 축복해 주시면 큰 기쁨이겠습니다.',
];

function GreetingPanel({ section, dispatch, goSettings }: PanelProps<'greeting'>) {
  const set = useUpdate('greeting', dispatch);
  return (
    <div className="panel-body">
      <PanelSection title="문구">
        <TextField label="제목" value={section.data.title} onChange={(title) => set({ title })} maxLength={40} />
        <TextArea label="본문" rows={9} value={section.data.body} onChange={(body) => set({ body })} maxLength={600} hint={`${section.data.body.length}/600`} />
        <div className="sample-row">
          <span className="field-hint">예시 문구:</span>
          {GREETING_SAMPLES.map((s, i) => (
            <button key={i} type="button" className="btn btn-ghost sm" onClick={() => set({ body: s })}>
              {i + 1}
            </button>
          ))}
        </div>
      </PanelSection>
      <PanelSection title="서명">
        <Toggle
          label="이름 서명 표시"
          hint="예) 김OO · 박OO의 아들 민준"
          checked={section.data.showSignature}
          onChange={(showSignature) => set({ showSignature })}
        />
        <SettingsLink onClick={goSettings}>이름·부모님 성함은 기본 정보에서</SettingsLink>
      </PanelSection>
    </div>
  );
}

// ---------------- calendar ----------------
function CalendarPanel({ doc, section, dispatch }: PanelProps<'calendar'>) {
  const set = useUpdate('calendar', dispatch);
  return (
    <div className="panel-body">
      <PanelSection title="날짜">
        <TextField
          label="일시"
          type="datetime-local"
          value={doc.core.datetime}
          onChange={(datetime) => dispatch({ type: 'UPDATE_CORE', patch: { datetime } })}
          hint="히어로에도 함께 반영돼요"
        />
      </PanelSection>
      <PanelSection title="표시">
        <Toggle label="달력 보이기" checked={section.data.showCalendar} onChange={(showCalendar) => set({ showCalendar })} />
        <Toggle label="D-day 카운트다운" checked={section.data.showCountdown} onChange={(showCountdown) => set({ showCountdown })} />
      </PanelSection>
    </div>
  );
}

// ---------------- gallery ----------------
function GalleryPanel({ doc, section, dispatch }: PanelProps<'gallery'>) {
  const set = useUpdate('gallery', dispatch);
  const { busy, upload } = useImageUpload(doc, dispatch, 'gallery');
  const ids = section.data.imageIds.filter((id) => doc.images[id]);
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= ids.length) return;
    const next = [...ids];
    [next[i], next[j]] = [next[j], next[i]];
    set({ imageIds: next });
  };
  return (
    <div className="panel-body">
      <PanelSection title="갤러리">
        <TextField label="제목" value={section.data.title} onChange={(title) => set({ title })} />
      </PanelSection>
      <PanelSection title={`사진 ${ids.length}장`}>
        <PhotoDrop onFiles={upload} busy={busy} compact />
        <ul className="gallery-edit">
          {ids.map((id, i) => (
            <li key={id}>
              <img src={doc.images[id].src} alt={`사진 ${i + 1}`} />
              <div className="gallery-edit-actions">
                <button type="button" className="icon-btn sm" aria-label="앞으로" disabled={i === 0} onClick={() => move(i, -1)}>
                  ←
                </button>
                <button type="button" className="icon-btn sm" aria-label="뒤로" disabled={i === ids.length - 1} onClick={() => move(i, 1)}>
                  →
                </button>
                <button
                  type="button"
                  className="icon-btn sm danger"
                  aria-label="사진 삭제"
                  onClick={() => {
                    // §3.3: 다른 섹션(히어로)이 참조 중이면 갤러리에서만 빼고, 아니면 이미지 자체를 삭제
                    const usedByHero = doc.sections.some((s) => s.type === 'hero' && s.data.imageId === id);
                    if (usedByHero) set({ imageIds: ids.filter((x) => x !== id) });
                    else dispatch({ type: 'REMOVE_IMAGE', imageId: id });
                  }}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      </PanelSection>
    </div>
  );
}

// ---------------- parents ----------------
function ParentsPanel({ section, dispatch, goSettings }: PanelProps<'parents'>) {
  const set = useUpdate('parents', dispatch);
  return (
    <div className="panel-body">
      <PanelSection title="혼주 · 연락처">
        <TextField label="제목" value={section.data.title} onChange={(title) => set({ title })} />
        <Toggle label="전화·문자 버튼 표시" checked={section.data.showContact} onChange={(showContact) => set({ showContact })} />
        <SettingsLink onClick={goSettings}>성함·연락처는 기본 정보에서 수정</SettingsLink>
      </PanelSection>
    </div>
  );
}

// ---------------- location ----------------
function LocationPanel({ doc, section, dispatch }: PanelProps<'location'>) {
  const set = useUpdate('location', dispatch);
  return (
    <div className="panel-body">
      <PanelSection title="장소">
        <TextField label="섹션 제목" value={section.data.title} onChange={(title) => set({ title })} />
        <VenueFields doc={doc} dispatch={dispatch} />
        <Toggle label="지도 앱 버튼 (카카오맵·네이버지도·티맵)" checked={section.data.showMapLinks} onChange={(showMapLinks) => set({ showMapLinks })} />
      </PanelSection>
      <PanelSection title="교통편 안내">
        <TextArea label="지하철" rows={2} placeholder="예) 7호선 청담역 9번 출구 도보 5분" value={section.data.subway} onChange={(subway) => set({ subway })} />
        <TextArea label="버스" rows={2} placeholder="예) 간선 301, 342" value={section.data.bus} onChange={(bus) => set({ bus })} />
        <TextArea label="자가용 · 주차" rows={2} placeholder="예) 건물 내 주차 2시간 무료" value={section.data.car} onChange={(car) => set({ car })} />
      </PanelSection>
    </div>
  );
}

// ---------------- account ----------------
const BANKS = ['국민', '신한', '우리', '하나', '농협', '기업', '카카오뱅크', '토스뱅크', '케이뱅크', 'SC제일', '새마을금고', '우체국', '수협', '부산', '대구'];

function AccountPanel({ doc, section, dispatch }: PanelProps<'account'>) {
  const set = useUpdate('account', dispatch);
  const accounts = section.data.accounts;
  const patchAcc = (id: string, patch: Partial<BankAccount>) =>
    set({ accounts: accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)) });
  const add = (hostId: string, label: string) =>
    set({ accounts: [...accounts, { id: uid('acc'), hostId, relation: label, holder: '', bank: '', number: '' }] });
  const remove = (id: string) => set({ accounts: accounts.filter((a) => a.id !== id) });

  return (
    <div className="panel-body">
      <PanelSection title="안내">
        <TextField label="제목" value={section.data.title} onChange={(title) => set({ title })} />
        <TextArea label="안내 문구" rows={3} value={section.data.description} onChange={(description) => set({ description })} />
      </PanelSection>
      <datalist id="bank-list">
        {BANKS.map((b) => (
          <option key={b} value={b} />
        ))}
      </datalist>
      {doc.core.hosts.map((h) => {
        const items = accounts.filter((a) => a.hostId === h.id);
        return (
          <PanelSection
            key={h.id}
            title={`${h.label}측 계좌`}
            aside={
              <button type="button" className="btn btn-ghost sm" onClick={() => add(h.id, `${h.label} 아버지`)}>
                + 추가
              </button>
            }
          >
            {items.length === 0 && <p className="field-hint">계좌가 없어요</p>}
            {items.map((a) => (
              <div key={a.id} className="account-edit">
                <div className="form-grid two">
                  <TextField label="관계" value={a.relation} onChange={(relation) => patchAcc(a.id, { relation })} placeholder="예) 신랑 아버지" />
                  <TextField label="예금주" value={a.holder} onChange={(holder) => patchAcc(a.id, { holder })} />
                  <TextField label="은행" list="bank-list" value={a.bank} onChange={(bank) => patchAcc(a.id, { bank })} />
                  <TextField
                    label="계좌번호"
                    inputMode="numeric"
                    value={a.number}
                    onChange={(number) => patchAcc(a.id, { number: number.replace(/[^\d-]/g, '') })}
                  />
                </div>
                <button type="button" className="link-btn danger" onClick={() => remove(a.id)}>
                  이 계좌 삭제
                </button>
              </div>
            ))}
          </PanelSection>
        );
      })}
    </div>
  );
}

// ---------------- guestbook ----------------
function GuestbookPanel({ section, dispatch }: PanelProps<'guestbook'>) {
  const set = useUpdate('guestbook', dispatch);
  return (
    <div className="panel-body">
      <PanelSection title="메시지 받기">
        <TextField label="제목" value={section.data.title} onChange={(title) => set({ title })} />
        <TextArea label="안내 문구" rows={2} value={section.data.description} onChange={(description) => set({ description })} />
        <p className="notice">
          지금은 초안 단계라 메시지가 작성한 사람의 브라우저에만 저장돼요. 서버 연동 후 실제로 모아볼 수 있어요.
        </p>
      </PanelSection>
    </div>
  );
}

export function SectionPanel(props: { doc: InvitationDoc; section: Section; dispatch: (a: EditorAction) => void; goSettings: () => void }) {
  const { section } = props;
  switch (section.type) {
    case 'hero':
      return <HeroPanel {...props} section={section} />;
    case 'greeting':
      return <GreetingPanel {...props} section={section} />;
    case 'calendar':
      return <CalendarPanel {...props} section={section} />;
    case 'gallery':
      return <GalleryPanel {...props} section={section} />;
    case 'parents':
      return <ParentsPanel {...props} section={section} />;
    case 'location':
      return <LocationPanel {...props} section={section} />;
    case 'account':
      return <AccountPanel {...props} section={section} />;
    case 'guestbook':
      return <GuestbookPanel {...props} section={section} />;
  }
}
