import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Card from "../MypageCard";
import { useStore } from "@/hooks/useStore";
import { categoryAPI } from "@/service/categoryAPI";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";
import InputField from "@/components/form/InputField";
import TextareaField from "@/components/form/TextareaField";
import Checkbox from "@/components/mypage/Checkbox";
import HoursField from "@/components/mypage/HoursField";
import ImageUpload from "@/components/form/ImageUpload";
import stylesLayout from "../MypageLayout.module.scss";

const DAY_OPTIONS = ["월", "화", "수", "목", "금", "토", "일", "휴무 없음"];

/** API 데이터를 폼 데이터 형식으로 변환하는 헬퍼 함수 */
const mapStoreToForm = (store, DAY_OPTIONS) => {
  if (!store || store.delYn === "Y") {
    // 등록 모드: 초기화 데이터 반환
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

  // 수정 모드: 데이터 세팅
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
    phone: store.phone,
    addr: store.addr,
    addrDetail: store.addrDetail,
    minPrice: store.minPrice?.toLocaleString() || "",
    origin: store.origin,
    notice: store.notice,
    categoryIds: store.categoryList.map((c) => c.category.caId.toString()),
    openTime,
    closeTime,
    days: mappedDays,
  };
};

/* 유효성 스키마 (Yup) */
const schema = yup.object().shape({
  categoryIds: yup
    .array()
    .min(1, "최소 1개 이상의 카테고리를 선택해주세요.")
    .required(),
  storeName: yup.string().required("가게명은 필수입니다."),
  mainImage: yup
    .mixed()
    .test(
      "file-required",
      "가게 대표 이미지를 등록해주세요.",
      function (value) {
        const isEdit = this.options.context?.isEdit;
        if (!isEdit) return value && value.length > 0;
        return true;
      }
    ),
  phone: yup
    .string()
    .required("전화번호를 입력해주세요.")
    .matches(/^[0-9-]{9,13}$/, "전화번호 형식이 올바르지 않습니다."),
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
  /* useStore 훅을 통해 API 로직 접근 */
  const { myStore, create, update, remove } = useStore();
  const [isEdit, setIsEdit] = useState(false);
  const [categories, setCategories] = useState([]);
  const [mainImageUrl, setMainImageUrl] = useState(null);

  /* RHF 설정 */
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

  /* 카테고리 데이터 초기 로드 */
  useEffect(() => {
    categoryAPI
      .getCategories()
      .then((list) =>
        setCategories(list.map((c) => ({ id: c.caId, name: c.caName })))
      )
      .catch((err) => console.error("카테고리 불러오기 실패:", err));
  }, []);

  /* myStore 변경 시 폼 초기화 및 모드 설정 */
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
  }, [myStore, reset, DAY_OPTIONS]);

  /* 휴무 요일 체크박스 상태 핸들러 */
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

  /* 폼 제출 (등록/수정) 처리 */
  const onSubmit = async (data) => {
    if (
      !window.confirm(
        isEdit ? "가게 정보를 수정하시겠습니까?" : "가게를 등록하시겠습니까?"
      )
    )
      return;
    try {
      // FormData 구성
      const formData = new FormData();
      [
        "storeName",
        "branchName",
        "addr",
        "addrDetail",
        "origin",
        "notice",
        "phone",
      ].forEach((k) => formData.append(k, data[k] || ""));
      formData.append("minPrice", Number(data.minPrice.replace(/,/g, "")));

      if (data.mainImage?.[0]) formData.append("mainImage", data.mainImage[0]);
      data.categoryIds.forEach((id) =>
        formData.append("categoryIds", Number(id))
      );

      // 영업시간/휴무일 배열 구성 (API 형식에 맞게 변환)
      const selectedDays = data.days || [];
      const isNoHoliday = selectedDays.includes("휴무 없음");

      DAY_OPTIONS.slice(0, 7).forEach((day, i) => {
        const closeYn = isNoHoliday
          ? "N"
          : selectedDays.includes(day)
          ? "Y"
          : "N";
        formData.append(`hourList[${i}].dayOfWeek`, i + 1);
        formData.append(`hourList[${i}].openTime`, `${data.openTime}:00`);
        formData.append(`hourList[${i}].closeTime`, `${data.closeTime}:00`);
        formData.append(`hourList[${i}].closeYn`, closeYn);
      });

      // API 호출 및 후처리
      if (isEdit) {
        if (!myStore?.storeId) {
          alert("수정할 가게 정보를 찾을 수 없습니다. 다시 시도해주세요.");
          return;
        }
        formData.append("storeId", myStore.storeId);
        await update.mutateAsync(formData);
        alert("가게 정보가 수정되었습니다.");
        reset(data, { keepValues: true }); // 수정 후 값 유지
      } else {
        await create.mutateAsync(formData);
        alert("가게가 등록되었습니다!");
        reset({}, { keepValues: true }); // 등록 후 폼 초기화
        setIsEdit(true); // 수정 모드로 전환
      }
    } catch (err) {
      console.error("등록/수정 실패:", err);
    }
  };

  /* 삭제 */
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
          options={categories}
          register={register}
          watch={watch}
          hint="가게 업종을 선택해주세요. (중복 선택 가능)"
          errorMessage={errors.categoryIds?.message}
        />

        <InputField
          label="가게명"
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
          type="price"
          register={register}
          value={watch("minPrice") || ""}
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
