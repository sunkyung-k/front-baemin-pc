import { useNavigate, useLocation } from "react-router-dom";
import styles from "./StoreTabs.module.scss";

export default function StoreTabs() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const activeTab = pathname.includes("/info")
    ? "info"
    : pathname.includes("/review")
    ? "review"
    : "menu";

  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tabBtn} ${
          activeTab === "menu" ? styles.active : ""
        }`}
        onClick={() => navigate(".")}
      >
        메뉴
      </button>

      <button
        className={`${styles.tabBtn} ${
          activeTab === "review" ? styles.active : ""
        }`}
        onClick={() => navigate("review")}
      >
        리뷰
      </button>

      <button
        className={`${styles.tabBtn} ${
          activeTab === "info" ? styles.active : ""
        }`}
        onClick={() => navigate("info")}
      >
        가게정보
      </button>
    </div>
  );
}
