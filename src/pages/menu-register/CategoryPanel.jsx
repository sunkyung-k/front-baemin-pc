import React, { useState, useMemo, useEffect } from "react";
import styles from "./CategoryPanel.module.scss";
import { TiPlus } from "react-icons/ti";
import { FaTrashAlt, FaLayerGroup, FaPen } from "react-icons/fa";
import Modal from "@/components/common/Modal";
import InputField from "@/components/form/InputField";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMenuCategory } from "@/hooks/menu/useMenuCategory";
import { dummyRegister } from "@/utills/formUtils";
import EmptyState from "@/components/menu/EmptyState";
import { useCategoryStore } from "@/store/useCategoryStore";

/** yup 유효성 검사 스키마 (등록 전용) */
const schema = yup.object().shape({
  categoryName: yup.string().required("카테고리명을 입력해주세요."),
  categoryOrder: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? undefined : value
    )
    .typeError("숫자만 입력 가능합니다.")
    .required("정렬 순서를 입력해주세요.")
    .min(1, "정렬 순서는 1 이상이어야 합니다."), // 1 이상만 허용
});

export default function CategoryPanel({ storeId }) {
  const [activeId, setActiveId] = useState(null);
  const [editableValues, setEditableValues] = useState({});
  const [modalOpen, setModalOpen] = useState(false);

  const { setActiveCategory, clearActiveCategory } = useCategoryStore();
  const { categories, createCategory, updateCategory, removeCategory } =
    useMenuCategory(storeId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  /** 삭제되지 않은 카테고리만 표시 */
  const visibleCategories = useMemo(
    () => categories.filter((cat) => cat.delYn === "N"),
    [categories]
  );

  /** 신규 카테고리 등록 */
  const onSubmit = (data) => {
    createCategory.mutate(
      {
        storeId,
        menuCaName: data.categoryName,
        displayOrder: Number(data.categoryOrder),
      },
      {
        onSuccess: () => {
          reset();
          setModalOpen(false);
        },
      }
    );
  };

  /** 수정 (수동 입력용) */
  const handleUpdate = (id) => {
    const target = editableValues[id];
    if (!target || !target.name?.trim()) {
      alert("카테고리명을 입력해주세요.");
      return;
    }

    const orderNum = Number(target.order ?? 0);
    if (isNaN(orderNum) || orderNum < 1) {
      alert("정렬 순서는 1 이상의 숫자만 입력 가능합니다."); // 0 이하 차단
      return;
    }

    updateCategory.mutate({
      menuCaId: id,
      menuCaName: target.name.trim(),
      displayOrder: orderNum,
    });
  };

  /** 삭제 */
  const handleRemove = (id) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      removeCategory.mutate(id, {
        onSuccess: () => {
          if (id === activeId) {
            setActiveId(null);
            clearActiveCategory();
          }
        },
      });
    }
  };

  /** 클릭 시 활성 토글 */
  const handleToggle = (id) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  /** 활성 카테고리 상태 동기화 */
  useEffect(() => {
    if (!categories?.length) return;

    if (activeId === null) {
      clearActiveCategory();
      return;
    }

    const selected = categories.find((c) => c.menuCaId === activeId);
    if (!selected) return;

    setActiveCategory({ ...selected, storeId });
  }, [activeId, categories, storeId]);

  return (
    <section className={styles.categoryPanel}>
      <div className={styles.categoryHeader}>
        <h2>메뉴 카테고리</h2>
      </div>

      <button
        type="button"
        className="btn btn-default btn-primary"
        onClick={() => setModalOpen(true)}
      >
        <TiPlus size={18} /> 새 카테고리 등록
      </button>

      {/* 카테고리 목록 */}
      {visibleCategories.length > 0 ? (
        <div className={styles.categoryList}>
          {visibleCategories.map((cat) => {
            const cur = editableValues?.[cat.menuCaId] || {
              name: cat.menuCaName ?? "",
              order: cat.displayOrder ?? 1,
            };

            return (
              <div
                key={cat.menuCaId}
                className={`${styles.categoryItem} ${
                  activeId === cat.menuCaId ? styles.active : ""
                }`}
                onClick={() => handleToggle(cat.menuCaId)}
              >
                <div className={styles.categoryItemHeader}>
                  <strong>{cat.menuCaName}</strong>
                  <span className={styles.categoryItemMeta}>
                    메뉴 {cat.menuList?.length ?? 0}개 | 순서 {cat.displayOrder}
                  </span>
                </div>

                {activeId === cat.menuCaId && (
                  <div
                    className={styles.categoryEdit}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={styles.formGroup}>
                      <InputField
                        label="카테고리명"
                        name={`name_${cat.menuCaId}`}
                        type="text"
                        value={cur.name ?? ""}
                        onChange={(e) =>
                          setEditableValues((prev) => ({
                            ...prev,
                            [cat.menuCaId]: {
                              ...cur,
                              name: e.target.value,
                            },
                          }))
                        }
                        register={dummyRegister}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <InputField
                        label="정렬 순서"
                        name={`order_${cat.menuCaId}`}
                        type="number"
                        value={cur.order ?? 1}
                        onChange={(e) =>
                          setEditableValues((prev) => ({
                            ...prev,
                            [cat.menuCaId]: {
                              ...cur,
                              order: e.target.value,
                            },
                          }))
                        }
                        register={dummyRegister}
                      />
                    </div>

                    <div className={styles.btnRow}>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary-line"
                        onClick={() => handleUpdate(cat.menuCaId)}
                      >
                        <FaPen /> 수정
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => handleRemove(cat.menuCaId)}
                      >
                        <FaTrashAlt /> 삭제
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<FaLayerGroup />}
          title="등록된 메뉴 카테고리가 없습니다."
          description="가게 메뉴를 구분할 카테고리를 먼저 등록해주세요."
        />
      )}

      {/* 등록 모달 */}
      <Modal
        isOpen={modalOpen}
        title="카테고리 등록"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="modalForm">
          <InputField
            label="카테고리명"
            name="categoryName"
            placeholder="예: 커피/음료"
            register={register}
            errorMessage={errors.categoryName?.message}
          />
          <InputField
            label="정렬 순서"
            name="categoryOrder"
            type="number"
            placeholder="예: 1"
            register={register}
            errorMessage={errors.categoryOrder?.message}
          />
          <button type="submit" className="btn btn-primary btn-full">
            등록
          </button>
        </form>
      </Modal>
    </section>
  );
}
