import React from "react";
import { Outlet } from "react-router-dom";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import { useAddressStore } from "@/store/useAddressStore";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import { useCurrentAddress } from "@/hooks/useCurrentAddress";
import StoreTopBar from "./StoreTopBar";

export default function StoreListLayout() {
  // 필터 관련: 카테고리/검색/정렬
  const { filters, setCategory, setSearchText, setSort } = useStoreFilters();

  // 주소 setter만 사용 (주소 값 자체는 필요 없음)
  const setAddress = useAddressStore((state) => state.setAddress);

  // 주소 검색 / 현재 위치
  const { openAddressSearch } = useAddressSearch(setAddress);
  const { fetchAddress } = useCurrentAddress();

  return (
    <>
      <StoreTopBar
        filters={filters}
        setCategory={setCategory}
        setSearchText={setSearchText}
        setSort={setSort}
        setAddress={setAddress}
        fetchAddress={fetchAddress}
        openAddressSearch={openAddressSearch}
      />

      {/* 자식 라우트 출력 */}
      <Outlet context={{ filters, setCategory, setSearchText, setSort }} />
    </>
  );
}
