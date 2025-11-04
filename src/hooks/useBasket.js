import { useQuery, useMutation } from "@tanstack/react-query";
import basketAPI from "@/service/basketAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAfterMutation, AFTER_TYPES } from "@/hooks/common/useAfterMutation";
import { useBasketStore } from "@/store/useBasketStore";
import { authStore } from "@/store/authStore";

export const useBasket = () => {
  const { setBasket, clearBasket } = useBasketStore();
  const { userRole } = authStore.getState();
  const isUser = userRole?.includes("USER");

  const afterMutation = useAfterMutation(AFTER_TYPES.DETAIL, async () => {
    if (!isUser) return null;
    const data = await basketAPI.getMyBasket();
    setBasket(data);
    return data;
  });

  const basketQuery = useQuery({
    queryKey: QUERY_KEYS.BASKET,
    queryFn: basketAPI.getMyBasket,
    enabled: isUser,
    onSuccess: (data) => setBasket(data),
    onError: (err) => {
      console.warn("[useBasket] 장바구니 조회 실패:", err?.message);
      clearBasket();
    },
  });

  /** ✅ 메뉴 추가 (다른 가게 확인 로직 포함, 수정본) */
  const addMenu = useMutation({
    mutationFn: async (payload) => {
      const currentBasket = basketQuery?.data;
      const currentStoreId = currentBasket?.storeId ?? null;
      const newStoreId = payload?.menu?.storeId ?? null;

      console.log("[useBasket] 기존 storeId:", currentStoreId);
      console.log("[useBasket] 새 storeId:", newStoreId);

      // confirm 조건 검증
      if (currentStoreId && newStoreId && currentStoreId !== newStoreId) {
        const confirmChange = window.confirm(
          "다른 음식점에서 이미 담은 메뉴가 있습니다.\n담긴 메뉴를 취소하고 새로운 음식점에서 메뉴를 담을까요?"
        );

        if (!confirmChange) {
          console.log("[useBasket] 사용자 취소 → 담기 중단");
          // 에러를 던져야 React Query가 요청 중단으로 인식함
          throw new Error("사용자가 메뉴 담기를 취소했습니다.");
        }

        // 확인 시 기존 장바구니 비우기
        await basketAPI.clearAll();
        console.log("[useBasket] 기존 장바구니 초기화 완료");
      }

      // 새 메뉴 추가 요청
      return basketAPI.addMenu(payload);
    },
    onSettled: () => isUser && afterMutation(QUERY_KEYS.BASKET),
  });

  const removeItem = useMutation({
    mutationFn: basketAPI.removeItem,
    onSettled: () => isUser && afterMutation(QUERY_KEYS.BASKET),
  });

  const increase = useMutation({
    mutationFn: basketAPI.increaseItem,
    onSettled: () => isUser && afterMutation(QUERY_KEYS.BASKET),
  });

  const decrease = useMutation({
    mutationFn: basketAPI.decreaseItem,
    onSettled: () => isUser && afterMutation(QUERY_KEYS.BASKET),
  });

  const clearAll = useMutation({
    mutationFn: basketAPI.clearAll,
    onSettled: async () => {
      clearBasket();
      if (isUser) await afterMutation(QUERY_KEYS.BASKET);
    },
  });

  const orderAll = useMutation({
    mutationFn: basketAPI.orderAll,
    onSettled: () => isUser && afterMutation(QUERY_KEYS.BASKET),
  });

  return {
    basketQuery,
    addMenu,
    removeItem,
    increase,
    decrease,
    clearAll,
    orderAll,
  };
};

export default useBasket;
