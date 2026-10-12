import { useRef, useState, type DragEvent, type ReactNode } from 'react';

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="phone">
      <div className="phone-notch" aria-hidden />
      <div className="phone-screen">{children}</div>
    </div>
  );
}

export function PhotoDrop({
  onFiles,
  busy,
  children,
  compact,
}: {
  onFiles: (files: File[]) => void;
  busy?: boolean;
  children?: ReactNode;
  compact?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    onFiles(Array.from(e.dataTransfer.files));
  };
  return (
    <div
      className={`dropzone${over ? ' is-over' : ''}${compact ? ' is-compact' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
    >
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) onFiles(Array.from(e.target.files));
          e.target.value = '';
        }}
      />
      <button type="button" className="btn btn-primary" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? '사진 처리 중…' : '사진 선택'}
      </button>
      {children ?? <p className="field-hint">또는 여기에 사진을 끌어다 놓으세요</p>}
    </div>
  );
}
