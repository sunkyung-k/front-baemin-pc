import React from "react";
import { Outlet, useLocation } from "react-router";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import LoadingSpinner from "../components/LoadingSpinner";

function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="wrap">
      <LoadingSpinner />
      <Header />
      <main className={`container ${isHome ? "home" : ""}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
