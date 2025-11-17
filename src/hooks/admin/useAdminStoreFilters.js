import { useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";

export function useAdminStoreFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  // 초기값: URL → 상태
  const [filters, setFilters] = useState(() => ({
    caId: Number(searchParams.get("caId")) || 0,
    searchText: searchParams.get("searchText") || "",
    sort: searchParams.get("sort") || "ratingAvg,desc",
    page: Number(searchParams.get("page")) || 0,
  }));

  // 상태 → URL sync
  useEffect(() => {
    const params = {};

    if (filters.caId) params.caId = filters.caId;
    if (filters.searchText) params.searchText = filters.searchText;
    if (filters.sort) params.sort = filters.sort;
    if (filters.page) params.page = filters.page;

    setSearchParams(params);
  }, [filters, setSearchParams]);

  // setter들
  const setCategory = useCallback(
    (caId) => setFilters((p) => ({ ...p, caId, page: 0 })),
    []
  );

  const setSearchText = useCallback(
    (text) => setFilters((p) => ({ ...p, searchText: text, page: 0 })),
    []
  );

  const setSort = useCallback(
    (sort) => setFilters((p) => ({ ...p, sort, page: 0 })),
    []
  );

  const setPage = useCallback(
    (page) => setFilters((p) => ({ ...p, page })),
    []
  );

  return {
    filters,
    setCategory,
    setSearchText,
    setSort,
    setPage,
  };
}
