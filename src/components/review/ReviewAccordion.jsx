import React, { useState } from "react";
import { formatPrice } from "@/utills/valueFormatter";
import { FaAngleDown } from "react-icons/fa";

/**
 * ReviewAccordion (리뷰 내 주문내역 아코디언)
 * ------------------------------------------------------
 * - 리뷰에 포함된 주문 메뉴들을 토글로 열고 닫을 수 있음
 * - OrderList 구조를 경량화하여 독립 사용 가능
 */
export default function ReviewAccordion({ order }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen((prev) => !prev);

  if (!order?.itemList?.length) return null;

  const formattedDate = order?.orderDate?.split(" ")[0] ?? "";

  return (
    <div className={`review-accordion ${isOpen ? "open" : ""}`}>
      {/* 헤더 (가게명 + 주문일자 + 토글 버튼) */}
      <div className="review-accordion-header" onClick={toggle}>
        <div className="info">
          <h4 className="store-name">{order.storeName || "가게명 없음"}</h4>
          <p className="order-date">{formattedDate}</p>
        </div>
        <FaAngleDown
          className={`toggle-icon ${isOpen ? "rotated" : ""}`}
          size={18}
        />
      </div>

      {/* 상세 메뉴 리스트 */}
      {isOpen && (
        <div className="order-detail-list">
          {order.itemList.map((item, idx) => (
            <div className="order-item" key={idx}>
              <div className="item-row">
                <span className="menu-name">{item.menuName}</span>
                <div>
                  <span className="qty">x {item.quantity}</span>
                  <span className="price">
                    {formatPrice(item.totalPrice)}원
                  </span>
                </div>
              </div>

              {item.optionNames?.length > 0 && (
                <ul className="option-list">
                  {item.optionNames.map((opt, i) => (
                    <li key={i}>+ {opt}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <p className="total">총 금액: {formatPrice(order.totalPrice)}원</p>
        </div>
      )}
    </div>
  );
}
