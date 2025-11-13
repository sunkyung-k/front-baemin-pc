import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import InputField from "@/components/form/InputField";
import SelectBox from "@/components/form/SelectBox";
import AuthLayout from "@/components/auth/AuthLayout";
import { useNavigate } from "react-router-dom";
import api from "@/api/axiosApi";
import { useHandleError } from "@/hooks/common/useHandleError";

/* ============================================================
  아이디 찾기 유효성 스키마
------------------------------------------------------------ */
const schema = yup.object().shape({
  emailId: yup.string().required("이메일 아이디를 입력해주세요."),
  emailDomain: yup.string().required("이메일 도메인을 선택해주세요."),
});

export default function FindId() {
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

  /** 아이디 찾기 요청 */
  const onSubmit = async (data) => {
    const fullEmail = `${data.emailId}@${data.emailDomain}`;
    const payload = { email: fullEmail };

    try {
      setLoading(true);
      const res = await api.post("/api/v1/recovery/id/forgot", payload);

      if (res.data?.resultCode === "200" && res.data?.response === "OK") {
        alert("아이디 찾기 메일이 전송되었습니다.");
        navigate("/find-id/complete");
      } else {
        throw new Error("아이디 찾기에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (err) {
      handleError(err, "recovery.id.forgot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="아이디 찾기"
      description="회원가입 시 등록한 이메일 주소를 입력해주세요. 
    해당 이메일로 아이디 안내 메일이 발송됩니다."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="authForm">
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
          {loading ? "전송 중..." : "아이디 찾기"}
        </button>
      </form>
    </AuthLayout>
  );
}
