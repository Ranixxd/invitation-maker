// 섹션별 내용 편집 폼 (CONSTITUTION §4). 디자인(레이아웃·테마)은 템플릿이 결정하므로 다루지 않는다(§6.2)
import { useState, type ReactNode } from 'react';
import type {
  BankAccount,
  InvitationDoc,
  Section,
  SectionDataMap,
  SectionOf,
  SectionType,
  TimelineItem,
} from '../../types/invitation';
import type { EditorAction } from '../../store/editorReducer';
import { HERO_EXTRA_MAX } from '../../store/editorReducer';
import { PanelSection, TextArea, TextField, Toggle } from '../common/fields';
import { CLOSING_PHOTO_MAX, GALLERY_MAX } from '../../lib/image';
import { uid } from '../../lib/id';
import { DatetimeField, HostInputs, HostNameFields, VenueFields } from './SettingsPanel';
import { PhotoSlots } from './PhotoSlots';

interface PanelProps<K extends SectionType> {
  doc: InvitationDoc;
  section: SectionOf<K>;
  dispatch: (a: EditorAction) => void;
}

function useUpdate<K extends SectionType>(type: K, dispatch: (a: EditorAction) => void) {
  return (patch: Partial<SectionDataMap[K]>) => dispatch({ type: 'UPDATE_SECTION', sectionType: type, patch });
}

/**
 * 기본 정보(core) 연동 블록 (CONSTITUTION §6.2). 섹션 폼에는 core 입력칸을 따로 두지 않고,
 * 안내 + `여기서 수정할까요?`로 펼친 자리에서 기본 정보와 같은 값을 바로 고친다.
 */
function CoreLink({ what, children }: { what: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="panel-section core-link">
      <div className="core-link-head">
        <p className="field-hint">{what} 정보는 기본 정보에서 수정할 수 있어요.</p>
        <button type="button" className="btn btn-ghost sm" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? '접기' : '여기서 수정할까요?'}
        </button>
      </div>
      {open && <div className="core-link-body">{children}</div>}
    </section>
  );
}

// ---------------- hero ----------------
function HeroPanel({ doc, section, dispatch }: PanelProps<'hero'>) {
  const set = useUpdate('hero', dispatch);
  const polaroid = section.data.layout === 'polaroid';
  const stack = section.data.layout === 'stack';
  // 폴라로이드·이어 붙이기는 대표 + 추가 2장 = 3칸, 그 외는 대표 1칸
  const multi = polaroid || stack;
  const extras = (section.data.extraImageIds ?? []).filter((id) => doc.images[id]);
  const slots = [section.data.imageId, ...(multi ? Array.from({ length: HERO_EXTRA_MAX }, (_, i) => extras[i] ?? null) : [])];
  const captions = section.data.captions ?? [];
  const setCaption = (i: number, text: string) =>
    set({ captions: Array.from({ length: HERO_EXTRA_MAX + 1 }, (_, k) => (k === i ? text : captions[k] ?? '')) });
  return (
    <div className="panel-body">
      <PanelSection title="사진">
        <PhotoSlots
          doc={doc}
          dispatch={dispatch}
          label="히어로 사진"
          slots={slots}
          onChange={([imageId, ...rest]) =>
            set(multi ? { imageId, extraImageIds: rest.filter((x): x is string => !!x) } : { imageId })
          }
        />
      </PanelSection>
      {stack && (
        <PanelSection title="사진 멘트">
          <p className="field-hint">사진 아래쪽에 한 줄로 보여요. 비우면 표시하지 않아요.</p>
          {Array.from({ length: HERO_EXTRA_MAX + 1 }, (_, i) => (
            <TextField
              key={i}
              label={`${i + 1}번째 사진`}
              value={captions[i] ?? ''}
              onChange={(text) => setCaption(i, text)}
              maxLength={60}
            />
          ))}
        </PanelSection>
      )}
      {/* 이어 붙이기(템플릿4)는 작은 문구를 쓰지 않는다 */}
      {!stack && (
        <PanelSection title="문구">
          <TextArea
            label={polaroid ? '작은 문구' : '헤드라인'}
            rows={polaroid ? 2 : 1}
            value={section.data.headline}
            onChange={(headline) => set({ headline })}
            maxLength={40}
          />
          {polaroid && (
            <TextField
              label="필기체 문구 (영문)"
              placeholder="Our Wedding Day"
              value={section.data.script ?? ''}
              onChange={(script) => set({ script })}
              maxLength={24}
            />
          )}
        </PanelSection>
      )}
      <CoreLink what="이름·예식 일시·장소">
        <HostNameFields doc={doc} dispatch={dispatch} />
        <DatetimeField doc={doc} dispatch={dispatch} />
        <VenueFields doc={doc} dispatch={dispatch} />
      </CoreLink>
    </div>
  );
}

// ---------------- greeting ----------------
const GREETING_SAMPLES = [
  '서로가 마주보며 다져온 사랑을\n이제 함께 한 곳을 바라보며\n걸어갈 수 있는 큰 사랑으로 키우고자 합니다.\n\n저희 두 사람이 사랑의 이름으로\n지켜나갈 수 있도록\n앞날을 축복해 주시면 감사하겠습니다.',
  '봄의 꽃처럼 따뜻하고\n여름의 바다처럼 깊은 마음으로\n서로를 아끼며 살겠습니다.\n\n귀한 걸음 하시어\n저희의 새로운 시작을 축복해 주세요.',
  '평생을 같이하고 싶은 사람을 만났습니다.\n\n서로 아껴주고 이해하며\n사랑 베풀며 살고 싶습니다.\n\n오셔서 축복해 주시면 큰 기쁨이겠습니다.',
];

function GreetingPanel({ section, dispatch }: PanelProps<'greeting'>) {
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
    </div>
  );
}

// ---------------- calendar ----------------
function CalendarPanel({ doc, section, dispatch }: PanelProps<'calendar'>) {
  const set = useUpdate('calendar', dispatch);
  return (
    <div className="panel-body">
      <PanelSection title="표시">
        <Toggle label="달력 보이기" checked={section.data.showCalendar} onChange={(showCalendar) => set({ showCalendar })} />
        <Toggle label="D-day 카운트다운" checked={section.data.showCountdown} onChange={(showCountdown) => set({ showCountdown })} />
      </PanelSection>
      <CoreLink what="예식 일시·장소">
        <DatetimeField doc={doc} dispatch={dispatch} />
        <VenueFields doc={doc} dispatch={dispatch} />
      </CoreLink>
    </div>
  );
}

// ---------------- gallery ----------------
function GalleryPanel({ doc, section, dispatch }: PanelProps<'gallery'>) {
  const set = useUpdate('gallery', dispatch);
  const ids = section.data.imageIds.filter((id) => doc.images[id]);
  const slots = Array.from({ length: GALLERY_MAX }, (_, i) => ids[i] ?? null);
  return (
    <div className="panel-body">
      <PanelSection title="갤러리">
        <TextField label="제목" value={section.data.title} onChange={(title) => set({ title })} />
      </PanelSection>
      <PanelSection title={`사진 (${ids.length}/${GALLERY_MAX})`}>
        <PhotoSlots
          doc={doc}
          dispatch={dispatch}
          label="갤러리 사진"
          slots={slots}
          reorderable
          onChange={(next) => set({ imageIds: next.filter((x): x is string => !!x) })}
        />
      </PanelSection>
    </div>
  );
}

// ---------------- couple ----------------
function CouplePanel({ doc, section, dispatch }: PanelProps<'couple'>) {
  const set = useUpdate('couple', dispatch);
  return (
    <div className="panel-body">
      <PanelSection title="신랑·신부">
        <Toggle label="혼주(부모님) 성함 표시" hint="이름 아래 작게 보여요" checked={section.data.showParents} onChange={(showParents) => set({ showParents })} />
        <Toggle label="연락하기 버튼 표시" hint="전화번호를 넣은 사람만 보여요" checked={section.data.showContact} onChange={(showContact) => set({ showContact })} />
      </PanelSection>
      <CoreLink what="이름·연락처·혼주">
        {doc.core.hosts.map((h) => (
          <div key={h.id} className="core-link-group">
            <h4>{h.label}측</h4>
            <HostInputs host={h} dispatch={dispatch} />
          </div>
        ))}
      </CoreLink>
    </div>
  );
}

// ---------------- profile ----------------
const TIMELINE_MAX = 10;

function ProfilePanel({ section, dispatch }: PanelProps<'profile'>) {
  const set = useUpdate('profile', dispatch);
  const { timeline } = section.data;
  const setItem = (id: string, patch: Partial<TimelineItem>) =>
    set({ timeline: timeline.map((t) => (t.id === id ? { ...t, ...patch } : t)) });

  return (
    <div className="panel-body">
      <PanelSection title="섹션">
        <TextField label="제목" value={section.data.title} onChange={(title) => set({ title })} />
      </PanelSection>
      <PanelSection
        title="타임라인"
        aside={
          timeline.length < TIMELINE_MAX && (
            <button
              type="button"
              className="btn btn-ghost sm"
              onClick={() => set({ timeline: [...timeline, { id: uid('tl'), date: '', text: '' }] })}
            >
              + 추가
            </button>
          )
        }
      >
        {timeline.length === 0 && <p className="field-hint">처음 만난 날, 연애 시작, 프러포즈 같은 순간을 적어 보세요.</p>}
        {timeline.map((t) => (
          <div key={t.id} className="account-edit">
            <div className="form-grid timeline-edit">
              <TextField label="날짜" placeholder="예) 2019.03" value={t.date} maxLength={20} onChange={(date) => setItem(t.id, { date })} />
              <TextField label="내용" placeholder="예) 처음 만난 날" value={t.text} maxLength={60} onChange={(text) => setItem(t.id, { text })} />
            </div>
            <button type="button" className="link-btn danger" onClick={() => set({ timeline: timeline.filter((x) => x.id !== t.id) })}>
              이 항목 삭제
            </button>
          </div>
        ))}
      </PanelSection>
    </div>
  );
}

// ---------------- rsvp ----------------
function RsvpPanel({ section, dispatch }: PanelProps<'rsvp'>) {
  const set = useUpdate('rsvp', dispatch);
  return (
    <div className="panel-body">
      <PanelSection title="참석 여부 받기">
        <TextField label="제목" value={section.data.title} onChange={(title) => set({ title })} />
        <TextArea label="안내 문구" rows={2} value={section.data.description} onChange={(description) => set({ description })} />
        <Toggle label="참석 인원 묻기" checked={section.data.askCount} onChange={(askCount) => set({ askCount })} />
        <Toggle label="식사 여부 묻기" checked={section.data.askMeal} onChange={(askMeal) => set({ askMeal })} />
        <p className="notice">지금은 초안 단계라 응답이 응답한 사람의 브라우저에만 저장돼요. 서버 연동 후 모아볼 수 있어요.</p>
      </PanelSection>
    </div>
  );
}

// ---------------- snap ----------------
function SnapPanel({ section, dispatch }: PanelProps<'snap'>) {
  const set = useUpdate('snap', dispatch);
  return (
    <div className="panel-body">
      <PanelSection title="게스트 스냅">
        <TextField label="제목" value={section.data.title} onChange={(title) => set({ title })} />
        <TextArea label="안내 문구" rows={2} value={section.data.description} onChange={(description) => set({ description })} />
        <p className="notice">하객이 예식 사진을 올리는 공간이에요. 필요할 때만 켜 주세요. 지금은 초안 단계라 올린 사진이 저장되지 않아요.</p>
      </PanelSection>
    </div>
  );
}

// ---------------- closing ----------------
const CLOSING_SAMPLES = [
  '바쁘신 와중에도 저희의 시작을 축하해 주셔서 감사합니다.\n\n서로 아끼고 배려하며\n예쁘게 잘 살겠습니다.',
  '함께해 주신 모든 분들께 감사드립니다.\n\n받은 사랑 잊지 않고\n행복하게 잘 살겠습니다.',
  '저희 두 사람의 새로운 시작을\n따뜻한 마음으로 지켜봐 주세요.\n\n고맙습니다.',
];

function ClosingPanel({ doc, section, dispatch }: PanelProps<'closing'>) {
  const set = useUpdate('closing', dispatch);
  const ids = (section.data.imageIds ?? []).filter((id) => doc.images[id]);
  const slots = Array.from({ length: CLOSING_PHOTO_MAX }, (_, i) => ids[i] ?? null);
  return (
    <div className="panel-body">
      <PanelSection title="마무리 멘트">
        <TextArea
          label="문구"
          rows={6}
          maxLength={300}
          value={section.data.body}
          onChange={(body) => set({ body })}
          hint={`${section.data.body.length}/300`}
        />
        <div className="sample-row">
          <span className="field-hint">예시 문구:</span>
          {CLOSING_SAMPLES.map((s, i) => (
            <button key={i} type="button" className="btn btn-ghost sm" onClick={() => set({ body: s })}>
              {i + 1}
            </button>
          ))}
        </div>
        <Toggle
          label="신랑·신부 이름 표시"
          hint="예) 신랑 김민준 · 신부 이서연 드림"
          checked={section.data.showNames}
          onChange={(showNames) => set({ showNames })}
        />
      </PanelSection>
      <PanelSection title="사진">
        <PhotoSlots
          doc={doc}
          dispatch={dispatch}
          label="마무리 멘트 사진"
          slots={slots}
          onChange={(next) => set({ imageIds: next.filter((x): x is string => !!x) })}
        />
      </PanelSection>
    </div>
  );
}

// ---------------- brand ----------------
function BrandPanel() {
  return (
    <div className="panel-body">
      <p className="notice">브랜드 소개는 청첩장 맨 아래에 항상 표시되며, 순서를 바꾸거나 숨기거나 편집할 수 없어요.</p>
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
        <Toggle label="지도 앱 버튼 (카카오맵·네이버지도·티맵)" checked={section.data.showMapLinks} onChange={(showMapLinks) => set({ showMapLinks })} />
      </PanelSection>
      <CoreLink what="장소">
        <VenueFields doc={doc} dispatch={dispatch} />
      </CoreLink>
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

export function SectionPanel(props: { doc: InvitationDoc; section: Section; dispatch: (a: EditorAction) => void }) {
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
    case 'couple':
      return <CouplePanel {...props} section={section} />;
    case 'profile':
      return <ProfilePanel {...props} section={section} />;
    case 'rsvp':
      return <RsvpPanel {...props} section={section} />;
    case 'snap':
      return <SnapPanel {...props} section={section} />;
    case 'closing':
      return <ClosingPanel {...props} section={section} />;
    case 'brand':
      return <BrandPanel />;
    case 'location':
      return <LocationPanel {...props} section={section} />;
    case 'account':
      return <AccountPanel {...props} section={section} />;
    case 'guestbook':
      return <GuestbookPanel {...props} section={section} />;
  }
}
