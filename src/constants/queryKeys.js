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

  /** 사용자(User / Account) */
  USER_INFO: (userId) => ["userInfo", userId], // 내 정보
  USER_DEPOSIT: (userId) => ["userDeposit", userId], // 보유금
  USER_LIST: ["userList"], // 관리자용 전체 조회 (선택)

  /** 찜(Favorite) */
  FAVORITE_LIST: ["favoriteList"], // 전체 찜 목록
  FAVORITE_DETAIL: (storeId) => ["favoriteDetail", storeId], // 특정 가게 찜 여부

  /** 주문(Order) */
  MY_ORDER_LIST: ["myOrderList"], // 유저 주문 내역
  MY_ORDER_RECENT_LIST: ["myOrderRecentList"], // 유저 최근 24시간 주문내역
  MY_STORE_ORDER_LIST: ["myStoreOrderList"], // 점주 주문 내역
  ORDER_DETAIL: (orderId) => ["orderDetail", orderId],

  /** 리뷰(Review) */
  MY_REVIEW_LIST: ["myReviewList"], // 내가 작성한 리뷰 목록
  STORE_REVIEW_LIST: (storeId) => ["storeReviewList", storeId], // 특정 가게 리뷰 목록
  MY_STORE_REVIEW_LIST: ["myStoreReviewList"], // 내 가게(점주) 리뷰 목록
  REVIEW_DETAIL: (reviewId) => ["reviewDetail", reviewId], // 리뷰 상세 (선택)

  /** 리뷰 답글(Review Reply) */
  REVIEW_REPLY_DETAIL: (reviewReplyId) => ["reviewReplyDetail", reviewReplyId],
  REVIEW_REPLY_LIST: (reviewId) => ["reviewReplyList", reviewId], // 리뷰별 답글 목록 (필요 시)

  /** 유틸성 (캐시 전체 초기화 등) */
  ALL_MENUS: ["allMenus"],
  ALL_OPTIONS: ["allOptions"],

  /** 관리자(Admin) */
  ADMIN_USER_LIST: (filters) => ["adminUserList", filters],
  ADMIN_USER_DETAIL: (userId) => ["adminUserDetail", userId],
};
