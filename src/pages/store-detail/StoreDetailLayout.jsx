import React from "react";
import { Outlet, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import storeAPI from "@/service/storeAPI";

/**
 * StoreDetailLayout
 * - 특정 가게 상세정보 조회 (/api/v1/store/{storeId})
 * - 하위 탭(menu / review / info)에 context로 전달
 */
export default function StoreDetailLayout() {
  const { storeId } = useParams(); //  URL에서 storeId 추출

  const { data, isLoading, error } = useQuery({
    queryKey: [QUERY_KEYS.STORE_DETAIL, storeId], //  storeId 포함
    queryFn: () => storeAPI.getStoreDetail(storeId), //  API에 전달
    enabled: !!storeId, //  storeId가 있을 때만 호출
  });

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>가게 정보를 불러올 수 없습니다.</div>;

  const storeDetail = data?.response?.vo;

  return (
    <div className="store-detail-layout">
      {/*  하위 탭에서 storeDetail 공통 사용 */}
      <Outlet context={{ storeDetail }} />
    </div>
  );
}
