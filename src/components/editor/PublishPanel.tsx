// 청첩장 만들기: 제목·링크 입력 (CONSTITUTION §6.6)
import { useState } from 'react';
import type { InvitationDoc } from '../../types/invitation';
import type { EditorAction } from '../../store/editorReducer';
import { autoTitle, defaultSlug, linkPrefix, normalizeSlug, validateSlug } from '../../lib/publish';
import { Field, TextField } from '../common/fields';
import { toast } from '../common/toast';

export function PublishPanel({ doc, dispatch }: { doc: InvitationDoc; dispatch: (a: EditorAction) => void }) {
  const [touched, setTouched] = useState(false);
  const error = validateSlug(doc.slug);
  const showError = touched && error;

  const submit = () => {
    setTouched(true);
    if (error) return;
    toast('청첩장 발행은 서버 연동 후 제공돼요');
  };

  return (
    <div className="publish">
      <TextField
        label="청첩장 제목"
        placeholder={autoTitle(doc)}
        value={doc.title}
        maxLength={40}
        onChange={(title) => dispatch({ type: 'SET_PUBLISH', patch: { title } })}
        hint="링크를 공유할 때 보이는 제목이에요. 비워두면 위 예시처럼 자동으로 만들어져요."
      />
      <Field label="링크" hint={showError ? undefined : '영문 소문자, 숫자, 하이픈(-)만 쓸 수 있어요.'} htmlFor="publish-slug">
        <div className={`slug-input${showError ? ' is-error' : ''}`}>
          <span className="slug-prefix">{linkPrefix()}</span>
          <input
            id="publish-slug"
            className="slug-field"
            value={doc.slug}
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={!!showError}
            aria-describedby={showError ? 'publish-slug-error' : undefined}
            onChange={(e) => dispatch({ type: 'SET_PUBLISH', patch: { slug: normalizeSlug(e.target.value) } })}
            onBlur={() => setTouched(true)}
          />
        </div>
        {showError && (
          <p id="publish-slug-error" className="field-error" role="alert">
            {error}
          </p>
        )}
      </Field>
      <button
        type="button"
        className="link-btn slug-reset"
        onClick={() => dispatch({ type: 'SET_PUBLISH', patch: { slug: defaultSlug(doc.core.datetime) } })}
      >
        자동 링크 다시 만들기
      </button>
      <button type="button" className="btn btn-primary btn-lg publish-submit" onClick={submit}>
        청첩장 만들기
      </button>
    </div>
  );
}
