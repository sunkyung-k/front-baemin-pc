import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormModal from "@/components/form/FormModal";
import InputField from "@/components/form/InputField";
import RadioGroup from "@/components/form/RadioGroup";
import useMenuOption from "@/hooks/menu/useMenuOption";
import { useHandleError } from "@/hooks/common/useHandleError";
import { formatPrice, parseNumber } from "@/utills/valueFormatter";

/*  유효성 스키마 */
const schema = yup.object().shape({
  menuOptName: yup.string().required("옵션명을 입력해주세요."),
  price: yup
    .string()
    .test("is-valid-price", "숫자만 입력 가능합니다.", (val) =>
      /^[\d,]+$/.test(val || "")
    )
    .required("가격을 입력해주세요."),
  availableYn: yup.string().required("선택 가능 여부를 선택해주세요."),
});

export default function OptionModal({
  menuId,
  groupId,
  isOpen,
  onClose,
  mode = "create",
  defaultValues = null,
}) {
  const { create, update, refreshMenu } = useMenuOption(menuId);
  const handleError = useHandleError();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      menuOptName: "",
      price: "",
      availableYn: "Y",
    },
  });

  /**  가격 입력 감시 & 자동 포맷 */
  const priceValue = watch("price");
  useEffect(() => {
    if (priceValue === undefined || priceValue === null) return;
    const formatted = formatPrice(priceValue);
    if (formatted !== priceValue) setValue("price", formatted);
  }, [priceValue, setValue]);

  /**  모달 열릴 때 기본값 세팅 */
  useEffect(() => {
    if (isOpen) {
      reset({
        menuOptName: defaultValues?.menuOptName ?? "",
        price: formatPrice(defaultValues?.price ?? ""),
        availableYn: defaultValues?.availableYn ?? "Y",
      });
    }
  }, [isOpen, defaultValues, reset]);

  /**  제출 핸들러 */
  const handleFormSubmit = async (data) => {
    const payload = {
      menuOptGrpId: groupId,
      menuOptName: data.menuOptName,
      price: parseNumber(data.price ?? "0"), // 문자열 → 숫자 변환
      availableYn: data.availableYn ?? "Y",
      delYn: "N",
      maxSelect: 0,
      displayOrder: defaultValues?.displayOrder ?? 1,
      ...(mode === "edit" && defaultValues?.menuOptId
        ? { menuOptId: defaultValues.menuOptId }
        : {}),
    };

    const mutation = mode === "edit" ? update : create;

    try {
      await mutation.mutateAsync(payload);
      await refreshMenu();
      reset();
      onClose();
    } catch (err) {
      handleError(err, "OptionModal.handleFormSubmit");
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <FormModal
      title={mode === "edit" ? "옵션 수정" : "옵션 등록"}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(handleFormSubmit)}
      submitLabel={mode === "edit" ? "수정" : "등록"}
    >
      <InputField
        label="옵션명"
        name="menuOptName"
        placeholder="예: 치즈 추가, 고기 두 배"
        register={register}
        errorMessage={errors.menuOptName?.message}
      />

      {/*  금액 입력 */}
      <InputField
        label="가격"
        name="price"
        placeholder="예: 2,000"
        register={register}
        errorMessage={errors.price?.message}
      />

      <Controller
        name="availableYn"
        control={control}
        render={({ field }) => (
          <RadioGroup
            label="선택 가능 여부"
            name="availableYn"
            options={[
              { label: "선택 가능", value: "Y" },
              { label: "선택 불가", value: "N" },
            ]}
            {...field}
            errorMessage={errors.availableYn?.message}
          />
        )}
      />
    </FormModal>,
    document.body
  );
}
