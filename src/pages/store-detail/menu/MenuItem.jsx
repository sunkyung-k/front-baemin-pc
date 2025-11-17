import { useState, useMemo } from "react";
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
import useMenuAdmin from "../../../hooks/admin/useAdminMenu";

export default function MenuItem({ menuId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState({});
  const { addMenu } = useBasket();

  const { userId, userRole } = authStore.getState();
  const isUser = userRole?.includes("USER");
  const isAdmin = userRole?.includes("ADMIN");

  const handleError = useHandleError();
  const { storeDetail } = useOutletContext();
  const currentStoreId = storeDetail?.storeId;

  /** Admin 삭제 훅 */
  const { removeMenu, removeOption } = useMenuAdmin(currentStoreId);

  /** 현재 storeDetail에서 존재하는 menuId 리스트 */
  const categoryMenuIds = useMemo(() => {
    if (!storeDetail?.menuCategoryList) return [];
    return storeDetail.menuCategoryList.flatMap((cat) =>
      cat.menuList?.map((m) => m.menuId)
    );
  }, [storeDetail]);

  /** 메뉴 존재 여부 (삭제 즉시 false) */
  const menuExistsInStore = categoryMenuIds.includes(menuId);

  /**
   * useQuery — 훅 규칙 100% 지키고 enabled로 호출 완전 차단
   * retry: false → 실패 시 재요청 0회 (500 두 번 방지)
   */
  const { data: menu } = useQuery({
    queryKey: QUERY_KEYS.MENU_DETAIL(menuId),
    queryFn: () => menuAPI.getMenuDetail(menuId),
    enabled: !!menuId && menuExistsInStore,
    retry: false, // 🔥 핵심: 실패 재시도 완전 OFF
    staleTime: 0,
  });

  /** 메뉴가 삭제되었으면 UI 렌더링도 안함 */
  if (!menuExistsInStore) return null;
  if (!menu) return null;

  const imageUrl = getAbsoluteImageUrl(menu);
  const optionGroups = menu.menuOptionGroupList || [];

  const handleChange = (groupId, value, type, maxSelect = 0) => {
    setSelectedValues((prev) => {
      if (type === "radio") return { ...prev, [groupId]: value };

      if (Array.isArray(value)) {
        if (maxSelect > 0 && value.length > maxSelect) {
          handleError(new Error(`최대 ${maxSelect}개까지만 선택 가능`));
          return prev;
        }
        return { ...prev, [groupId]: value };
      }
      return prev;
    });
  };

  const handleAdd = (e) => {
    e.stopPropagation();

    const requiredGroups = optionGroups.filter(
      (g) => g.requiredYn === "Y" && g.menuOptionList?.length > 0
    );

    const missing = requiredGroups.find((g) => {
      const v = selectedValues[g.menuOptGrpId];
      return Array.isArray(v) ? v.length === 0 : !v;
    });

    if (missing) {
      handleError(new Error(`${missing.menuOptGrpName} 옵션을 선택해주세요.`));
      return;
    }

    const quantity = 1;

    const optionList = Object.values(selectedValues)
      .flat()
      .map((id) => ({
        menuOptId: Number(id),
        quantity,
      }));

    addMenu.mutate(
      {
        userId,
        menu: {
          menuId: menu.menuId,
          storeId: currentStoreId,
          quantity,
          optionList,
        },
      },
      {
        onSuccess: () => setIsOpen(false),
        onError: handleError,
      }
    );
  };

  return (
    <div
      className={`${styles.box} ${isOpen ? styles.open : ""}`}
      onClick={() => setIsOpen((p) => !p)}
    >
      <div className={styles.menuCard}>
        <div className={styles.thumb}>
          {imageUrl ? (
            <>
              <img src={imageUrl} alt={menu.menuName} />

              {menu.soldoutYn === "Y" && (
                <span className={styles.soldoutBadge}>품절</span>
              )}
            </>
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

        {isAdmin && (
          <button
            className="btn btn-sm btn-danger"
            onClick={(e) => {
              e.stopPropagation();
              removeMenu.mutate(menuId);
            }}
          >
            삭제
          </button>
        )}
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

            const labelText = (
              <>
                {menuOptGrpName}
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
                isAdmin={isAdmin}
                removeOption={removeOption}
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
                isAdmin={isAdmin}
                removeOption={removeOption}
              />
            );
          })}

          {isUser && (
            <button
              className="btn btn-default btn-primary"
              onClick={handleAdd}
              disabled={
                menu.soldoutYn === "Y" ||
                !storeDetail?.open ||
                !!storeDetail?.hourComment
              }
            >
              {menu.soldoutYn === "Y"
                ? "품절"
                : storeDetail?.open && !storeDetail?.hourComment
                ? "담기"
                : storeDetail?.hourComment || "주문 불가"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
