import React from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import styles from "./StoreSearchBox.module.scss";

export default function StoreSearchBox({
  searchText,
  setSearchText,
  onSearch,
}) {
  /** 검색 실행 핸들러 */
  const handleSearch = (e) => {
    e.preventDefault(); // 폼 새로고침 방지
    if (onSearch) onSearch(searchText.trim());
  };

  return (
    <form
      className={`${styles.menuSearch} input-round ${styles.show}`}
      onSubmit={handleSearch}
    >
      <input
        type="search"
        placeholder="메뉴명 또는 가게명을 입력하세요"
        value={searchText}
        className="input-round"
        onChange={(e) => setSearchText(e.target.value)}
      />

      <button type="submit" className={styles.iconBtn}>
        <FaMagnifyingGlass className={styles.icon} />
      </button>
    </form>
  );
}
