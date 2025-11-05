import React from "react";
import { Outlet, useMatches } from "react-router";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

function Layout() {
  const matches = useMatches();

  // 현재 매칭된 라우트들의 handle 중 마지막(현재 페이지)의 layoutClass 읽기
  const layoutClass = matches
    .map((m) => m.handle?.layoutClass)
    .filter(Boolean)
    .at(-1);

  return (
    <div className="wrap">
      <Header />
      <main className={`container ${layoutClass || ""}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
