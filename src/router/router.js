import { createBrowserRouter } from "react-router";
import Layout from "../pages/Layout";
import Home from "../pages/home/Home";
import Login from "../pages/login/Login";
import MypageLayout from "../pages/mypage/MypageLayout";
import StoreCRUD from "../pages/mypage/owner/StoreCRUD";
import MenuLayout from "../pages/menu-register/MenuLayout";

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
        path: "mypage",
        Component: MypageLayout,
        children: [
          {
            index: true,
            Component: StoreCRUD,
          },
        ],
      },

      // {
      //   path: "book",
      //   children: [
      //     {
      //       index: true, // /book
      //       Component: BookList,
      //     },
      //     {
      //       path: ":bookId", // /book/:bookId
      //       Component: BookDetail,
      //     },
      //     {
      //       path: "new", // /book/new
      //       Component: BookCreate,
      //     },
      //     {
      //       path: "search", //  /book/search
      //       Component: BookSearch,
      //     },
      //   ],
      // },
      // {
      //   path: "users",
      //   children: [{ index: true, Component: UserList }],
      // },
      // {
      //   path: "mypage",
      //   children: [{ index: true, Component: MyPage }],
      // },
      // {
      //   path: "cart",
      //   children: [{ index: true, Component: CartPage }],
      // },
      // {
      //   path: "order",
      //   children: [
      //     {
      //       path: "result",
      //       Component: OrderResult,
      //     },
      //   ],
      // },
    ],
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/menuRegister",
    Component: MenuLayout,
  },
]);
