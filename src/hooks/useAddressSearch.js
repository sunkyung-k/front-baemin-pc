import { openKakaoAddressSearch } from "@/utills/kakaoAddressSearch";

/**
 * useAddressSearch 훅
 * @param {Function} onComplete 주소 선택 시 실행되는 콜백
 */
export function useAddressSearch(onComplete) {
  const openAddressSearch = () => {
    openKakaoAddressSearch((address) => {
      if (onComplete) onComplete(address);
    });
  };

  return { openAddressSearch };
}
