import React, { useState } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import ImportAddress from "@/components/form/ImportAddress";
import StoreTopBar from "./StoreTopBar";
import styles from "./StoreListLayout.module.scss";

export default function StoreListLayout() {
  const [searchParams] = useSearchParams();
  const [searchText, setSearchText] = useState("");
  const addr = searchParams.get("addr") || "";
  const activeCaId = searchParams.get("caId") || "";

  return (
    <>
      <section className={styles.addressSection}>
        <ImportAddress userAddress={addr} readonly />
      </section>

      <StoreTopBar
        activeCaId={activeCaId}
        searchText={searchText}
        setSearchText={setSearchText}
      />

      {/* 하위 Outlet에서 리스트 or 상세 페이지 렌더링 */}

      {console.log("🔥 StoreListLayout 렌더됨", { searchText, activeCaId })}
      <Outlet context={{ searchText, activeCaId }} />
    </>
  );
}
