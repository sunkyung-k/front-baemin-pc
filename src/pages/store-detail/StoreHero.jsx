import React from "react";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";
import LikeButton from "@/components/store/StoreLikeButton";
import useFavoriteToggle from "@/hooks/useFavoriteToggle";
import styles from "./StoreHero.module.scss";
import { FaStar, FaClock } from "react-icons/fa6";

/**
 * StoreHero
 * -------------------------------------------------
 * - 가게 상세 상단
 * - 대표 이미지, 찜 버튼, 가게 기본정보 표시
 */
export default function StoreHero({ storeDetail }) {
  const detail = storeDetail?.vo || storeDetail || {};

  const { storeId, storeName, ratingAvg, minPrice, hourComment, fileList } =
    detail;

  const { isLiked, toggleLike } = useFavoriteToggle(storeId);

  if (!storeDetail) return null;

  const normalized = {
    ...detail,
    fileThumbName: detail.fileThumbName ?? fileList?.[0]?.fileThumbName,
    storedName: detail.storedName ?? fileList?.[0]?.storedName,
    filePath: detail.filePath ?? fileList?.[0]?.filePath,
  };

  const heroImage = getAbsoluteImageUrl(normalized);
  const ratingText =
    typeof ratingAvg === "number" && !isNaN(ratingAvg)
      ? ratingAvg.toFixed(1)
      : null;

  return (
    <section className={styles.heroWrap}>
      <div
        className={styles.storeHero}
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <LikeButton
          isActive={isLiked}
          onToggle={toggleLike}
          size={24}
          round
          animated
        />
      </div>

      <div className={styles.storeInfo}>
        <h2 className={styles.storeName}>{storeName}</h2>

        {(ratingText || minPrice) && (
          <div className={styles.storeMeta}>
            {ratingText && (
              <>
                <FaStar /> {ratingText}
              </>
            )}
            {ratingText && minPrice && " | "}
            {minPrice && <>최소 주문 금액 : {minPrice.toLocaleString()}원</>}
          </div>
        )}

        {(hourComment || open) && (
          <div className={styles.storeHour}>
            <FaClock /> {hourComment || "영업 중"}
          </div>
        )}
      </div>
    </section>
  );
}
