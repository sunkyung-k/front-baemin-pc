import { useOutletContext } from "react-router-dom";
import { useStoreList } from "@/hooks/useStoreList";
import StoreCard from "./StoreCard";
import styles from "./StoreList.module.scss";

export default function StoreList() {
  const { searchText, activeCaId } = useOutletContext();

  const { stores, isError } = useStoreList({
    caId: activeCaId || null,
    searchText: searchText || null,
  });

  if (isError) return <p>가게 정보를 불러올 수 없습니다 😢</p>;
  if (!stores.length) return <p>결과 없음 😢</p>;

  return (
    <main className={styles.main}>
      <div className={styles.storeGrid}>
        {stores.map((s) => (
          <StoreCard key={s.storeId} store={s} />
        ))}
      </div>
    </main>
  );
}
