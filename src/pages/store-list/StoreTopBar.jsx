import React, { useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useCategory } from "@/hooks/useCategory"; // ✅ 요거!
import StoreSearchBox from "./StoreSearchBox";
import styles from "./StoreTopBar.module.scss";

export default function StoreTopBar({ activeCaId, searchText, setSearchText }) {
  const [showSearch, setShowSearch] = useState(false);
  const { categories, isLoading } = useCategory(); // ✅ 캐시된 카테고리 목록
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  if (isLoading) return <p>카테고리 불러오는 중...</p>;

  const handleCategoryClick = (id) => {
    const newParams = new URLSearchParams(searchParams);
    if (id) newParams.set("caId", id);
    else newParams.delete("caId");
    navigate({
      pathname: location.pathname,
      search: `?${newParams.toString()}`,
    });
  };

  return (
    <section className={styles.topBar}>
      <div className={styles.tabWrap}>
        <button
          className={styles.searchToggleBtn}
          onClick={() => setShowSearch((prev) => !prev)}
        >
          <FaMagnifyingGlass />
        </button>

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

      {showSearch && (
        <StoreSearchBox searchText={searchText} setSearchText={setSearchText} />
      )}
    </section>
  );
}
