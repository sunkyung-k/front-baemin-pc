import React from "react";
import { Link } from "react-router-dom";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";
import LikeButton from "@/components/store/StoreLikeButton";
import useFavorite from "@/hooks/useFavorite";
import { FaStar } from "react-icons/fa6";

/**
 * StoreCard
 * -------------------------------------------------
 * - 찜 버튼 / 이미지 / 평점 / 최소주문금액 / 반경 / 주소
 */
export default function StoreCard({
  store,
  linkable = true,
  showStatus = true,
  showMinPrice = true,
}) {
  const {
    storeId,
    storeName,
    branchName,
    minPrice,
    ratingAvg,
    open,
    hourComment,
    isAround,
    around,
    addr,
  } = store;

  const { isLiked, toggleLike } = useFavorite(storeId);

  if (!store) return null;

  // 반경 가능 여부
  const available = isAround ?? around ?? true;

  // 최소 주문 금액 포맷
  const formattedPrice = Number(minPrice)?.toLocaleString() ?? "0";

  // 카드 본문
  const content = (
    <>
      {/* 찜 버튼 */}
      <LikeButton
        isActive={isLiked}
        onToggle={toggleLike}
        size={20}
        round
        animated
        className="btn-like"
      />

      <div className="card-thumb">
        <img
          src={getAbsoluteImageUrl(store)}
          alt={storeName || "가게 이미지"}
          loading="lazy"
        />

        {/* 휴무 뱃지 */}
        {showStatus && open === false && (
          <span className="closedBadge">{hourComment || "휴무"}</span>
        )}
      </div>

      <div className="card-info">
        <h3 className="card-title">
          {storeName} {branchName && <span>- {branchName}</span>}
        </h3>

        {/* 최소주문금액 표시 여부 */}
        {showMinPrice && <p>최소주문금액 {formattedPrice}원</p>}

        {/* 평점 */}
        <p className="card-rating">
          <FaStar /> {(ratingAvg ?? 0).toFixed(1)}
        </p>

        {/* 반경 4km 이상 시 */}
        {!available && (
          <>
            <p>{addr}</p>
            <p className="not-available">
              해당 주소에서는 서비스가 제공되지 않습니다.
              <br />
              주소를 변경한 뒤 다시 확인해주세요.
            </p>
          </>
        )}
      </div>
    </>
  );

  return linkable ? (
    <Link
      to={`/store/${storeId}`}
      className={`card-store ${!available ? "disabled" : ""}`}
      onClick={(e) => {
        if (!available) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      {content}
    </Link>
  ) : (
    <div className="card-store">{content}</div>
  );
}
