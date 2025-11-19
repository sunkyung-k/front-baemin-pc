import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAddressStore } from "@/store/useAddressStore";

/**
 * useStoreFilters
 * --------------------------------------------
 * - 카테고리 / 검색어 / 정렬 상태만 관리
 * - 주소는 전역 주소 스토어에서 단독 관리
 * - URL과 상태 자동 동기화
 * --------------------------------------------
 */
export function useStoreFilters() {
  const location = useLocation();
  const navigate = useNavigate();

  // 전역 주소 단독 관리 (여기서는 값만 들고오기)
  const address = useAddressStore((s) => s.address);

  const [filters, setFilters] = useState(() => {
    const params = new URLSearchParams(location.search);
    return {
      caId: Number(params.get("caId")) || 0,
      searchText: params.get("searchText") || "",
      sort: params.get("sort") || "ratingAvg,desc",
      page: Number(params.get("page")) || 0,
    };
  });

  /** URL 자동 동기화 */
  useEffect(() => {
    const newParams = new URLSearchParams();

    newParams.set("caId", filters.caId ?? 0);
    newParams.set("page", filters.page ?? 0);

    if (filters.searchText) newParams.set("searchText", filters.searchText);
    if (filters.sort) newParams.set("sort", filters.sort);

    // 전역 주소 동기화
    if (address) newParams.set("addr", address);

    const newSearch = newParams.toString();
    const currentSearch = window.location.search.replace(/^\?/, "");

    if (newSearch !== currentSearch) {
      navigate(`${location.pathname}?${newSearch}`, { replace: true });
    }
  }, [filters, address, location.pathname, navigate]);

  // setter ---------------------------------------------------
  const setCategory = useCallback(
    (caId) => setFilters((prev) => ({ ...prev, caId })),
    []
  );

  const setSearchText = useCallback(
    (text) => setFilters((prev) => ({ ...prev, searchText: text })),
    []
  );

  const setSort = useCallback(
    (sort) => setFilters((prev) => ({ ...prev, sort })),
    []
  );

  const setPage = useCallback(
    (page) => setFilters((prev) => ({ ...prev, page })),
    []
  );

  return { filters, setCategory, setSearchText, setSort, setPage };
}
