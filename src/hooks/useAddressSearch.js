import { openDaumPostcode } from "@/config/kakao/postcode";
import { useAddressStore } from "@/store/useAddressStore";

export function useAddressSearch(onSelect) {
  const setAddress = useAddressStore((state) => state.setAddress);

  const openAddressSearch = () => {
    openDaumPostcode((addr) => {
      // 1) 전역 주소 업데이트
      setAddress(addr);

      // 2) 원하면 local에도 반영 가능
      if (typeof onSelect === "function") {
        onSelect(addr);
      }

      // console.log("주소 선택:", addr);
    });
  };

  return { openAddressSearch };
}
