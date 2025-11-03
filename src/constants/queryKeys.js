/**
 * ============================================
 *  React Query Key 상수 관리
 * --------------------------------------------
 * - 캐시 구분 / refetch / invalidate 통일용
 * - 팀 내 공통 네이밍 규칙: [도메인, 식별자]
 * ============================================
 */

export const QUERY_KEYS = {
  /** 가게(Store) */
  STORE_LIST: ["storeList"],
  STORE_SEARCH: (params) => ["storeSearch", params],
  STORE_DETAIL: (storeId) => ["storeDetail", storeId],
  MY_STORE: ["myStore"],
  STORE_CATEGORY_LIST: ["storeCategoryList"],

  /** 메뉴 카테고리(Menu Category) */
  MENU_CATEGORY_LIST: (storeId) => ["menuCategoryList", storeId],
  MENU_CATEGORY_DETAIL: (menuCaId) => ["menuCategoryDetail", menuCaId],

  /** 메뉴(Menu) */
  MENU_LIST: (menuCaId) => ["menuList", menuCaId],
  MENU_DETAIL: (menuId) => ["menuDetail", menuId],

  /** 메뉴 옵션 그룹(Menu Option Group) */
  MENU_OPTION_GROUP_LIST: (menuId) => ["menuOptionGroupList", menuId],
  MENU_OPTION_GROUP_DETAIL: (menuOptGrpId) => [
    "menuOptionGroupDetail",
    menuOptGrpId,
  ],

  /** 메뉴 옵션(Menu Option) */
  MENU_OPTION_LIST: (menuOptGrpId) => ["menuOptionList", menuOptGrpId],
  MENU_OPTION_DETAIL: (menuOptId) => ["menuOptionDetail", menuOptId],

  /** 유틸성 (캐시 전체 초기화 등) */
  ALL_MENUS: ["allMenus"],
  ALL_OPTIONS: ["allOptions"],
};
