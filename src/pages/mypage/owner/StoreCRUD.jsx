import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Card from "../MypageCard";

import { useStore } from "@/hooks/useStore";
import { useCategory } from "@/hooks/useCategory";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";

import InputField from "@/components/form/InputField";
import TextareaField from "@/components/form/TextareaField";
import Checkbox from "@/components/mypage/Checkbox";
import HoursField from "@/components/mypage/HoursField";
import ImageUpload from "@/components/form/ImageUpload";
import stylesLayout from "../MypageLayout.module.scss";

// 공통 포맷 유틸 (전화번호·금액 포맷 / 숫자 정제)
import {
  formatPhone,
  formatPrice,
  cleanNumber,
  parseNumber,
} from "@/utills/valueFormatter";

const DAY_OPTIONS = ["월", "화", "수", "목", "금", "토", "일", "휴무 없음"];

/* ============================================================
  mapStoreToForm
  API로부터 받은 데이터 → RHF 기본값 형태로 변환
  (등록모드 / 수정모드 자동 구분)
  ============================================================ */
const mapStoreToForm = (store, DAY_OPTIONS) => {
  if (!store || store.delYn === "Y") {
    // 신규 등록 (store 없음 or 삭제된 경우)
    return {
      categoryIds: [],
      storeName: "",
      branchName: "",
      phone: "",
      addr: "",
      addrDetail: "",
      minPrice: "",
      origin: "",
      notice: "",
      mainImage: null,
      openTime: "",
      closeTime: "",
      days: [],
    };
  }

  // 수정 모드 데이터 매핑
  const openTime = store.hourList?.[0]?.openTime?.slice(0, 5) || "";
  const closeTime = store.hourList?.[0]?.closeTime?.slice(0, 5) || "";
  const mappedDays = store.hourList?.every((h) => h.closeYn === "N")
    ? ["휴무 없음"]
    : store.hourList
        ?.filter((h) => h.closeYn === "Y")
        .map((h) => DAY_OPTIONS[h.dayOfWeek - 1]) || [];

  return {
    storeName: store.storeName,
    branchName: store.branchName,
    phone: store.phone ? formatPhone(store.phone) : "", // 전화번호 포맷 (공통 함수 사용)
    addr: store.addr,
    addrDetail: store.addrDetail,
    minPrice: store.minPrice ? formatPrice(store.minPrice.toString()) : "", // 금액 포맷 (공통 함수 사용)
    origin: store.origin,
    notice: store.notice,
    categoryIds: store.categoryList.map((c) => c.category.caId.toString()),
    openTime,
    closeTime,
    days: mappedDays,
  };
};

/* ============================================================
  유효성 스키마
  ============================================================ */
const schema = yup.object().shape({
  categoryIds: yup
    .array()
    .min(1, "카테고리를 최소 1개 이상 선택해주세요.")
    .required("카테고리를 선택해주세요."),
  storeName: yup.string().required("가게명을 입력해주세요."),
  mainImage: yup.mixed().required("가게 대표 이미지를 등록해주세요."),
  phone: yup
    .string()
    .required("전화번호를 입력해주세요.")
    .matches(/^[0-9-]{8,13}$/, "전화번호 형식이 올바르지 않습니다."),
  addr: yup.string().required("주소를 입력해주세요."),
  minPrice: yup.string().required("최소 주문 금액을 입력해주세요."),
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
        return !openTime || !value || value > openTime;
      }
    ),
  days: yup.array().min(1, "휴무 요일을 선택해주세요."),
});

export default function StoreCRUD() {
  const { myStore, create, update, remove } = useStore();
  const { categories } = useCategory();
  const [isEdit, setIsEdit] = useState(false);
  const [mainImageUrl, setMainImageUrl] = useState(null);

  /* ------------------------------------------------------------
    RHF 설정
    - yupResolver로 유효성 검사
    - defaultValues는 등록 시 초기화용
    ------------------------------------------------------------ */
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
    context: { isEdit },
    defaultValues: {
      categoryIds: [],
      days: [],
    },
    mode: "onChange",
  });

  /* ------------------------------------------------------------
    내 가게 정보 로드 및 폼 초기화
    - 수정 모드 자동 감지
    ------------------------------------------------------------ */
  useEffect(() => {
    const isStoreValid = myStore && myStore.delYn !== "Y";

    // API 데이터로 폼 reset (등록/수정 모드 자동 처리)
    const defaultValues = mapStoreToForm(
      isStoreValid ? myStore : null,
      DAY_OPTIONS
    );
    reset(defaultValues);

    // 모드 및 이미지 URL 업데이트
    setIsEdit(isStoreValid);
    if (isStoreValid) {
      setMainImageUrl(getAbsoluteImageUrl(myStore.fileList?.[0]));
    } else {
      setMainImageUrl(null);
    }
  }, [myStore, reset]);

  /* ------------------------------------------------------------
    휴무 요일 체크박스 핸들러
    ------------------------------------------------------------ */
  const handleDaysChange = (e) => {
    const { value, checked } = e.target;
    const current = watch("days") || [];
    let updated = [...current];

    if (checked) updated.push(value);
    else updated = updated.filter((v) => v !== value);

    // '휴무 없음' 선택 시 다른 요일 제거 및 반대 로직 처리
    if (value === "휴무 없음" && checked) updated = ["휴무 없음"];
    if (value !== "휴무 없음" && checked && current.includes("휴무 없음")) {
      updated = updated.filter((v) => v !== "휴무 없음");
      updated.push(value);
    }

    setValue("days", updated, { shouldValidate: true });
  };

  /* ------------------------------------------------------------
    onSubmit - 등록 / 수정 처리
    ------------------------------------------------------------ */
  const onSubmit = async (data) => {
    const confirmText = isEdit
      ? "가게 정보를 수정하시겠습니까?"
      : "가게를 등록하시겠습니까?";

    if (!window.confirm(confirmText)) return;

    try {
      const formData = new FormData();

      // 기본 필드 append
      const basicFields = [
        "storeName",
        "branchName",
        "addr",
        "addrDetail",
        "origin",
        "notice",
      ];
      basicFields.forEach((key) => formData.append(key, data[key] || ""));

      // 전화번호, 금액 클린 처리
      formData.append("phone", cleanNumber(data.phone));
      formData.append("minPrice", Number(parseNumber(data.minPrice)));

      // 대표 이미지 처리
      if (data.mainImage?.[0]) {
        formData.append("mainImage", data.mainImage[0]);
      }

      // 카테고리 배열 처리
      (data.categoryIds || []).forEach((id) =>
        formData.append("categoryIds", Number(id))
      );

      // 영업시간, 휴무일 처리
      const selectedDays = data.days || [];
      const isNoHoliday = selectedDays.includes("휴무 없음");

      const hours = DAY_OPTIONS.slice(0, 7).map((day, i) => ({
        dayOfWeek: i + 1,
        openTime: `${data.openTime}:00`,
        closeTime: `${data.closeTime}:00`,
        closeYn: isNoHoliday ? "N" : selectedDays.includes(day) ? "Y" : "N",
      }));

      hours.forEach((hour, i) => {
        Object.entries(hour).forEach(([key, value]) =>
          formData.append(`hourList[${i}].${key}`, value)
        );
      });

      // API 호출
      if (isEdit) {
        if (!myStore?.storeId) {
          alert("수정할 가게 정보를 찾을 수 없습니다. 다시 시도해주세요.");
          return;
        }
        formData.append("storeId", myStore.storeId);
        await update.mutateAsync(formData);
        alert("가게 정보가 수정되었습니다.");
      } else {
        await create.mutateAsync(formData);
        alert("가게가 등록되었습니다.");
      }

      // 후처리
      reset(data, { keepValues: true });
      if (!isEdit) setIsEdit(true);
    } catch (err) {
      console.error("등록/수정 실패:", err);
    }
  };

  /* ------------------------------------------------------------
    가게 삭제
    ------------------------------------------------------------ */
  const handleDelete = async () => {
    if (!window.confirm("정말 가게를 삭제하시겠습니까?")) return;
    try {
      await remove.mutateAsync(myStore?.storeId);
      alert("가게가 삭제 처리되었습니다.");
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <Card title={isEdit ? "가게 관리" : "가게 등록"}>
      <form onSubmit={handleSubmit(onSubmit)} className={stylesLayout.form}>
        <Checkbox
          label="카테고리 선택"
          name="categoryIds"
          options={categories.map((c) => ({ id: c.id, name: c.name }))}
          register={register}
          watch={watch}
          hint="가게 업종을 선택해주세요. (중복 선택 가능)"
          errorMessage={errors.categoryIds?.message}
        />

        <InputField
          label="가게명"
          name="storeName"
          register={register}
          placeholder="예: 홍길동식당"
          errorMessage={errors.storeName?.message}
        />

        <InputField
          label="지점명 (선택)"
          name="branchName"
          register={register}
          placeholder="예: 강남점"
        />

        <ImageUpload
          label="가게 대표 이미지"
          name="mainImage"
          register={register}
          currentImageUrl={mainImageUrl}
          errorMessage={errors.mainImage?.message}
          hint="JPG, PNG 형식 / 최대 50MB까지 업로드 가능합니다."
        />

        <InputField
          label="전화번호"
          name="phone"
          type="phone"
          register={register}
          value={watch("phone") || ""}
          placeholder="예: 02-123-4567 또는 010-1234-5678 (숫자만 입력하세요)"
          errorMessage={errors.phone?.message}
        />

        <InputField
          label="주소"
          name="addr"
          register={register}
          placeholder="예: 서울특별시 강남구 테헤란로 123"
          errorMessage={errors.addr?.message}
        />

        <InputField
          label="상세주소 (선택)"
          name="addrDetail"
          register={register}
          placeholder="예: 3층 302호"
        />

        <InputField
          label="최소 주문 금액"
          name="minPrice"
          type="price"
          register={register}
          value={watch("minPrice") || ""}
          placeholder="예: 10,000 (숫자만 입력하세요)"
          errorMessage={errors.minPrice?.message}
        />

        <TextareaField
          label="원산지 표시"
          name="origin"
          register={register}
          placeholder="예: 쌀(국내산), 김치(중국산)"
          errorMessage={errors.origin?.message}
        />

        <TextareaField
          label="공지사항 (선택)"
          name="notice"
          register={register}
          placeholder="예: 명절 기간에는 휴무입니다."
        />

        <HoursField
          label="영업시간"
          register={register}
          watch={watch}
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
          onChangeCustom={handleDaysChange}
          errorMessage={errors.days?.message}
        />

        <div className="btnWrap btnWrap-center">
          <button
            type="submit"
            className="btn btn-default btn-primary"
            disabled={isEdit && !isDirty}
          >
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
