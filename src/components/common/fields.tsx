import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';

export function Field({ label, hint, children, htmlFor }: { label: string; hint?: ReactNode; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

type TextProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  label: string;
  hint?: ReactNode;
  value: string;
  onChange: (v: string) => void;
};

export function TextField({ label, hint, value, onChange, ...rest }: TextProps) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <input id={id} className="input" value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
    </Field>
  );
}

type AreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> & {
  label: string;
  hint?: ReactNode;
  value: string;
  onChange: (v: string) => void;
};

export function TextArea({ label, hint, value, onChange, rows = 4, ...rest }: AreaProps) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <textarea id={id} className="input" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
    </Field>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="toggle-row">
      <span>
        <span className="toggle-label">{label}</span>
        {hint && <span className="field-hint">{hint}</span>}
      </span>
      <input type="checkbox" role="switch" className="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <Field label={label}>
      <div className="segmented" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            className={value === o.value ? 'is-on' : ''}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </Field>
  );
}

export function PanelSection({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="panel-section">
      <header>
        <h3>{title}</h3>
        {aside}
      </header>
      {children}
    </section>
  );
}
