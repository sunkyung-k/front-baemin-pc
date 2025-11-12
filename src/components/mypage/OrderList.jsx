import React, { useState, useEffect } from "react";
import { formatPrice } from "@/utills/valueFormatter";
import { FaAngleDown, FaUtensils } from "react-icons/fa";
import EmptyState from "../menu/EmptyState";

/**
 * OrderList (주문 내역 공용 컴포넌트)
 * --------------------------------------------------
 * - type: "user" | "owner"
 * - data 변경 시 강제 리렌더 처리 (리뷰등록 직후 즉시 반영)
 */
export default function OrderList({
  data = [],
  type = "user",
  onReviewClick,
  onStatusChange,
  refreshTrigger,
  readOnly = false,
}) {
  const [openIds, setOpenIds] = useState([]);
  const [renderKey, setRenderKey] = useState(0); //  렌더 강제 트리거 키

  /**  외부 트리거 (페이지 변경 등) 시 아코디언 초기화 및 데이터 변경 시 강제 리렌더 */
  useEffect(() => {
    // data 내부 값 변화(reviewed: true)에 대한 강제 리렌더 트리거
    setRenderKey((prev) => prev + 1);

    // readOnly 상태가 아니거나, 데이터가 변경되면 openIds 정리
    if (!readOnly || data.length > 0) {
      // 현재 데이터에 없는 orderId는 openIds에서 제거 (상태 유지)
      setOpenIds((prev) =>
        prev.filter((id) => data.some((o) => o.orderId === id))
      );
    }
  }, [data, readOnly, refreshTrigger]);

  /**
   * 아코디언 토글
   * (기본적으로 토글 활성화. readOnly=true일 때만 비활성화)
   */
  const toggleAccordion = (orderId) => {
    // 토글 비활성화 조건: readOnly가 true일 때
    if (readOnly) return;

    setOpenIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  /**  상태 표시 텍스트 */
  const getStatusLabel = (status) => {
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

  /**  데이터 없을 때 EmptyState 출력 */
  /**  데이터 없을 때 EmptyState 출력 */
  if (!data?.length) {
    const emptyProps =
      type === "user"
        ? {
            icon: <FaUtensils />,
            title: "주문 내역이 없습니다.",
            description: "최근 주문하신 내역이 여기에 표시됩니다.",
          }
        : {
            icon: <FaUtensils />,
            title: "접수된 주문이 없습니다.",
            description: "새로운 주문이 들어오면 여기에 표시됩니다.",
          };

    return <EmptyState {...emptyProps} />;
  }

  // 토글 기능이 활성화되었는지 확인하는 플래그 (UI 표시용)
  const isToggleActive = !readOnly;

  return (
    <div
      key={renderKey} //  data 내부 값 변화(markReviewed)에 대한 강제 리렌더 트리거
      className={`order-list ${readOnly ? "read-only" : ""}`}
    >
      {data.map((order) => {
        const {
          orderId,
          orderDate,
          totalPrice,
          status,
          itemList,
          storeName,
          reviewed,
        } = order;

        const isOpen = openIds.includes(orderId);

        /**  리뷰쓰기 버튼 표시 조건
         * - 배달완료 상태
         * - reviewed === false (또는 undefined)
         */
        const isReviewable =
          !readOnly &&
          type === "user" &&
          status === "배달완료" &&
          (reviewed === false || reviewed === undefined);

        return (
          <div key={orderId} className={`order-card ${isOpen ? "open" : ""}`}>
            <div
              className="order-card-header"
              onClick={
                isToggleActive ? () => toggleAccordion(orderId) : undefined
              }
              style={{ cursor: isToggleActive ? "pointer" : "default" }}
            >
              <div className="order-info">
                <h4 className="order-title">{storeName || "가게명 미표시"}</h4>

                <div className="order-detail">
                  <p>{formatPrice(totalPrice)}원</p> /{" "}
                  <span>{orderDate ?? ""}</span>
                  {isToggleActive && <FaAngleDown className="toggle-arrow" />}
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

                {/*  리뷰쓰기 버튼 */}
                {isReviewable && (
                  <button
                    className="btn btn-round btn-sm btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReviewClick(order);
                    }}
                  >
                    리뷰 쓰기
                  </button>
                )}

                {/*  점주용 상태 변경 버튼 */}
                {type === "owner" && status === "주문완료" && (
                  <>
                    <button
                      className="btn btn-outline btn-round btn-sm btn-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusChange(orderId, "주문취소", order);
                      }}
                    >
                      주문 취소
                    </button>
                    <button
                      className="btn btn-primary btn-round btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
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
