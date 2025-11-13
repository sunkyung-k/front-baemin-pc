import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import InputField from "@/components/form/InputField";
import AuthLayout from "@/components/auth/AuthLayout";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "@/api/axiosApi";
import { useHandleError } from "@/hooks/common/useHandleError";

/* ============================================================
  비밀번호 재설정 유효성 스키마
------------------------------------------------------------ */
const PW_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/;

const schema = yup.object().shape({
  password: yup
    .string()
    .required("비밀번호를 입력해주세요.")
    .matches(
      PW_REGEX,
      "비밀번호는 영문과 숫자를 모두 포함해 최소 8자 이상 20자 이내로 입력해주세요."
    ),
  confirmPassword: yup
    .string()
    .required("비밀번호를 다시 입력해주세요.")
    .oneOf([yup.ref("password"), null], "비밀번호가 일치하지 않습니다."),
});

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const handleError = useHandleError();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  /** 비밀번호 재설정 요청 */
  const onSubmit = async (data) => {
    const payload = {
      token,
      newPassword: data.password,
    };

    try {
      setLoading(true);
      const res = await api.post("/api/v1/recovery/passwd/reset", payload);

      if (res.data?.resultCode === "200" && res.data?.response === "OK") {
        alert("비밀번호가 성공적으로 재설정되었습니다!");
        navigate("/reset-password/complete");
      } else {
        throw new Error("비밀번호 재설정에 실패했습니다.");
      }
    } catch (err) {
      handleError(err, "recovery.passwd.reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="비밀번호 재설정"
      description={`새 비밀번호를 입력하고 확인해주세요.\n영문과 숫자를 포함하여 8~20자 이내로 설정해주세요.`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="authForm">
        <InputField
          label="새 비밀번호"
          type="password"
          name="password"
          placeholder="영문 + 숫자 포함 (8~20자)"
          register={register}
          errorMessage={errors.password?.message}
        />

        <InputField
          label="비밀번호 확인"
          type="password"
          name="confirmPassword"
          placeholder="비밀번호를 다시 입력해주세요"
          register={register}
          errorMessage={errors.confirmPassword?.message}
        />

        <button
          type="submit"
          className="btn btn-default btn-primary btn-round"
          disabled={loading}
        >
          {loading ? "처리 중..." : "비밀번호 재설정"}
        </button>
      </form>
    </AuthLayout>
  );
}
