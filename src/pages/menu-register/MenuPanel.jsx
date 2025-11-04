import React, { useState } from "react";
import styles from "./MenuPanel.module.scss";
import EmptyState from "@/components/menu/EmptyState";
import { TiPlus } from "react-icons/ti";
import { FaUtensils, FaPen, FaTrashAlt } from "react-icons/fa";
import { useMenuCategoryStore } from "@/store/useMenuCategoryStore";
import { useMenu } from "@/hooks/menu/useMenu";
import MenuModal from "./MenuModal";
import OptionGroupPanel from "./OptionGroupPanel";
import { getAbsoluteImageUrl } from "../../utills/imageUtills";
import { useHandleError } from "@/hooks/common/useHandleError";

export default function MenuPanel() {
  const { activeCategory } = useMenuCategoryStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const handleError = useHandleError();

  const hasActiveCategory = !!activeCategory;
  const menuList = activeCategory?.menuList || [];
  const hasMenus = menuList.length > 0;

  const storeId =
    activeCategory?.storeId ||
    activeCategory?.store?.storeId ||
    activeCategory?.store_id ||
    activeCategory?.storeID;

  const { create, update, remove } = useMenu(storeId);

  const handleCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const handleEdit = (menu) => {
    setEditTarget(menu);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editTarget) {
        await update.mutateAsync(formData);
      } else {
        await create.mutateAsync(formData);
      }
      setModalOpen(false); // alert 생략 (메뉴관리 전용)
    } catch (err) {
      handleError(err, "MenuPanel.handleSubmit");
    }
  };

  const handleRemove = async (menuId) => {
    try {
      await remove.mutateAsync(menuId); // confirm + alert 통합
    } catch (err) {
      handleError(err, "MenuPanel.handleRemove");
    }
  };

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
        <button className="btn btn-primary btn-default" onClick={handleCreate}>
          <TiPlus size={18} /> 메뉴 등록
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
                      {menu.price?.toLocaleString()}원
                    </div>
                    <div className={styles.menuButtons}>
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
