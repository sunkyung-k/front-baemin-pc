import { useOutletContext } from "react-router-dom";
import { useStoreList } from "@/hooks/useStoreList";
import StoreCard from "./StoreCard";
import EmptyState from "@/components/menu/EmptyState";
import { FaStore } from "react-icons/fa6";
import styles from "./StoreList.module.scss";

export default function StoreList() {
  const { searchText, activeCaId } = useOutletContext();

  const { stores, isError } = useStoreList({
    caId: activeCaId || null,
    searchText: searchText || null,
  });

  /** 상태별 콘텐츠 렌더링 */
  const renderContent = () => {
    if (isError) {
      return (
        <EmptyState
          icon={<FaStore />}
          title="가게 정보를 불러올 수 없습니다."
          description="네트워크 상태를 확인하거나, 잠시 후 다시 시도해주세요."
        />
      );
    }

    if (!stores.length) {
      return (
        <EmptyState
          icon={<FaStore />}
          title="아직 등록된 음식점이 없습니다."
          description="빠른 시일 내에 서비스를 제공할 수 있도록 최선을 다하겠습니다."
        />
      );
    }

    return (
      <div className={styles.storeGrid}>
        {stores.map((s) => (
          <StoreCard key={s.storeId} store={s} />
        ))}
      </div>
    );
  };

  return <main className={styles.main}>{renderContent()}</main>;
}
