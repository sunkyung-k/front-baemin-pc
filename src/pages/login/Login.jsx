import React, { useState } from "react";
import styles from "./Login.module.scss";
import { Link } from "react-router-dom";
import { useLogin } from "../../hooks/useLogin";
import InputField from "../../components/common/form/InputField";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  username: yup.string().required("아이디를 입력해주세요."),
  password: yup.string().required("비밀번호를 입력해주세요."),
});

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { mutateAsync: loginMutate } = useLogin();
  const [loginError, setLoginError] = useState("");

  const onSubmit = async (data) => {
    try {
      await loginMutate(data);
    } catch (error) {
      setLoginError("아이디 또는 비밀번호가 일치하지 않습니다.");
    }
  };

  const handleFocus = () => {
    if (loginError) setLoginError("");
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>로그인</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <InputField
            label="아이디"
            name="username"
            placeholder="아이디를 입력하세요"
            {...register("username")}
            register={register}
            errorMessage={errors.username?.message}
            onFocus={handleFocus}
          />

          <InputField
            label="비밀번호"
            type="password"
            name="password"
            placeholder="비밀번호를 입력하세요"
            {...register("password")}
            register={register}
            errorMessage={errors.password?.message}
            onFocus={handleFocus}
          />

          {loginError && <p className={styles.error}>{loginError}</p>}

          <button
            type="submit"
            className="btn btn-default btn-primary btn-round"
          >
            로그인
          </button>
        </form>

        <p className={styles.signupText}>
          아직 회원이 아니신가요?{" "}
          <Link to="/join" className="btn-hv">
            회원가입하기
          </Link>
        </p>
      </div>
    </div>
  );
}
