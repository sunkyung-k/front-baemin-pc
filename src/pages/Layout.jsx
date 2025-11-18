import React from "react";
import { Outlet, useMatches } from "react-router";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import ScrollToTop from "../components/common/ScrollToTop";
import useGA from "../hooks/common/useGA";
import useFirstVisit from "../hooks/common/useFirstVisit";

function Layout() {
  const matches = useMatches();

  // 현재 매칭된 라우트들의 handle 중 마지막(현재 페이지)의 layoutClass 읽기
  const layoutClass = matches
    .map((m) => m.handle?.layoutClass)
    .filter(Boolean)
    .at(-1);

  useGA();
  useFirstVisit();
  return (
    <div className="wrap">
      {/* 페이지 이동 시 스크롤 맨 위로 */}
      <ScrollToTop />

      <Header />
      <main className={`container ${layoutClass || ""}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
