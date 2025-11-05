import React, { useState } from "react";
import styles from "./Join.module.scss";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import InputField from "@/components/form/InputField";
import RadioGroup from "@/components/form/RadioGroup";
import SelectBox from "@/components/form/SelectBox";
import { Link, useNavigate } from "react-router-dom";
import authAPI from "@/service/authAPI";
import { cleanNumber, cleanBirth } from "@/utills/valueFormatter";

/* ============================================================
  회원가입 유효성 스키마
------------------------------------------------------------ */
const ID_REGEX = /^(?=.*[a-z])(?=.*\d)[a-z\d]{4,20}$/;
const PW_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/;

const schema = yup.object().shape({
  userId: yup
    .string()
    .required("아이디를 입력해주세요.")
    .matches(
      /^(?=.*[a-z])(?=.*\d)[a-z\d]{4,20}$/,
      "아이디는 영문 소문자와 숫자를 모두 포함해 4~20자 이내로 입력해주세요."
    ),
  password: yup
    .string()
    .required("비밀번호를 입력해주세요.")
    .matches(PW_REGEX, "비밀번호는 영문과 숫자를 포함해야 합니다."),
  confirmPassword: yup
    .string()
    .required("비밀번호를 다시 입력해주세요.")
    .oneOf([yup.ref("password"), null], "비밀번호가 일치하지 않습니다."),
  name: yup.string().required("이름을 입력해주세요."),
  birth: yup
    .string()
    .required("생년월일을 입력해주세요.")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "생년월일은 YYYY-MM-DD 형식이어야 합니다.")
    .test("is-valid-date", "유효하지 않은 날짜입니다.", (value) => {
      if (!value) return false;
      const [year, month, day] = value.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      // 날짜 객체의 월/일이 입력값과 실제 일치하는지 검사
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
    .matches(/^[0-9-]{9,13}$/, "전화번호 형식이 올바르지 않습니다."),
  emailId: yup.string().required("이메일 아이디를 입력해주세요."),
  emailDomain: yup.string().required("이메일 도메인을 선택해주세요."),
  userType: yup.string().required("회원구분을 선택해주세요."),
  businessNumber: yup.string().when("userType", {
    is: "OWNER",
    then: (schema) =>
      schema
        .transform((v) => v.replace(/-/g, ""))
        .required("사업자등록번호를 입력해주세요.")
        .matches(/^\d{10}$/, "사업자등록번호는 숫자 10자리여야 합니다."),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export default function Join() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("USER");
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

  /** 회원가입 요청 */
  const onSubmit = async (data) => {
    const fullEmail = `${data.emailId}@${data.emailDomain}`;

    // 공통 정제 유틸 적용
    const payload = {
      userId: data.userId,
      passwd: data.password,
      userName: data.name,
      userRole: data.userType,
      birth: cleanBirth(data.birth),
      gender: data.gender === "M" ? "남자" : "여자",
      phone: cleanNumber(data.phone),
      email: fullEmail,
      ...(data.userType === "OWNER" && {
        businessNo: cleanNumber(data.businessNumber),
      }),
    };

    try {
      setLoading(true);
      const res = await authAPI.register(payload);

      if (res?.resultCode === "200" && res?.response === "OK") {
        alert("회원가입이 완료되었습니다!");
        navigate("/login");
      } else {
        alert("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (err) {
      console.error("회원가입 오류:", err);
      alert("서버 오류로 회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.joinContainer}>
      <div className={styles.joinBox}>
        <h2 className={styles.title}>회원가입</h2>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.joinForm}>
          {/* 아이디 */}
          <InputField
            label="아이디"
            name="userId"
            placeholder="영문 소문자 + 숫자 (4~20자)"
            register={register}
            errorMessage={errors.userId?.message}
          />

          {/* 비밀번호 */}
          <InputField
            label="비밀번호"
            type="password"
            name="password"
            placeholder="영문 + 숫자 포함 (8~20자)"
            register={register}
            errorMessage={errors.password?.message}
          />

          {/* 비밀번호 확인 */}
          <InputField
            label="비밀번호 확인"
            type="password"
            name="confirmPassword"
            placeholder="비밀번호를 다시 입력해주세요"
            register={register}
            errorMessage={errors.confirmPassword?.message}
          />

          {/* 이름 */}
          <InputField
            label="이름"
            name="name"
            placeholder="이름을 입력하세요"
            register={register}
            errorMessage={errors.name?.message}
          />

          {/* 생년월일 */}
          <InputField
            label="생년월일"
            type="birth" // 자동 하이픈 추가
            name="birth"
            placeholder="예: 1993-08-10"
            register={register}
            errorMessage={errors.birth?.message}
          />

          {/* 성별 */}
          <RadioGroup
            label="성별"
            name="gender"
            register={register}
            options={[
              { label: "남성", value: "M" },
              { label: "여성", value: "F" },
            ]}
            errorMessage={errors.gender?.message}
          />

          {/* 전화번호 */}
          <InputField
            label="전화번호"
            type="phone"
            name="phone"
            placeholder="예: 010-1234-5678"
            register={register}
            errorMessage={errors.phone?.message}
          />

          {/* 이메일 */}
          <div className="input-field">
            <label className="input-label">이메일</label>
            <div className={styles.emailField}>
              <InputField
                name="emailId"
                placeholder="이메일 아이디"
                register={register}
                errorMessage={errors.emailId?.message}
              />
              <span className={styles.at}>@</span>

              <div className={styles.emailBox}>
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

          {/* 회원구분 */}
          <SelectBox
            label="회원구분"
            name="userType"
            register={register}
            options={[
              { label: "일반 사용자", value: "USER" },
              { label: "점주", value: "OWNER" },
            ]}
            onChange={(e) => setSelectedType(e.target.value)}
            errorMessage={errors.userType?.message}
          />

          {/* 점주일 때 사업자등록번호 */}
          {selectedType === "OWNER" && (
            <InputField
              label="사업자등록번호"
              name="businessNumber"
              type="business"
              placeholder="000-00-00000"
              register={register}
              errorMessage={errors.businessNumber?.message}
            />
          )}

          {/* 버튼 */}
          <button
            type="submit"
            className="btn btn-default btn-primary btn-round"
            disabled={loading}
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <p className={styles.loginText}>
          이미 계정이 있으신가요?{" "}
          <Link to="/login" className="btn-hv">
            로그인하기
          </Link>
        </p>
      </div>
    </div>
  );
}
