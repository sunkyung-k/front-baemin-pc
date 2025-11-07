import { createBrowserRouter } from "react-router";
import { redirect } from "react-router-dom";
import Layout from "../pages/Layout";
import Home from "../pages/home/Home";
import Login from "../pages/login/Login";
import MypageLayout from "../pages/mypage/MypageLayout";
import StoreCRUD from "../pages/mypage/owner/StoreCRUD";
import OrderManage from "../pages/mypage/owner/OrderManage";
import OrderInfo from "../pages/mypage/user/OrderInfo";
import MypageAccount from "../pages/mypage/MypageAccount";
import MenuLayout from "../pages/menu-register/MenuLayout";
import StoreListLayout from "../pages/store-list/StoreListLayout";
import StoreDetailLayout from "../pages/store-detail/StoreDetailLayout";
import MenuTabContent from "../pages/store-detail/menu/MenuTabContent";
import Join from "../pages/join/Join";
import StoreList from "../pages/store-list/StoreList";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: Home,
        handle: { layoutClass: "wide" },
      },

      {
        path: "store",
        Component: StoreListLayout,
        handle: { layoutClass: "wide" },
        children: [
          {
            index: true,
            Component: StoreList,
          },
          {
            path: "list",
            loader: () => redirect("/store"),
          },
        ],
      },
      {
        path: "store/:storeId",
        Component: StoreDetailLayout,
        children: [{ index: true, Component: MenuTabContent }],
      },
      {
        path: "mypage",
        Component: MypageLayout,
        children: [
          {
            path: "order/manage", // 점주용
            Component: OrderManage,
          },
          {
            path: "order/info", // 일반회원용
            Component: OrderInfo,
          },
          {
            path: "store",
            Component: StoreCRUD,
          },
          {
            path: "account",
            Component: MypageAccount,
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/join",
    Component: Join,
  },
  {
    path: "/menuRegister/:storeId",
    Component: MenuLayout,
  },
]);
