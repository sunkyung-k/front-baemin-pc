import React, { useEffect, useRef, useState, useMemo } from "react";
import styles from "./CategoryPanel.module.scss";
import { TiPlus } from "react-icons/ti";
import { MdModeEdit } from "react-icons/md";
import { FaTrashAlt, FaLayerGroup } from "react-icons/fa";
import Modal from "@/components/common/Modal";
import InputField from "@/components/form/InputField";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMenuCategory } from "../../hooks/useMenuCategory";
import { dummyRegister } from "../../utills/formUtils";
import EmptyState from "../../components/menu/EmptyState";

const schema = yup.object().shape({
  categoryName: yup.string().required("카테고리명을 입력해주세요."),
  categoryOrder: yup
    .number()
    .typeError("숫자만 입력 가능합니다.")
    .required("정렬 순서를 입력해주세요."),
});

export default function CategoryPanel({ storeId }) {
  const [activeId, setActiveId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editableValues, setEditableValues] = useState({});
  const prevJSONRef = useRef("");

  const {
    categories,
    isLoading,
    isError,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch,
  } = useMenuCategory(storeId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  useEffect(() => {
    if (!Array.isArray(categories) || categories.length === 0) {
      if (prevJSONRef.current !== "{}") {
        setEditableValues({});
        prevJSONRef.current = "{}";
      }
      return;
    }

    const nextValues = categories.reduce((acc, c) => {
      acc[c.menuCaId] = {
        name: c.menuCaName ?? "",
        order: c.displayOrder ?? 0,
      };
      return acc;
    }, {});

    const nextJSON = JSON.stringify(nextValues);
    if (prevJSONRef.current !== nextJSON) {
      prevJSONRef.current = nextJSON;
      setEditableValues(nextValues);
    }
  }, [categories]);

  const visibleCategories = useMemo(
    () => categories?.filter((cat) => cat.delYn === "N") ?? [],
    [categories]
  );

  const onSubmit = (data) => {
    const payload = {
      storeId,
      menuCaName: data.categoryName,
      displayOrder: Number(data.categoryOrder),
    };
    createCategory.mutate(payload, {
      onSuccess: () => {
        reset();
        setModalOpen(false);
        refetch();
      },
    });
  };

  const handleUpdate = (id) => {
    const target = editableValues[id];
    if (!target) return;

    const payload = {
      menuCaId: id,
      menuCaName: target.name.trim(),
      displayOrder: Number(target.order),
    };

    updateCategory.mutate(payload, {
      onSuccess: () => refetch(),
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      deleteCategory.mutate(id, {
        onSuccess: () => refetch(),
      });
    }
  };

  const handleToggle = (id) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  const handleChangeEditable = (id, field, value) => {
    setEditableValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

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

      {/* ✅ EmptyState 적용 */}
      {visibleCategories.length > 0 ? (
        <div className={styles.categoryList}>
          {visibleCategories.map((cat) => {
            const cur = editableValues?.[cat.menuCaId] || {
              name: cat.menuCaName ?? "",
              order: cat.displayOrder ?? 0,
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
                        value={cur.name}
                        onChange={(e) =>
                          handleChangeEditable(
                            cat.menuCaId,
                            "name",
                            e.target.value
                          )
                        }
                        register={dummyRegister}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <InputField
                        label="정렬 순서"
                        name={`order_${cat.menuCaId}`}
                        type="number"
                        value={cur.order}
                        onChange={(e) =>
                          handleChangeEditable(
                            cat.menuCaId,
                            "order",
                            e.target.value
                          )
                        }
                        register={dummyRegister}
                      />
                    </div>

                    <div className={styles.btnRow}>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.secondary} ${styles.small}`}
                        onClick={() => handleUpdate(cat.menuCaId)}
                      >
                        <MdModeEdit /> 수정
                      </button>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.danger} ${styles.small}`}
                        onClick={() => handleDelete(cat.menuCaId)}
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
        >
          <button
            className="btn btn-primary btn-full"
            onClick={() => setModalOpen(true)}
          >
            <TiPlus size={18} /> 카테고리 등록
          </button>
        </EmptyState>
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
