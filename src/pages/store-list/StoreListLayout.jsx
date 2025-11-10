import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAddressStore } from "@/store/useAddressStore";
import { useCurrentAddress } from "@/hooks/useCurrentAddress";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import AddressInput from "@/components/store/AddressInput";
import StoreTopBar from "./StoreTopBar";
import styles from "./StoreListLayout.module.scss";

export default function StoreListLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { address, setAddress } = useAddressStore();
  const { fetchAddress, loading } = useCurrentAddress();
  const { openAddressSearch } = useAddressSearch(setAddress);

  /** 초기 URL 파라미터 → 즉시 메모이제이션 (깜빡임 방지) */
  const initialCaId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (
      params.get("caId") || sessionStorage.getItem("lastCategoryId") || "all"
    );
  }, [location.search]);

  const initialSearchText = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("searchText") || "";
  }, [location.search]);

  /** 상태 초기화 (렌더 타이밍 문제 해결) */
  const [activeCaId, setActiveCaId] = useState(initialCaId);
  const [searchText, setSearchText] = useState(initialSearchText);

  /** URL → 상태 동기화 */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const caId =
      params.get("caId") || sessionStorage.getItem("lastCategoryId") || "all";
    const text = params.get("searchText") || "";
    setActiveCaId(caId);
    setSearchText(text);
  }, [location.search]);

  /** 주소 자동 보정 */
  useEffect(() => {
    if (!address) return;
    const params = new URLSearchParams(location.search);
    if (!params.get("addr")) {
      params.set("addr", address);
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
  }, [address, location.pathname, location.search, navigate]);

  /** 카테고리 변경 */
  const handleCategoryChange = (newCaId) => {
    const params = new URLSearchParams(location.search);
    params.set("caId", newCaId || "all");
    navigate(`${location.pathname}?${params.toString()}`);
  };

  /** 검색어 변경 */
  const handleSearchChange = (text) => {
    const params = new URLSearchParams(location.search);
    text ? params.set("searchText", text) : params.delete("searchText");
    navigate(`${location.pathname}?${params.toString()}`);
  };

  /** 아직 초기값 로드 안됐을 경우 렌더 차단 (보호막 역할) */
  if (!activeCaId) return null;

  return (
    <>
      <section className={styles.addressSection}>
        <AddressInput
          variant="compact"
          value={address}
          setValue={setAddress}
          onGetLocation={fetchAddress}
          onSearchAddress={openAddressSearch}
          loading={loading}
        />
      </section>

      <StoreTopBar
        activeCaId={activeCaId}
        searchText={searchText}
        onCategoryChange={handleCategoryChange}
        onSearchChange={handleSearchChange}
      />

      <Outlet context={{ activeCaId, searchText }} />
    </>
  );
}
