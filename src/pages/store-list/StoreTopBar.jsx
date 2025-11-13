import React, { useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { useCategory } from "@/hooks/useCategory";
import Modal from "@/components/common/Modal";
import SearchModalContent from "./SearchModalContent";
import styles from "./StoreTopBar.module.scss";

export default function StoreTopBar({ filters, setCategory, setSearchText }) {
  const { categories } = useCategory();

  // 검색 값 (버튼에 표시될 값)
  const [searchValue, setSearchValue] = useState(filters.searchText || "");

  // 모달 열림/닫힘
  const [isModalOpen, setIsModalOpen] = useState(false);

  const clearSearch = () => {
    setSearchValue("");
    setSearchText("");
  };

  const allCategories = [{ id: 0, name: "전체보기" }, ...categories];
  const isActive = (id) => Number(filters.caId ?? 0) === Number(id ?? 0);

  return (
    <section className={styles.topBar}>
      <div className={styles.innerBox}>
        {/* 검색 버튼 */}
        <div className={styles.searchWrap}>
          <FaMagnifyingGlass className={styles.searchIcon} />

          <button
            className={`${styles.searchBtn} ${
              !searchValue ? styles.valueNone : ""
            }`}
            onClick={() => setIsModalOpen(true)}
          >
            <span className={styles.placeholder}>
              {searchValue || "메뉴명 또는 가게명을 입력하세요"}
            </span>
          </button>

          {/* 검색어가 존재할 때만 표시 */}
          <button className={styles.clearBtn} onClick={clearSearch}>
            {searchValue && <IoClose />}
          </button>
        </div>

        {/* 검색 모달 */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="검색하기"
        >
          <SearchModalContent
            closePopup={() => setIsModalOpen(false)}
            onSearch={(word) => {
              setSearchValue(word);
              setSearchText(word);
            }}
          />
        </Modal>

        {/* 카테고리 */}
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
