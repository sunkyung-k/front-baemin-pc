// src/pages/store-detail/StoreDetailLayout.jsx
import React from "react";
import { Outlet, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import storeAPI from "@/service/storeAPI";
import { useHandleError } from "@/hooks/common/useHandleError";
import StoreHero from "./StoreHero";
import StoreTabs from "./StoreTabs";
import styles from "./StoreDetailLayout.module.scss";

export default function StoreDetailLayout() {
  const { storeId } = useParams();
  const handleError = useHandleError();

  const { data } = useQuery({
    queryKey: [QUERY_KEYS.STORE_DETAIL, storeId],
    queryFn: () => storeAPI.getStoreDetail(storeId),
    enabled: !!storeId,

    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,

    onError: (err) => handleError(err, "StoreDetailLayout.getStoreDetail"),
  });

  if (!data) return null;

  const storeDetail = data;

  return (
    <>
      <StoreHero storeDetail={storeDetail} />
      <StoreTabs />

      <div className={styles.tabContent}>
        <Outlet context={{ storeDetail, storeId: Number(storeId) }} />
      </div>
    </>
  );
}
