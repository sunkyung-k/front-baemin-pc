import styles from "./InfoTabContent.module.scss";

export default function InfoOwnerMessage({ store }) {
  if (!store) return null;
  if (!store.notice) return null;

  return (
    <section className={styles.ownerMessage}>
      <h3 className={styles.sectionTitle}>사장님 한마디</h3>
      <div className={styles.messageBox}>
        <p style={{ whiteSpace: "pre-line" }}>{store.notice}</p>
      </div>
    </section>
  );
}
