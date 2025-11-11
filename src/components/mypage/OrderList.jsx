import React, { useState, useEffect } from "react";
import { formatPrice } from "@/utills/valueFormatter";
import { FaAngleDown, FaUtensils } from "react-icons/fa";
import EmptyState from "@/components/menu/EmptyState";

export default function OrderList({
  data = [],
  type = "user",
  onReviewClick,
  onStatusChange,
  refreshTrigger, // 페이지 이동 등 외부 트리거로 초기화
  readOnly = false,
}) {
  const [openIds, setOpenIds] = useState([]);

  /** 외부 트리거(page 등) 발생 시 자동 닫기 */
  useEffect(() => {
    if (!readOnly) setOpenIds([]);
  }, [refreshTrigger, readOnly]);

  /** 데이터 변경 시 기존 open 상태 유지 */
  useEffect(() => {
    if (!readOnly) {
      setOpenIds((prev) =>
        prev.filter((id) => data.some((o) => o.orderId === id))
      );
    }
  }, [data, readOnly]);

  /** 아코디언 토글 */
  const toggleAccordion = (orderId) => {
    if (readOnly) return;
    setOpenIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  /** 상태 텍스트 변환 */
  const getStatusLabel = (status) => {
    if (readOnly && status === "주문완료") return "";

    const mapUser = {
      주문완료: "주문 확인중",
      배달완료: "배달 완료",
      주문취소: "주문 취소",
    };
    const mapOwner = {
      주문완료: "",
      배달완료: "배달 완료",
      주문취소: "주문 취소",
    };
    return type === "user" ? mapUser[status] : mapOwner[status];
  };

  /** 데이터 없을 때 EmptyState 출력 */
  if (!data?.length) {
    return (
      <EmptyState
        icon={<FaUtensils />}
        title="주문 내역이 없습니다."
        description="최근 주문하신 내역이 여기에 표시됩니다."
      />
    );
  }

  return (
    <div className={`order-list ${readOnly ? "read-only" : ""}`}>
      {data.map((order) => {
        const { orderId, orderDate, totalPrice, status, itemList, storeName } =
          order;

        const isOpen = readOnly ? true : openIds.includes(orderId);
        const isReviewable = type === "user" && status === "배달완료";
        const formattedDate = orderDate?.split(" ")[0] ?? "";

        return (
          <div key={orderId} className={`order-card ${isOpen ? "open" : ""}`}>
            <div
              className="order-card-header"
              onClick={() => toggleAccordion(orderId)}
            >
              <div className="order-info">
                <h4 className="order-title">{storeName || "가게명 미표시"}</h4>

                <div className="order-detail">
                  <p>{formatPrice(totalPrice)}원</p> /{" "}
                  <span>{formattedDate}</span>
                  {!readOnly && <FaAngleDown className="toggle-arrow" />}
                </div>
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

                {!readOnly && type === "user" && status !== "주문취소" && (
                  <button
                    className={`btn btn-round btn-sm ${
                      isReviewable ? "btn-primary" : "btn-disabled"
                    }`}
                    disabled={!isReviewable}
                    onClick={(e) => {
                      e.stopPropagation(); // 부모 토글 차단
                      isReviewable && onReviewClick(order);
                    }}
                  >
                    리뷰 쓰기
                  </button>
                )}

                {type === "owner" && status === "주문완료" && (
                  <>
                    <button
                      className="btn btn-outline btn-round btn-sm btn-danger"
                      onClick={(e) => {
                        e.stopPropagation(); // 부모 토글 이벤트 차단
                        onStatusChange(orderId, "주문취소", order);
                      }}
                    >
                      주문 취소
                    </button>
                    <button
                      className="btn btn-primary btn-round btn-sm"
                      onClick={(e) => {
                        e.stopPropagation(); // 부모 토글 이벤트 차단
                        onStatusChange(orderId, "배달완료", order);
                      }}
                    >
                      배달 완료
                    </button>
                  </>
                )}
              </div>
            </div>

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
