import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SearchInput from "@/components/form/SearchInput";
import { useCurrentAddress } from "@/hooks/useCurrentAddress";
import { useCategory } from "@/hooks/useCategory";
import { useAddressStore } from "@/store/useAddressStore";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import styles from "./Home.module.scss";

export default function Home() {
  const navigate = useNavigate();
  const { categories } = useCategory();
  const { address, setAddress } = useAddressStore();
  const { fetchAddress, loading } = useCurrentAddress();
  const { openAddressSearch } = useAddressSearch(setAddress);

  // 최초 진입 시 주소 없으면 자동으로 현재 위치 불러오기
  useEffect(() => {
    if (!address) {
      (async () => {
        const addr = await fetchAddress();
        if (addr) setAddress(addr);
      })();
    }
  }, [address, fetchAddress, setAddress]);

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
    const encodedAddr = encodeURIComponent(address);
    navigate(`/store/list?addr=${encodedAddr}&caId=${category.id}`);
  };

  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <p className={styles.tit}>“어디로 배달해 드릴까요?”</p>
        <p>현재 위치를 불러오면 내 주변 맛집을 볼 수 있어요!</p>

        {/* Kakao + Daum 주소 입력 통합 */}
        <SearchInput
          mode="address"
          value={address}
          setValue={setAddress}
          onGetLocation={fetchAddress}
          onSearchAddress={openAddressSearch}
          loading={loading}
        />
      </section>

      <main className={styles.main}>
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
      </main>
    </div>
  );
}
