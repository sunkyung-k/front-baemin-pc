import React, { useState } from "react";
import styles from "./MenuPanel.module.scss";
import EmptyState from "@/components/menu/EmptyState";
import { TiPlus } from "react-icons/ti";
import { FaUtensils, FaPen, FaTrashAlt } from "react-icons/fa";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useMenu } from "@/hooks/menu/useMenu";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";
import MenuModal from "./MenuModal";
import OptionGroupPanel from "./OptionGroupPanel";

/**
 * 메뉴 패널 (카테고리별 메뉴 목록 + CRUD)
 * - React Query + Zustand 완전 동기화 구조
 * - useMemo 제거 → 즉시 반영 보장
 */
export default function MenuPanel() {
  const { activeCategory } = useCategoryStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null); // 옵션 그룹 토글 상태

  const hasActiveCategory = !!activeCategory;
  const menuList = activeCategory?.menuList || []; // useMemo 제거로 즉시 반영 보장
  const hasMenus = menuList.length > 0;

  const storeId =
    activeCategory?.storeId ||
    activeCategory?.store?.storeId ||
    activeCategory?.store_id ||
    activeCategory?.storeID;

  const { create, update, remove } = useMenu(storeId);

  /** 메뉴 등록 버튼 클릭 */
  const handleCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  /** 메뉴 수정 버튼 클릭 */
  const handleEdit = (menu) => {
    setEditTarget(menu);
    setModalOpen(true);
  };

  /** 등록 / 수정 처리 */
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

  /** 메뉴 삭제 처리 */
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

  /** 메뉴 클릭 시 옵션 그룹 토글 */
  const handleToggle = (menuId) => {
    setActiveMenuId((prev) => (prev === menuId ? null : menuId));
  };

  /** 선택된 카테고리가 없을 때 */
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

  /** 메뉴 리스트 렌더링 */
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
                {/* 메뉴 헤더 */}
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

                {/* 옵션 그룹 패널 */}
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

      {/* 메뉴 등록/수정 모달 */}
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
