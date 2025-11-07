import React, { useState } from "react";
import { formatPrice } from "@/utills/valueFormatter";
import { FaAngleDown } from "react-icons/fa";

/**
 * OrderList (공용 주문 리스트 컴포넌트)
 * --------------------------------------------------
 * - order-title: 가게명 고정
 * - 헤더는 항상 동일한 요약(총금액 / 주문일자 / 토글아이콘)
 * - 모든 주문(1개든 n개든)에서 토글 가능
 * - UI / 클래스 / SCSS 절대 변경 없음
 * - 페이지네이션은 부모에서 처리 (OrderInfo)
 */
export default function OrderList({
  data = [],
  type = "user",
  onReviewClick,
  onStatusChange,
}) {
  const [openIds, setOpenIds] = useState([]);

  /** ✅ 아코디언 토글 */
  const toggleAccordion = (orderId) => {
    setOpenIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  /** ✅ 상태 텍스트 변환 */
  const getStatusLabel = (status) => {
    const mapUser = {
      주문완료: "주문 확인중",
      배달완료: "배달 완료",
      주문취소: "주문 취소",
    };
    const mapOwner = {
      주문완료: "주문 완료",
      배달완료: "배달 완료",
      주문취소: "주문 취소",
    };
    return type === "user" ? mapUser[status] : mapOwner[status];
  };

  if (!data?.length) {
    return <p className="txt-center txt-gray">주문 내역이 없습니다.</p>;
  }

  return (
    <div className="order-list">
      {data.map((order) => {
        const { orderId, orderDate, totalPrice, status, itemList, storeName } =
          order;

        const isOpen = openIds.includes(orderId);
        const isReviewable = type === "user" && status === "배달완료";
        const formattedDate = orderDate?.split(" ")[0] ?? "";

        return (
          <div key={orderId} className={`order-card ${isOpen ? "open" : ""}`}>
            {/* ===== 헤더 영역 ===== */}
            <div
              className="order-card-header"
              onClick={() => toggleAccordion(orderId)}
            >
              <div className="order-info">
                <h4 className="order-title">{storeName || "가게명 미표시"}</h4>

                <p className="order-detail">
                  <span>{formatPrice(totalPrice)}원</span> /{" "}
                  <span>{formattedDate}</span>
                  <FaAngleDown className="toggle-arrow" />
                </p>
              </div>

              <div className="order-actions">
                <span
                  className={`badge ${
                    status === "주문취소"
                      ? "badge-cancel"
                      : status === "배달완료"
                      ? "badge-done"
                      : "badge-progress"
                  }`}
                >
                  {getStatusLabel(status)}
                </span>

                {type === "user" && (
                  <button
                    className={`btn btn-round btn-sm ${
                      isReviewable ? "btn-primary" : "btn-disabled"
                    }`}
                    disabled={!isReviewable}
                    onClick={() => isReviewable && onReviewClick(order)}
                  >
                    리뷰 쓰기
                  </button>
                )}

                {type === "owner" && status === "주문완료" && (
                  <>
                    <button
                      className="btn btn-outline"
                      onClick={() => onStatusChange(orderId, "주문취소", order)}
                    >
                      주문 취소
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => onStatusChange(orderId, "배달완료", order)}
                    >
                      배달 완료
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* ===== 상세(항목 리스트) ===== */}
            <div
              className="order-items"
              style={{ display: isOpen ? "block" : "none" }}
            >
              {itemList.map((item, idx) => (
                <div className="order-item" key={idx}>
                  <div className="item-row">
                    <span className="menu-name">{item.menuName}</span>
                    <div>
                      <span className="qty">x {item.quantity}</span>
                      <span className="price">
                        {formatPrice(item.totalPrice)} 원
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
            </div>
          </div>
        );
      })}
    </div>
  );
}
