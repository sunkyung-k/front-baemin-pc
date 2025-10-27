import React from "react";
import { Outlet } from "react-router";
import Header from "../components/common/header/Header";
import Footer from "../components/common/footer/Footer";

function Layout() {
  return (
    <div className="wrap">
      <Header />
      <section>
        <Outlet />
      </section>
      <Footer />
    </div>
  );
}

export default Layout;
