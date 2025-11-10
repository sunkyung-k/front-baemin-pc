import React, { useState, useRef, useEffect } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useCategory } from "@/hooks/useCategory";
import { useAddressStore } from "@/store/useAddressStore"; // 전역 주소 상태 불러오기
import { useNavigate, useSearchParams } from "react-router-dom"; // URL 변경용 훅
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

  // 현재 주소 가져오기 (Zustand 등 전역 상태)
  const { address } = useAddressStore();

  // URL 조작용 훅
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 주소 변경 시 URL 자동 갱신
  useEffect(() => {
    if (!address) return;

    // 현재 URL의 쿼리 파라미터들 복사
    const params = new URLSearchParams(searchParams);

    // addr 값만 새로 세팅
    params.set("addr", address);

    // 변경된 쿼리 문자열로 이동 (히스토리 쌓임)
    navigate(`/store?${params.toString()}`, { replace: false });
  }, [address]);

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

  /** 현재 활성 카테고리 판별 */
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
