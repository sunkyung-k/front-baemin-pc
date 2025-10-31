import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import FormModal from "@/components/form/FormModal";
import InputField from "@/components/form/InputField";
import TextareaField from "@/components/form/TextareaField";
import RadioGroup from "@/components/form/RadioGroup";
import ImageUpload from "@/components/form/ImageUpload";
import { useCategoryStore } from "@/store/useCategoryStore";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";

// 유효성 검사 스키마
const schema = yup.object().shape({
  menuName: yup.string().required("메뉴명을 입력해주세요."),
  price: yup
    .number()
    .typeError("가격은 숫자만 입력 가능합니다.")
    .required("가격을 입력해주세요."),
  description: yup
    .string()
    .max(500, "최대 500자까지 입력 가능합니다.")
    .required("메뉴 설명을 입력해주세요."),
  soldoutYn: yup.string().required("품절 여부를 선택해주세요."),
});

export default function MenuFormModal({
  isOpen,
  onClose,
  mode = "create", // "create" | "edit"
  defaultValues = null,
  onSubmit,
}) {
  const { activeCategory } = useCategoryStore();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      menuName: "",
      price: "",
      description: "",
      soldoutYn: "N", // 기본값: 판매중
      ...defaultValues,
    },
  });

  /** 모달 열릴 때 defaultValues 반영 */
  useEffect(() => {
    if (isOpen) {
      reset(defaultValues || { soldoutYn: "N" });
    }
  }, [isOpen, defaultValues, reset]);

  /** 폼 제출 핸들러 */
  const handleFormSubmit = (data) => {
    const formData = new FormData();

    formData.append(
      "menuCategoryId",
      activeCategory?.menuCaId || activeCategory?.menuCategoryId || ""
    );
    formData.append("menuName", data.menuName);
    formData.append("description", data.description);
    formData.append("price", data.price);
    formData.append("soldoutYn", data.soldoutYn);

    const fileField = data.menuImage;
    if (fileField instanceof FileList && fileField.length > 0) {
      formData.append("mainImage", fileField[0]);
    } else if (fileField instanceof File) {
      formData.append("mainImage", fileField);
    }

    if (mode === "edit" && defaultValues?.menuId) {
      formData.append("menuId", defaultValues.menuId);
    }

    onSubmit(formData);
  };

  /** 기존 이미지 미리보기 처리 */
  const currentImageUrl =
    mode === "edit" && defaultValues
      ? getAbsoluteImageUrl(defaultValues)
      : null;

  return (
    <FormModal
      title={mode === "edit" ? "메뉴 수정" : "메뉴 등록"}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(handleFormSubmit)}
      submitLabel={mode === "edit" ? "수정" : "등록"}
    >
      <InputField
        label="메뉴명"
        name="menuName"
        placeholder="메뉴명을 입력해주세요"
        register={register}
        errorMessage={errors.menuName?.message}
      />

      <InputField
        label="가격"
        name="price"
        type="number"
        placeholder="예: 8500"
        register={register}
        errorMessage={errors.price?.message}
      />

      <TextareaField
        label="메뉴 설명"
        name="description"
        placeholder="예: 진한 국물의 대표 메뉴"
        register={register}
        errorMessage={errors.description?.message}
      />

      <RadioGroup
        label="품절 여부"
        name="soldoutYn"
        options={[
          { label: "판매중", value: "N" },
          { label: "품절", value: "Y" },
        ]}
        register={register}
        errorMessage={errors.soldoutYn?.message}
        defaultValue={watch("soldoutYn") || "N"}
      />

      <ImageUpload
        label="메뉴 이미지"
        name="menuImage"
        register={register}
        errorMessage={errors.menuImage?.message}
        currentImageUrl={currentImageUrl}
      />
    </FormModal>
  );
}
