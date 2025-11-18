import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import FormModal from "@/components/form/FormModal";
import InputField from "@/components/form/InputField";
import SelectBox from "@/components/form/SelectBox";
import RadioGroup from "@/components/form/RadioGroup";
import UserReadOnly from "./UserReadOnly";
import { useHandleError } from "@/hooks/common/useHandleError";

import {
  formatPhone,
  formatBirth,
  formatBusinessNo,
  cleanNumber, // 서버 전송용 정제 함수
} from "@/utills/valueFormatter";

import {
  useAdminUserDetail,
  useAdminUserMutation,
} from "@/hooks/admin/useAdminUser";

import styles from "./UserModal.module.scss";

/** Yup 스키마 */
const ID_REGEX = /^(?=.*[a-z])(?=.*\d)[a-z\d]{4,20}$/;
const PW_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/;

const schema = yup.object().shape({
  userId: yup
    .string()
    .required("아이디를 입력해주세요.")
    .matches(
      ID_REGEX,
      "아이디는 영문 소문자와 숫자를 모두 포함해 4~20자 이내로 입력해주세요."
    ),
  userName: yup.string().required("이름을 입력해주세요."),
  birth: yup
    .string()
    .required("생년월일을 입력해주세요.")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식이어야 합니다."),
  gender: yup.string().required("성별을 선택해주세요."),
  phone: yup
    .string()
    .required("전화번호를 입력해주세요.")
    .matches(/^[0-9-]{8,13}$/, "전화번호 형식이 올바르지 않습니다."),
  emailId: yup.string().required("이메일 아이디를 입력해주세요."),
  emailDomain: yup.string().required("이메일 도메인을 선택해주세요."),
  userRole: yup.string().required("권한을 선택해주세요."),
  businessNo: yup.string().when("userRole", {
    is: "OWNER",
    then: (schema) => schema.required("사업자 번호를 입력해주세요."),
    otherwise: (schema) => schema.notRequired(),
  }),

  /** -------------------------------------------------------
   *  password / confirmPassword
   *  - 등록: password 필수 + PW_REGEX + confirmPassword 필수
   *  - 수정: password 입력 안 하면 둘 다 스킵
   *          password 입력하면 confirmPassword + PW_REGEX 모두 수행
   ------------------------------------------------------- */
  password: yup.string().when("_isEdit", {
    is: false,
    then: (schema) =>
      schema
        .required("비밀번호를 입력해주세요.")
        .matches(
          PW_REGEX,
          "비밀번호는 영문과 숫자를 모두 포함해 최소 8자 이상 20자 이내로 입력해주세요."
        ),
    otherwise: (schema) =>
      schema
        .transform((v) => (v === "" ? undefined : v))
        .matches(
          PW_REGEX,
          "비밀번호는 영문과 숫자를 모두 포함해 최소 8자 이상 20자 이내로 입력해주세요."
        )
        .nullable(),
  }),

  confirmPassword: yup.string().when("_isEdit", {
    is: false,
    then: (schema) =>
      schema
        .required("비밀번호를 다시 입력해주세요.")
        .oneOf([yup.ref("password")], "비밀번호가 일치하지 않습니다."),
    otherwise: (schema) =>
      schema.when("password", {
        is: (pwd) => !!pwd,
        then: (schema) =>
          schema
            .required("비밀번호 확인을 입력해주세요.")
            .oneOf([yup.ref("password")], "비밀번호가 일치하지 않습니다."),
        otherwise: (schema) => schema.notRequired(),
      }),
  }),
});

export default function UserModal({ userId, isOpen, onClose }) {
  const isEdit = !!userId;
  const handleError = useHandleError();

  const { data: vo } = useAdminUserDetail(userId, isOpen && isEdit);
  const { create, update, remove } = useAdminUserMutation();

  const [isCustomDomain, setIsCustomDomain] = useState(false);

  const [roleType, setRoleType] = useState("USER");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    shouldUnregister: false,
    defaultValues: {
      _isEdit: isEdit,
    },
  });

  /** 데이터 로드 (등록/수정 모드에 따라 값 reset) */
  useEffect(() => {
    if (isEdit && vo) {
      const [emailId, emailDomain] = vo.email?.split("@") ?? ["", ""];

      const defaults = ["naver.com", "gmail.com", "daum.net", "nate.com"];
      const isCustom = !defaults.includes(emailDomain);

      const role = vo.userRole ?? "USER";
      setRoleType(role);

      reset({
        userId: vo.userId ?? "",
        userName: vo.userName ?? "",
        birth: formatBirth(vo.birth ?? ""),
        gender: vo.gender === "남자" ? "M" : "F",
        phone: formatPhone(vo.phone),
        emailId,
        emailDomain,
        userRole: role,
        businessNo: formatBusinessNo(vo.businessNo ?? ""),
        _isEdit: true,
      });

      setIsCustomDomain(isCustom);
    }

    /** 신규 생성 초기화 */
    if (!isEdit && isOpen) {
      reset({
        userId: "",
        userName: "",
        birth: "",
        gender: "",
        phone: "",
        emailId: "",
        emailDomain: "",
        userRole: "",
        businessNo: "",
        _isEdit: false,
      });
      setRoleType("USER");
      setIsCustomDomain(false);
    }
  }, [vo, isEdit, isOpen, reset]);

  /** 입력 포맷 */
  const handleFormat = (e) => {
    const { name, value } = e.target;
    let formatted = value;

    // 화면에서는 포맷해서 보여주기
    if (name === "phone") formatted = formatPhone(value);
    if (name === "birth") formatted = formatBirth(value);
    if (name === "businessNo") formatted = formatBusinessNo(value);

    setValue(name, formatted, { shouldDirty: true });
  };

  /** 저장 — 서버로 보낼 때는 cleanNumber로 숫자만 전송 */
  const onSubmit = (data) => {
    const payload = {
      userId: data.userId,
      userName: data.userName,
      userRole: data.userRole,
      birth: cleanNumber(data.birth),
      gender: data.gender === "M" ? "남자" : "여자",
      phone: cleanNumber(data.phone),
      email: `${data.emailId}@${data.emailDomain}`,

      businessNo:
        data.userRole === "OWNER" ? cleanNumber(data.businessNo || "") : null,

      ...(data.password && { passwd: data.password }),
    };

    const action = isEdit ? update : create;

    action.mutate(payload, {
      onSuccess: () => {
        alert(isEdit ? "수정되었습니다." : "등록되었습니다.");
        onClose();
      },
      onError: (err) => handleError(err, "adminUser.save"),
    });
  };

  /** 삭제 */
  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await remove.mutateAsync(userId);
      alert("삭제되었습니다.");
      onClose();
    } catch (err) {
      handleError(err, "adminUser.remove");
    }
  };

  if (!isOpen) return null;

  const showBusinessNo = roleType === "OWNER";

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      title={isEdit ? "회원 수정" : "회원 등록"}
      submitLabel={isEdit ? "수정" : "등록"}
      footer={
        <div className={`btnWrap ${styles.footerBtns}`}>
          <button
            type="submit"
            className="btn btn-default btn-primary"
            disabled={isEdit && !isDirty}
          >
            {isEdit ? "수정" : "등록"}
          </button>

          {isEdit && (
            <button
              type="button"
              className="btn btn-default btn-danger"
              onClick={handleDelete}
            >
              삭제
            </button>
          )}
        </div>
      }
    >
      <div className={isEdit ? styles.gridTwo : styles.gridOne}>
        {isEdit && <UserReadOnly vo={vo} />}

        <div className={styles.formArea}>
          {/* 아이디 */}
          <InputField
            label="아이디"
            name="userId"
            register={register}
            disabled={isEdit}
            errorMessage={errors.userId?.message}
          />

          {/* 비밀번호 (등록 or 수정 시 입력 가능) */}
          {!isEdit && (
            <>
              <InputField
                label="비밀번호"
                type="password"
                name="password"
                register={register}
                placeholder="비밀번호"
                errorMessage={errors.password?.message}
              />

              <InputField
                label="비밀번호 확인"
                type="password"
                name="confirmPassword"
                register={register}
                placeholder="비밀번호 확인"
                errorMessage={errors.confirmPassword?.message}
              />
            </>
          )}

          {/* 수정 모드일 때는 비밀번호 변경 옵션 */}
          {isEdit && (
            <>
              <InputField
                label="새 비밀번호 (선택사항)"
                type="password"
                name="password"
                register={register}
                placeholder="변경할 때만 입력"
                errorMessage={errors.password?.message}
              />
              {watch("password") && (
                <InputField
                  label="비밀번호 확인"
                  type="password"
                  name="confirmPassword"
                  register={register}
                  placeholder="비밀번호 확인"
                  errorMessage={errors.confirmPassword?.message}
                />
              )}
            </>
          )}

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
            name="birth"
            type="birth"
            register={register}
            placeholder="YYYY-MM-DD"
            onChange={handleFormat}
            errorMessage={errors.birth?.message}
          />

          {/* 성별 */}
          <RadioGroup
            label="성별"
            name="gender"
            options={[
              { label: "남성", value: "M" },
              { label: "여성", value: "F" },
            ]}
            disabled={isEdit}
            register={register}
            errorMessage={errors.gender?.message}
          />

          {/* 전화번호 */}
          <InputField
            label="전화번호"
            name="phone"
            type="phone"
            register={register}
            placeholder="010-0000-0000"
            onChange={handleFormat}
            errorMessage={errors.phone?.message}
          />

          {/* 이메일 */}
          <div className="input-field">
            <label className="input-label">이메일</label>

            <div className="email-field">
              <InputField
                name="emailId"
                register={register}
                placeholder="이메일 아이디"
                errorMessage={errors.emailId?.message}
              />

              <span>@</span>

              <div className="emailBox">
                <SelectBox
                  name="emailDomainSelect"
                  isControlled
                  value={isCustomDomain ? "custom" : watch("emailDomain")}
                  onChange={(e) => {
                    const val = e.target.value;

                    if (val === "custom") {
                      setIsCustomDomain(true);
                      setValue("emailDomain", "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    } else {
                      setIsCustomDomain(false);
                      setValue("emailDomain", val, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  }}
                  options={[
                    { label: "naver.com", value: "naver.com" },
                    { label: "gmail.com", value: "gmail.com" },
                    { label: "daum.net", value: "daum.net" },
                    { label: "nate.com", value: "nate.com" },
                    { label: "직접입력", value: "custom" },
                  ]}
                  errorMessage={errors.emailDomain?.message}
                />
                <input type="hidden" {...register("emailDomain")} />
                {isCustomDomain && (
                  <InputField
                    name="emailDomain"
                    register={register}
                    placeholder="직접 입력"
                    errorMessage={errors.emailDomain?.message}
                  />
                )}
              </div>
            </div>
          </div>

          {/* 권한 - SelectBox 컨트롤 모드 */}
          {!isEdit && (
            <>
              <SelectBox
                label="권한"
                name="userRole"
                isControlled
                value={roleType}
                onChange={(e) => {
                  const next = e.target.value;
                  setRoleType(next); // 로컬 상태 업데이트
                  setValue("userRole", next, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                options={[
                  { label: "일반 사용자", value: "USER" },
                  { label: "점주", value: "OWNER" },
                  { label: "관리자", value: "ADMIN" },
                ]}
                errorMessage={errors.userRole?.message}
              />

              {/* RHF 유지용 hidden input */}
              <input type="hidden" {...register("userRole")} />
            </>
          )}

          {/* 사업자번호 */}
          {showBusinessNo && (
            <InputField
              label="사업자 번호"
              name="businessNo"
              type="business"
              register={register}
              placeholder="000-00-00000"
              onChange={handleFormat}
              errorMessage={errors.businessNo?.message}
            />
          )}
        </div>
      </div>
    </FormModal>
  );
}
