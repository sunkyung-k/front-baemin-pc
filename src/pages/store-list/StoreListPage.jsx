import StoreListLayout from "@/components/store/StoreListLayout";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import { useStoreList } from "@/hooks/useStoreList";

export default function StoreListPage() {
  const { filters, setCategory, setSearchText, setSort } = useStoreFilters();
  const { stores, pageInfo } = useStoreList(filters);

  return (
    <StoreListLayout
      filters={filters}
      setCategory={setCategory}
      setSearchText={setSearchText}
      setSort={setSort}
      stores={stores}
      pageInfo={pageInfo}
      isAdmin={false}
    />
  );
}
