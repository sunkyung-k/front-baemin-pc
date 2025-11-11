import { useQuery, useMutation } from "@tanstack/react-query";
import basketAPI from "@/service/basketAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAfterMutation, AFTER_TYPES } from "@/hooks/common/useAfterMutation";
import { useBasketStore } from "@/store/useBasketStore";
import { authStore } from "@/store/authStore";

/**
 * useBasket 훅 (정식 Lock 동기화 반영)
 * ------------------------------------------------------
 * - React Query + Zustand 병행 관리 구조
 * - clearBasket() 시 Lock 활성화 → invalidate 후 releaseLock()
 * - 장바구니 / 결제 페이지 공용 훅
 */
export const useBasket = () => {
  const { setBasket, clearBasket, releaseLock } = useBasketStore(); // releaseLock 추가
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
    onSuccess: (data) => {
      setBasket(data);
      releaseLock(); // refetch 완료 → Lock 해제
    },
    onError: (err) => {
      console.error("❌ useBasket.getMyBasket Error:", err);
      clearBasket();
      releaseLock(); // 에러 시에도 Lock 해제
    },
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

        // 서버 비우기
        await basketAPI.clearAll();

        // React Query 캐시 강제 무효화 (중요!)
        await basketQuery.refetch();
      }

      // 최신 basketQuery 데이터 기준으로 다시 추가
      return basketAPI.addMenu(payload);
    },
    onSettled: () => isUser && afterMutation(QUERY_KEYS.BASKET),
  });

  /** 항목 삭제 */
  const removeItem = useMutation({
    mutationFn: basketAPI.removeItem,
    onMutate: () => clearBasket(),
    onSettled: async () => {
      if (isUser) {
        await afterMutation(QUERY_KEYS.BASKET);
        releaseLock();
      }
    },
  });

  /** 수량 증가 */
  const increase = useMutation({
    mutationFn: basketAPI.increaseItem,
    onSettled: async () => {
      if (isUser) {
        await afterMutation(QUERY_KEYS.BASKET);
        releaseLock();
      }
    },
  });

  /** 수량 감소 */
  const decrease = useMutation({
    mutationFn: basketAPI.decreaseItem,
    onSettled: async () => {
      if (isUser) {
        await afterMutation(QUERY_KEYS.BASKET);
        releaseLock();
      }
    },
  });

  /** 전체 비우기 */
  const clearAll = useMutation({
    mutationFn: basketAPI.clearAll,
    onMutate: () => {
      clearBasket(); // Lock 자동 설정됨
    },
    onSettled: async () => {
      if (isUser) {
        await afterMutation(QUERY_KEYS.BASKET);
        releaseLock();
      }
    },
  });

  return {
    basketQuery,
    addMenu,
    removeItem,
    increase,
    decrease,
    clearAll,
  };
};

export default useBasket;
