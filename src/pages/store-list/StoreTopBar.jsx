import React, { useState, useRef, useEffect } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useCategory } from "@/hooks/useCategory";
import InputField from "@/components/form/InputField";
import styles from "./StoreTopBar.module.scss";

export default function StoreTopBar({ filters, setCategory, setSearchText }) {
  const { categories } = useCategory();

  // 검색 Input 상태
  const [localValue, setLocalValue] = useState(filters.searchText);
  const inputRef = useRef(null);

  // 필터 변경 → 검색창 업데이트
  useEffect(() => setLocalValue(filters.searchText), [filters.searchText]);

  // 검색 제출
  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchText(localValue.trim());
  };

  // 검색어 초기화
  const handleClear = () => {
    setLocalValue("");
    setSearchText("");
    inputRef.current?.focus();
  };

  // 카테고리 목록
  const allCategories = [{ id: 0, name: "전체보기" }, ...categories];
  const isActive = (catId) => Number(filters.caId ?? 0) === Number(catId ?? 0);

  return (
    <section className={styles.topBar}>
      <div className={styles.innerBox}>
        {/* 검색창 */}
        <div className={styles.innerArea}>
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
              >
                ×
              </button>
            )}
          </form>
        </div>

        {/* 카테고리 탭 */}
        <div className={styles.categoryTabsWrap}>
          <div className={styles.categoryTabs}>
            {allCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`${styles.tab} ${
                  isActive(cat.id) ? styles.active : ""
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
