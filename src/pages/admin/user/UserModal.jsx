import React, { useEffect, useState } from "react";
import FormModal from "@/components/form/FormModal";
import InputField from "@/components/form/InputField";

import {
  useAdminUserDetail,
  useAdminUserMutation,
} from "@/hooks/admin/useAdminUser";

export default function UserModal({ userId, isOpen, onClose }) {
  const isEdit = !!userId;

  const { data: userData } = useAdminUserDetail(userId, isOpen && isEdit);
  const { create, update, remove } = useAdminUserMutation();

  /** 폼 상태 */
  const [form, setForm] = useState({
    userId: "",
    passwd: "",
    userName: "",
    birth: "",
    gender: "",
    phone: "",
    email: "",
    userRole: "USER",
    businessNo: "",
  });

  /** 🔄 기존 데이터 로딩 */
  useEffect(() => {
    if (isEdit && userData) {
      setForm({
        ...userData,
        passwd: "",
        businessNo: userData.businessNo ?? "",
      });
    } else if (!isEdit && isOpen) {
      setForm({
        userId: "",
        passwd: "",
        userName: "",
        birth: "",
        gender: "",
        phone: "",
        email: "",
        userRole: "USER",
        businessNo: "",
      });
    }
  }, [userData, isEdit, isOpen]);

  /** 입력 핸들러 */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  /** 저장 */
  const handleSubmit = () => {
    const payload = { ...form };
    if (payload.userRole !== "OWNER") delete payload.businessNo;

    isEdit ? update.mutate(payload) : create.mutate(payload);
    onClose();
  };

  /** 삭제 */
  const handleDelete = () => {
    if (confirm("정말 삭제하시겠습니까?")) {
      remove.mutate(userId);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "회원 수정" : "회원 등록"}
      submitLabel={isEdit ? "수정" : "등록"}
      onSubmit={handleSubmit}
      // 수정 모드에서는 삭제 버튼 표시
      extraButton={
        isEdit && (
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
          >
            삭제
          </button>
        )
      }
    >
      <div className="form-group">
        <InputField
          label="아이디"
          name="userId"
          placeholder="아이디"
          disabled={isEdit}
          value={form.userId}
          onChange={handleChange}
        />

        <InputField
          label="비밀번호"
          type="password"
          name="passwd"
          placeholder={isEdit ? "변경 시에만 입력" : "비밀번호"}
          value={form.passwd}
          onChange={handleChange}
        />

        <InputField
          label="이름"
          name="userName"
          placeholder="이름"
          value={form.userName}
          onChange={handleChange}
        />

        <InputField
          label="생년월일"
          type="birth"
          name="birth"
          placeholder="예: 901122"
          value={form.birth}
          onChange={handleChange}
        />

        <InputField
          label="성별"
          name="gender"
          placeholder="남자 / 여자"
          value={form.gender}
          onChange={handleChange}
        />

        <InputField
          label="전화번호"
          type="phone"
          name="phone"
          placeholder="010-0000-0000"
          value={form.phone}
          onChange={handleChange}
        />

        <InputField
          label="이메일"
          name="email"
          placeholder="example@email.com"
          value={form.email}
          onChange={handleChange}
        />

        {/* 권한 (select) */}
        <div className="input-field">
          <label className="input-label">권한</label>
          <select
            name="userRole"
            value={form.userRole}
            disabled={isEdit}
            onChange={handleChange}
            className="input-txt"
          >
            <option value="USER">사용자</option>
            <option value="OWNER">점주</option>
            <option value="ADMIN">관리자</option>
          </select>
        </div>

        {/* OWNER일 때만 */}
        {form.userRole === "OWNER" && (
          <InputField
            label="사업자 번호"
            type="business"
            name="businessNo"
            placeholder="사업자 번호"
            value={form.businessNo}
            onChange={handleChange}
          />
        )}
      </div>
    </FormModal>
  );
}
