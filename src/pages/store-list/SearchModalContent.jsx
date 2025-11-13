import React, { useEffect, useState, useRef } from "react";
import InputField from "@/components/form/InputField";
import styles from "./SearchModalContent.module.scss";
import { FaArrowUp, FaArrowDown, FaMagnifyingGlass } from "react-icons/fa6";
import storeListAPI from "@/service/storeListAPI";

export default function SearchModalContent({ closePopup, onSearch }) {
  const [keyword, setKeyword] = useState("");
  const [keywords, setKeywords] = useState([]);
  const inputRef = useRef(null);

  // 팝업 열릴 때 header z-index 낮추기
  useEffect(() => {
    const header = document.querySelector(".header");
    if (!header) return;

    // 팝업 오픈 시 z-index:1
    header.style.zIndex = 1;

    // 언마운트(팝업 닫힘) 시 되돌리기
    return () => {
      header.style.zIndex = 2;
    };
  }, []);

  useEffect(() => {
    const fetchKeywords = async () => {
      const list = await storeListAPI.getPopularKeywords();
      setKeywords(list);
    };

    fetchKeywords();
  }, []);

  // 검색 실행
  const submitSearch = () => {
    if (!keyword.trim()) return;
    onSearch(keyword.trim());
    closePopup();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitSearch();
  };

  return (
    <>
      {/* 검색 */}
      <form className={styles.searchRow} onSubmit={handleSubmit}>
        <div className={styles.inputWrap}>
          <FaMagnifyingGlass className={styles.searchIcon} />

          <InputField
            ref={inputRef}
            name="popupSearch"
            type="search"
            placeholder="검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className={styles.popupInputField}
          />
        </div>

        <button type="submit" className="btn btn-default btn-primary">
          검색
        </button>
      </form>

      {/* 인기 검색어 */}
      {keywords?.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>인기 검색어</h4>

          <div className={styles.keywordGrid}>
            {keywords.map((item) => (
              <button
                key={item.statId}
                className={styles.keywordRow}
                onClick={() => {
                  onSearch(item.keyword);
                  closePopup();
                }}
              >
                <span className={styles.rank}>{item.rank}</span>
                <span className={styles.word}>{item.keyword}</span>

                <span className={styles.diff}>
                  {item.rankDiff === null ? (
                    <span className={styles.new}>NEW</span>
                  ) : item.rankDiff > 0 ? (
                    <>
                      <FaArrowUp className={styles.up} />
                      <span className={styles.diffNum}>{item.rankDiff}</span>
                    </>
                  ) : item.rankDiff < 0 ? (
                    <>
                      <FaArrowDown className={styles.down} />
                      <span className={styles.diffNum}>
                        {Math.abs(item.rankDiff)}
                      </span>
                    </>
                  ) : (
                    <span className={styles.same}>-</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
