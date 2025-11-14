import React, { useEffect, useState } from "react";
import Modal from "@/components/common/Modal";
import adminUserAPI from "@/service/admin/adminUserAPI";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function UserModal({ userId, isOpen, onClose }) {
  const isEdit = !!userId;
  const queryClient = useQueryClient();

  // 폼 상태
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

  /** 🔥 수정 모드일 때 — 상세 정보 로딩 */
  const { data: userData } = useQuery({
    enabled: isEdit && isOpen,
    queryKey: ["adminUserDetail", userId],
    queryFn: () => adminUserAPI.getDetail(userId),
  });

  /** 데이터 세팅 */
  useEffect(() => {
    if (isEdit && userData) {
      setForm({
        ...userData,
        passwd: "",
        businessNo: userData.businessNo ?? "",
      });
    } else if (!isEdit && isOpen) {
      // 등록 모드 초기값
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

  /** 입력 변경 핸들러 */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /** 🔥 등록/수정 처리 */
  const saveMutation = useMutation({
    mutationFn: () => {
      const sendData = { ...form };
      if (sendData.userRole !== "OWNER") delete sendData.businessNo;

      return isEdit
        ? adminUserAPI.update(sendData)
        : adminUserAPI.create(sendData);
    },
    onSuccess: () => {
      alert(isEdit ? "회원 정보 수정 완료" : "회원 등록 완료");
      queryClient.invalidateQueries(["adminUserList"]);
      onClose();
    },
  });

  /** 🔥 삭제 처리 */
  const deleteMutation = useMutation({
    mutationFn: () => adminUserAPI.remove(userId),
    onSuccess: () => {
      alert("회원 삭제 완료");
      queryClient.invalidateQueries(["adminUserList"]);
      onClose();
    },
  });

  const handleDelete = () => {
    if (confirm("정말 삭제하시겠습니까?")) deleteMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      title={isEdit ? "회원 수정" : "회원 등록"}
      onClose={onClose}
    >
      <div className="form-area">
        {/* 아이디 */}
        <label>
          아이디
          <input
            name="userId"
            value={form.userId}
            onChange={handleChange}
            disabled={isEdit}
            placeholder="아이디"
          />
        </label>

        {/* 비밀번호 */}
        <label>
          비밀번호
          <input
            name="passwd"
            type="password"
            value={form.passwd}
            onChange={handleChange}
            placeholder={isEdit ? "변경 시에만 입력" : "비밀번호"}
          />
        </label>

        {/* 이름 */}
        <label>
          이름
          <input
            name="userName"
            value={form.userName}
            onChange={handleChange}
            placeholder="이름"
          />
        </label>

        {/* 생년월일 */}
        <label>
          생년월일
          <input
            name="birth"
            value={form.birth}
            onChange={handleChange}
            placeholder="예: 901122"
          />
        </label>

        {/* 성별 */}
        <label>
          성별
          <input
            name="gender"
            value={form.gender}
            onChange={handleChange}
            placeholder="남자 / 여자"
          />
        </label>

        {/* 전화번호 */}
        <label>
          전화번호
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="010-0000-0000"
          />
        </label>

        {/* 이메일 */}
        <label>
          이메일
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="example@email.com"
          />
        </label>

        {/* 권한 */}
        <label>
          권한
          <select
            name="userRole"
            value={form.userRole}
            disabled={isEdit}
            onChange={handleChange}
          >
            <option value="USER">사용자</option>
            <option value="OWNER">점주</option>
            <option value="ADMIN">관리자</option>
          </select>
        </label>

        {/* 사업자번호 — OWNER 전용 */}
        {form.userRole === "OWNER" && (
          <label>
            사업자 번호
            <input
              name="businessNo"
              value={form.businessNo}
              onChange={handleChange}
              placeholder="사업자 번호"
            />
          </label>
        )}

        <div className="btn-row">
          <button
            className="btn btn-primary"
            onClick={() => saveMutation.mutate()}
          >
            {isEdit ? "수정" : "등록"}
          </button>

          {isEdit && (
            <button className="btn btn-danger" onClick={handleDelete}>
              삭제
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
