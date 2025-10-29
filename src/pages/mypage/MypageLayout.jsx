import React from "react";
import { Outlet } from "react-router-dom";
import styles from "./MypageLayout.module.scss";
import MypageMenu from "./MypageMenu";

function MypageLayout(props) {
  return (
    <>
      <div className={styles.mypage}>
        <MypageMenu />
        <div className={styles.contents}>
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default MypageLayout;
