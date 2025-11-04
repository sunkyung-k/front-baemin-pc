import React, { useState } from "react";
import styles from "./OptionPanel.module.scss";
import { FaPlus } from "react-icons/fa";
import OptionModal from "./OptionModal";
import { useMenuOption } from "@/hooks/menu/useMenuOption";
import { useHandleError } from "@/hooks/common/useHandleError";
import { useConfirmDelete } from "@/hooks/common/useConfirmDelete";
import EmptyState from "@/components/menu/EmptyState";

/**
 * 옵션 패널 (v2 alert 구조)
 * --------------------------------
 * - 삭제: useConfirmDelete
 * - 에러: useHandleError
 */
export default function OptionPanel({ menuId, group }) {
  const { remove, refreshMenu } = useMenuOption(menuId);
  const handleError = useHandleError();
  const { handleDelete } = useConfirmDelete();

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [editTarget, setEditTarget] = useState(null);

  const optionList = group?.menuOptionList ?? [];

  const handleOpenModal = (option = null, e) => {
    e?.stopPropagation?.();
    e?.nativeEvent?.stopImmediatePropagation?.();
    setEditTarget(option);
    setMode(option ? "edit" : "create");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditTarget(null);
    setMode("create");
    setModalOpen(false);
  };

  /** 옵션 삭제 */
  const handleRemoveOption = async (menuOptId, e) => {
    e?.stopPropagation?.();
    e?.nativeEvent?.stopImmediatePropagation?.();
    try {
      // ✅ handleDelete 제거 — remove 내부에서 이미 confirm/alert 수행
      await remove.mutateAsync(menuOptId);
      await refreshMenu();
    } catch (err) {
      handleError(err, "OptionPanel.handleRemoveOption");
    }
  };

  return (
    <div className={styles.optionPanel}>
      <div className={styles.optionList}>
        {optionList.length === 0 ? (
          <EmptyState
            icon={<FaPlus />}
            title={`${group.menuOptGrpName}의 등록된 옵션이 없습니다.`}
            description="새 옵션을 등록해보세요."
          />
        ) : (
          optionList.map((opt, index) => (
            <div key={opt.menuOptId || index} className={styles.optionItem}>
              <div className={styles.optionInfo}>
                <span className={styles.optName}>{opt.menuOptName}</span>
                <span
                  className={`${styles.optAvailable} ${
                    opt.availableYn === "Y" ? styles.on : styles.off
                  }`}
                >
                  {opt.availableYn === "Y" ? "선택 가능" : "선택 불가"}
                </span>
              </div>

              <div className={styles.optionActions}>
                <span className={styles.optPrice}>
                  + {opt.price?.toLocaleString() ?? 0}원
                </span>
                <button
                  className="btn btn-sm btn-secondary-line"
                  title="옵션 수정"
                  onClick={(e) => handleOpenModal(opt, e)}
                >
                  수정
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  title="옵션 삭제"
                  onClick={(e) => handleRemoveOption(opt.menuOptId, e)}
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <OptionModal
        menuId={menuId}
        groupId={group.menuOptGrpId}
        isOpen={modalOpen}
        onClose={handleCloseModal}
        defaultValues={editTarget}
        mode={mode}
      />
    </div>
  );
}
