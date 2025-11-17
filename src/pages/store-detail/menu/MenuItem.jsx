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

  /** 메뉴 존재 여부 (storeDetail 기준 + delYn="N") */
  const menuExistsInStore = useMemo(() => {
    return (
      storeDetail?.menuCategoryList
        ?.flatMap((cat) => cat.menuList ?? [])
        ?.some((m) => m.menuId === menuId && m.delYn !== "Y") ?? false
    );
  }, [storeDetail, menuId]);

  /** 메뉴 상세 조회 */
  const { data: menu } = useQuery({
    queryKey: QUERY_KEYS.MENU_DETAIL(menuId),
    queryFn: () => menuAPI.getMenuDetail(menuId),
    enabled: !!menuId && menuExistsInStore,
    retry: false,
    staleTime: 0,
  });

  if (!menuExistsInStore) return null;
  if (!menu) return null;
  if (menu.menuId === 0 || menu.delYn === "Y") return null;

  const imageUrl = getAbsoluteImageUrl(menu);

  /** 옵션 그룹 */
  const optionGroups = menu.menuOptionGroupList || [];

  /** 옵션 아이템 0개면 옵션 그룹 미노출 */
  const visibleOptionGroups = optionGroups.filter((group) => {
    const validOptions =
      group.menuOptionList?.filter(
        (opt) => opt.availableYn === "Y" && opt.delYn === "N"
      ) ?? [];
    return validOptions.length > 0; // 옵션 1개 이상 있을 때만 노출
  });

  /** 옵션 변경 */
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

  /** 담기 */
  const handleAdd = (e) => {
    e.stopPropagation();

    const requiredGroups = visibleOptionGroups.filter(
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
          {visibleOptionGroups.map((group) => {
            const {
              menuOptGrpId,
              menuOptGrpName,
              requiredYn,
              maxSelect,
              menuOptionList,
            } = group;

            const isRequired = requiredYn === "Y";

            const filteredOptions =
              menuOptionList?.filter(
                (opt) => opt.availableYn === "Y" && opt.delYn === "N"
              ) ?? [];

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

            const options = filteredOptions.map((opt) => ({
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
