import React from "react";
import PopularItem from "./PopularItem";

export default function PopularList({ keywords, onSelect }) {
  return (
    <div className="popular-section">
      <h4 className="popular-title">인기 검색어</h4>

      <div className="popular-grid">
        {keywords.map((item) => (
          <PopularItem key={item.statId} item={item} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
