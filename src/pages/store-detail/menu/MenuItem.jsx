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
import { useHandleError } from "@/hooks/common/useHandleError";
import styles from "./MenuItem.module.scss";

/**
 * MenuItem
 * ------------------------------------------------------
 * - 단일 메뉴 카드 + 옵션 선택 + 장바구니 담기
 * - 필수 옵션 검증 및 alert 처리
 * - 프론트는 선택된 메뉴/옵션만 서버에 전송
 * - 수량/총합 계산은 백엔드가 처리
 */
export default function MenuItem({ menuId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState({});
  const { addMenu } = useBasket();
  const { userId, userRole } = authStore.getState();
  const isUser = userRole?.includes("USER");
  const handleError = useHandleError();

  const { storeDetail } = useOutletContext();
  const currentStoreId = storeDetail?.storeId;

  /** 메뉴 상세 조회 */
  const { data: menu, isError } = useQuery({
    queryKey: QUERY_KEYS.MENU_DETAIL(menuId),
    queryFn: () => menuAPI.getMenuDetail(menuId),
    enabled: !!menuId,
  });

  if (isError || !menu) return null;

  const imageUrl = getAbsoluteImageUrl(menu);
  const optionGroups = menu.menuOptionGroupList || [];

  /** 옵션 변경 */
  const handleChange = (groupId, value, type, maxSelect = 0) => {
    setSelectedValues((prev) => {
      if (type === "radio") {
        return { ...prev, [groupId]: value };
      }
      if (Array.isArray(value)) {
        if (maxSelect > 0 && value.length > maxSelect) {
          handleError(
            new Error(`최대 ${maxSelect}개까지만 선택할 수 있습니다.`),
            "MenuItem.maxSelect"
          );
          return prev;
        }
        return { ...prev, [groupId]: value };
      }
      return prev;
    });
  };

  /** 담기 */
  const handleAdd = (e) => {
    e.stopPropagation();

    // 필수 옵션 체크
    const requiredGroups = optionGroups.filter(
      (g) => g.requiredYn === "Y" && g.menuOptionList?.length > 0
    );
    const missing = requiredGroups.find((g) => {
      const val = selectedValues[g.menuOptGrpId];
      return Array.isArray(val) ? val.length === 0 : !val;
    });
    if (missing) {
      handleError(
        new Error(`${missing.menuOptGrpName} 옵션을 선택해주세요.`),
        "MenuItem.optionSelect"
      );
      return;
    }

    // 선택된 옵션 구성 (옵션 quantity는 메뉴 quantity와 동일하게 설정)
    const menuQuantity = 1; // 최초 담기 시 기본 수량은 1
    const optionList = Object.values(selectedValues)
      .flat()
      .map((optId) => ({
        menuOptId: Number(optId),
        quantity: menuQuantity,
      }));

    const payload = {
      userId,
      menu: {
        menuId: menu.menuId,
        storeId: currentStoreId,
        quantity: menuQuantity,
        optionList,
      },
    };

    addMenu.mutate(payload, {
      onSuccess: () => setIsOpen(false),
      onError: (err) => handleError(err, "MenuItem.addMenu"),
    });
  };

  return (
    <div
      className={`${styles.box} ${isOpen ? styles.open : ""}`}
      onClick={() => setIsOpen((prev) => !prev)}
    >
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
          <p className={styles.price}>{menu.price?.toLocaleString()}원</p>
        </div>
      </div>

      {isOpen && (
        <div className={styles.optionBox} onClick={(e) => e.stopPropagation()}>
          {optionGroups.map((group) => {
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
                      <span>+{opt.price.toLocaleString()}원</span>
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
            <button
              className="btn btn-default btn-primary"
              onClick={handleAdd}
              disabled={!storeDetail?.open || !!storeDetail?.hourComment}
              title={
                storeDetail?.hourComment
                  ? storeDetail.hourComment
                  : "지금 주문 가능합니다."
              }
            >
              {storeDetail?.open && !storeDetail?.hourComment
                ? "담기"
                : storeDetail?.hourComment || "주문 불가"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
