import React, { useState } from "react";
import UserModal from "./UserModal";
import Pagination from "@/components/common/Pagination";
import { formatPhone } from "@/utills/valueFormatter";
import { Tabs, TabButton } from "@/components/common/Tabs";
import { useAdminUserList } from "@/hooks/admin/useAdminUser";
import { FaMagnifyingGlass } from "react-icons/fa6";
import InputField from "@/components/form/InputField";
import { TiPlus } from "react-icons/ti";
import styles from "./UserList.module.scss";

export default function UserList() {
  const [activeTab, setActiveTab] = useState("ACTIVE");
  const [delYn, setDelYn] = useState("N");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0);

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const params = { searchText, delYn, page };
  const { data } = useAdminUserList(params);

  const { content = [], pageInfo } = data ?? {};
  const totalCount = pageInfo?.totalElements ?? 0;

  return (
    <div className={styles.adminWrap}>
      <Tabs variant="admin" className={styles.tabs}>
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

      <div className={styles.topArea}>
        <div className={styles.searchBox}>
          <FaMagnifyingGlass className={styles.searchIcon} />
          <InputField
            type="search"
            placeholder="아이디 또는 이름 검색"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(0);
            }}
          />
        </div>

        {delYn === "N" && (
          <button
            className="btn btn-default btn-primary"
            onClick={() => {
              setSelectedUserId(null);
              setOpenModal(true);
            }}
          >
            <TiPlus size={18} />
            회원 등록
          </button>
        )}
      </div>

      {/* 테이블 */}
      <div className={styles.table}>
        <table>
          <colgroup>
            <col width="10%" />
            <col width="15%" />
            <col width="15%" />
            <col width="18%" />
            <col width="22%" />
            <col width="*" />
          </colgroup>
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
                <td>{totalCount - (page * 10 + index)}</td>
                <td>{u.userId}</td>
                <td>
                  <button
                    type="button"
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
                  </button>
                </td>
                <td>{formatPhone(u.phone)}</td>
                <td>{u.email}</td>
                <td>
                  {u.userRole === "OWNER" && (
                    <div className={styles.roleBox}>
                      <span className={styles.roleText}>점주</span>

                      {delYn === "N" && u.storeId && u.storeName && (
                        <a
                          href={`/store/${u.storeId}`}
                          className={styles.storeBadge}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {u.storeName}
                        </a>
                      )}
                    </div>
                  )}

                  {u.userRole === "ADMIN" && (
                    <span className={styles.roleText}>관리자</span>
                  )}

                  {u.userRole === "USER" && (
                    <span className={styles.roleText}>사용자</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {pageInfo && <Pagination pageInfo={pageInfo} onPageChange={setPage} />}

      {/* modal */}
      {openModal && (
        <UserModal
          userId={selectedUserId}
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
        />
      )}
    </div>
  );
}
