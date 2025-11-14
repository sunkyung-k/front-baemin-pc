import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import adminUserAPI from "@/service/admin/adminUserAPI";
import UserModal from "./UserModal";
import Pagination from "@/components/common/Pagination";

export default function UserList() {
  // 🔥 탭 상태 (활성 / 삭제)
  const [activeTab, setActiveTab] = useState("ACTIVE");
  const [delYn, setDelYn] = useState("N");

  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0);

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  /** 탭 전환 */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setDelYn(tab === "ACTIVE" ? "N" : "Y");
    setPage(0);
  };

  /** 리스트 조회 */
  const { data, isLoading } = useQuery({
    queryKey: ["adminUserList", searchText, delYn, page],
    queryFn: () => adminUserAPI.getList({ searchText, delYn, page }),
  });

  if (isLoading) return <div>불러오는 중...</div>;

  const { content = [], pageInfo } = data ?? {};
  const totalCount = pageInfo?.totalElements ?? 0;

  return (
    <div className="page-wrap admin-page">
      <h2 class="page-title">회원 관리</h2>

      {/* 탭 메뉴 */}
      <div className="tab-menu">
        <button
          className={activeTab === "ACTIVE" ? "active" : ""}
          onClick={() => handleTabChange("ACTIVE")}
        >
          회원 리스트
        </button>

        <button
          className={activeTab === "DELETED" ? "active" : ""}
          onClick={() => handleTabChange("DELETED")}
        >
          삭제 회원 리스트
        </button>
      </div>

      {/* 🔍 검색 + 등록 */}
      <div className="search-area">
        <input
          type="text"
          placeholder="아이디 또는 이름 검색"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setPage(0);
          }}
        />

        {/* 삭제회원일 때는 등록 버튼 숨김 */}
        {delYn === "N" && (
          <button
            className="btn"
            onClick={() => {
              setSelectedUserId(null);
              setOpenModal(true);
            }}
          >
            + 회원 등록
          </button>
        )}
      </div>

      {/* 🔥 총 N건 */}
      <div className="result-count">총 {totalCount}건</div>

      {/* 📋 리스트 */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>No</th>
            <th>아이디</th>
            <th>이름</th>
            <th>전화번호</th>
            <th>이메일</th>
            <th>회원구분</th>
          </tr>
        </thead>

        <tbody>
          {content.map((u, index) => (
            <tr key={u.userId}>
              {/* 번호 = (현재페이지 * size) + index + 1 */}
              <td>{page * 10 + index + 1}</td>

              <td>{u.userId}</td>

              {/* 수정 가능한 탭(활성)일 때만 clickable */}
              <td
                style={{
                  cursor: delYn === "N" ? "pointer" : "default",
                  color: delYn === "N" ? "#007aff" : "#333",
                  fontWeight: 500,
                }}
                onClick={() => {
                  if (delYn === "N") {
                    setSelectedUserId(u.userId);
                    setOpenModal(true);
                  }
                }}
              >
                {u.userName}
              </td>

              <td>{u.phone}</td>
              <td>{u.email}</td>
              <td>{u.roleName}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      {pageInfo && <Pagination pageInfo={pageInfo} onPageChange={setPage} />}

      {/* 등록/수정 모달 */}
      {delYn === "N" && (
        <UserModal
          userId={selectedUserId}
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
        />
      )}
    </div>
  );
}
