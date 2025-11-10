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
    onError: (err) => handleError(err, "StoreDetailLayout.getStoreDetail"),
  });

  if (!data) return null;

  const storeDetail = data?.response?.vo ?? data;

  return (
    <div className={styles.detailLayout}>
      {/* 상단 히어로 */}
      <StoreHero storeDetail={storeDetail} />

      {/* 탭 네비게이션 */}
      <StoreTabs />

      {/* 탭 콘텐츠 (Outlet) */}
      <div className={styles.tabContent}>
        <Outlet context={{ storeDetail, storeId: Number(storeId) }} />
      </div>
    </div>
  );
}
