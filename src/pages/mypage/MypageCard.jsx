import React from "react";
import styles from "./MypageCard.module.scss";

function Card({ title, children, className }) {
  return (
    <div className={`${styles.card} ${className || ""}`}>
      {title && <h2 className={styles.cardTit}>{title}</h2>}
      <div className={styles.cardBody}>{children}</div>
    </div>
  );
}

export default Card;
