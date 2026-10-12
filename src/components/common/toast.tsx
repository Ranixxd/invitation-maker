import { useEffect, useState } from 'react';

const EVENT = 'app:toast';

export function toast(message: string) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: message }));
}

export async function copyText(text: string, done = '복사되었습니다') {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  toast(done);
}

export function ToastHost() {
  const [msg, setMsg] = useState<{ text: string; key: number } | null>(null);
  useEffect(() => {
    const on = (e: Event) => setMsg({ text: (e as CustomEvent<string>).detail, key: Date.now() });
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 1800);
    return () => clearTimeout(t);
  }, [msg]);
  return (
    <div className="toast-host" role="status" aria-live="polite">
      {msg && (
        <div key={msg.key} className="toast">
          {msg.text}
        </div>
      )}
    </div>
  );
}
