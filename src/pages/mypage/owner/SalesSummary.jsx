import React from "react";
import { FaMoneyBillWave } from "react-icons/fa";
import Card from "@/components/mypage/Card";
import styles from "./SalesSummary.module.scss";
import { useStore } from "@/hooks/useStore";
import { useStoreSales } from "../../../hooks/useStoreSales";
import { formatPrice } from "../../../utills/valueFormatter";

export default function SalesSummary() {
  const { myStore } = useStore();
  const storeId = myStore?.storeId;
  const { data } = useStoreSales(storeId);

  const todaySales = data?.todaySales ?? 0;
  const monthSales = data?.monthSales ?? 0;

  return (
    <Card title="매출 요약">
      <div className={styles.salesBox}>
        <div className={styles.salesItem}>
          <p className={styles.label}>오늘 수입</p>
          <p className={styles.value}>{formatPrice(todaySales)} 원</p>
        </div>
        <div className={styles.salesItem}>
          <p className={styles.label}>이번 달 수입</p>
          <p className={styles.value}>{formatPrice(monthSales)} 원</p>
        </div>
      </div>
    </Card>
  );
}
