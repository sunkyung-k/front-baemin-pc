import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAddressStore } from "@/store/useAddressStore";

/**
 * useStoreFilters
 * --------------------------------------------
 * - 가게 리스트 필터(주소, 카테고리, 검색어) 상태를 통합 관리하는 커스텀 훅
 * - Home, StoreListLayout, StoreTopBar 등에서 중복 로직 제거
 * --------------------------------------------
 */
export function useStoreFilters() {
  const location = useLocation();
  const navigate = useNavigate();
  const { address, setAddress } = useAddressStore();

  /** 초기 필터값 세팅 */
  const [filters, setFilters] = useState(() => {
    const params = new URLSearchParams(location.search);
    return {
      caId: Number(params.get("caId")) || 0,
      searchText: params.get("searchText") || "",
    };
  });

  /** URL 자동 동기화 */
  useEffect(() => {
    const newParams = new URLSearchParams();
    newParams.set("caId", filters.caId ?? 0);
    if (filters.searchText) newParams.set("searchText", filters.searchText);
    if (address) newParams.set("addr", address);

    const newSearch = newParams.toString();

    const currentSearch = window.location.search.replace(/^\?/, "");
    if (newSearch !== currentSearch) {
      navigate(`${location.pathname}?${newSearch}`, { replace: true });
    }
  }, [filters, address, location.pathname, navigate]);

  /** 카테고리 변경 */
  const setCategory = useCallback(
    (caId) => setFilters((prev) => ({ ...prev, caId })),
    []
  );

  /** 검색어 변경 */
  const setSearchText = useCallback(
    (text) => setFilters((prev) => ({ ...prev, searchText: text })),
    []
  );

  return { filters, setCategory, setSearchText, address, setAddress };
}
