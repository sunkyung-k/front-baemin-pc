import React from "react";
import StoreCard from "@/components/store/StoreCard";
import EmptyState from "@/components/menu/EmptyState";
import Pagination from "@/components/common/Pagination";
import SelectBox from "@/components/form/SelectBox";
import { FaStore } from "react-icons/fa6";

export default function StoreList({
  filters,
  setSort,
  stores,
  pageInfo,
  onPageChange,
  isAdmin,
}) {
  const sortOptions = [
    { label: "별점 높은순", value: "ratingAvg,desc" },
    { label: "리뷰 많은순", value: "reviewCount,desc" },
    { label: "최소주문금액 낮은순", value: "minPrice,asc" },
  ];

  if (!stores || stores.length === 0) {
    return (
      <main className="store-list">
        <EmptyState
          icon={<FaStore />}
          title="현재 등록된 가게가 없습니다."
          description="새로운 가게가 입점되면 바로 확인하실 수 있습니다."
        />
      </main>
    );
  }

  return (
    <main className="store-list">
      <div className="store-list-header">
        <p className="store-list-result-count">
          총 <strong>{pageInfo?.totalElements ?? stores.length}</strong>개
        </p>

        <SelectBox
          name="sort"
          value={filters.sort || "ratingAvg,desc"}
          onChange={(e) => setSort(e.target.value)}
          options={sortOptions}
        />
      </div>

      <div className="store-list-grid">
        {stores.map((s) => (
          <StoreCard key={s.storeId} store={s} showStatus isAdmin={isAdmin} />
        ))}
      </div>

      {pageInfo && (
        <Pagination pageInfo={pageInfo} onPageChange={onPageChange} />
      )}
    </main>
  );
}
