import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabButton } from "@/components/common/Tabs";
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
    <Tabs className={styles.sticky}>
      <TabButton active={activeTab === "menu"} onClick={() => navigate(".")}>
        메뉴
      </TabButton>

      <TabButton
        active={activeTab === "review"}
        onClick={() => navigate("review")}
      >
        리뷰
      </TabButton>

      <TabButton active={activeTab === "info"} onClick={() => navigate("info")}>
        가게정보
      </TabButton>
    </Tabs>
  );
}
