import React, { useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { useCategory } from "@/hooks/useCategory";
import Modal from "@/components/common/Modal";
import SearchModal from "@/components/store/SearchModal";

export default function StoreTopBar({
  filters,
  setCategory,
  setSearchText,
  isAdmin = false,
}) {
  const { categories } = useCategory();

  const [searchValue, setSearchValue] = useState(filters.searchText || "");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const clearSearch = () => {
    setSearchValue("");
    setSearchText("");
  };

  const allCategories = [{ id: 0, name: "전체보기" }, ...categories];
  const isActive = (id) => Number(filters.caId ?? 0) === Number(id ?? 0);

  return (
    <section className="store-topbar">
      <div className="store-topbar-inner">
        {/* 검색 영역 */}
        <div className="store-topbar-search">
          <FaMagnifyingGlass className="store-topbar-search-icon" />

          <button
            className={`store-topbar-search-btn ${
              !searchValue ? "store-topbar-search-btn-empty" : ""
            }`}
            onClick={() => setIsModalOpen(true)}
          >
            <span className="store-topbar-placeholder">
              {searchValue || "메뉴명 또는 가게명을 입력하세요"}
            </span>
          </button>

          <button className="store-topbar-clear-btn" onClick={clearSearch}>
            {searchValue && <IoClose />}
          </button>
        </div>

        {/* 검색 모달 */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="검색하기"
        >
          <SearchModal
            closePopup={() => setIsModalOpen(false)}
            onSearch={(word) => {
              setSearchValue(word);
              setSearchText(word);
            }}
          />
        </Modal>

        {/* 카테고리 */}
        <div className="store-topbar-categories">
          <div className="store-topbar-tabs">
            {allCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`store-topbar-tab ${
                  isActive(cat.id) ? "store-topbar-tab-active" : ""
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
