import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useStoreList } from "@/hooks/useStoreList";
import StoreCard from "@/components/store/StoreCard";
import EmptyState from "@/components/menu/EmptyState";
import Pagination from "@/components/common/Pagination";
import SelectBox from "@/components/form/SelectBox";
import { FaStore } from "react-icons/fa6";
import styles from "./StoreList.module.scss";

export default function StoreList() {
  const { filters, setSort } = useOutletContext();
  const [page, setPage] = useState(0);
  const { stores, pageInfo } = useStoreList({
    ...filters,
    page,
  });

  /** 정렬 옵션 리스트 */
  const sortOptions = [
    { label: "별점 높은순", value: "ratingAvg,desc" },
    { label: "리뷰 많은순", value: "reviewCount,desc" },
    { label: "최소주문금액 낮은순", value: "minPrice,asc" },
  ];

  if (stores === undefined) return null;
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
      <div className={styles.listHeader}>
        {/* 결과 개수 안내 */}
        <p className={styles.resultCount}>
          총 <strong>{pageInfo?.totalElements ?? stores.length}</strong>개
        </p>

        {/* 정렬 셀렉트 */}
        <SelectBox
          name="sort"
          value={filters.sort || "ratingAvg,desc"}
          onChange={(e) => setSort(e.target.value)}
          options={sortOptions}
        />
      </div>

      {/* 가게 리스트 */}
      <div className={styles.storeGrid}>
        {stores.map((s) => (
          <StoreCard key={s.storeId} store={s} showStatus />
        ))}
      </div>

      {/* 페이지네이션 */}
      {pageInfo && (
        <Pagination pageInfo={pageInfo} onPageChange={handlePageChange} />
      )}
    </main>
  );
}
