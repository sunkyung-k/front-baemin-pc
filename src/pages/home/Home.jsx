import React, { useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AddressInput from "@/components/store/AddressInput";
import { useCurrentAddress } from "@/hooks/useCurrentAddress";
import { useCategory } from "@/hooks/useCategory";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import styles from "./Home.module.scss";

export default function Home() {
  const navigate = useNavigate();
  const { categories } = useCategory();
  const { address, setAddress } = useStoreFilters();
  const { fetchAddress, loading } = useCurrentAddress();
  const { openAddressSearch } = useAddressSearch(setAddress);

  /** 주소 초기 자동 설정 */
  useEffect(() => {
    if (!address) {
      (async () => {
        const addr = await fetchAddress();
        if (addr) setAddress(addr);
      })();
    }
  }, [address, fetchAddress, setAddress]);

  /** 카테고리 이미지 (정적 경로) */
  const categoryImages = useMemo(
    () =>
      Array.from(
        { length: 10 },
        (_, i) =>
          `${import.meta.env.BASE_URL}images/category/category_${String(
            i
          ).padStart(2, "0")}.png`
      ),
    []
  );

  /** 전체보기 caId=0 */
  const categoryList = useMemo(
    () => [{ id: 0, name: "전체보기" }, ...(categories || [])],
    [categories]
  );

  /** 카테고리 클릭 시 이동 로직 개선 */
  const handleCategoryClick = useCallback(
    (caId) => {
      if (!address) {
        alert("현재 위치를 먼저 설정해주세요!");
        return;
      }

      const params = new URLSearchParams({
        addr: address,
        caId,
      });

      navigate(`/store?${params.toString()}`, { replace: false });
    },
    [address, navigate]
  );

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <p className={styles.tit}>“어디로 배달해 드릴까요?”</p>
        <div className={styles.txtBox}>
          <p>현재 위치를 불러오면 내 주변 4km 이내의 가게를 볼 수 있어요!</p>
        </div>

        <AddressInput
          value={address}
          setValue={setAddress}
          onGetLocation={fetchAddress}
          onSearchAddress={openAddressSearch}
          variant="default"
          loading={loading}
        />
      </section>

      <main className={styles.main}>
        <h2 className={styles.homeTit}>카테고리</h2>
        <div className={styles.categoryGrid}>
          {categoryList.map((cat, idx) => {
            const imgSrc = categoryImages[idx % categoryImages.length];
            const caId = cat.id ?? 0;
            return (
              <button
                key={cat.id || idx}
                onClick={() => handleCategoryClick(caId)}
                className={styles.categoryCard}
              >
                <div className={styles.categoryThumb}>
                  <img src={imgSrc} alt={`${cat.name} 이미지`} loading="lazy" />
                </div>
                <p className={styles.categoryName}>{cat.name}</p>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
