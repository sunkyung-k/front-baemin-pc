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
import { useMenuCategoryStore } from "@/store/useMenuCategoryStore";
import { useHandleError } from "@/hooks/common/useHandleError";

const schema = yup.object().shape({
  categoryName: yup.string().required("카테고리명을 입력해주세요."),
  categoryOrder: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? undefined : value
    )
    .typeError("숫자만 입력 가능합니다.")
    .required("정렬 순서를 입력해주세요.")
    .min(1, "정렬 순서는 1 이상이어야 합니다."),
});

export default function CategoryPanel({ storeId }) {
  const [activeId, setActiveId] = useState(null);
  const [editableValues, setEditableValues] = useState({});
  const [editableErrors, setEditableErrors] = useState({});
  const [modalOpen, setModalOpen] = useState(false);

  const { setActiveCategory, clearActiveCategory } = useMenuCategoryStore();
  const { categories, createCategory, updateCategory, removeCategory } =
    useMenuCategory(storeId);
  const handleError = useHandleError();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const visibleCategories = useMemo(
    () => categories.filter((cat) => cat.delYn === "N"),
    [categories]
  );

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
        onError: (err) => handleError(err, "CategoryPanel.create"),
      }
    );
  };

  const handleUpdate = (id) => {
    const target = editableValues[id];
    if (!target) return;

    try {
      schema.validateSync(
        {
          categoryName: target.name,
          categoryOrder: target.order,
        },
        { abortEarly: false }
      );

      setEditableErrors((prev) => ({ ...prev, [id]: {} }));
      updateCategory.mutate(
        {
          menuCaId: id,
          menuCaName: target.name.trim(),
          displayOrder: Number(target.order),
        },
        {
          onError: (err) => handleError(err, "CategoryPanel.update"),
        }
      );
    } catch (err) {
      if (err.inner?.length) {
        const errorObj = {};
        err.inner.forEach((e) => {
          if (e.path === "categoryName") errorObj.name = e.message;
          if (e.path === "categoryOrder") errorObj.order = e.message;
        });
        setEditableErrors((prev) => ({
          ...prev,
          [id]: errorObj,
        }));
      }
    }
  };

  const handleRemove = (id) => {
    removeCategory.mutate(id, {
      onSuccess: () => {
        if (id === activeId) {
          setActiveId(null);
          clearActiveCategory();
        }
      },
      onError: (err) => handleError(err, "CategoryPanel.remove"),
    });
  };

  const handleToggle = (id) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

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

      {visibleCategories.length > 0 ? (
        <div className={styles.categoryList}>
          {visibleCategories.map((cat) => {
            const cur = editableValues?.[cat.menuCaId] || {
              name: cat.menuCaName ?? "",
              order: cat.displayOrder ?? 1,
            };
            const curErrors = editableErrors?.[cat.menuCaId] || {};

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
                        errorMessage={curErrors.name}
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
                        errorMessage={curErrors.order}
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
