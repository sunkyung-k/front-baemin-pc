import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import storeAPI from "@/service/storeAPI";
import MenuItem from "./MenuItem";
import styles from "./MenuList.module.scss";

export default function MenuList() {
  const { storeId } = useParams();
  const [active, setActive] = useState("전체");

  /** ✅ 가게 상세 API 호출 */
  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.STORE_DETAIL(storeId),
    queryFn: () => storeAPI.getStoreDetail(storeId),
    enabled: !!storeId,
  });

  const store = data?.response?.vo || null;

  /** ✅ 메뉴 있는 카테고리만 필터링 */
  const categories = useMemo(() => {
    if (!store?.menuCategoryList) return [];
    return store.menuCategoryList.filter(
      (cat) => Array.isArray(cat.menuList) && cat.menuList.length > 0
    );
  }, [store]);

  /** ✅ 전체 메뉴 목록 */
  const allMenus = useMemo(() => {
    return categories.flatMap((cat) =>
      (cat.menuList || []).map((menu) => ({
        ...menu,
        categoryName: cat.menuCaName,
      }))
    );
  }, [categories]);

  /** ✅ 탭 구성 */
  const categoryTabs = useMemo(() => {
    const names = categories.map((cat) => cat.menuCaName);
    return ["전체", ...names];
  }, [categories]);

  /** ✅ 필터링된 메뉴 */
  const filteredMenus = useMemo(() => {
    if (active === "전체") return allMenus;
    return allMenus.filter((m) => m.categoryName === active);
  }, [active, allMenus]);

  /** ✅ 로딩 / 에러 처리 */
  if (isLoading) return <p className={styles.loading}>로딩 중...</p>;
  if (isError || !store) return null;
  if (!categories.length || !allMenus.length) return null;

  return (
    <div className={styles.menuListWrap}>
      {/* ✅ 카테고리 탭 */}
      <div className={styles.categoryTabs}>
        {categoryTabs.map((cat) => (
          <button
            key={cat}
            className={`${styles.tab} ${active === cat ? styles.active : ""}`}
            onClick={() => setActive(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ✅ 메뉴 렌더링 */}
      {filteredMenus.length > 0 && (
        <>
          <h3 className={styles.categoryTitle}>{active}</h3>
          <div className={styles.menuItems}>
            {filteredMenus.map((menu) => (
              <MenuItem key={menu.menuId} menuId={menu.menuId} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
