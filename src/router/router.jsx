import React from "react";
import { createBrowserRouter, redirect } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Layout & Pages
import Layout from "../pages/Layout";
import Home from "../pages/home/Home";
import Login from "../pages/login/Login";
import Join from "../pages/join/Join";

import StoreListLayout from "../pages/store-list/StoreListLayout";
import StoreList from "../pages/store-list/StoreList";

import StoreDetailLayout from "../pages/store-detail/StoreDetailLayout";
import MenuTabContent from "../pages/store-detail/menu/MenuTabContent";
import InfoTabContent from "../pages/store-detail/info/InfoTabContent";

import Favorite from "../pages/favorite/Favorite";

import OrderLayout from "../pages/order/OrderLayout";
import OrderStatus from "../pages/order/OrderStatus";
import OrderComplete from "../pages/order/OrderComplete";

import MypageLayout from "../pages/mypage/MypageLayout";
import OrderManage from "../pages/mypage/owner/OrderManage";
import StoreCRUD from "../pages/mypage/owner/StoreCRUD";
import OrderInfo from "../pages/mypage/user/OrderInfo";
import MypageAccount from "../pages/mypage/MypageAccount";

import MenuLayout from "../pages/menu-register/MenuLayout";

// Auth pages
import ResetPassword from "../pages/auth/ResetPassword";
import ResetPasswordComplete from "../pages/auth/ResetPasswordComplete";
import FindPasswordComplete from "../pages/auth/FindPasswordComplete";
import FindIdComplete from "../pages/auth/FindIdComplete";
import FindId from "../pages/auth/FindId";
import FindPassword from "../pages/auth/FindPassword";
import UserList from "../pages/admin/user/UserList";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // ---------------------- 게스트 전체 공개 ----------------------
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
        handle: { layoutClass: "wide" },
      },

      {
        path: "store",
        element: <StoreListLayout />,
        handle: { layoutClass: "wide" },
        children: [
          { index: true, element: <StoreList /> },
          { path: "list", loader: () => redirect("/store") },
        ],
      },

      {
        path: "store/:storeId",
        element: <StoreDetailLayout />,
        handle: { layoutClass: "wide" },
        children: [
          { index: true, element: <MenuTabContent /> },
          { path: "info", element: <InfoTabContent /> },
        ],
      },

      // ---------------------- USER 전용 ----------------------
      {
        path: "favorite",
        element: (
          <ProtectedRoute allowedRoles={["ROLE_USER", "ROLE_OWNER"]}>
            <Favorite />
          </ProtectedRoute>
        ),
      },

      {
        path: "order/status",
        element: (
          <ProtectedRoute allowedRoles={["ROLE_USER"]}>
            <OrderStatus />
          </ProtectedRoute>
        ),
      },

      {
        path: "order",
        element: (
          <ProtectedRoute allowedRoles={["ROLE_USER"]}>
            <OrderLayout />
          </ProtectedRoute>
        ),
      },

      {
        path: "order/complete",
        element: (
          <ProtectedRoute allowedRoles={["ROLE_USER"]}>
            <OrderComplete />
          </ProtectedRoute>
        ),
      },

      // ---------------------- USER & OWNER 공통 ----------------------
      {
        path: "mypage",
        element: (
          <ProtectedRoute allowedRoles={["ROLE_USER", "ROLE_OWNER"]}>
            <MypageLayout />
          </ProtectedRoute>
        ),
        children: [
          // USER 메뉴
          {
            path: "order/info",
            element: (
              <ProtectedRoute allowedRoles={["ROLE_USER"]}>
                <OrderInfo />
              </ProtectedRoute>
            ),
          },

          // OWNER 메뉴
          {
            path: "order/manage",
            element: (
              <ProtectedRoute allowedRoles={["ROLE_OWNER"]}>
                <OrderManage />
              </ProtectedRoute>
            ),
          },
          {
            path: "store",
            element: (
              <ProtectedRoute allowedRoles={["ROLE_OWNER"]}>
                <StoreCRUD />
              </ProtectedRoute>
            ),
          },

          // 공통
          {
            path: "account",
            element: (
              <ProtectedRoute allowedRoles={["ROLE_USER", "ROLE_OWNER"]}>
                <MypageAccount />
              </ProtectedRoute>
            ),
          },
        ],
      },

      // ---------------------- ADMIN ONLY ----------------------
      {
        path: "admin/user",
        element: (
          <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
            <UserList />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // ---------------------- 인증 페이지 ----------------------
  { path: "/login", element: <Login /> },
  { path: "/join", element: <Join /> },

  { path: "/menuRegister/:storeId", element: <MenuLayout /> },

  // 아이디 비번 찾기
  { path: "/find-id", element: <FindId /> },
  { path: "/find-id/complete", element: <FindIdComplete /> },
  { path: "/find-password", element: <FindPassword /> },
  { path: "/find-password/complete", element: <FindPasswordComplete /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/reset-password/complete", element: <ResetPasswordComplete /> },
]);
