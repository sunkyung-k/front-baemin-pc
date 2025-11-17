import React, { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import MenuItem from "./MenuItem";
import styles from "./MenuList.module.scss";
import EmptyState from "@/components/menu/EmptyState";
import { FaUtensils } from "react-icons/fa6";

export default function MenuList() {
  const { storeDetail } = useOutletContext();
  const [active, setActive] = useState("전체");

  /** 카테고리 + 메뉴 정제 (삭제된 메뉴 제거) */
  const categories = useMemo(() => {
    const list = storeDetail?.menuCategoryList ?? [];

    return list
      .map((cat) => ({
        ...cat,
        menuList: (cat.menuList || []).filter(
          (m) => m && m.menuId !== 0 && m.delYn !== "Y"
        ),
      }))
      .filter((cat) => cat.menuList.length > 0);
  }, [storeDetail]);

  /** 전체 메뉴 평탄화 */
  const allMenus = useMemo(
    () =>
      categories.flatMap((cat) =>
        cat.menuList.map((m) => ({
          ...m,
          categoryName: cat.menuCaName,
        }))
      ),
    [categories]
  );

  /** 탭 리스트 */
  const categoryTabs = useMemo(
    () => ["전체", ...categories.map((cat) => cat.menuCaName)],
    [categories]
  );

  /** 현재 탭에 따른 메뉴 필터링 */
  const filteredMenus = useMemo(
    () =>
      active === "전체"
        ? allMenus
        : allMenus.filter((m) => m.categoryName === active),
    [active, allMenus]
  );

  /** 메뉴가 하나도 없을 때 */
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
      {/* 카테고리 탭 */}
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

      {/* 메뉴 리스트 */}
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
