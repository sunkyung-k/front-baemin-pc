import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import InputField from "@/components/form/InputField";
import SelectBox from "@/components/form/SelectBox";
import AuthLayout from "@/components/auth/AuthLayout";
import api from "@/api/axiosApi";
import { useHandleError } from "@/hooks/common/useHandleError";
import { Link, useNavigate } from "react-router-dom";

/* ============================================================
  비밀번호 찾기 유효성 스키마
------------------------------------------------------------ */
const schema = yup.object().shape({
  userId: yup.string().required("아이디를 입력해주세요."),
  emailId: yup.string().required("이메일 아이디를 입력해주세요."),
  emailDomain: yup.string().required("이메일 도메인을 선택해주세요."),
});

export default function FindPassword() {
  const navigate = useNavigate();
  const handleError = useHandleError();
  const [emailDomainType, setEmailDomainType] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  /** 이메일 도메인 선택 */
  const handleEmailDomainChange = (e) => {
    const value = e.target.value;
    setEmailDomainType(value);
    if (value === "custom") setValue("emailDomain", "");
    else setValue("emailDomain", value);
  };

  /** 비밀번호 재설정 링크 요청 */
  const onSubmit = async (data) => {
    const fullEmail = `${data.emailId}@${data.emailDomain}`;
    const payload = {
      userId: data.userId,
      email: fullEmail,
    };

    try {
      setLoading(true);
      const res = await api.post("/api/v1/recovery/passwd/forgot", payload);

      if (res.data?.resultCode === "200" && res.data?.response === "OK") {
        alert("비밀번호 재설정 링크가 이메일로 전송되었습니다.");
        navigate("/find-password/complete");
      } else {
        throw new Error("비밀번호 재설정 요청에 실패했습니다.");
      }
    } catch (err) {
      handleError(err, "recovery.passwd.forgot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="비밀번호 찾기"
      description={`비밀번호를 재설정할 계정의 아이디와 이메일을 입력해주세요.\n입력하신 이메일로 재설정 링크가 발송됩니다.`}
      footer={
        <>
          아이디가 기억나지 않는다면?{" "}
          <Link to="/find-id" className="btn-hv">
            아이디찾기
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="authForm">
        {/* 아이디 */}
        <InputField
          label="아이디"
          name="userId"
          placeholder="아이디를 입력하세요"
          register={register}
          errorMessage={errors.userId?.message}
        />

        {/* 이메일 */}
        <div className="input-field">
          <label className="input-label">이메일</label>
          <div className="email-field">
            <InputField
              name="emailId"
              placeholder="이메일 아이디"
              register={register}
              errorMessage={errors.emailId?.message}
            />
            <span>@</span>
            <div className="emailBox">
              <SelectBox
                name="emailDomain"
                register={register}
                options={[
                  { label: "naver.com", value: "naver.com" },
                  { label: "gmail.com", value: "gmail.com" },
                  { label: "daum.net", value: "daum.net" },
                  { label: "nate.com", value: "nate.com" },
                  { label: "직접입력", value: "custom" },
                ]}
                onChange={handleEmailDomainChange}
                errorMessage={errors.emailDomain?.message}
              />
              {emailDomainType === "custom" && (
                <InputField
                  name="emailDomain"
                  placeholder="직접 입력"
                  register={register}
                  errorMessage={errors.emailDomain?.message}
                />
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-default btn-primary btn-round"
          disabled={loading}
        >
          {loading ? "전송 중..." : "비밀번호 찾기"}
        </button>
      </form>
    </AuthLayout>
  );
}
