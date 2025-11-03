import { createBrowserRouter } from "react-router";
import Layout from "../pages/Layout";
import Home from "../pages/home/Home";
import Login from "../pages/login/Login";
import MypageLayout from "../pages/mypage/MypageLayout";
import StoreCRUD from "../pages/mypage/owner/StoreCRUD";
import OrderManage from "../pages/mypage/owner/OrderManage";
import OrderInfo from "../pages/mypage/user/OrderInfo";
import MypageAccount from "../pages/mypage/MypageAccount";
import MenuLayout from "../pages/menu-register/MenuLayout";
import StoreList from "../pages/store-list/StoreList";
import StoreDetailLayout from "../pages/store-detail/StoreDetailLayout";
import MenuTabContent from "../pages/store-detail/components/menu/MenuTabContent";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "store/list",
        Component: StoreList,
      },
      {
        path: "store",
        Component: StoreDetailLayout,
        children: [
          {
            path: ":storeId",
            Component: MenuTabContent,
          },
        ],
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
    path: "/menuRegister/:storeId",
    Component: MenuLayout,
  },
]);
