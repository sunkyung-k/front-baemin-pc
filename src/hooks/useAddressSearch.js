import { openDaumPostcode } from "@/config/kakao/postcode";

/**
 * 주소 검색 훅 (Daum Postcode API)
 * --------------------------------------------------
 * - 다음(카카오) 주소검색 팝업을 열어 주소 선택
 * - 선택된 주소를 Zustand 전역 상태(setAddress)에 저장
 * - onComplete 콜백으로 결과 반환
 */
export function useAddressSearch(setAddress) {
  const openAddressSearch = () => {
    openDaumPostcode((addr) => {
      setAddress(addr);
      console.log("주소 선택:", addr);
    });
  };
  return { openAddressSearch };
}
