import React, { useState } from "react";
import styles from "./MenuPanel.module.scss";
import EmptyState from "@/components/menu/EmptyState";
import { TiPlus } from "react-icons/ti";
import { FaUtensils, FaPen, FaTrashAlt } from "react-icons/fa";
import { MdContentCopy } from "react-icons/md";
import { useMenuCategoryStore } from "@/store/useMenuCategoryStore";
import { useMenu } from "@/hooks/menu/useMenu";
import MenuModal from "./MenuModal";
import OptionGroupPanel from "./OptionGroupPanel";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";
import { formatPrice } from "@/utills/valueFormatter";

export default function MenuPanel() {
  const { activeCategory } = useMenuCategoryStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const hasActiveCategory = !!activeCategory;
  const menuList = activeCategory?.menuList || [];
  const hasMenus = menuList.length > 0;

  const storeId =
    activeCategory?.storeId ||
    activeCategory?.store?.storeId ||
    activeCategory?.store_id ||
    activeCategory?.storeID;

  const { create, update, remove, copy } = useMenu(storeId);

  /** 메뉴 등록 모달 열기 */
  const handleCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  /** 메뉴 수정 모달 열기 */
  const handleEdit = (menu) => {
    setEditTarget(menu);
    setModalOpen(true);
  };

  /** 메뉴 등록/수정 */
  const handleSubmit = async (formData) => {
    try {
      if (editTarget) {
        await update.mutateAsync(formData);
        alert("메뉴가 수정되었습니다.");
      } else {
        await create.mutateAsync(formData);
        alert("메뉴가 등록되었습니다.");
      }
      setModalOpen(false);
    } catch (err) {
      console.error("메뉴 등록/수정 실패:", err);
      alert("등록/수정 중 오류가 발생했습니다.");
    }
  };

  /** 메뉴 삭제 */
  const handleRemove = async (menuId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await remove.mutateAsync(menuId);
      alert("삭제되었습니다.");
    } catch (err) {
      console.error("메뉴 삭제 실패:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  /** 메뉴 복사 */
  const handleCopy = async (menuId) => {
    if (!window.confirm("이 메뉴를 복사하시겠습니까?")) return;
    try {
      await copy.mutateAsync(menuId);
      alert("메뉴가 복사되었습니다.");
    } catch (err) {
      console.error("메뉴 복사 실패:", err);
      alert("복사 중 오류가 발생했습니다.");
    }
  };

  /** 옵션 그룹 토글 */
  const handleToggle = (menuId) => {
    setActiveMenuId((prev) => (prev === menuId ? null : menuId));
  };

  if (!hasActiveCategory) {
    return (
      <section className={styles.detailPanel}>
        <EmptyState
          icon={<FaUtensils />}
          title="카테고리를 먼저 선택해주세요."
          description="좌측에서 카테고리를 클릭하면 메뉴를 등록할 수 있습니다."
        />
      </section>
    );
  }

  return (
    <section className={styles.detailPanel}>
      <div className={styles.detailHeader}>
        <h2 className={styles.categoryTitle}>
          <span>{activeCategory.menuCaName}</span>
        </h2>

        <button
          className="btn btn-primary-line btn-default btn-sm"
          onClick={handleCreate}
        >
          <TiPlus size={18} /> 메뉴
        </button>
      </div>

      {hasMenus ? (
        <div className={styles.menuList}>
          {menuList.map((menu, index) => {
            const key = menu.menuId ?? `${menu.menuName}-${index}`;
            const imageSrc = getAbsoluteImageUrl(menu);
            const isActive = activeMenuId === menu.menuId;

            return (
              <div key={key} className={styles.menuItem}>
                <div
                  className={`${styles.menuHeader} ${
                    isActive ? styles.active : ""
                  }`}
                  onClick={() => handleToggle(menu.menuId)}
                >
                  <div className={styles.menuLeft}>
                    <div className={styles.menuThumb}>
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={menu.menuName}
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      ) : (
                        <span className={styles.noImage}>사진 없음</span>
                      )}

                      {menu.soldoutYn === "Y" && (
                        <span className={styles.soldoutBadge}>품절</span>
                      )}
                    </div>

                    <div className={styles.menuInfo}>
                      <h4>{menu.menuName}</h4>
                      <p>{menu.description || "메뉴 설명이 없습니다."}</p>
                    </div>
                  </div>

                  <div className={styles.menuRight}>
                    <div className={styles.menuPrice}>
                      {`${formatPrice(menu.price ?? 0)}원`}
                    </div>

                    <div className={styles.menuButtons}>
                      {/* 수정 */}
                      <button
                        className="btn btn-sm btn-secondary-line"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(menu);
                        }}
                      >
                        <FaPen />
                        수정
                      </button>

                      {/* 복사 */}
                      <button
                        className="btn btn-sm btn-primary-line"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(menu.menuId);
                        }}
                      >
                        <MdContentCopy />
                        복사
                      </button>

                      {/* 삭제 */}
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(menu.menuId);
                        }}
                      >
                        <FaTrashAlt />
                        삭제
                      </button>
                    </div>
                  </div>
                </div>

                {/* 옵션 패널 */}
                {isActive && (
                  <div className={styles.optionPanelWrapper}>
                    <OptionGroupPanel menuId={menu.menuId} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<FaUtensils />}
          title="현재 카테고리에 등록된 메뉴가 없습니다."
          description="가게에서 판매할 메뉴를 등록해주세요."
        />
      )}

      {/* 모달 */}
      <MenuModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={editTarget ? "edit" : "create"}
        defaultValues={editTarget}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
