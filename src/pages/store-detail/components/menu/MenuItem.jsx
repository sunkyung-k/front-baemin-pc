import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
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
 * ------------------------------------------------------
 * - 단일 메뉴 카드 + 옵션 선택 + 장바구니 담기
 * - 필수 옵션 검증
 * - useBasket 훅을 통해 confirm 로직 및 API 요청 처리
 */
export default function MenuItem({ menuId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState({});
  const { addMenu } = useBasket();
  const { userId, userRole } = authStore.getState();
  const isUser = userRole?.includes("USER");

  /** 현재 가게 ID (storeDetail에서 전달받음) */
  const { storeDetail } = useOutletContext();
  const currentStoreId = storeDetail?.storeId;

  /** 메뉴 상세 조회 */
  const { data: menu, isError } = useQuery({
    queryKey: QUERY_KEYS.MENU_DETAIL(menuId),
    queryFn: () => menuAPI.getMenuDetail(menuId),
    enabled: !!menuId,
  });

  if (isError || !menu) return "";

  const imageUrl = getAbsoluteImageUrl(menu);
  const optionGroups = menu.menuOptionGroupList || [];

  /** 옵션 변경 핸들러 */
  const handleChange = (groupId, value, type, maxSelect = 0) => {
    setSelectedValues((prev) => {
      if (type === "radio") return { ...prev, [groupId]: value };
      if (Array.isArray(value)) {
        if (maxSelect > 0 && value.length > maxSelect) {
          console.warn(`최대 ${maxSelect}개까지만 선택할 수 있습니다.`);
          return prev;
        }
        return { ...prev, [groupId]: value };
      }
      return prev;
    });
  };

  /** '담기' 버튼 클릭 시 실행 */
  const handleAdd = (e) => {
    e.stopPropagation();

    // 필수 옵션 검증
    const requiredGroups = optionGroups.filter(
      (g) =>
        g.requiredYn === "Y" &&
        Array.isArray(g.menuOptionList) &&
        g.menuOptionList.length > 0
    );

    const missing = requiredGroups.find((g) => {
      const val = selectedValues[g.menuOptGrpId];
      return Array.isArray(val) ? val.length === 0 : !val;
    });

    if (missing) {
      console.warn(`${missing.menuOptGrpName} 옵션을 선택해주세요!`);
      return;
    }

    // 선택된 옵션 정리
    const optionList = Object.values(selectedValues)
      .flat()
      .map((optId) => ({
        menuOptId: Number(optId),
        quantity: 1,
      }));

    // 장바구니에 전달할 데이터
    const payload = {
      userId,
      menu: {
        menuId: menu.menuId,
        storeId: currentStoreId,
        quantity: 1,
        optionList,
      },
    };

    // useBasket 내부에서 confirm + API 처리
    addMenu.mutate(payload, {
      onSuccess: () => setIsOpen(false),
      onError: (err) => console.error("장바구니 담기 실패:", err),
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

      {/* 옵션 선택 UI */}
      {isOpen && (
        <div className={styles.optionBox} onClick={(e) => e.stopPropagation()}>
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
                  <span className={styles.radioTag}>
                    {isRequired
                      ? "필수"
                      : `선택${maxSelect > 0 ? ` (최대 ${maxSelect}개)` : ""}`}
                  </span>
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
