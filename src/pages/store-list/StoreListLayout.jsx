import React from "react";
import { Outlet } from "react-router-dom";
import { useCurrentAddress } from "@/hooks/useCurrentAddress";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import AddressInput from "@/components/store/AddressInput";
import StoreTopBar from "./StoreTopBar";
import styles from "./StoreListLayout.module.scss";

export default function StoreListLayout() {
  // 주소/카테고리/검색어 모두 useStoreFilters로 통합
  const { filters, setCategory, setSearchText, address, setAddress } =
    useStoreFilters();
  const { fetchAddress, loading } = useCurrentAddress();
  const { openAddressSearch } = useAddressSearch(setAddress);

  return (
    <>
      <section className={styles.addressSection}>
        <AddressInput
          variant="compact"
          value={address}
          setValue={setAddress}
          onGetLocation={fetchAddress}
          onSearchAddress={openAddressSearch}
          loading={loading}
        />
      </section>

      <StoreTopBar
        filters={filters}
        setCategory={setCategory}
        setSearchText={setSearchText}
      />
      <Outlet context={{ filters, setCategory, setSearchText }} />
    </>
  );
}
