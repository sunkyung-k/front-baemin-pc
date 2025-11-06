import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAddressStore } from "@/store/useAddressStore";
import { useCurrentAddress } from "@/hooks/useCurrentAddress";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import ImportAddress from "@/components/form/ImportAddress";
import StoreTopBar from "./StoreTopBar";
import styles from "./StoreListLayout.module.scss";

export default function StoreListLayout() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const activeCaId = query.get("caId") || "";

  const { address, setAddress } = useAddressStore();
  const { fetchAddress, loading } = useCurrentAddress();
  const { openAddressSearch } = useAddressSearch(setAddress);

  return (
    <>
      <section className={styles.addressSection}>
        <ImportAddress
          userAddress={address}
          onGetLocation={fetchAddress}
          onSearchAddress={openAddressSearch}
          loading={loading}
        />
      </section>

      <StoreTopBar activeCaId={activeCaId} />
      <Outlet context={{ activeCaId }} />
    </>
  );
}
