import React, { useState } from "react";
import UserModal from "./UserModal";
import Pagination from "@/components/common/Pagination";
import { Tabs, TabButton } from "@/components/common/Tabs";

import { useAdminUserList } from "@/hooks/admin/useAdminUser";

import styles from "./UserList.module.scss";

export default function UserList() {
  const [activeTab, setActiveTab] = useState("ACTIVE");
  const [delYn, setDelYn] = useState("N");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0);

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const params = { searchText, delYn, page };
  const { data, isLoading } = useAdminUserList(params);

  if (isLoading) return <div>불러오는 중...</div>;

  const { content = [], pageInfo } = data ?? {};
  const totalCount = pageInfo?.totalElements ?? 0;

  return (
    <>
      <Tabs variant="admin">
        <TabButton
          active={activeTab === "ACTIVE"}
          onClick={() => {
            setActiveTab("ACTIVE");
            setDelYn("N");
            setPage(0);
          }}
        >
          회원 리스트
        </TabButton>

        <TabButton
          active={activeTab === "DELETED"}
          onClick={() => {
            setActiveTab("DELETED");
            setDelYn("Y");
            setPage(0);
          }}
        >
          삭제 회원 리스트
        </TabButton>
      </Tabs>

      <div className={styles.searchArea}>
        <input
          type="text"
          placeholder="아이디 또는 이름 검색"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setPage(0);
          }}
        />

        {delYn === "N" && (
          <button
            className={styles.addBtn}
            onClick={() => {
              setSelectedUserId(null);
              setOpenModal(true);
            }}
          >
            + 회원 등록
          </button>
        )}
      </div>

      <div className={styles.resultCount}>총 {totalCount}건</div>

      <table className={styles.adminTable}>
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
              <td>{page * 10 + index + 1}</td>
              <td>{u.userId}</td>

              <td
                className={
                  delYn === "N" ? styles.editableName : styles.disabledName
                }
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

      {pageInfo && <Pagination pageInfo={pageInfo} onPageChange={setPage} />}

      {openModal && (
        <UserModal
          userId={selectedUserId}
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
        />
      )}
    </>
  );
}
