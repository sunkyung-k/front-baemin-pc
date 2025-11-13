import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAddressStore } from "@/store/useAddressStore";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { FaHeart } from "react-icons/fa6";
import favoriteAPI from "@/service/favoriteAPI";
import StoreCard from "@/components/store/StoreCard";
import EmptyState from "@/components/menu/EmptyState";
import Pagination from "@/components/common/Pagination";
import styles from "./Favorite.module.scss";

/**
 * Favorite (찜 목록 페이지)
 * -------------------------------------------------
 * - 주소 기반으로 내 찜한 가게 목록을 불러옴
 * - 4km 이상 가게는 '주문 불가' 문구 표시
 */
export default function Favorite() {
  const [page, setPage] = useState(0);
  const { address } = useAddressStore();

  /** 찜 목록 조회 (주소 없으면 비활성화) */
  const { data } = useQuery({
    queryKey: [QUERY_KEYS.FAVORITE_LIST, page, address],
    queryFn: () => favoriteAPI.list(page, address),
    enabled: !!address,
  });

  const likedStores = data?.content ?? [];
  const pageInfo = data?.pageInfo;

  /** 주소 미등록 시 */
  if (!address)
    return (
      <section className={styles.detailPanel}>
        <EmptyState
          icon={<FaHeart />}
          title="주소를 설정해주세요."
          description="주소를 입력해야 찜한 가게의 주문 가능 여부를 확인할 수 있습니다."
        />
      </section>
    );

  /** 찜한 가게가 없을 때 */
  if (likedStores.length === 0)
    return (
      <section className={styles.detailPanel}>
        <EmptyState
          icon={<FaHeart />}
          title="찜한 가게가 없습니다."
          description="마음에 드는 가게를 찜하면 이곳에 표시됩니다."
        />
      </section>
    );

  const handlePageChange = (newPage) => setPage(newPage);

  return (
    <main className="page-wrap">
      <h2 className="page-title">내가 찜한 가게</h2>
      <div className={styles.storeList}>
        {likedStores.map((store) => (
          <StoreCard
            key={store.storeId}
            store={store}
            showStatus={true}
            showMinPrice={false}
            userAddress={address}
          />
        ))}
      </div>

      {pageInfo && (
        <Pagination pageInfo={pageInfo} onPageChange={handlePageChange} />
      )}
    </main>
  );
}
