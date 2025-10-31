import React from "react";
import { Outlet } from "react-router";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

function Layout() {
  return (
    <div className="wrap">
      <Header />
      <main className="container">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
