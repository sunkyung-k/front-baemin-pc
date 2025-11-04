import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import menuAPI from "@/service/menu/menuAPI";
import RadioGroup from "@/components/form/RadioGroup";
import CheckboxGroup from "@/components/form/CheckboxGroup";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";
import useBasket from "@/hooks/useBasket";
import { authStore } from "@/store/authStore";
import styles from "./MenuItem.module.scss";

/**
 * MenuItem
 * ------------------------------------------------------------
 * - 필수 옵션 검증
 * - USER만 '담기' 버튼 노출
 * - 다른 가게 메뉴 담기 확인(confirm)은 useBasket 훅에서 처리
 * ------------------------------------------------------------
 */
export default function MenuItem({ menuId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState({});

  /** 장바구니 훅 */
  const { addMenu } = useBasket();
  const { userId, userRole } = authStore.getState();
  const isUser = userRole?.includes("USER");

  /** 메뉴 상세 조회 */
  const {
    data: menu,
    isLoading,
    isError,
  } = useQuery({
    queryKey: QUERY_KEYS.MENU_DETAIL(menuId),
    queryFn: () => menuAPI.getMenuDetail(menuId),
    enabled: !!menuId,
  });

  if (isLoading) return <p>로딩 중...</p>;
  if (isError || !menu) return <p>메뉴 정보를 불러올 수 없습니다.</p>;

  const imageUrl = getAbsoluteImageUrl(menu);
  const optionGroups = menu.menuOptionGroupList || [];

  /** 옵션 선택 핸들러 */
  const handleChange = (groupId, value, type, maxSelect = 0) => {
    setSelectedValues((prev) => {
      if (type === "radio") {
        return { ...prev, [groupId]: value };
      } else if (Array.isArray(value)) {
        if (maxSelect > 0 && value.length > maxSelect) {
          // UI 알림 대신 콘솔에만 기록 — 필요하면 토스트로 교체
          console.warn(`최대 ${maxSelect}개까지만 선택할 수 있습니다.`);
          return prev;
        }
        return { ...prev, [groupId]: value };
      }
      return prev;
    });
  };

  /** 담기 버튼 클릭 */
  const handleAdd = (e) => {
    e.stopPropagation();

    // 1️⃣ 필수 옵션 체크
    const requiredGroups = optionGroups.filter(
      (g) =>
        g.requiredYn === "Y" &&
        Array.isArray(g.menuOptionList) &&
        g.menuOptionList.length > 0
    );

    const missing = requiredGroups.find((g) => {
      const val = selectedValues[g.menuOptGrpId];
      if (Array.isArray(val)) return val.length === 0;
      return !val;
    });

    if (missing) {
      // 기존 alert 제거 — 향후 토스트로 대체 권장
      console.warn(`${missing.menuOptGrpName} 옵션을 선택해주세요!`);
      return;
    }

    // 2️⃣ 선택된 옵션 정리
    const optionList = Object.values(selectedValues)
      .flat()
      .map((optId) => ({
        menuOptId: Number(optId),
        quantity: 1,
      }));

    // 3️⃣ 서버로 전달할 payload 구성
    const payload = {
      userId,
      menu: {
        menuId: menu.menuId,
        storeId: menu.storeId, // useBasket 훅에서 비교용
        quantity: 1,
        optionList,
      },
    };

    console.log("[장바구니 담기 요청]", payload);

    // 4️⃣ 단순 호출 — 다른 가게 확인, clearAll, confirm은 훅 내부 처리
    addMenu.mutate(payload, {
      onSuccess: () => {
        // alert 제거: 대신 UI 상태(옵션창 닫기) 및 콘솔 기록
        setIsOpen(false);
        console.log(`${menu.menuName} 장바구니에 담겼습니다.`);
        // 필요하면 여기서 토스트를 띄우도록 교체:
        // e.g. toast.success(`${menu.menuName} 장바구니에 담겼습니다.`);
      },
      onError: (err) => {
        // alert 제거: 콘솔에 에러만 기록
        console.error("장바구니 담기 실패:", err);
        // 필요하면 여기서 토스트를 띄우도록 교체:
        // e.g. toast.error("장바구니 담기 중 오류가 발생했습니다.");
      },
    });
  };

  return (
    <div
      className={`${styles.box} ${isOpen ? styles.open : ""}`}
      onClick={() => setIsOpen((prev) => !prev)}
    >
      {/* 메뉴 카드 */}
      <div className={styles.menuCard}>
        <div className={styles.thumb}>
          {imageUrl ? (
            <img src={imageUrl} alt={menu.menuName} />
          ) : (
            <div className={styles.noImg}></div>
          )}
        </div>

        <div className={styles.info}>
          <div className={styles.texts}>
            <h4 className={styles.name}>{menu.menuName}</h4>
            <p className={styles.desc}>{menu.description}</p>
          </div>
          <p className={styles.price}>₩{menu.price?.toLocaleString()}</p>
        </div>
      </div>

      {/* 옵션 그룹 */}
      {isOpen && (
        <div
          className={styles.optionBox}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {optionGroups
            .filter(
              (group) =>
                Array.isArray(group.menuOptionList) &&
                group.menuOptionList.some(
                  (opt) => opt.availableYn === "Y" && opt.delYn === "N"
                )
            )
            .map((group) => {
              const {
                menuOptGrpId,
                menuOptGrpName,
                requiredYn,
                maxSelect,
                menuOptionList,
              } = group;

              const isRequired = requiredYn === "Y";
              const type = isRequired ? "radio" : "checkbox";

              const labelText = (
                <>
                  {menuOptGrpName}{" "}
                  {isRequired ? (
                    <span className={styles.radioTag}>필수</span>
                  ) : (
                    <span className={styles.radioTag}>
                      선택
                      {maxSelect > 0 && ` (최대 ${maxSelect}개)`}
                    </span>
                  )}
                </>
              );

              const options = (menuOptionList || [])
                .filter((opt) => opt.availableYn === "Y" && opt.delYn === "N")
                .map((opt) => ({
                  value: opt.menuOptId.toString(),
                  label: (
                    <>
                      <span>{opt.menuOptName}</span>
                      {opt.price > 0 && (
                        <span>+₩{opt.price.toLocaleString()}</span>
                      )}
                    </>
                  ),
                }));

              return isRequired ? (
                <RadioGroup
                  key={menuOptGrpId}
                  label={labelText}
                  name={`radio-${menuOptGrpId}`}
                  direction="column"
                  value={selectedValues[menuOptGrpId] || ""}
                  onChange={(e) =>
                    handleChange(menuOptGrpId, e.target.value, "radio")
                  }
                  options={options}
                />
              ) : (
                <CheckboxGroup
                  key={menuOptGrpId}
                  label={labelText}
                  name={`checkbox-${menuOptGrpId}`}
                  direction="column"
                  values={selectedValues[menuOptGrpId] || []}
                  onChange={(vals) =>
                    handleChange(menuOptGrpId, vals, "checkbox", maxSelect)
                  }
                  options={options}
                />
              );
            })}

          {/* USER만 '담기' 버튼 표시 */}
          {isUser && (
            <button className="btn btn-default btn-primary" onClick={handleAdd}>
              담기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
