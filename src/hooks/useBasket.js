import { useQuery, useMutation } from "@tanstack/react-query";
import basketAPI from "@/service/basketAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAfterMutation, AFTER_TYPES } from "@/hooks/common/useAfterMutation";
import { useBasketStore } from "@/store/useBasketStore";
import { authStore } from "@/store/authStore";

/**
 * useBasket 훅
 * - React Query(서버 캐시) + Zustand(로컬 UI 상태) 병행 관리
 * - clearBasket 시 Lock 활성화 → refetch 후 releaseLock 호출으로 동기화
 * - 제공 API: basketQuery, addMenu, removeItem, increase, decrease, clearAll
 */
export const useBasket = () => {
  const { setBasket, clearBasket, releaseLock } = useBasketStore();
  const { userRole } = authStore.getState();
  const isUser = userRole?.includes("USER");

  // CRUD 후처리 훅: 상세 재조회 또는 Zustand 동기화 용도
  const afterMutation = useAfterMutation(AFTER_TYPES.DETAIL, async () => {
    if (!isUser) return null;
    const data = await basketAPI.getMyBasket();
    setBasket(data);
    return data;
  });

  // 장바구니 조회 (로그인된 사용자만 활성화)
  const basketQuery = useQuery({
    queryKey: QUERY_KEYS.BASKET,
    queryFn: basketAPI.getMyBasket,
    enabled: isUser,
    onSuccess: (data) => {
      // React Query에서 받아온 최신 장바구니를 Zustand에 동기화
      setBasket(data);
      // refetch 완료 시 Lock 해제
      releaseLock();
    },
    onError: () => {
      // 실패 시 로컬 상태 초기화 및 Lock 해제
      clearBasket();
      releaseLock();
    },
  });

  /** 메뉴 추가
   * ------------------------------------------------------
   * - 다른 가게의 메뉴가 있으면 confirm 후 기존 장바구니 초기화
   */
  const addMenu = useMutation({
    mutationFn: async (payload) => {
      const currentStoreId = basketQuery?.data?.storeId ?? null;
      const newStoreId = payload?.menu?.storeId ?? null;

      // 다른 가게 메뉴 담기 시 경고 후 초기화
      if (currentStoreId && newStoreId && currentStoreId !== newStoreId) {
        const confirmChange = window.confirm(
          "다른 음식점에서 이미 담은 메뉴가 있습니다.\n담긴 메뉴를 취소하고 새로운 음식점에서 메뉴를 담을까요?"
        );
        if (!confirmChange)
          throw new Error("사용자가 메뉴 담기를 취소했습니다.");

        await basketAPI.clearAll();
        await basketQuery.refetch();
      }
      return basketAPI.addMenu(payload);
    },
    onSettled: () => isUser && afterMutation(QUERY_KEYS.BASKET),
  });

  /**
   * 항목 삭제
   * - onMutate로 로컬 초기화(optimistic 방지) 처리
   * - settled 시 캐시 재동기화 및 Lock 해제
   */
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

  /**
   * 수량 증가
   * - 서버 API에 위임
   * - settled 시 상세/로컬 동기화
   */
  const increase = useMutation({
    mutationFn: basketAPI.increaseItem,
    onSettled: async () => {
      if (isUser) {
        await afterMutation(QUERY_KEYS.BASKET);
        releaseLock();
      }
    },
  });

  /**
   * 수량 감소
   */
  const decrease = useMutation({
    mutationFn: basketAPI.decreaseItem,
    onSettled: async () => {
      if (isUser) {
        await afterMutation(QUERY_KEYS.BASKET);
        releaseLock();
      }
    },
  });

  /**
   * 전체 비우기
   * - onMutate에서 로컬 상태 비워 잠금 표시
   * - settled 시 캐시 재동기화 및 Lock 해제
   */
  const clearAll = useMutation({
    mutationFn: basketAPI.clearAll,
    onMutate: () => clearBasket(),
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
