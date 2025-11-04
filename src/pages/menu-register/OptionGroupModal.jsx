import React, { useEffect, useCallback } from "react";
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormModal from "@/components/form/FormModal";
import InputField from "@/components/form/InputField";
import RadioGroup from "@/components/form/RadioGroup";
import { useMenuOptionGroup } from "@/hooks/menu/useMenuOptionGroup";
import { useHandleError } from "@/hooks/common/useHandleError";

/* ===============================
   유효성 스키마
================================= */
const schema = yup.object().shape({
  groupName: yup.string().required("그룹명을 입력해주세요."),
  requiredYn: yup.string().required("유형을 선택해주세요."),
  displayOrder: yup
    .number()
    .typeError("숫자만 입력 가능합니다.")
    .required("정렬 순서를 입력해주세요.")
    .min(1, "정렬 순서는 1 이상이어야 합니다."),
  maxSelect: yup
    .number()
    .typeError("숫자만 입력 가능합니다.")
    .when("requiredYn", {
      is: "N",
      then: (schema) =>
        schema
          .required("최대 선택 개수를 입력해주세요.")
          .min(1, "최대 선택 개수는 1 이상이어야 합니다."),
      otherwise: (schema) => schema.notRequired(),
    }),
});

/* ===============================
   옵션 그룹 등록/수정 모달 (v2 alert)
================================= */
export default function OptionGroupModal({
  menuId,
  isOpen,
  onClose,
  mode = "create",
  defaultValues = null,
}) {
  const { create, update, refreshMenu } = useMenuOptionGroup(menuId);
  const handleError = useHandleError();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      groupName: "",
      requiredYn: "Y",
      maxSelect: null,
      displayOrder: null,
    },
  });

  const requiredYnValue = watch("requiredYn");

  /** 모달 열릴 때 기존 데이터 세팅 */
  useEffect(() => {
    if (isOpen) {
      reset(
        defaultValues
          ? {
              groupName: defaultValues.menuOptGrpName ?? "",
              requiredYn: defaultValues.requiredYn ?? "Y",
              maxSelect:
                defaultValues.requiredYn === "N"
                  ? defaultValues.maxSelect ?? null
                  : null,
              displayOrder: defaultValues.displayOrder ?? null,
            }
          : {
              groupName: "",
              requiredYn: "Y",
              maxSelect: null,
              displayOrder: null,
            }
      );
    }
  }, [isOpen, defaultValues, reset]);

  /** 닫힐 때 초기화 */
  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  /** 제출 */
  const handleFormSubmit = async (data) => {
    const payload = {
      menuId,
      menuOptGrpName: data.groupName,
      requiredYn: data.requiredYn,
      minSelect: data.requiredYn === "Y" ? 1 : 0,
      maxSelect: data.requiredYn === "N" ? Number(data.maxSelect) : 0,
      displayOrder: Number(data.displayOrder),
      ...(mode === "edit" && defaultValues?.menuOptGrpId
        ? { menuOptGrpId: defaultValues.menuOptGrpId }
        : {}),
    };

    const mutation = mode === "edit" ? update : create;

    try {
      await mutation.mutateAsync(payload);
      await refreshMenu();
      handleClose();
    } catch (err) {
      handleError(err, "OptionGroupModal.handleSubmit");
    }
  };

  return (
    <FormModal
      title={mode === "edit" ? "옵션 그룹 수정" : "옵션 그룹 등록"}
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit(handleFormSubmit)}
      submitLabel={mode === "edit" ? "수정" : "등록"}
    >
      <InputField
        label="그룹명"
        name="groupName"
        placeholder="예: 사이즈 선택, 추가 토핑"
        register={register}
        errorMessage={errors.groupName?.message}
      />

      <Controller
        name="requiredYn"
        control={control}
        render={({ field }) => (
          <RadioGroup
            label="유형"
            name="requiredYn"
            options={[
              { label: "필수 선택", value: "Y" },
              { label: "선택 가능", value: "N" },
            ]}
            {...field}
            errorMessage={errors.requiredYn?.message}
          />
        )}
      />

      {requiredYnValue === "N" && (
        <InputField
          label="최대 선택 개수"
          name="maxSelect"
          type="number"
          placeholder="예: 3"
          register={register}
          errorMessage={errors.maxSelect?.message}
        />
      )}

      <InputField
        label="정렬 순서"
        name="displayOrder"
        type="number"
        placeholder="예: 1"
        register={register}
        errorMessage={errors.displayOrder?.message}
      />
    </FormModal>
  );
}
