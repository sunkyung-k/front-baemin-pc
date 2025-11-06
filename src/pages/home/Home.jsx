import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ImportAddress from "@/components/form/ImportAddress";
import { useCurrentAddress } from "@/hooks/useCurrentAddress";
import { useCategory } from "@/hooks/useCategory";
import { useAddressStore } from "@/store/useAddressStore";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import styles from "./Home.module.scss";

function Home() {
  const navigate = useNavigate();
  const { categories } = useCategory();
  const { address, setAddress } = useAddressStore();
  const { fetchAddress, loading } = useCurrentAddress();
  const { openAddressSearch } = useAddressSearch(setAddress);

  useEffect(() => {
    if (address) setAddress(address);
  }, [address]);

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

  const handleCategoryClick = (category) => {
    if (!address) {
      alert("현재 위치를 먼저 설정해주세요!");
      return;
    }

    const shortAddr = address.split(" ").slice(0, 2).join(" ");
    navigate(
      `/store/list?addr=${encodeURIComponent(shortAddr)}&caId=${category.id}`
    );
  };

  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <p className={styles.tit}>“어디로 배달해 드릴까요?”</p>
        <p>현재 위치를 불러오면 내 주변 맛집을 볼 수 있어요!</p>

        <ImportAddress
          userAddress={address}
          onGetLocation={fetchAddress}
          onSearchAddress={openAddressSearch}
          loading={loading}
        />
      </section>

      <main className={styles.main}>
        <section>
          <h2 className={styles.homeTit}>카테고리</h2>
          <div className={styles.categoryGrid}>
            {categories.map((category, idx) => (
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
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
