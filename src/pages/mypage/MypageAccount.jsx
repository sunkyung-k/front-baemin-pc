import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Card from "@/components/mypage/Card";
import stylesLayout from "./MypageLayout.module.scss";
import InputField from "@/components/form/InputField";
import RadioGroup from "@/components/form/RadioGroup";
import SelectBox from "@/components/form/SelectBox";
import useAccount from "@/hooks/useAccount";
import { useHandleError } from "@/hooks/common/useHandleError";
import {
  formatPhone,
  formatBirth,
  cleanNumber,
  formatBusinessNo,
} from "@/utills/valueFormatter";

/** ============================================================
 *  계정 설정 유효성 스키마
 * ============================================================ */
const schema = yup.object().shape({
  userName: yup.string().required("이름을 입력해주세요."),
  birth: yup
    .string()
    .required("생년월일을 입력해주세요.")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "생년월일은 YYYY-MM-DD 형식이어야 합니다.")
    .test("is-valid-date", "유효하지 않은 날짜입니다.", (value) => {
      if (!value) return false;
      const [year, month, day] = value.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return (
        date.getFullYear() === year &&
        date.getMonth() + 1 === month &&
        date.getDate() === day
      );
    }),
  gender: yup.string().required("성별을 선택해주세요."),
  phone: yup
    .string()
    .required("전화번호를 입력해주세요.")
    .matches(/^[0-9-]{8,13}$/, "전화번호 형식이 올바르지 않습니다."),
  emailId: yup.string().required("이메일 아이디를 입력해주세요."),
  emailDomain: yup.string().required("이메일 도메인을 선택해주세요."),
  emailDomainType: yup.string(),
  userRole: yup.string().required("회원구분을 선택해주세요."),
  businessNo: yup.string().nullable(),
});

/** ============================================================
 *  계정 설정 컴포넌트
 * ============================================================ */
export default function MypageAccount() {
  const { userInfo, update, remove } = useAccount();
  const [selectedType, setSelectedType] = useState("USER");
  const [emailDomainType, setEmailDomainType] = useState("naver.com");
  const handleError = useHandleError();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    shouldUnregister: false, // ✅ 숨김필드 유지
  });

  /** 사용자 정보 초기 세팅 */
  useEffect(() => {
    if (userInfo) {
      let birthVal = userInfo.birth?.toString().replace(/\D/g, "") || "";

      if (birthVal.length === 6) {
        const currentYear = new Date().getFullYear() % 100;
        const birthYear = parseInt(birthVal.slice(0, 2), 10);
        const prefix = birthYear <= currentYear ? "20" : "19";
        birthVal = prefix + birthVal;
      }

      const formattedBirth = formatBirth(birthVal);
      const [emailId, domainPart] = userInfo.email?.split("@") || ["", ""];
      const domainOptions = ["naver.com", "gmail.com", "daum.net", "nate.com"];
      const isCustom = !domainOptions.includes(domainPart);

      reset({
        userId: userInfo.userId,
        password: userInfo.password
          ? "*".repeat(userInfo.password.length)
          : "********",
        userName: userInfo.userName,
        birth: formattedBirth,
        gender: userInfo.gender,
        phone: formatPhone(userInfo.phone),
        emailId,
        emailDomain: domainPart || "naver.com",
        emailDomainType: isCustom ? "custom" : domainPart || "naver.com",
        userRole: userInfo.businessNo ? "OWNER" : "USER",
        businessNo: formatBusinessNo(userInfo.businessNo ?? ""),
      });

      setSelectedType(userInfo.businessNo ? "OWNER" : "USER");
      setEmailDomainType(isCustom ? "custom" : domainPart || "naver.com");
      setValue("emailDomain", domainPart || "naver.com", {
        shouldDirty: false,
      });
    }
  }, [userInfo, reset, setValue]);

  /** 이메일 도메인 변경 */
  const handleEmailDomainChange = (e) => {
    const value = e.target.value;
    setEmailDomainType(value);
    setValue("emailDomainType", value, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (value === "custom") {
      setValue("emailDomain", "", { shouldDirty: true, shouldValidate: true });
    } else {
      setValue("emailDomain", value, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  /** 회원정보 수정 */
  const onSubmit = async (data) => {
    const email = `${data.emailId}@${data.emailDomain}`;
    const payload = {
      userId: data.userId,
      userName: data.userName,
      userRole: data.userRole,
      birth: cleanNumber(data.birth),
      gender: data.gender,
      phone: cleanNumber(data.phone),
      email,
      ...(data.userRole === "OWNER" && {
        businessNo: cleanNumber(data.businessNo),
      }),
    };

    try {
      const res = await update.mutateAsync(payload);
      if (res?.resultCode === "200") {
        alert("회원 정보가 수정되었습니다.");
      } else {
        alert("회원정보 수정에 실패했습니다.");
      }
    } catch (err) {
      handleError(err, "accountAPI.register");
    }
  };

  /** 회원탈퇴 */
  const handleAccountDelete = async () => {
    const confirmed = window.confirm("정말로 탈퇴하시겠습니까?");
    if (!confirmed) return;

    try {
      await remove.mutateAsync();
      alert("회원 탈퇴가 완료되었습니다.");
      window.location.href = "/";
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.errorMessage ||
        "탈퇴 처리 중 오류가 발생했습니다.";

      alert(serverMsg);
      console.error("[회원탈퇴 실패]", err);
    }
  };

  /** 렌더링 */
  return (
    <Card title="계정 설정">
      <form onSubmit={handleSubmit(onSubmit)} className={stylesLayout.form}>
        {/* 아이디 */}
        <InputField
          label="아이디"
          name="userId"
          register={register}
          disabled
          placeholder="아이디는 수정할 수 없습니다"
        />

        {/* 비밀번호 */}
        <InputField
          label="비밀번호"
          type="password"
          name="password"
          register={register}
          disabled
        />

        {/* 이름 */}
        <InputField
          label="이름"
          name="userName"
          register={register}
          errorMessage={errors.userName?.message}
        />

        {/* 생년월일 */}
        <InputField
          label="생년월일"
          type="birth"
          name="birth"
          register={register}
          placeholder="예: 1993-08-10"
          errorMessage={errors.birth?.message}
        />

        {/* 성별 */}
        <RadioGroup
          label="성별"
          name="gender"
          register={register}
          options={[
            { label: "남자", value: "남자" },
            { label: "여자", value: "여자" },
          ]}
          disabled
          errorMessage={errors.gender?.message}
        />

        {/* 전화번호 */}
        <InputField
          label="전화번호"
          type="phone"
          name="phone"
          register={register}
          placeholder="예: 010-1234-5678"
          errorMessage={errors.phone?.message}
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
                name="emailDomainType"
                value={emailDomainType}
                onChange={handleEmailDomainChange}
                options={[
                  { label: "naver.com", value: "naver.com" },
                  { label: "gmail.com", value: "gmail.com" },
                  { label: "daum.net", value: "daum.net" },
                  { label: "nate.com", value: "nate.com" },
                  { label: "직접입력", value: "custom" },
                ]}
                isControlled
              />

              {/* ✅ RHF 등록 유지용 hidden input */}
              <input type="hidden" {...register("emailDomain")} />
              <input type="hidden" {...register("emailDomainType")} />

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

        {/* 회원구분 */}
        <SelectBox
          label="회원구분"
          name="userRole"
          register={register}
          options={[
            { label: "일반 사용자", value: "USER" },
            { label: "점주", value: "OWNER" },
          ]}
          disabled
          value={selectedType}
          errorMessage={errors.userRole?.message}
        />

        {/* 사업자등록번호 */}
        {selectedType === "OWNER" && (
          <InputField
            label="사업자등록번호"
            name="businessNo"
            type="business"
            register={register}
            placeholder="예: 000-00-00000"
            errorMessage={errors.businessNo?.message}
          />
        )}

        {/* 버튼 */}
        <div className="btnWrap btnWrap-center">
          <button
            type="submit"
            className="btn btn-default btn-primary"
            disabled={!isDirty}
          >
            수정
          </button>
          <button
            type="button"
            onClick={handleAccountDelete}
            className="btn btn-default btn-danger"
          >
            회원 탈퇴
          </button>
        </div>
      </form>
    </Card>
  );
}
