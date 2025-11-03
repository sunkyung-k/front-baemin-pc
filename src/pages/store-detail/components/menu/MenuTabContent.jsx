import MenuList from "./MenuList";
import CartBox from "./CartBox";
import styles from "./MenuTabContent.module.scss";
import { useOutletContext } from "react-router-dom";

export default function MenuTabContent() {
  const { storeDetail } = useOutletContext(); // 부모에서 전달한 데이터 받기
  console.log("현재 가게 상세:", storeDetail);
  return (
    <div className={styles.menuTabContainer}>
      <section className={styles.leftArea}>
        <MenuList />
      </section>
      <aside className={styles.rightArea}>
        <CartBox />
      </aside>
    </div>
  );
}
