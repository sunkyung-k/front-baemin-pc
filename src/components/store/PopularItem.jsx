import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa6";

export default function PopularItem({ item, onSelect }) {
  const diff = item.rankDiff;

  const renderDiff = (() => {
    if (diff === null) {
      return <span className="popular-new">NEW</span>;
    }
    if (diff > 0) {
      return (
        <>
          <FaArrowUp className="popular-up" />
          <span className="popular-num">{diff}</span>
        </>
      );
    }
    if (diff < 0) {
      return (
        <>
          <FaArrowDown className="popular-down" />
          <span className="popular-num">{Math.abs(diff)}</span>
        </>
      );
    }
    return <span className="popular-same">-</span>;
  })();

  return (
    <button className="popular-item" onClick={() => onSelect(item.keyword)}>
      <span className="popular-rank">{item.rank}</span>
      <span className="popular-word">{item.keyword}</span>
      <span className="popular-diff">{renderDiff}</span>
    </button>
  );
}
