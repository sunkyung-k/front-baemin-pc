import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAddressStore } from "@/store/useAddressStore";
import { useCurrentAddress } from "@/hooks/useCurrentAddress";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import SearchInput from "@/components/form/SearchInput";
import StoreTopBar from "./StoreTopBar";
import styles from "./StoreListLayout.module.scss";

export default function StoreListLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const activeCaId = query.get("caId") || "";
  const { address, setAddress } = useAddressStore();
  const { fetchAddress, loading } = useCurrentAddress();
  const { openAddressSearch } = useAddressSearch(setAddress);

  const [searchText, setSearchText] = useState("");

  // 주소 없으면 자동으로 URL에 addr 동기화
  useEffect(() => {
    const addr = query.get("addr");
    if (!addr && address) {
      const params = new URLSearchParams(query);
      params.set("addr", address);
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
  }, [address, location, navigate]);

  return (
    <>
      <section className={styles.addressSection}>
        <SearchInput
          mode="address"
          value={address}
          setValue={setAddress}
          onGetLocation={fetchAddress}
          onSearchAddress={openAddressSearch}
          loading={loading}
        />
      </section>

      <StoreTopBar
        activeCaId={activeCaId}
        searchText={searchText}
        setSearchText={setSearchText}
      />

      <Outlet context={{ activeCaId, searchText }} />
    </>
  );
}
