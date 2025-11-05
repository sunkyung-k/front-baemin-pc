import React from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import styles from "./StoreSearchBox.module.scss";

export default function StoreSearchBox({ searchText, setSearchText }) {
  return (
    <div className={`${styles.menuSearch} input-round ${styles.show}`}>
      <input
        type="search"
        placeholder="메뉴명 또는 가게명을 입력하세요"
        value={searchText}
        className="input-round"
        onChange={(e) => setSearchText(e.target.value)}
      />
      <FaMagnifyingGlass className={styles.icon} />
    </div>
  );
}
