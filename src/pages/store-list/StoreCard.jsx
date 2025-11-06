// /store-list/StoreCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";
import styles from "./StoreCard.module.scss";

export default function StoreCard({ store }) {
  return (
    <Link to={`/store/${store.storeId}`} className={styles.storeCard}>
      <div className={styles.thumb}>
        <img src={getAbsoluteImageUrl(store)} alt={store.storeName} />
      </div>
      <div className={styles.info}>
        <h3>{store.storeName}</h3>
        <p>{store.addr}</p>
        <p className={styles.rating}>⭐ {store.ratingAvg?.toFixed(1) ?? 0}</p>
      </div>
    </Link>
  );
}
