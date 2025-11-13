import { openDaumPostcode } from "@/config/kakao/postcode";
import { useAddressStore } from "@/store/useAddressStore";

export function useAddressSearch() {
  const setAddress = useAddressStore((state) => state.setAddress);

  const openAddressSearch = () => {
    openDaumPostcode((addr) => {
      setAddress(addr);
      console.log("주소 선택:", addr);
    });
  };

  return { openAddressSearch };
}
