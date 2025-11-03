import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ImportAddress from "@/components/form/ImportAddress";
import { getAddressFromCoords } from "@/utills/addressUtils";
import { useCategory } from "@/hooks/useCategory";
import styles from "./Home.module.scss";

function Home() {
  const [userAddress, setUserAddress] = useState("");
  const { categories, isLoading, error } = useCategory();
  const navigate = useNavigate();

  /** 카테고리 이미지 자동 import */
  const images = import.meta.glob("@/assets/images/category/*.{png,jpg,jpeg}", {
    eager: true,
  });
  const sortedKeys = Object.keys(images).sort((a, b) => a.localeCompare(b));
  const categoryImages = sortedKeys.map((key) => images[key].default);

  /** 현재 위치 → 주소 자동 변환 */
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("이 브라우저에서는 위치 정보를 사용할 수 없습니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const address = await getAddressFromCoords(longitude, latitude);
        setUserAddress(address);
        alert(`현재 위치가 설정되었습니다.\n${address}`);
      },
      () => alert("위치 정보를 불러올 수 없습니다.")
    );
  };

  /** 카테고리 클릭 시 음식점 리스트 페이지로 이동 */
  const handleCategoryClick = (categoryName) => {
    if (!userAddress) {
      alert("현재 위치를 설정해주세요!");
      return;
    }

    const selected = categories.find((c) => c.name === categoryName);
    const caId = selected ? selected.id : "";

    // 시/구까지만 추출
    const shortAddr = userAddress.split(" ").slice(0, 2).join(" ");

    const params = new URLSearchParams({
      addr: shortAddr,
      caId: caId ?? "",
    }).toString();

    navigate(`/store/list?${params}`);
  };

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
            {Array.isArray(categories) && categories.length ? (
              categories.map((category, idx) => (
                <div
                  key={category.id || idx}
                  className={styles.categoryCard}
                  onClick={() => handleCategoryClick(category.name)}
                >
                  <div className={styles.categoryThumb}>
                    <img
                      src={categoryImages[idx % categoryImages.length]}
                      alt={category.name}
                    />
                  </div>
                  <p>{category.name}</p>
                </div>
              ))
            ) : (
              <p>카테고리 데이터를 불러오는 중...</p>
            )}
          </div>
        </section>

        <section className={styles.about}>
          <h3>배민 PC 서비스란?</h3>
          <p>
            스마트폰이 불편한 사용자도 쉽게 이용할 수 있는
            <br />
            PC 전용 배달 주문 서비스입니다.
          </p>
          <p>
            직관적인 디자인, 빠른 접근, 안전한 결제까지.
            <br />
            지금 바로 배민 PC에서 편하게 주문해보세요!
          </p>
        </section>
      </main>
    </div>
  );
}

export default Home;
