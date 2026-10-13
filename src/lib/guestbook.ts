// 방명록 비밀번호 (CONSTITUTION §4.4)
// 서버 연동 전 데모: 원문 대신 메시지 id를 소금으로 섞은 해시만 저장한다.
// 브라우저 저장소라 보안 장치가 아니며, 서버 도입 시 서버에서 해시·검증한다.

export const PW_MIN = 4;
export const PW_MAX = 20;
/** 템플릿 미리보기 예시 쪽지의 비밀번호 */
export const SAMPLE_PASSWORD = '0000';

/** FNV-1a 32비트 두 줄을 이어 붙인 결정적 해시 (데모용) */
export function hashPassword(messageId: string, password: string): string {
  const input = `${messageId}:${password}`;
  let a = 0x811c9dc5;
  let b = 0x01000193;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193);
    b = Math.imul(b ^ c ^ (i & 0xff), 0x811c9dc5);
  }
  return (a >>> 0).toString(16).padStart(8, '0') + (b >>> 0).toString(16).padStart(8, '0');
}

export const checkPassword = (messageId: string, password: string, hash: string | undefined) =>
  !!hash && hashPassword(messageId, password) === hash;
