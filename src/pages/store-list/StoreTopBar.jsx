import React, { useState, useRef, useEffect } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useCategory } from "@/hooks/useCategory";
import InputField from "@/components/form/InputField";
import styles from "./StoreTopBar.module.scss";

export default function StoreTopBar({
  activeCaId,
  searchText,
  onCategoryChange,
  onSearchChange,
}) {
  const { categories } = useCategory();
  const [localValue, setLocalValue] = useState(searchText);
  const inputRef = useRef(null);

  /** 외부 searchText 변경 시 내부 input 반영 */
  useEffect(() => setLocalValue(searchText), [searchText]);

  /** 검색 실행 */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchChange(localValue.trim());
  };

  /** 검색어 초기화 */
  const handleClear = () => {
    setLocalValue("");
    onSearchChange("");
    inputRef.current?.focus();
  };

  /** 카테고리 데이터 */
  const allCategories = [{ id: "all", name: "전체보기" }, ...categories];
  const isActive = (catId) =>
    String(activeCaId || "all") === String(catId || "all");

  return (
    <section className={styles.topBar}>
      <div className={styles.innerBox}>
        {/* 검색창 */}
        <form className={styles.searchForm} onSubmit={handleSubmit}>
          <FaMagnifyingGlass className={styles.searchIcon} />
          <InputField
            ref={inputRef}
            name="storeSearch"
            type="search"
            placeholder="메뉴명 또는 가게명을 입력하세요"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className={styles.searchInput}
          />
          {localValue && (
            <button
              type="button"
              onClick={handleClear}
              className={styles.btnClear}
              title="검색어 지우기"
            >
              ×
            </button>
          )}
        </form>

        {/* 카테고리 탭 */}
        <div className={styles.categoryTabs}>
          {allCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`${styles.tab} ${
                isActive(cat.id) ? styles.active : ""
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
