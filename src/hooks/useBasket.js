import { useQuery, useMutation } from "@tanstack/react-query";
import basketAPI from "@/service/basketAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAfterMutation, AFTER_TYPES } from "@/hooks/common/useAfterMutation";
import { useBasketStore } from "@/store/useBasketStore";
import { authStore } from "@/store/authStore";

/**
 * useBasket 훅
 * - USER 역할 및 유효한 인증 상태일 때만 API 호출을 시도합니다.
 */
export const useBasket = () => {
  const { setBasket, clearBasket, releaseLock } = useBasketStore();

  // Zustand의 reactive selector를 사용하여 상태 변화에 반응합니다.
  const isAuthenticated = authStore((s) => s.isAuthenticated);
  const getUserRole = authStore((s) => s.getUserRole);

  const role = getUserRole() || "GUEST";
  const isUser = role.includes("USER");

  // 최종 API 호출 허용 조건: USER 역할이면서 현재 인증된 상태일 때만 true
  const isUserAllowed = isUser && isAuthenticated;

  // CRUD 후처리 훅: 상세 재조회 또는 Zustand 동기화 용도
  const afterMutation = useAfterMutation(AFTER_TYPES.DETAIL, async () => {
    // isUserAllowed를 사용
    if (!isUserAllowed) return null;
    const data = await basketAPI.getMyBasket();
    setBasket(data);
    return data;
  });

  // 장바구니 조회 (로그인된 사용자만 활성화)
  const basketQuery = useQuery({
    queryKey: QUERY_KEYS.BASKET,
    queryFn: basketAPI.getMyBasket,
    enabled: isUserAllowed,
    onSuccess: (data) => {
      setBasket(data);
      releaseLock();
    },
    onError: () => {
      clearBasket();
      releaseLock();
    },
  });

  /** 메뉴 추가 */
  const addMenu = useMutation({
    mutationFn: async (payload) => {
      if (!isUserAllowed) throw new Error("Unauthorized access.");

      const currentStoreId = basketQuery?.data?.storeId ?? null;
      const newStoreId = payload?.menu?.storeId ?? null;

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
    onSettled: () => isUserAllowed && afterMutation(QUERY_KEYS.BASKET),
  });

  /** 항목 삭제 */
  const removeItem = useMutation({
    mutationFn: basketAPI.removeItem,
    onMutate: () => clearBasket(),
    onSettled: async () => {
      if (isUserAllowed) {
        await afterMutation(QUERY_KEYS.BASKET);
        releaseLock();
      }
    },
  });

  /** 수량 증가 */
  const increase = useMutation({
    mutationFn: basketAPI.increaseItem,
    onSettled: async () => {
      if (isUserAllowed) {
        await afterMutation(QUERY_KEYS.BASKET);
        releaseLock();
      }
    },
  });

  /** 수량 감소 */
  const decrease = useMutation({
    mutationFn: basketAPI.decreaseItem,
    onSettled: async () => {
      if (isUserAllowed) {
        await afterMutation(QUERY_KEYS.BASKET);
        releaseLock();
      }
    },
  });

  /** 전체 비우기 */
  const clearAll = useMutation({
    mutationFn: basketAPI.clearAll,
    onMutate: () => clearBasket(),
    onSettled: async () => {
      if (isUserAllowed) {
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
