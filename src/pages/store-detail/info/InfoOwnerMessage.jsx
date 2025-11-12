import styles from "./InfoTabContent.module.scss";

export default function InfoOwnerMessage({ store }) {
  if (!store) return null;
  if (!store.notice) return null;

  return (
    <section className={styles.section}>
      <h3 className={`${styles.sectionSubTitle} ${styles.bdNone}`}>
        사장님 한마디
      </h3>
      <div className={styles.messageBox}>
        <p>{store.notice}</p>
      </div>
    </section>
  );
}
