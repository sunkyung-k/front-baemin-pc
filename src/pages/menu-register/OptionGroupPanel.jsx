import React, { useState, useMemo, useEffect, useCallback } from "react";
import styles from "./OptionGroupPanel.module.scss";
import { useMenuCategoryStore } from "@/store/useMenuCategoryStore";
import EmptyState from "@/components/menu/EmptyState";
import { FaPuzzlePiece, FaPlus, FaCog, FaTimes } from "react-icons/fa";
import { TiPlus } from "react-icons/ti";
import OptionGroupModal from "./OptionGroupModal";
import OptionPanel from "./OptionPanel";
import OptionModal from "./OptionModal";
import { useMenuOptionGroup } from "@/hooks/menu/useMenuOptionGroup";
import menuAPI from "@/service/menu/menuAPI";
import { useHandleError } from "@/hooks/common/useHandleError";
import { useConfirmDelete } from "@/hooks/common/useConfirmDelete";

export default function OptionGroupPanel({ menuId }) {
  const { activeCategory, setActiveCategory } = useMenuCategoryStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [mode, setMode] = useState("create");
  const [optionModalOpen, setOptionModalOpen] = useState(false);
  const [optionGroupTarget, setOptionGroupTarget] = useState(null);
  const [openGroupId, setOpenGroupId] = useState(null);

  const { remove, refreshMenu } = useMenuOptionGroup(menuId);
  const handleError = useHandleError();
  const { handleDelete } = useConfirmDelete();

  /** 메뉴 상세 최신화 */
  useEffect(() => {
    const fetchMenuDetail = async () => {
      if (!activeCategory || !menuId) return;
      try {
        const updatedMenu = await menuAPI.getMenuDetail(menuId);
        if (!updatedMenu) return;
        const updatedList = activeCategory.menuList.map((m) =>
          m.menuId === menuId ? updatedMenu : m
        );
        setActiveCategory({ ...activeCategory, menuList: updatedList });
      } catch (err) {
        handleError(err, "OptionGroupPanel.fetchMenuDetail");
      }
    };
    fetchMenuDetail();
  }, [menuId]);

  /** targetMenu 구하기 */
  const targetMenu = useMemo(() => {
    if (!activeCategory?.menuList) return null;
    return activeCategory.menuList.find((m) => m.menuId === menuId);
  }, [activeCategory, menuId]);

  const groupList = targetMenu?.menuOptionGroupList ?? [];

  /** 그룹 토글 */
  const toggleGroup = useCallback(
    (groupId) => setOpenGroupId((prev) => (prev === groupId ? null : groupId)),
    []
  );

  /** 그룹 모달 열기 */
  const handleOpenGroupModal = useCallback((group = null, e) => {
    if (e) e.stopPropagation();
    setEditTarget(group);
    setMode(group ? "edit" : "create");
    setModalOpen(true);
  }, []);

  /** 그룹 모달 닫기 */
  const handleCloseGroupModal = useCallback(async () => {
    setModalOpen(false);
    setEditTarget(null);
    setMode("create");
    await refreshMenu();
  }, [refreshMenu]);

  /** 옵션 모달 열기/닫기 */
  const handleOpenOptionModal = useCallback((group, e) => {
    if (e) e.stopPropagation();
    setOptionGroupTarget(group);
    setOptionModalOpen(true);
  }, []);
  const handleCloseOptionModal = useCallback(async () => {
    const targetId = optionGroupTarget?.menuOptGrpId;
    setOptionModalOpen(false);
    await refreshMenu();
    if (targetId) setOpenGroupId(targetId);
    setOptionGroupTarget(null);
  }, [refreshMenu, optionGroupTarget]);

  /** 그룹 삭제 */
  const handleRemoveGroup = useCallback(
    async (groupId, e) => {
      e?.stopPropagation?.();
      try {
        //  handleDelete 제거 — remove 내부에서 이미 confirm/alert 수행
        await remove.mutateAsync(groupId);
        await refreshMenu();
      } catch (err) {
        handleError(err, "OptionGroupPanel.handleRemoveGroup");
      }
    },
    [remove, refreshMenu]
  );

  if (!targetMenu) {
    return (
      <div className={styles.emptyGroup}>
        <p>선택한 메뉴 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={styles.optionGroupPanel}>
      <button
        type="button"
        className={styles.addGroupButton}
        onClick={(e) => handleOpenGroupModal(null, e)}
      >
        <TiPlus size={18} /> 새 옵션 그룹
      </button>

      {groupList.length === 0 ? (
        <EmptyState
          icon={<FaPuzzlePiece />}
          title={`${targetMenu.menuName}의 등록된 옵션 그룹이 없습니다.`}
          description="추가 토핑, 사이즈 등 옵션 구성을 등록해주세요."
        />
      ) : (
        <div className={styles.optionGroupWrap}>
          {groupList.map((group) => {
            const isOpen = openGroupId === group.menuOptGrpId;
            return (
              <div key={group.menuOptGrpId} className={styles.optionGroupItem}>
                <div
                  className={styles.groupHeader}
                  onClick={() => toggleGroup(group.menuOptGrpId)}
                >
                  <div className={styles.groupTitle}>
                    <strong>{group.menuOptGrpName}</strong>
                    <span>
                      {group.requiredYn === "Y" ? "필수 선택" : "선택 가능"} (
                      {group.requiredYn === "Y"
                        ? `${group.minSelect ?? 1}개`
                        : `최대 ${group.maxSelect ?? 0}개`}
                      )
                    </span>
                  </div>
                  <div
                    className={styles.groupActions}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="btn btn-sm btn-secondary-line"
                      title="옵션 등록"
                      onClick={(e) => handleOpenOptionModal(group, e)}
                    >
                      <FaPlus />
                    </button>
                    <button
                      className="btn btn-sm btn-secondary-line"
                      title="옵션 그룹 수정"
                      onClick={(e) => handleOpenGroupModal(group, e)}
                    >
                      <FaCog />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      title="옵션 그룹 삭제"
                      onClick={(e) => handleRemoveGroup(group.menuOptGrpId, e)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>

                {isOpen && <OptionPanel menuId={menuId} group={group} />}
              </div>
            );
          })}
        </div>
      )}

      <OptionGroupModal
        key={`${menuId}-${mode}-${modalOpen ? "open" : "close"}`}
        menuId={menuId}
        isOpen={modalOpen}
        onClose={handleCloseGroupModal}
        defaultValues={editTarget}
        mode={mode}
      />

      <OptionModal
        menuId={menuId}
        groupId={optionGroupTarget?.menuOptGrpId}
        isOpen={optionModalOpen}
        onClose={handleCloseOptionModal}
      />
    </div>
  );
}
