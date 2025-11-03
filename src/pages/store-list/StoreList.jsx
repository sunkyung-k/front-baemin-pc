import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaLocationCrosshairs, FaMagnifyingGlass } from "react-icons/fa6";
import api from "@/api/axiosApi";
import styles from "./StoreList.module.scss";

function StoreList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const [addr, setAddr] = useState(searchParams.get("addr") || "");
  const [searchText, setSearchText] = useState(
    searchParams.get("searchText") || ""
  );
  const [activeCaId, setActiveCaId] = useState(searchParams.get("caId") || "");

  const categories = [
    { id: "", name: "전체보기" },
    { id: 1, name: "한식" },
    { id: 2, name: "중식" },
    { id: 3, name: "일식" },
    { id: 4, name: "양식" },
    { id: 5, name: "치킨" },
    { id: 6, name: "분식" },
    { id: 7, name: "카페/디저트" },
    { id: 8, name: "패스트푸드" },
    { id: 9, name: "족발/보쌈" },
  ];

  /** 가게 목록 조회 */
  const fetchStores = async (pageNo = 0) => {
    try {
      setLoading(true);

      const params = { page: pageNo };

      if (activeCaId && !isNaN(Number(activeCaId))) {
        params.caId = Number(activeCaId);
      }

      if (searchText.trim()) {
        params.searchText = searchText.trim();
      }

      const res = await api.get("/api/v1/store", { params });
      let { content = [], total: totalCnt } = res.data.response || {};

      // ⚠️ [임시] 프론트에서 주소 필터링 (백엔드 addr 검색 전)
      if (addr.trim()) {
        content = content.filter(
          (store) => store.addr && store.addr.includes(addr.trim())
        );
      }

      // ✅ 첫 페이지면 새로 세팅, 아니면 append
      setStores((prev) => (pageNo === 0 ? content : [...prev, ...content]));
      setPage(pageNo);
      setTotal(totalCnt);
    } catch (err) {
      console.error("❌ 가게 목록 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  /** 주소, 검색어, 카테고리 변경 시 첫 페이지 새로 불러오기 */
  useEffect(() => {
    fetchStores(0);
  }, [activeCaId, searchText, addr]);

  /** 메뉴/가게명 검색 */
  const handleSearch = () => {
    setSearchParams({ addr, caId: activeCaId, searchText });
    fetchStores(0);
  };

  /** 카테고리 클릭 */
  const handleCategoryClick = (id) => {
    setActiveCaId(id);
    const params = { addr, searchText };
    if (id) params.caId = id;
    setSearchParams(params);
  };

  /** 더보기 클릭 */
  const handleLoadMore = () => {
    fetchStores(page + 1);
  };

  return (
    <div className={styles.storeList}>
      {/* 🔹 주소 검색창 */}
      <div className={styles.addressBox}>
        <button className={styles.locationBtn} title="현재 위치 가져오기">
          <FaLocationCrosshairs />
        </button>
        <input
          type="text"
          className={styles.addressInput}
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
          placeholder="배달받을 주소를 입력해주세요"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
      </div>

      {/* 🔹 메뉴/가게명 검색창 */}
      <div className={styles.menuSearch}>
        <input
          type="text"
          placeholder="메뉴명 또는 가게명을 입력하세요"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button className={styles.searchBtn} onClick={handleSearch}>
          <FaMagnifyingGlass />
        </button>
      </div>

      {/* 🔹 카테고리 탭 */}
      <div className={styles.categoryTabs}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.tab} ${
              String(activeCaId) === String(cat.id) ? styles.active : ""
            }`}
            onClick={() => handleCategoryClick(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 🔹 가게 리스트 */}
      <div className={styles.storeGrid}>
        {loading && <p>불러오는 중...</p>}
        {!loading && stores.length === 0 && (
          <p className={styles.empty}>검색 결과가 없습니다.</p>
        )}
        {stores.map((s) => (
          <div key={s.storeId} className={styles.storeCard}>
            <div className={styles.thumb}>
              <img
                src={
                  s.fileThumbName
                    ? `${s.filePath}${s.fileThumbName}`
                    : "/images/default_store.png"
                }
                alt={s.storeName}
              />
            </div>
            <div className={styles.info}>
              <h3>{s.storeName}</h3>
              <p>{s.addr}</p>
              <p className={styles.comment}>
                {s.hourComment || (s.open ? "영업 중" : "영업 종료")}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 더보기 버튼 */}
      {!loading && stores.length < total && (
        <div className="btnWrap btnWrap-center">
          <button
            className="btn btn-default btn-round btn-primary-line"
            onClick={handleLoadMore}
          >
            <i className="fa-solid fa-chevron-down"></i> 더보기
          </button>
        </div>
      )}
    </div>
  );
}

export default StoreList;
