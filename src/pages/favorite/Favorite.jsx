import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import favoriteAPI from "@/service/favoriteAPI";
import StoreCard from "@/components/store/StoreCard";
import { FaHeart } from "react-icons/fa6";
import EmptyState from "@/components/menu/EmptyState";
import Pagination from "@/components/common/Pagination";
import styles from "./Favorite.module.scss";

export default function Favorite() {
  const [page, setPage] = useState(0);

  const { data } = useQuery({
    queryKey: [QUERY_KEYS.FAVORITE_LIST, page],
    queryFn: () => favoriteAPI.list(page),
  });

  const likedStores = data?.content ?? [];
  const pageInfo = data?.pageInfo;

  if (likedStores.length === 0) {
    return (
      <section className={styles.detailPanel}>
        <EmptyState
          icon={<FaHeart />}
          title="찜한 가게가 없습니다."
          description="마음에 드는 가게를 찜하면 이곳에 표시됩니다."
        />
      </section>
    );
  }

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <main className="page-wrap">
      <h2 className="page-title">내가 찜한 가게</h2>

      <div className={styles.storeList}>
        {likedStores.map((store) => (
          <StoreCard key={store.storeId} store={store} showStatus={true} />
        ))}
      </div>

      {/* 페이지네이션 추가 */}
      {pageInfo && (
        <Pagination pageInfo={pageInfo} onPageChange={handlePageChange} />
      )}
    </main>
  );
}
