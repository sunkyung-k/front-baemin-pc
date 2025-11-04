import React from "react";
import { Outlet, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import storeAPI from "@/service/storeAPI";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useHandleError } from "@/hooks/common/useHandleError";

export default function StoreDetailLayout() {
  const { storeId: storeIdParam } = useParams();
  const storeId = Number(storeIdParam);
  const handleError = useHandleError();

  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.STORE_DETAIL, storeId],
    queryFn: () => storeAPI.getStoreDetail(storeId),
    enabled: !!storeId,
    onError: (err) => handleError(err, "StoreDetailLayout.getStoreDetail"), // ✅ alert 띄움
  });

  if (isLoading)
    if (isError || !data)
      // return <LoadingSpinner fullscreen message="가게 정보를 불러오는 중..." />;

      return <div>가게 정보를 불러올 수 없습니다.</div>;

  const storeDetail = data?.response?.vo ?? data;

  return (
    <div className="store-detail-layout">
      <Outlet context={{ storeDetail, storeId }} />
    </div>
  );
}
