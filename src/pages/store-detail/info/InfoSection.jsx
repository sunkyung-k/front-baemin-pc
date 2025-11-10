import styles from "./InfoTabContent.module.scss";

export default function InfoSection({ store }) {
  if (!store) return null;

  const infoList = [
    store.businessHour && { label: "영업시간", value: store.businessHour },
    store.phone && { label: "전화번호", value: store.phone },
    (store.addr || store.addrDetail) && {
      label: "주소",
      value: `${store.addr ?? ""} ${store.addrDetail ?? ""}`.trim(),
    },
    store.minPrice && {
      label: "최소주문금액",
      value: `${store.minPrice.toLocaleString()}원`,
    },
    store.hourComment && { label: "영업 상태", value: store.hourComment },
  ].filter(Boolean); // falsy 제거 (빈 값 안 보이게)

  const hasBusinessInfo = infoList.length > 0;
  const hasOwnerInfo = store.storeName || store.ownerName || store.bizNumber;
  const hasOrigin = !!store.origin;

  return (
    <>
      {hasBusinessInfo && (
        <section className={styles.section}>
          <h4 className={styles.sectionSubTitle}>가게 정보</h4>
          <ul className={styles.infoList}>
            {infoList.map((it, i) => (
              <li key={i}>
                <strong>{it.label} :</strong> {it.value}
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasOwnerInfo && (
        <section className={styles.section}>
          <h4 className={styles.sectionSubTitle}>사업자정보</h4>
          <ul className={styles.infoList}>
            {store.storeName && (
              <li>
                <strong>상호명 :</strong> {store.storeName}
              </li>
            )}
            {store.ownerName && (
              <li>
                <strong>대표자명 :</strong> {store.ownerName}
              </li>
            )}
            {store.bizNumber && (
              <li>
                <strong>사업자등록번호 :</strong> {store.bizNumber}
              </li>
            )}
          </ul>
        </section>
      )}

      {hasOrigin && (
        <section className={styles.section}>
          <h4 className={styles.sectionSubTitle}>원산지정보</h4>
          <p className={styles.infoText}>{store.origin}</p>
        </section>
      )}
    </>
  );
}
