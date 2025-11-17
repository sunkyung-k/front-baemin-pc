import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useMenuStore = create(
  devtools((set, get) => ({
    menus: [], // 전체 메뉴 flat 형태

    /** 메뉴 초기화 (storeDetail에서 한 번에 세팅) */
    setMenus: (menuList = []) =>
      set(() => ({
        menus: Array.isArray(menuList) ? [...menuList] : [],
      })),

    /** 단일 메뉴 삭제 */
    removeMenuLocal: (menuId) =>
      set((state) => ({
        menus: state.menus.filter((m) => m.menuId !== menuId),
      })),

    /** 메뉴 전체 초기화 */
    clearMenus: () => set({ menus: [] }),
  }))
);
