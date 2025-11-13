import React, { useState } from "react";
import { Link } from "react-router-dom";
import InputField from "@/components/form/InputField";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useLogin } from "@/hooks/useLogin";
import AuthLayout from "@/components/auth/AuthLayout";

/* ============================================================
  로그인 유효성 스키마
------------------------------------------------------------ */
const schema = yup.object().shape({
  username: yup.string().required("아이디를 입력해주세요."),
  password: yup.string().required("비밀번호를 입력해주세요."),
});

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const { mutateAsync: loginMutate } = useLogin();
  const [loginError, setLoginError] = useState("");

  /** 로그인 요청 */
  const onSubmit = async (data) => {
    try {
      await loginMutate(data);
    } catch {
      setLoginError("아이디 또는 비밀번호가 일치하지 않습니다.");
    }
  };

  /** 입력 포커스 시 에러 초기화 */
  const handleFocus = () => {
    if (loginError) setLoginError("");
  };

  return (
    <AuthLayout
      title="로그인"
      footer={
        <>
          아직 회원이 아니신가요?{" "}
          <Link to="/join" className="btn-hv">
            회원가입하기
          </Link>
        </>
      }
      subFooter
    >
      <form onSubmit={handleSubmit(onSubmit)} className="authForm">
        {/* 아이디 */}
        <InputField
          label="아이디"
          name="username"
          placeholder="아이디를 입력하세요"
          register={register}
          errorMessage={errors.username?.message}
          onFocus={handleFocus}
        />

        {/* 비밀번호 */}
        <InputField
          label="비밀번호"
          type="password"
          name="password"
          placeholder="비밀번호를 입력하세요"
          register={register}
          errorMessage={errors.password?.message}
          onFocus={handleFocus}
        />

        {/* 로그인 실패 메시지 */}
        {loginError && <p className="authError">{loginError}</p>}

        <button type="submit" className="btn btn-default btn-primary btn-round">
          로그인
        </button>
      </form>
    </AuthLayout>
  );
}
