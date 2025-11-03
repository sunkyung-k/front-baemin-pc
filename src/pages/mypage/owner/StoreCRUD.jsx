import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Card from "../MypageCard";
import { useStore } from "@/hooks/useStore";
import { categoryAPI } from "@/service/categoryAPI";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";
import { authStore } from "@/store/authStore";
import InputField from "@/components/form/InputField";
import TextareaField from "@/components/form/TextareaField";
import Checkbox from "@/components/mypage/Checkbox";
import HoursField from "@/components/mypage/HoursField";
import ImageUpload from "@/components/form/ImageUpload";
import stylesLayout from "../MypageLayout.module.scss";

/**
 * ============================================
 * ✅ StoreCRUD (Owner 전용)
 * --------------------------------------------
 * - 한 페이지에서 등록 / 수정 / 삭제 / 조회까지
 * - React Hook Form + Yup 검증 + useStore 훅 연동
 * - 팀원과 동일한 imageUtils 로 통일 (/static/imgs)
 * ============================================
 */
function StoreCRUD() {
  const { myStore, create, update, remove } = useStore();
  const [isEdit, setIsEdit] = useState(false);
  const [categories, setCategories] = useState([]);
  const [mainImageUrl, setMainImageUrl] = useState(null);

  const DAY_OPTIONS = ["월", "화", "수", "목", "금", "토", "일"];

  /** ✅ [1] 유효성 검증 스키마 */
  const schema = useMemo(
    () =>
      yup.object().shape({
        storeName: yup.string().required("가게 이름은 필수입니다."),
        phone: yup
          .string()
          .matches(/^[0-9-]+$/, "전화번호 형식이 올바르지 않습니다.")
          .required("전화번호를 입력해주세요."),
        addr: yup.string().required("주소를 입력해주세요."),
        minPrice: yup
          .number()
          .typeError("숫자만 입력 가능합니다.")
          .positive("0원 이상이어야 합니다.")
          .required("최소 주문 금액을 입력해주세요."),
        origin: yup.string().required("원산지 정보를 입력해주세요."),
        openTime: yup.string().required("영업 시작 시간을 선택해주세요."),
        closeTime: yup
          .string()
          .required("영업 종료 시간을 선택해주세요.")
          .test(
            "is-after-open",
            "종료시간은 시작시간 이후여야 합니다.",
            function (value) {
              const { openTime } = this.parent;
              if (!openTime || !value) return true;
              return value > openTime;
            }
          ),
        categoryIds: yup
          .array()
          .min(1, "최소 1개 이상의 카테고리를 선택해주세요.")
          .required("카테고리를 선택해주세요."),
      }),
    []
  );

  /** ✅ [2] RHF 세팅 */
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { categoryIds: [], days: [] },
  });

  /** ✅ [3] 카테고리 목록 로드 */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await categoryAPI.getCategories();
        setCategories(
          categories.map((item) => ({
            id: item.caId,
            name: item.caName,
          }))
        );
      } catch (err) {
        console.error("카테고리 불러오기 실패:", err);
      }
    };
    loadCategories();
  }, []);

  /** ✅ [4] myStore → form 변환 함수 */
  const mapStoreToForm = (store) => {
    if (!store) return {};
    const hasBusinessHour = store.businessHour?.includes("~");
    const openTime = hasBusinessHour
      ? store.businessHour.split("~")[0].trim()
      : store.hourList?.[0]?.openTime?.substring(0, 5) || "09:00";
    const closeTime = hasBusinessHour
      ? store.businessHour.split("~")[1].trim()
      : store.hourList?.[0]?.closeTime?.substring(0, 5) || "18:00";

    return {
      storeName: store.storeName,
      branchName: store.branchName,
      phone: store.phone,
      addr: store.addr,
      addrDetail: store.addrDetail,
      minPrice: store.minPrice,
      origin: store.origin,
      notice: store.notice,
      categoryIds: store.categoryList.map((c) => c.category.caId.toString()),
      openTime,
      closeTime,
      days:
        store.hourList
          ?.filter((h) => h.closeYn === "Y")
          ?.map((h) => DAY_OPTIONS[h.dayOfWeek - 1]) || [],
    };
  };

  /** ✅ [5] myStore 변경 시 폼 자동 세팅 */
  useEffect(() => {
    if (!myStore || myStore.delYn === "Y") {
      reset();
      setIsEdit(false);
      setMainImageUrl(null);
      return;
    }

    setIsEdit(true);

    // imageUtils 적용 (팀원 버전 호환)
    const imageUrl = getAbsoluteImageUrl(myStore.fileList?.[0]);
    setMainImageUrl(imageUrl);

    reset(mapStoreToForm(myStore));
  }, [myStore]);

  /** ✅ [6] 등록 / 수정 */
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("storeName", data.storeName);
      formData.append("branchName", data.branchName || "");
      formData.append("phone", data.phone);
      formData.append("addr", data.addr);
      formData.append("addrDetail", data.addrDetail || "");
      formData.append("minPrice", Number(data.minPrice));
      formData.append("origin", data.origin);
      formData.append("notice", data.notice ?? "");

      if (data.mainImage?.[0]) {
        const file = data.mainImage[0];
        const ext = file.name.split(".").pop();
        const safeFile = new File([file], `upload_${Date.now()}.${ext}`, {
          type: file.type,
        });
        formData.append("mainImage", safeFile);
      }

      const categoryIds = data.categoryIds.map((id) => Number(id));
      categoryIds.forEach((id) => formData.append("categoryIds", id));

      const selectedDays = data.days || [];
      DAY_OPTIONS.forEach((day, idx) => {
        const closeYn = selectedDays.includes(day) ? "Y" : "N";
        formData.append(`hourList[${idx}].dayOfWeek`, idx + 1);
        formData.append(`hourList[${idx}].openTime`, `${data.openTime}:00`);
        formData.append(`hourList[${idx}].closeTime`, `${data.closeTime}:00`);
        formData.append(`hourList[${idx}].closeYn`, closeYn);
      });

      if (isEdit) {
        if (!myStore?.storeId) {
          alert("가게 정보 식별 실패: 다시 로그인 후 시도해주세요.");
          return;
        }
        formData.append("storeId", myStore.storeId);
        await update.mutateAsync(formData);
        alert("가게 정보가 수정되었습니다.");
      } else {
        await create.mutateAsync(formData);
        alert("가게가 등록되었습니다!");
      }
    } catch (err) {
      console.error("등록/수정 실패:", err);
      alert("처리 중 오류가 발생했습니다.");
    }
  };

  /** ✅ [7] 삭제 */
  const handleDelete = async () => {
    if (!window.confirm("정말 가게를 삭제하시겠습니까?")) return;
    try {
      await remove.mutateAsync(myStore?.storeId);
      reset();
      setIsEdit(false);
      setMainImageUrl(null);
      authStore.getState().clearStoreId();
      alert("가게가 삭제 처리되었습니다.");
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제 처리 중 오류가 발생했습니다.");
    }
  };

  /** ✅ [8] 렌더링 */
  return (
    <Card title={isEdit ? "가게 수정" : "가게 등록"}>
      <form onSubmit={handleSubmit(onSubmit)} className={stylesLayout.form}>
        <Checkbox
          label="카테고리 선택"
          name="categoryIds"
          options={categories}
          register={register}
          watch={watch}
          hint="가게 업종을 선택해주세요. (중복 선택 가능)"
          errorMessage={errors.categoryIds?.message}
        />

        <InputField
          label="가게 이름"
          name="storeName"
          register={register}
          errorMessage={errors.storeName?.message}
        />

        <InputField
          label="지점명 (선택)"
          name="branchName"
          register={register}
        />

        <ImageUpload
          label="가게 대표 이미지"
          name="mainImage"
          register={register}
          errorMessage={errors.mainImage?.message}
          currentImageUrl={mainImageUrl}
          hint="JPG, PNG 형식 / 최대 50MB까지 업로드 가능합니다."
        />

        <InputField
          label="전화번호"
          name="phone"
          type="tel"
          register={register}
          errorMessage={errors.phone?.message}
        />

        <InputField
          label="주소"
          name="addr"
          register={register}
          errorMessage={errors.addr?.message}
        />

        <InputField
          label="상세주소 (선택)"
          name="addrDetail"
          register={register}
        />

        <InputField
          label="최소 주문 금액"
          name="minPrice"
          type="number"
          register={register}
          errorMessage={errors.minPrice?.message}
        />

        <TextareaField
          label="원산지 표시"
          name="origin"
          register={register}
          errorMessage={errors.origin?.message}
        />

        <TextareaField
          label="공지사항 (선택)"
          name="notice"
          register={register}
        />

        <HoursField
          label="영업시간"
          register={register}
          openError={errors.openTime?.message}
          closeError={errors.closeTime?.message}
          hint="모든 요일 동일하게 적용됩니다."
        />

        <Checkbox
          label="휴무 요일"
          name="days"
          options={DAY_OPTIONS}
          register={register}
          watch={watch}
        />

        <div className="btnWrap btnWrap-center">
          <button type="submit" className="btn btn-default btn-primary">
            {isEdit ? "수정" : "등록"}
          </button>

          {isEdit && (
            <button
              type="button"
              className="btn btn-default btn-danger"
              onClick={handleDelete}
            >
              삭제
            </button>
          )}
        </div>
      </form>
    </Card>
  );
}

export default StoreCRUD;
