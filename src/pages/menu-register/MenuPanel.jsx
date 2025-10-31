import React, { useState, useMemo } from "react";
import styles from "./MenuPanel.module.scss";
import EmptyState from "@/components/menu/EmptyState";
import { TiPlus } from "react-icons/ti";
import { FaUtensils } from "react-icons/fa";
import MenuFormModal from "./MenuFormModal";
import { useCategoryStore } from "@/store/useCategoryStore";
import menuAPI from "@/service/menuAPI";
import menuCategoryAPI from "@/service/menuCategoryAPI";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";

export default function MenuPanel() {
  const { activeCategory, setActiveCategory } = useCategoryStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const hasActiveCategory = !!activeCategory;
  const menuList = useMemo(
    () => activeCategory?.menuList ?? [],
    [activeCategory]
  );
  const hasMenus = menuList.length > 0;

  // 메뉴 목록 새로고침
  const refreshMenuList = async () => {
    try {
      const preservedStoreId =
        activeCategory?.storeId ||
        activeCategory?.store?.storeId ||
        activeCategory?.store_id ||
        activeCategory?.storeID;

      if (!preservedStoreId) return;

      const list = await menuCategoryAPI.getList(preservedStoreId);
      const matched = list.find(
        (cat) => cat.menuCaId === activeCategory.menuCaId
      );

      if (matched) {
        const cloned = {
          ...JSON.parse(JSON.stringify(matched)),
          storeId: preservedStoreId,
        };
        setActiveCategory(cloned);
      }
    } catch (err) {
      console.error("메뉴 목록 갱신 실패:", err);
    }
  };

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
      if (editTarget) await menuAPI.update(formData);
      else await menuAPI.create(formData);

      await refreshMenuList();
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
      await menuAPI.remove(menuId);
      await refreshMenuList();
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
  console.log("🧩 menuList 데이터 구조 확인:", menuList[0]);

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
