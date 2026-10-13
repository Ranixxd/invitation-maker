// 손그림(크레용) 하트 이미지 (예식 일자 하이라이트·히어로 이름 사이 공용)
import heartCrayon from '../../assets/decor/heart-crayon.png';

export function HeartScribble({ className }: { className: string }) {
  return <img className={`heart-scribble ${className}`} src={heartCrayon} alt="" aria-hidden draggable={false} />;
}
