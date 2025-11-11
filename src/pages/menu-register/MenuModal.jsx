import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import FormModal from "@/components/form/FormModal";
import InputField from "@/components/form/InputField";
import TextareaField from "@/components/form/TextareaField";
import RadioGroup from "@/components/form/RadioGroup";
import ImageUpload from "@/components/form/ImageUpload";
import { useMenuCategoryStore } from "@/store/useMenuCategoryStore";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";
import { useHandleError } from "@/hooks/common/useHandleError";
import { formatPrice, parseNumber } from "@/utills/valueFormatter";

/* 유효성 스키마 */
const schema = yup.object().shape({
  menuName: yup.string().required("메뉴명을 입력해주세요."),
  price: yup
    .string()
    .test("is-valid-price", "가격은 숫자만 입력 가능합니다.", (val) =>
      /^[\d,]+$/.test(val || "")
    )
    .required("가격을 입력해주세요."),
  description: yup
    .string()
    .max(500, "최대 500자까지 입력 가능합니다.")
    .required("메뉴 설명을 입력해주세요."),
  soldoutYn: yup.string().required("품절 여부를 선택해주세요."),
});

export default function MenuModal({
  isOpen,
  onClose,
  mode = "create",
  defaultValues = null,
  onSubmit,
}) {
  const { activeCategory } = useMenuCategoryStore();
  const handleError = useHandleError();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      menuName: "",
      price: "",
      description: "",
      soldoutYn: "N",
      ...defaultValues,
    },
  });

  /** 실시간 가격 포맷 */
  const priceValue = watch("price");
  useEffect(() => {
    if (priceValue === undefined || priceValue === null) return;
    const formatted = formatPrice(priceValue);
    if (formatted !== priceValue) setValue("price", formatted);
  }, [priceValue, setValue]);

  /** 모달 열릴 때 기본값 초기화 */
  useEffect(() => {
    if (isOpen) {
      reset({
        menuName: defaultValues?.menuName ?? "",
        price: formatPrice(defaultValues?.price ?? ""),
        description: defaultValues?.description ?? "",
        soldoutYn: defaultValues?.soldoutYn ?? "N",
        menuImage: defaultValues?.menuImage ?? "",
      });
    }
  }, [isOpen, defaultValues, reset]);

  /** 폼 제출 */
  const handleFormSubmit = (data) => {
    try {
      const formData = new FormData();
      formData.append(
        "menuCategoryId",
        activeCategory?.menuCaId || activeCategory?.menuCategoryId || ""
      );
      formData.append("menuName", data.menuName);
      formData.append("description", data.description);
      formData.append("price", parseNumber(data.price)); // 콤마 제거 후 숫자 변환
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
    } catch (err) {
      handleError(err, "MenuModal.submit");
    }
  };

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

      {/* 금액 입력 필드 (자동 포맷 적용) */}
      <InputField
        label="가격"
        name="price"
        placeholder="예: 8,500"
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
        hint="JPG, PNG 형식 / 최대 50MB까지 업로드 가능합니다."
      />
    </FormModal>
  );
}
