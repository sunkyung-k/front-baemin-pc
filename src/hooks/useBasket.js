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

  /** 후처리 훅 (React Query 캐시 + Zustand 동기화) */
  const afterMutation = useAfterMutation(AFTER_TYPES.DETAIL, async () => {
    if (!isUser) return null;
    const data = await basketAPI.getMyBasket();
    setBasket(data);
    return data;
  });

  /** 장바구니 조회 */
  const basketQuery = useQuery({
    queryKey: QUERY_KEYS.BASKET,
    queryFn: basketAPI.getMyBasket,
    enabled: isUser,
    onSuccess: (data) => setBasket(data),
    onError: clearBasket,
  });

  /** 메뉴 추가 (다른 가게일 경우 confirm 처리) */
  const addMenu = useMutation({
    mutationFn: async (payload) => {
      const currentStoreId = basketQuery?.data?.storeId ?? null;
      const newStoreId = payload?.menu?.storeId ?? null;

      if (currentStoreId && newStoreId && currentStoreId !== newStoreId) {
        const confirmChange = window.confirm(
          "다른 음식점에서 이미 담은 메뉴가 있습니다.\n담긴 메뉴를 취소하고 새로운 음식점에서 메뉴를 담을까요?"
        );
        if (!confirmChange)
          throw new Error("사용자가 메뉴 담기를 취소했습니다.");
        await basketAPI.clearAll();
      }

      return basketAPI.addMenu(payload);
    },
    onSettled: () => isUser && afterMutation(QUERY_KEYS.BASKET),
  });

  /** 항목 삭제 */
  const removeItem = useMutation({
    mutationFn: basketAPI.removeItem,
    onSettled: () => isUser && afterMutation(QUERY_KEYS.BASKET),
  });

  /** 수량 증가 */
  const increase = useMutation({
    mutationFn: basketAPI.increaseItem,
    onSettled: () => isUser && afterMutation(QUERY_KEYS.BASKET),
  });

  /** 수량 감소 */
  const decrease = useMutation({
    mutationFn: basketAPI.decreaseItem,
    onSettled: () => isUser && afterMutation(QUERY_KEYS.BASKET),
  });

  /** 전체 비우기 */
  const clearAll = useMutation({
    mutationFn: basketAPI.clearAll,
    onSettled: async () => {
      clearBasket();
      if (isUser) await afterMutation(QUERY_KEYS.BASKET);
    },
  });

  /** 전체 주문 */
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
