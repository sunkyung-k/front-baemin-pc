import { useOutletContext } from "react-router-dom";
import InfoOwnerMessage from "./InfoOwnerMessage";
import InfoSection from "./InfoSection";
import styles from "./InfoTabContent.module.scss";

export default function InfoTabContent() {
  const { storeDetail } = useOutletContext();

  return (
    <div className={styles.infoTabContainer}>
      <InfoOwnerMessage store={storeDetail} />
      <InfoSection store={storeDetail} />
    </div>
  );
}
