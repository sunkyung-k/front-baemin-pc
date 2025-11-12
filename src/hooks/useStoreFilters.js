import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAddressStore } from "@/store/useAddressStore";

/**
 * useStoreFilters
 * --------------------------------------------
 * - 주소 / 카테고리 / 검색어 / 정렬 상태를 통합 관리
 * - URL과 상태를 자동 동기화
 * --------------------------------------------
 */
export function useStoreFilters() {
  const location = useLocation();
  const navigate = useNavigate();
  const { address, setAddress } = useAddressStore();

  // ✅ sort 필터 추가
  const [filters, setFilters] = useState(() => {
    const params = new URLSearchParams(location.search);
    return {
      caId: Number(params.get("caId")) || 0,
      searchText: params.get("searchText") || "",
      sort: params.get("sort") || "ratingAvg,desc", // ⭐️ 기본 정렬 추가
    };
  });

  /** URL 자동 동기화 */
  useEffect(() => {
    const newParams = new URLSearchParams();
    newParams.set("caId", filters.caId ?? 0);
    if (filters.searchText) newParams.set("searchText", filters.searchText);
    if (filters.sort) newParams.set("sort", filters.sort); // ✅ 추가됨
    if (address) newParams.set("addr", address);

    const newSearch = newParams.toString();
    const currentSearch = window.location.search.replace(/^\?/, "");
    if (newSearch !== currentSearch) {
      navigate(`${location.pathname}?${newSearch}`, { replace: true });
    }
  }, [filters, address, location.pathname, navigate]);

  // ✅ setter 메서드 추가
  const setCategory = useCallback(
    (caId) => setFilters((prev) => ({ ...prev, caId })),
    []
  );

  const setSearchText = useCallback(
    (text) => setFilters((prev) => ({ ...prev, searchText: text })),
    []
  );

  const setSort = useCallback(
    (sort) => setFilters((prev) => ({ ...prev, sort })), // ✅ 새로 추가
    []
  );

  return { filters, setCategory, setSearchText, setSort, address, setAddress };
}
