import React from "react";
import { Outlet, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import storeAPI from "@/service/storeAPI";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function StoreDetailLayout() {
  const { storeId: storeIdParam } = useParams();
  const storeId = Number(storeIdParam);

  /** 가게 상세 조회 → 모든 하위 탭(menu/review/info)에 전달 */
  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.STORE_DETAIL, storeId],
    queryFn: () => storeAPI.getStoreDetail(storeId),
    enabled: !!storeId,
  });

  // if (isLoading)
  //   return <LoadingSpinner fullscreen message="가게 정보를 불러오는 중..." />;

  // if (isError || !data) return <div>가게 정보를 불러올 수 없습니다.</div>;

  /** 실제 전달되는 store 상세 데이터 */
  const storeDetail = data?.response?.vo ?? data;

  /** Outlet context로 storeId, storeDetail 전달 */
  return (
    <div className="store-detail-layout">
      <Outlet context={{ storeDetail, storeId }} />
    </div>
  );
}
