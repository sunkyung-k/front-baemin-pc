// src/pages/store-list/StoreTopBar.jsx
import React, { useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useCategory } from "@/hooks/useCategory";
import { useAddressStore } from "@/store/useAddressStore";
import { useCurrentAddress } from "@/hooks/useCurrentAddress";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import SearchInput from "../../components/form/SearchInput";
import styles from "./StoreTopBar.module.scss";

export default function StoreTopBar({ activeCaId, searchText, setSearchText }) {
  const [showSearch, setShowSearch] = useState(false);
  const { categories } = useCategory();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { address, setAddress } = useAddressStore();
  const { fetchAddress, loading } = useCurrentAddress();
  const { openAddressSearch } = useAddressSearch(setAddress);

  /** 카테고리 탭 클릭 핸들러 */
  const handleCategoryClick = (id) => {
    const newParams = new URLSearchParams(searchParams);

    if (id) newParams.set("caId", id);
    else newParams.delete("caId");

    const { address } = useAddressStore.getState();
    if (address) newParams.set("addr", address);

    if (searchText) newParams.set("searchText", searchText);
    else newParams.delete("searchText");

    navigate({
      pathname: location.pathname,
      search: `?${newParams.toString()}`,
    });
  };

  return (
    <section className={styles.topBar}>
      <div className={styles.tabWrap}>
        {/* 🔍 검색창 토글 버튼 */}
        <button
          className={styles.searchToggleBtn}
          onClick={() => setShowSearch((prev) => !prev)}
        >
          <FaMagnifyingGlass />
        </button>

        {/* 🏷 카테고리 탭 */}
        <div className={styles.categoryTabs}>
          {[{ id: "", name: "전체보기" }, ...categories].map((cat) => (
            <button
              key={cat.id}
              className={`${styles.tab} ${
                String(activeCaId) === String(cat.id) ? styles.active : ""
              }`}
              onClick={() => handleCategoryClick(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 📍 검색창 (Daum + Kakao 주소 검색 통합) */}
      {showSearch && (
        <div className={styles.menuSearch}>
          <SearchInput
            mode="search"
            variant="sub"
            value={searchText}
            setValue={setSearchText}
            placeholder="메뉴명 또는 가게명을 입력하세요"
            onSearch={() => console.log("검색 실행:", searchText)}
          />
        </div>
      )}
    </section>
  );
}
