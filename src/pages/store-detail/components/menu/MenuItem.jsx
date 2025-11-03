import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import menuAPI from "@/service/menu/menuAPI";
import RadioGroup from "@/components/form/RadioGroup";
import CheckboxGroup from "@/components/form/CheckboxGroup";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";
import styles from "./MenuItem.module.scss";

export default function MenuItem({ menuId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState({});

  /** 메뉴 상세 조회 (React Query) */
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

  /** 그룹별 선택 핸들러 */
  const handleChange = (groupId, value, type, maxSelect = 0) => {
    setSelectedValues((prev) => {
      if (type === "radio") {
        return { ...prev, [groupId]: value };
      } else if (Array.isArray(value)) {
        if (maxSelect > 0 && value.length > maxSelect) {
          alert(`최대 ${maxSelect}개까지만 선택할 수 있습니다.`);
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

    const requiredGroups = optionGroups.filter((g) => g.requiredYn === "Y");
    const missing = requiredGroups.find((g) => !selectedValues[g.menuOptGrpId]);
    if (missing) {
      alert(`${missing.menuOptGrpName} 옵션을 선택해주세요!`);
      return;
    }

    console.log("선택된 옵션:", selectedValues);
    alert(`${menu.menuName} 담기 완료`);
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

      {/* 옵션 그룹 영역 */}
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

              // 옵션 리스트
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

          <button className="btn btn-default btn-primary" onClick={handleAdd}>
            담기
          </button>
        </div>
      )}
    </div>
  );
}
