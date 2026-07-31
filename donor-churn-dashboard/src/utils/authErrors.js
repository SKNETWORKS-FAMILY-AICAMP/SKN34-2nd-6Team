const MESSAGES = {
  'auth/email-already-in-use': '이미 가입된 이메일입니다.',
  'auth/invalid-email': '올바른 이메일 형식이 아닙니다.',
  'auth/weak-password': '비밀번호는 6자 이상이어야 합니다.',
  'auth/user-not-found': '가입되지 않은 이메일입니다.',
  'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
  'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'auth/popup-closed-by-user': '로그인 창이 닫혔습니다. 다시 시도해 주세요.',
}

export function getAuthErrorMessage(error) {
  return MESSAGES[error?.code] ?? '요청 처리 중 오류가 발생했습니다. 다시 시도해 주세요.'
}
