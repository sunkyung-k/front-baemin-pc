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
  STORE_LIST: (filters) => ["storeList", filters],
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

  /** 장바구니(Basket) */
  BASKET: ["basket"], // 전체 장바구니 조회
  BASKET_DETAIL: (basketId) => ["basketDetail", basketId],
  BASKET_ITEM_LIST: (basketId) => ["basketItemList", basketId],

  /** 유틸성 (캐시 전체 초기화 등) */
  ALL_MENUS: ["allMenus"],
  ALL_OPTIONS: ["allOptions"],

  /** 사용자(User / Account) */
  USER_INFO: (userId) => ["userInfo", userId], // 내 정보
  USER_DEPOSIT: (userId) => ["userDeposit", userId], // 보유금
  USER_LIST: ["userList"], // 관리자용 전체 조회 (선택)
};
