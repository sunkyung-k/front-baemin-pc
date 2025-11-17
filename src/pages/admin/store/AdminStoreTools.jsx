import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useQueryClient } from "@tanstack/react-query";
import useAdminStoreDetail from "@/hooks/admin/useAdminStoreDetail";
import { QUERY_KEYS } from "@/constants/queryKeys";
import styles from "./AdminStoreTools.module.scss";

export default function AdminStoreTools({ storeId, closeYn }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { updateStatus, remove } = useAdminStoreDetail();

  /** 현재 상태를 로컬에서 보관 (UI 즉각 업데이트용) */
  const [localYn, setLocalYn] = useState(closeYn);

  /** 상태 토글 클릭 */
  const handleToggle = () => {
    const nextYn = localYn === "Y" ? "N" : "Y";
    const nextLabel = nextYn === "Y" ? "휴무" : "영업";

    const getConfirmMessage = (label) =>
      `가게를 "${label}" 상태로 전환하시겠습니까?\n모든 요일이 동일한 상태로 변경됩니다.`;

    if (!confirm(getConfirmMessage(nextLabel))) return;

    updateStatus.mutate(
      { storeId, closeYn: nextYn },
      {
        onSuccess: () => {
          setLocalYn(nextYn); // UI 즉시 반영
          queryClient.invalidateQueries([QUERY_KEYS.STORE_DETAIL, storeId]);
          queryClient.invalidateQueries(["adminStoreList"]);
        },
      }
    );
  };

  /** 삭제 버튼 */
  const handleDelete = () => {
    if (!confirm("정말 가게를 삭제할까요?")) return;

    remove.mutate(storeId, {
      onSuccess: () => {
        alert("가게가 삭제되었습니다.");
        queryClient.invalidateQueries(["adminStoreList"]);
        navigate("/store", { replace: true });
      },
    });
  };

  return (
    <div className={styles.toolsWrap}>
      <div className={styles.toggleArea}>
        <span className={styles.label}>영업 상태</span>

        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={localYn !== "Y"}
            onChange={handleToggle}
          />
          <span className={styles.slider}></span>
        </label>

        <span className={styles.stateText}>
          {localYn === "Y" ? "휴무 중" : "영업 중"}
        </span>
      </div>

      <button className="btn btn-default btn-danger" onClick={handleDelete}>
        가게 삭제
      </button>
    </div>
  );
}
