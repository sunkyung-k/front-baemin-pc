import React, { useState, useMemo } from "react";
import styles from "./MenuPanel.module.scss";
import EmptyState from "@/components/menu/EmptyState";
import { TiPlus } from "react-icons/ti";
import { FaUtensils } from "react-icons/fa";
import MenuFormModal from "./MenuFormModal";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useMenu } from "@/hooks/useMenu";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";

export default function MenuPanel() {
  const { activeCategory } = useCategoryStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const hasActiveCategory = !!activeCategory;
  const menuList = useMemo(
    () => activeCategory?.menuList ?? [],
    [activeCategory]
  );
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
      if (editTarget) await update.mutateAsync(formData);
      else await create.mutateAsync(formData);
      setModalOpen(false);
      alert(editTarget ? "메뉴가 수정되었습니다." : "메뉴가 등록되었습니다.");
    } catch (err) {
      console.error("메뉴 등록/수정 실패:", err);
      alert("등록/수정 중 오류가 발생했습니다.");
    }
  };

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

            return (
              <div key={key} className={styles.menuItem}>
                <div className={styles.menuHeader}>
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
                        className="btn btn-small btn-secondary"
                        onClick={() => handleEdit(menu)}
                      >
                        <i className="fas fa-pen"></i> 수정
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleRemove(menu.menuId)}
                      >
                        <i className="fas fa-trash-alt"></i> 삭제
                      </button>
                    </div>
                  </div>
                </div>
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

      <MenuFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={editTarget ? "edit" : "create"}
        defaultValues={editTarget}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
