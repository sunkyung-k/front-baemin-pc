import React from "react";
import StoreTopBar from "@/components/store/StoreTopBar";
import StoreList from "@/components/store/StoreList";
import "@/assets/scss/pages/store/store.scss";

export default function StoreListLayout({
  filters,
  setCategory,
  setSearchText,
  setSort,
  stores,
  pageInfo,
  isAdmin = false,
  onPageChange,
}) {
  return (
    <>
      <StoreTopBar
        filters={filters}
        setCategory={setCategory}
        setSearchText={setSearchText}
        isAdmin={isAdmin}
      />

      <StoreList
        filters={filters}
        setSort={setSort}
        stores={stores}
        pageInfo={pageInfo}
        isAdmin={isAdmin}
        onPageChange={onPageChange}
      />
    </>
  );
}
