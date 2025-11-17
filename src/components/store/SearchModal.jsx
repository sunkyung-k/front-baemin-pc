import React, { useEffect, useState, useRef } from "react";
import storeListAPI from "@/service/storeListAPI";
import InputField from "@/components/form/InputField";
import { FaMagnifyingGlass } from "react-icons/fa6";
import PopularList from "./PopularList";

export default function SearchModal({ closePopup, onSearch }) {
  const [keyword, setKeyword] = useState("");
  const [keywords, setKeywords] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    storeListAPI.getPopularKeywords().then(setKeywords);
  }, []);

  const submitSearch = () => {
    if (!keyword.trim()) return;
    onSearch(keyword.trim());
    closePopup();
  };

  return (
    <div className="search-modal">
      <form
        className="search-row"
        onSubmit={(e) => {
          e.preventDefault();
          submitSearch();
        }}
      >
        <div className="search-input-wrap">
          <FaMagnifyingGlass className="search-icon" />

          <InputField
            ref={inputRef}
            name="popupSearch"
            type="search"
            placeholder="검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="search-input"
          />
        </div>

        <button type="submit" className="btn btn-default btn-primary">
          검색
        </button>
      </form>

      {keywords?.length > 0 && (
        <PopularList
          keywords={keywords}
          onSelect={(word) => {
            onSearch(word);
            closePopup();
          }}
        />
      )}
    </div>
  );
}
