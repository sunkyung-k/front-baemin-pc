import React, { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import MenuItem from "./MenuItem";
import styles from "./MenuList.module.scss";

// EmptyState 임포트
import EmptyState from "@/components/menu/EmptyState";
import { FaUtensils } from "react-icons/fa6";

/**
 * MenuList
 * ------------------------------------------------------
 * - OutletContext로 전달받은 storeDetail에서 메뉴카테고리 추출
 * - 삭제된 메뉴(delYn="Y")를 categories 단계에서 제거
 * - 메뉴 삭제 후 500 에러 호출 완전 방지
 */
export default function MenuList() {
  const { storeDetail: store } = useOutletContext();
  const [active, setActive] = useState("전체");

  /** 메뉴 포함 카테고리 필터링 (🔥 delYn="Y" 메뉴 완전 제거) */
  const categories = useMemo(() => {
    if (!store?.menuCategoryList) return [];

    return store.menuCategoryList
      .map((cat) => ({
        ...cat,
        menuList: (cat.menuList || []).filter((m) => m.delYn !== "Y"), // 🔥 여기 추가
      }))
      .filter((cat) => Array.isArray(cat.menuList) && cat.menuList.length > 0);
  }, [store]);

  /** 모든 카테고리 메뉴 평탄화 */
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

  /** 카테고리 탭 구성 */
  const categoryTabs = useMemo(
    () => ["전체", ...categories.map((cat) => cat.menuCaName)],
    [categories]
  );

  /** 현재 탭 기준 메뉴 필터링 */
  const filteredMenus = useMemo(
    () =>
      allMenus.filter((m) =>
        active === "전체" ? true : m.categoryName === active
      ),
    [active, allMenus]
  );

  /** 메뉴 카테고리조차 없으면 → 탭 + 리스트 전부 숨기고 EmptyState만 표시 */
  if (categories.length === 0) {
    return (
      <EmptyState
        icon={<FaUtensils />}
        title="등록된 메뉴가 없습니다."
        description="사장님이 메뉴를 준비 중이에요."
      />
    );
  }

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
