import React from "react";
import { Link } from "react-router-dom";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";
import LikeButton from "@/components/store/StoreLikeButton";
import useFavoriteToggle from "@/hooks/useFavoriteToggle";
import { FaStar } from "react-icons/fa6";

export default function StoreCard({
  store,
  linkable = true,
  showStatus = true,
}) {
  const { storeId, storeName, addr, ratingAvg, open, hourComment } = store;
  const { isLiked, toggleLike } = useFavoriteToggle(storeId);

  if (!store) return null;

  const cardInner = (
    <>
      <div className="card-thumb">
        <img src={getAbsoluteImageUrl(store)} alt={storeName} />

        {/* 휴무 뱃지 */}
        {showStatus && open === false && (
          <span className="closedBadge">{hourComment || "휴무"}</span>
        )}

        {/* 찜 버튼 */}
        <LikeButton
          isActive={isLiked}
          onToggle={toggleLike}
          size={20}
          round
          animated
          className="btn-like"
        />
      </div>

      <div className="card-info">
        <h3 className="card-title">{storeName}</h3>
        {addr && <p className="card-addr">{addr}</p>}
        <p className="card-rating">
          <FaStar /> {ratingAvg?.toFixed(1) ?? 0}
        </p>
      </div>
    </>
  );

  return linkable ? (
    <Link to={`/store/${storeId}`} className="card-store">
      {cardInner}
    </Link>
  ) : (
    <div className="card-store">{cardInner}</div>
  );
}
