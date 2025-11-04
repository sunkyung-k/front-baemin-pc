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

  /** 가게 상세 + 메뉴 목록 조회 */
  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.STORE_DETAIL(storeId),
    queryFn: () => storeAPI.getStoreDetail(storeId),
    enabled: !!storeId,
  });

  const store = data?.response?.vo || null;

  /** 메뉴가 포함된 카테고리만 필터링 */
  const categories = useMemo(() => {
    if (!store?.menuCategoryList) return [];
    return store.menuCategoryList.filter(
      (cat) => Array.isArray(cat.menuList) && cat.menuList.length > 0
    );
  }, [store]);

  /** 모든 카테고리의 메뉴를 평탄화 (allMenus) */
  const allMenus = useMemo(
    () =>
      categories.flatMap((cat) =>
        (cat.menuList || []).map((menu) => ({
          ...menu,
          categoryName: cat.menuCaName,
        }))
      ),
    [categories]
  );

  /** 카테고리 탭 구성 (전체 + 각 카테고리명) */
  const categoryTabs = useMemo(
    () => ["전체", ...categories.map((cat) => cat.menuCaName)],
    [categories]
  );

  /** 현재 선택된 탭 기준으로 메뉴 필터링 */
  const filteredMenus = useMemo(
    () =>
      active === "전체"
        ? allMenus
        : allMenus.filter((m) => m.categoryName === active),
    [active, allMenus]
  );

  // if (isLoading) return <p className={styles.loading}>로딩 중...</p>;
  // if (isError || !store || !categories.length || !allMenus.length) return null;

  return (
    <div className={styles.menuListWrap}>
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
