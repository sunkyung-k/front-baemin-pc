import React from "react";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import favoriteAPI from "@/service/favoriteAPI";
import StoreCard from "@/components/store/StoreCard";
import { FaHeart } from "react-icons/fa6";
import EmptyState from "@/components/menu/EmptyState";
import styles from "./Favorite.module.scss";

/**
 * Favorite (내가 찜한 가게 목록)
 * -------------------------------------------------
 * - 서버에서 찜 목록 조회
 * - 영업 상태는 표시하지 않음 (단순 정보만 노출)
 */
export default function Favorite() {
  const { data: likedStores = [] } = useQuery({
    queryKey: [QUERY_KEYS.FAVORITE_LIST],
    queryFn: favoriteAPI.list,
  });

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

  return (
    <main className={styles.favoriteWrap}>
      <h1 className={styles.pageTitle}>내가 찜한 가게</h1>
      <div className={styles.storeList}>
        {likedStores.map((store) => (
          <StoreCard key={store.storeId} store={store} showStatus={false} />
        ))}
      </div>
    </main>
  );
}
