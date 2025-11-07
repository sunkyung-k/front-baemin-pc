import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import FormModal from "@/components/form/FormModal";
import InputField from "@/components/form/InputField";
import { useHandleError } from "@/hooks/common/useHandleError";
import { parseNumber } from "@/utills/valueFormatter";
import { authStore } from "@/store/authStore";
import useAccount from "@/hooks/useAccount";

/**
 * PointChargeModal (공통 포인트 충전 모달)
 * --------------------------------------------------------
 * - 1원 이상 금액만 허용
 * - 금액 입력 시 자동 콤마 포맷 (InputField type="price")
 * - RHF + yupResolver 기반 폼 검증
 * - valueFormatter 유틸 사용 (formatPrice / parseNumber)
 * --------------------------------------------------------
 */
export default function PointChargeModal({ isOpen, onClose, onSuccess }) {
  const handleError = useHandleError();
  const { userId } = authStore.getState(); // 로그인한 사용자 ID
  const { deposit } = useAccount(); // useAccount 훅에서 React Query mutate 사용

  /** 검증 스키마 */
  const schema = yup.object({
    amount: yup
      .string()
      .required("금액을 입력하세요.")
      .test(
        "is-valid",
        "충전할 보유금은 1원 이상이어야 합니다.",
        (val) => parseNumber(val) >= 1
      ),
  });

  /** RHF 설정 */
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { amount: "" },
  });

  /** 폼 제출 핸들러 */
  const onSubmit = async (data) => {
    try {
      const depositAmount = parseNumber(data.amount);

      // React Query mutate 사용 → 캐시 자동 invalidate
      // (useAccount 내부에서 afterMutation 처리됨)
      await deposit.mutateAsync({ userId, deposit: depositAmount });

      alert("포인트 충전이 완료되었습니다.");
      onSuccess?.(); // 상위 컴포넌트에서 후처리 필요 시
      reset();
      onClose();
    } catch (error) {
      handleError(error, "PointChargeModal");
    }
  };

  return (
    <FormModal
      title="포인트 충전하기"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="충전하기"
      disabled={isSubmitting}
    >
      <InputField
        type="price"
        name="amount"
        placeholder="충전할 금액을 입력하세요"
        register={register}
        errorMessage={errors.amount?.message}
      />
    </FormModal>
  );
}
