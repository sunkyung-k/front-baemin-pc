import { formatPhone, formatBusinessNo } from "@/utills/valueFormatter";
import styles from "./InfoTabContent.module.scss";

export default function InfoSection({ store }) {
  if (!store) return null;

  /** 점주(owner) 정보 구조 분리 */
  const owner = store.ownerInfo ?? {};

  /** 가게 기본 정보 */
  const infoList = [
    store.businessHour && { label: "영업시간", value: store.businessHour },
    store.phone && { label: "전화번호", value: formatPhone(store.phone) },
    (store.addr || store.addrDetail) && {
      label: "주소",
      value: `${store.addr ?? ""} ${store.addrDetail ?? ""}`.trim(),
    },
    store.minPrice && {
      label: "최소주문금액",
      value: `${store.minPrice.toLocaleString()}원`,
    },
    store.hourComment && { label: "영업 상태", value: store.hourComment },
    store.notice && { label: "안내사항", value: store.notice },
  ].filter(Boolean);

  const hasBusinessInfo = infoList.length > 0;
  const hasOwnerInfo =
    store.storeName || owner.userName || owner.businessNo || owner.phone;
  const hasOrigin = !!store.origin;

  return (
    <>
      {/* 가게 정보 */}
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

      {/* 사업자 정보 */}
      {hasOwnerInfo && (
        <section className={styles.section}>
          <h4 className={styles.sectionSubTitle}>사업자정보</h4>
          <ul className={styles.infoList}>
            {store.storeName && (
              <li>
                <strong>상호명 :</strong> {store.storeName}
              </li>
            )}
            {owner.userName && (
              <li>
                <strong>대표자명 :</strong> {owner.userName}
              </li>
            )}
            {owner.businessNo && (
              <li>
                <strong>사업자등록번호 :</strong>{" "}
                {formatBusinessNo(owner.businessNo)}
              </li>
            )}
            {owner.phone && (
              <li>
                <strong>점주 연락처 :</strong> {formatPhone(owner.phone)}
              </li>
            )}
          </ul>
        </section>
      )}

      {/* 원산지 정보 */}
      {hasOrigin && (
        <section className={styles.section}>
          <h4 className={styles.sectionSubTitle}>원산지정보</h4>
          <p className={styles.infoText}>{store.origin}</p>
        </section>
      )}
    </>
  );
}
