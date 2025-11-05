import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ImportAddress from "@/components/form/ImportAddress";
import { getAddressFromCoords } from "@/utills/addressUtils";
import { useCategory } from "@/hooks/useCategory";
import api from "@/api/axiosApi";
import styles from "./Home.module.scss";

function Home() {
  const [userAddress, setUserAddress] = useState("");
  const [searchText, setSearchText] = useState("");
  const { categories, isLoading, error } = useCategory();
  const navigate = useNavigate();

  const categoryImages = useMemo(
    () =>
      Array.from(
        { length: 9 },
        (_, i) =>
          `${import.meta.env.BASE_URL}images/category/category_${String(
            i + 1
          ).padStart(2, "0")}.png`
      ),
    []
  );

  /** 📍 현재 위치 → 주소 자동 변환 */
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("이 브라우저에서는 위치 정보를 사용할 수 없습니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const address = await getAddressFromCoords(longitude, latitude);
          setUserAddress(address);
          alert(`현재 위치가 설정되었습니다.\n${address}`);
        } catch (err) {
          console.error("주소 변환 실패:", err);
          alert("주소를 가져오는 중 오류가 발생했습니다.");
        }
      },
      () => alert("위치 정보를 불러올 수 없습니다.")
    );
  };

  /** 카테고리 클릭 시 음식점 리스트 페이지로 이동 */
  const handleCategoryClick = async (category) => {
    if (!userAddress) {
      alert("현재 위치를 설정해주세요!");
      return;
    }

    const shortAddr = userAddress.split(" ").slice(0, 2).join(" ");

    try {
      // 백엔드 검색 API 호출
      const res = await api.post("/api/v1/store/search", {
        searchText: searchText.trim(),
        caId: category.id,
      });

      const stores = res.data?.response || [];

      // 검색 결과 페이지로 이동 (stores 데이터 전달)
      navigate("/store/list", {
        state: {
          stores,
          addr: shortAddr,
          caName: category.name,
          searchText,
        },
      });
    } catch (err) {
      console.error("검색 실패:", err);
      alert("가게 검색 중 오류가 발생했습니다.");
    }
  };

  /** 🧭 로딩 상태 / 에러 처리 */
  if (isLoading) {
    return (
      <div className={styles.loadingWrap}>
        <p>카테고리를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorWrap}>
        <p>카테고리를 불러오는 중 오류가 발생했습니다 😢</p>
      </div>
    );
  }

  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <p className={styles.tit}>“어디로 배달해 드릴까요?”</p>
        <p>현재 위치를 불러오면 내 주변 맛집을 볼 수 있어요!</p>

        <ImportAddress
          userAddress={userAddress}
          onGetLocation={handleGetLocation}
        />
      </section>

      <main className={styles.main}>
        <section>
          <h2 className={styles.homeTit}>카테고리</h2>
          <div className={styles.categoryGrid}>
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map((category, idx) => (
                <div
                  key={category.id || idx}
                  className={styles.categoryCard}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className={styles.categoryThumb}>
                    <img
                      src={categoryImages[idx % categoryImages.length]}
                      alt={category.name}
                      loading="lazy"
                    />
                  </div>
                  <p>{category.name}</p>
                </div>
              ))
            ) : (
              <p>표시할 카테고리가 없습니다.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
