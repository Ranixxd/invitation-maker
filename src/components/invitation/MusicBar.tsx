// 음악 재생 바 (히어로 하단). 음악 파일(src)이 있으면 실제로 재생하고,
// 아직 없으면(배경음악 연결 전, plan.md) 재생 모습만 보여준다.
import { useEffect, useRef, useState } from 'react';

const IconPlay = () => (
  <svg viewBox="0 0 24 24" aria-hidden>
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
  </svg>
);
const IconPause = () => (
  <svg viewBox="0 0 24 24" aria-hidden>
    <rect x="6.5" y="5" width="4" height="14" rx="1.2" />
    <rect x="13.5" y="5" width="4" height="14" rx="1.2" />
  </svg>
);

/** 플레이어 변형(크림 티켓)의 양옆 장식 아이콘: 소리 작게 · 이전 · 다음 · 소리 크게 */
const line = (d: string) => (
  <svg viewBox="0 0 24 24" aria-hidden>
    <path d={d} />
  </svg>
);
const IconVolDown = () => line('M4 9.5h3l4-3.5v12l-4-3.5H4z M15 12h5');
const IconPrev = () => line('M7 5v14 M18 6 9.5 12 18 18z');
const IconNext = () => line('M17 5v14 M6 6l8.5 6L6 18z');
const IconVolUp = () => line('M4 9.5h3l4-3.5v12l-4-3.5H4z M15 12h5 M17.5 9.5v5');

export function MusicBar({ title, src, variant = 'bar' }: { title: string; src?: string; variant?: 'bar' | 'player' }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0~1 (실제 음악일 때)

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    const onTime = () => setProgress(a.duration ? a.currentTime / a.duration : 0);
    const onEnd = () => setPlaying(false);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('ended', onEnd);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('ended', onEnd);
    };
  }, [src]);

  const toggle = () => {
    const a = audio.current;
    if (a) {
      if (playing) a.pause();
      else void a.play().catch(() => setPlaying(false));
    }
    setPlaying((p) => !p);
  };

  const playButton = (
    <button type="button" className="music-btn" onClick={toggle} aria-label={playing ? '배경음악 일시정지' : '배경음악 재생'}>
      {playing ? <IconPause /> : <IconPlay />}
    </button>
  );

  // 플레이어: 가운데 큰 재생 버튼, 양옆 장식 아이콘 (곡 제목은 버튼 이름으로만)
  if (variant === 'player') {
    return (
      <div className={`music-player${playing ? ' is-playing' : ''}`} title={title}>
        {src && <audio ref={audio} src={src} preload="none" loop />}
        <span className="music-player-side" aria-hidden>
          <IconVolDown />
          <IconPrev />
        </span>
        {playButton}
        <span className="music-player-side" aria-hidden>
          <IconNext />
          <IconVolUp />
        </span>
      </div>
    );
  }

  return (
    <div className={`music-bar${playing ? ' is-playing' : ''}${src ? '' : ' is-demo'}`}>
      {src && <audio ref={audio} src={src} preload="none" loop />}
      {playButton}
      <div className="music-info">
        <p className="music-title">{title}</p>
        <div className="music-track" aria-hidden>
          <span className="music-fill" style={src ? { width: `${progress * 100}%` } : undefined} />
        </div>
      </div>
      <span className="music-eq" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}
