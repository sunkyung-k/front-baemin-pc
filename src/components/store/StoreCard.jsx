import React from "react";
import { Link } from "react-router-dom";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";
import LikeButton from "@/components/store/StoreLikeButton";
import useFavorite from "@/hooks/useFavorite";
import { FaStar } from "react-icons/fa6";

export default function StoreCard({
  store,
  linkable = true,
  showStatus = true,
}) {
  const {
    storeId,
    storeName,
    branchName,
    ratingAvg,
    open,
    hourComment,
    minPrice,
  } = store;
  const { isLiked, toggleLike } = useFavorite(storeId);

  if (!store) return null;

  const cardInner = (
    <>
      <LikeButton
        isActive={isLiked}
        onToggle={toggleLike}
        size={20}
        round
        animated
        className="btn-like"
      />

      <div className="card-thumb">
        <img src={getAbsoluteImageUrl(store)} alt={storeName} />
        {showStatus && open === false && (
          <span className="closedBadge">{hourComment || "휴무"}</span>
        )}
      </div>

      <div className="card-info">
        <h3 className="card-title">
          {storeName}
          {branchName && <span className="branch-name"> - {branchName}</span>}
        </h3>

        {minPrice && (
          <p className="min-price">
            최소주문금액 {minPrice.toLocaleString()}원
          </p>
        )}

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
