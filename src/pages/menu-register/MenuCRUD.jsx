import React, { useState } from "react";
import styles from "./MenuCRUD.module.scss";
import CategoryPanel from "./CategoryPanel";
import { TiPlus } from "react-icons/ti";
import { IoClose } from "react-icons/io5";

export default function MenuCRUD() {
  const [activeCategory, setActiveCategory] = useState(null);

  return (
    <div className={styles.wrap}>
      <main className={styles.main}>
        <button type="button" className={styles.close}>
          <IoClose />
        </button>
        <div className={styles.panelWrapper}>
          <CategoryPanel
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            storeId={5}
          />

          <section className={styles.detailPanel}>
            <div className={styles.detailHeader}>
              <h2 className={styles.categoryTitle}>메뉴 상세 관리</h2>
              <button className={`${styles.btn} ${styles.primary}`}>
                <TiPlus /> 메뉴 등록
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
