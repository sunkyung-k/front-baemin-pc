import MenuList from "./MenuList";
import styles from "./MenuTabContent.module.scss";
import { useOutletContext } from "react-router-dom";
import { authStore } from "@/store/authStore";
import BasketBox from "./BasketBox";

export default function MenuTabContent() {
  const { storeDetail } = useOutletContext();
  const { userRole } = authStore.getState();

  if (!userRole) return null;

  const isUser = userRole.includes("USER");

  return (
    <div
      className={`${styles.menuTabContainer} ${
        isUser ? styles.hasCart : styles.noCart
      }`}
    >
      <section className={styles.leftArea}>
        <MenuList />
      </section>

      {isUser && (
        <aside className={styles.rightArea}>
          <BasketBox />
        </aside>
      )}
    </div>
  );
}
