import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useStoreList } from "@/hooks/useStoreList";
import StoreCard from "@/components/store/StoreCard";
import EmptyState from "@/components/menu/EmptyState";
import Pagination from "@/components/common/Pagination";
import { FaStore } from "react-icons/fa6";
import styles from "./StoreList.module.scss";

export default function StoreList() {
  // StoreListLayout에서 전달한 filters 통째로 받기
  const { filters } = useOutletContext();

  // 현재 페이지 번호 관리
  const [page, setPage] = useState(0);

  // filters 전체 전달 (React Query가 자동으로 refetch)
  const { stores, pageInfo } = useStoreList({
    ...filters,
    page,
  });

  // 데이터 준비 전엔 아무것도 렌더하지 않음
  if (stores === undefined) return null;

  // 가게가 하나도 없을 때만 EmptyState 노출
  if (!stores.length) {
    return (
      <main className={styles.main}>
        <EmptyState
          icon={<FaStore />}
          title="아직 등록된 음식점이 없습니다."
          description="빠른 시일 내에 서비스를 제공할 수 있도록 최선을 다하겠습니다."
        />
      </main>
    );
  }

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <main className={styles.main}>
      <div className={styles.storeGrid}>
        {stores.map((s) => (
          <StoreCard key={s.storeId} store={s} showStatus />
        ))}
      </div>

      {/* Pagination */}
      {pageInfo && (
        <Pagination pageInfo={pageInfo} onPageChange={handlePageChange} />
      )}
    </main>
  );
}
