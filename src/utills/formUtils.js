/**
 * dummyRegister
 * RHF(register) 대신 사용할 더미 함수
 * RHF를 사용하지 않는 폼(수정폼 등)에서 InputField 재사용 시 에러 방지용
 */
export const dummyRegister = (name) => ({
  name,
  onChange: () => {},
  onBlur: () => {},
  ref: null,
});

/**
 * safeRegister
 * RHF를 쓰든, 안 쓰든 안전하게 register를 처리하기 위한 헬퍼
 * RHF 폼에선 register(name)을 반환, 아니면 dummyRegister(name)을 반환
 */
export const safeRegister = (register, name) => {
  if (typeof register === "function") return register(name);
  return dummyRegister(name);
};
