import React, { useState, useRef, useEffect } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useCategory } from "@/hooks/useCategory";
import InputField from "@/components/form/InputField";
import styles from "./StoreTopBar.module.scss";

/**
 * StoreTopBar
 * -----------------------------------------------------
 * - 검색창 + 카테고리 탭 (정렬 셀렉트는 제거됨)
 * - Home / StoreListLayout 과 연동
 * -----------------------------------------------------
 */
export default function StoreTopBar({ filters, setCategory, setSearchText }) {
  const { categories } = useCategory();
  const [localValue, setLocalValue] = useState(filters.searchText);
  const inputRef = useRef(null);

  /** 외부 searchText 변경 시 내부 input 반영 */
  useEffect(() => setLocalValue(filters.searchText), [filters.searchText]);

  /** 검색 실행 */
  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchText(localValue.trim());
  };

  /** 검색어 초기화 */
  const handleClear = () => {
    setLocalValue("");
    setSearchText("");
    inputRef.current?.focus();
  };

  /** 전체보기 caId=0 고정 */
  const allCategories = [{ id: 0, name: "전체보기" }, ...categories];

  /** 현재 활성 카테고리 판별 */
  const isActive = (catId) => Number(filters.caId ?? 0) === Number(catId ?? 0);

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
          {/* 검색어 있을 때만 X버튼 노출 */}
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
    </section>
  );
}
