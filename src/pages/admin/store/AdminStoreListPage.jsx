import React from "react";
import StoreListLayout from "@/components/store/StoreListLayout";
import { useAdminStoreFilters } from "@/hooks/admin/useAdminStoreFilters";
import { useAdminStoreList } from "@/hooks/admin/useAdminStoreList";

export default function AdminStoreListPage() {
  const { filters, setCategory, setSearchText, setSort, setPage } =
    useAdminStoreFilters();

  const { stores, pageInfo } = useAdminStoreList(filters);

  return (
    <StoreListLayout
      filters={filters}
      setCategory={setCategory}
      setSearchText={setSearchText}
      setSort={setSort}
      stores={stores}
      pageInfo={pageInfo}
      isAdmin
      onPageChange={setPage}
    />
  );
}
