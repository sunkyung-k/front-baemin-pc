// /src/pages/store-detail/StoreHero.jsx
import React from "react";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";
import LikeButton from "@/components/store/StoreLikeButton";
import useFavorite from "@/hooks/useFavorite";
import { authStore } from "@/store/authStore";
import AdminStoreTools from "@/pages/admin/store/AdminStoreTools";
import { FaStar, FaLocationDot } from "react-icons/fa6";
import { IoTime } from "react-icons/io5";
import styles from "./StoreHero.module.scss";

export default function StoreHero({ storeDetail }) {
  const detail = storeDetail?.vo || storeDetail || {};

  const {
    storeId,
    storeName,
    ratingAvg = 0,
    minPrice,
    hourComment,
    fileList = [],
    addr,
    fileThumbName,
    storedName,
    filePath,
  } = detail;

  const { isLiked, toggleLike } = useFavorite(storeId);
  const role = authStore((s) => s.userRole);
  const isAdmin = role === "ROLE_ADMIN";

  if (!storeDetail) return null;

  // 이미지 fallback
  const normalized = {
    ...detail,
    fileThumbName: fileThumbName ?? fileList?.[0]?.fileThumbName ?? null,
    storedName: storedName ?? fileList?.[0]?.storedName ?? null,
    filePath: filePath ?? fileList?.[0]?.filePath ?? null,
  };

  const heroImage = getAbsoluteImageUrl(normalized);
  const ratingText = Number(ratingAvg).toFixed(1);

  /** 오늘 기준 휴무/영업 파생 값 */
  const derivedCloseYn = hourComment?.includes("휴무") ? "Y" : "N";

  return (
    <section className={styles.heroWrap}>
      <div
        className={styles.storeHero}
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        {!isAdmin && (
          <LikeButton
            isActive={isLiked}
            onToggle={toggleLike}
            size={24}
            round
            animated
          />
        )}
      </div>

      <div className={styles.storeInfoWrap}>
        <div className={styles.storeInfo}>
          <h2 className={styles.storeName}>{storeName}</h2>

          <InfoRow icon={<FaStar className={styles.starIcon} />}>
            {ratingText} | 최소 주문 금액 : {minPrice?.toLocaleString()}원
          </InfoRow>

          {addr && <InfoRow icon={<FaLocationDot />}>{addr}</InfoRow>}

          {(hourComment || open) && (
            <p className={styles.infoRow}>
              <IoTime className={styles.clockIcon} />
              {hourComment || "영업 중"}
            </p>
          )}
        </div>

        {isAdmin && (
          <AdminStoreTools storeId={storeId} closeYn={derivedCloseYn} />
        )}
      </div>
    </section>
  );
}

function InfoRow({ icon, children }) {
  return (
    <p className={styles.infoRow}>
      {icon}
      {children}
    </p>
  );
}
