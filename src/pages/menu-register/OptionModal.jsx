import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormModal from "@/components/form/FormModal";
import InputField from "@/components/form/InputField";
import RadioGroup from "@/components/form/RadioGroup";
import useMenuOption from "../../hooks/menu/useMenuOption";

/* 유효성 스키마 */
const schema = yup.object().shape({
  menuOptName: yup.string().required("옵션명을 입력해주세요."),
  price: yup
    .number()
    .typeError("숫자만 입력 가능합니다.")
    .min(0, "0원 이상 입력해주세요.")
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
  const { create, update } = useMenuOption(menuId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      menuOptName: "",
      price: "",
      availableYn: "Y",
    },
  });

  /** 모달 열릴 때 기존 데이터 세팅 */
  useEffect(() => {
    if (isOpen) {
      reset({
        menuOptName: defaultValues?.menuOptName ?? "",
        price: defaultValues?.price ?? "",
        availableYn: defaultValues?.availableYn ?? "Y",
      });
    }
  }, [isOpen, defaultValues, reset]);

  /** 제출 핸들러 */
  const handleFormSubmit = (data) => {
    const basePayload = {
      menuOptGrpId: groupId,
      menuOptName: data.menuOptName,
      price: Number(data.price ?? 0),
      availableYn: data.availableYn ?? "Y",
      delYn: "N",
      maxSelect: 0,
      displayOrder: defaultValues?.displayOrder ?? 1,
    };

    const payload =
      mode === "edit"
        ? { ...basePayload, menuOptId: defaultValues?.menuOptId }
        : basePayload;

    console.log(
      `🟩 [OptionModal payload / ${mode}]`,
      JSON.stringify(payload, null, 2)
    );

    const mutation = mode === "edit" ? update : create;

    mutation.mutate(payload, {
      onSuccess: () => {
        alert(
          mode === "edit" ? "옵션이 수정되었습니다." : "옵션이 등록되었습니다."
        );
        reset();
        onClose();
      },
      onError: (err) => {
        console.error(`옵션 ${mode === "edit" ? "수정" : "등록"} 실패:`, err);
      },
    });
  };

  /** Portal 렌더링 */
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

      <InputField
        label="가격"
        name="price"
        type="number"
        placeholder="예: 2000"
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
    document.body // 모달이 루트 트리 외부로 렌더링되어 부모 이벤트 영향 없음
  );
}
