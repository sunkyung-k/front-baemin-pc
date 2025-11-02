import React, { useState } from "react";
import styles from "./OptionPanel.module.scss";
import { FaPlus } from "react-icons/fa";
import OptionModal from "./OptionModal";
import { useMenuOption } from "@/hooks/menu/useMenuOption";
import EmptyState from "@/components/menu/EmptyState";

export default function OptionPanel({ menuId, group }) {
  const { create, update, remove } = useMenuOption(menuId);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [editTarget, setEditTarget] = useState(null);

  const optionList = group?.menuOptionList ?? [];

  /** 모달 열기 */
  const handleOpenModal = (option = null, e) => {
    if (e) {
      e.stopPropagation();
      if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) {
        e.nativeEvent.stopImmediatePropagation(); // 전파 완전 차단
      }
    }
    setEditTarget(option);
    setMode(option ? "edit" : "create");
    setModalOpen(true);
  };

  /** 모달 닫기 */
  const handleCloseModal = () => {
    setEditTarget(null);
    setMode("create");
    setModalOpen(false);
  };

  /** 옵션 삭제 */
  const handleRemoveOption = (menuOptId, e) => {
    if (e) {
      e.stopPropagation();
      if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) {
        e.nativeEvent.stopImmediatePropagation();
      }
    }
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    remove.mutate(menuOptId, {
      onSuccess: () => alert("옵션이 삭제되었습니다."),
    });
  };

  return (
    <div className={styles.optionPanel}>
      {/* 옵션 리스트 */}
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

      {/* 옵션 등록/수정 모달 (Portal 렌더링) */}
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
