import React from "react";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";
import LikeButton from "@/components/store/StoreLikeButton";
import useFavorite from "@/hooks/useFavorite";
import styles from "./StoreHero.module.scss";
// 아이콘 import는 그대로 유지
import { FaStar, FaLocationDot } from "react-icons/fa6";
import { IoTime } from "react-icons/io5";

/**
 * StoreHero
 * -------------------------------------------------
 * - 가게 상세 상단
 * - 대표 이미지, 찜 버튼, 가게 기본정보 표시
 */
export default function StoreHero({ storeDetail }) {
  const detail = storeDetail?.vo || storeDetail || {};

  const {
    storeId,
    storeName,
    ratingAvg,
    minPrice,
    hourComment,
    fileList,
    addr,
    // open 상태를 detail에서 직접 가져온다고 가정 (원래 코드에서 open이 사용되었으나 detail에 없는 경우를 대비해 추가)
    open,
  } = detail;

  const { isLiked, toggleLike } = useFavorite(storeId);

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
      {/* 이미지 및 찜 버튼 섹션 */}
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

      {/* 가게 정보 섹션 */}
      <div className={styles.storeInfo}>
        <h2 className={styles.storeName}>{storeName}</h2>

        {(ratingText || minPrice) && (
          <p className={styles.infoRow}>
            <FaStar className={styles.starIcon} />
            {ratingText || "0.0"}
            {" | "}
            {minPrice && <>최소 주문 금액 : {minPrice.toLocaleString()}원</>}
          </p>
        )}

        {addr && (
          <p className={styles.infoRow}>
            <FaLocationDot className={styles.locationIcon} />
            {addr}
          </p>
        )}

        {(hourComment || open) && (
          <p className={styles.infoRow}>
            <IoTime className={styles.clockIcon} />
            {hourComment || "영업 중"}
          </p>
        )}
      </div>
    </section>
  );
}
