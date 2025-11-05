/**
 * ------------------------------------
 * 입력값 포맷 / 정제 공용 유틸
 * - `formatPhone()`      : 전화번호 보기 좋게 포맷 (01012345678 → 010-1234-5678)
 * - `formatPrice()`      : 금액을 3자리 콤마로 포맷 (10000 → 10,000)
 * - `cleanNumber()`      : 문자열에서 숫자만 추출 ("010-1234-5678" → "01012345678")
 * - `parseNumber()`      : 금액 문자열을 숫자형으로 변환 ("12,000" → 12000)
 * - `formatBusinessNo()` : 사업자등록번호 포맷 (0000000000 → 000-00-00000)
 * ------------------------------------
 * 사용 예시:
 * import { formatPhone, formatBusinessNo, cleanNumber } from "@/utills/valueFormatter";
 *
 * formatPhone("01012345678");       // "010-1234-5678"
 * formatPrice("1000000");           // "1,000,000"
 * cleanNumber("010-2222-3333");     // "01022223333"
 * parseNumber("15,000");            // 15000
 * formatBusinessNo("1234567890");   // "123-45-67890"
 * ------------------------------------
 */

/**
 * 전화번호 포맷: 숫자 → 하이픈 포함
 *
 * @example
 * formatPhone("01012345678") // "010-1234-5678"
 * formatPhone("021234567")   // "02-123-4567"
 */
export const formatPhone = (val = "") => {
  const digits = val.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("02")) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length <= 9)
      return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }

  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 11)
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  return digits;
};

/**
 * 금액 포맷: 숫자 → 3자리 콤마
 *
 * @example
 * formatPrice("12000")   // "12,000"
 * formatPrice("1000000") // "1,000,000"
 */
export const formatPrice = (val = "") => {
  const digits = val.replace(/\D/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * 문자열 → 숫자만 남기기
 *
 * @example
 * cleanNumber("010-1234-5678") // "01012345678"
 * cleanNumber("12,000원")      // "12000"
 */
export const cleanNumber = (val = "") => val.replace(/\D/g, "");

/**
 * 문자열 → 숫자형 변환 ("12,000" → 12000)
 *
 * @example
 * parseNumber("12,000") // 12000
 * parseNumber("500")    // 500
 */
export const parseNumber = (val = "") => Number(val.replace(/,/g, ""));

/**
 * 사업자등록번호 포맷: 숫자 → 하이픈 포함
 *
 * @example
 * formatBusinessNo("1234567890")  // "123-45-67890"
 * formatBusinessNo("123-45-67890") // "123-45-67890" (이미 포맷된 경우 유지)
 */
export const formatBusinessNo = (val = "") => {
  const digits = val.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 10)}`;
};

/**
 * 생년월일 포맷: YYYYMMDD → YYYY-MM-DD
 *
 * @example
 * formatBirth("19930810") // "1993-08-10"
 */
export const formatBirth = (val = "") => {
  const digits = val.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
};

/**
 * 생년월일 정제: YYYY-MM-DD → YYYYMMDD
 *
 * @example
 * cleanBirth("1993-08-10") // "19930810"
 */
export const cleanBirth = (val = "") => val.replace(/\D/g, "");
