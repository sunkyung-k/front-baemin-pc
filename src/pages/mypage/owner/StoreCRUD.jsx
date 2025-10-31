import React, { useState, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import InputField from "@/components/form/InputField";
import ImageUpload from "@/components/form/ImageUpload";
import TextareaField from "@/components/form/TextareaField";
import Checkbox from "@/components/mypage/Checkbox";
import TimeField from "@/components/mypage/TimeField";
import Card from "../MypageCard";

import stylesLayout from "../MypageLayout.module.scss";
import stylesCrud from "./StoreCRUD.module.scss";

import {
  fetchStoreCategories,
  fetchMyStore,
  createStore,
  updateStore,
  removeStore,
} from "@/service/storeAPI";

/**
 * ✅ StoreCRUD.jsx
 * 점주(OWNER) 전용 가게 등록 / 수정 / 삭제 페이지
 * - 1개 계정 = 1개 가게
 * - Soft Delete (delYn='Y') 구조
 * - 등록 → 수정 자동 전환, 삭제 → 등록 폼으로 리셋
 */
function StoreCRUD() {
  /** ---------- [State 정의] ---------- **/
  const [isEdit, setIsEdit] = useState(false); // true면 수정모드, false면 등록모드
  const [storeId, setStoreId] = useState(null); // 현재 가게 id
  const [options, setOptions] = useState({ category: [], days: [] });
  const [mainImageUrl, setMainImageUrl] = useState(null); // 기존 이미지 미리보기 URL

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:9091";

  /** ---------- [중복 호출 방지용] ---------- **/
  const didFetchRef = useRef(false);

  /** ---------- [검증 스키마 설정] ---------- **/
  const schema = useMemo(
    () =>
      yup.object().shape({
        storeName: yup.string().required("가게 이름은 필수입니다."),
        phone: yup
          .string()
          .matches(/^[0-9]{9,11}$/, "전화번호 형식이 올바르지 않습니다.")
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
        mainImage: yup
          .mixed()
          .test(
            "file-required",
            "메인 이미지를 업로드해주세요.",
            function (value) {
              // 수정 모드일 때 이미 업로드된 이미지가 있으면 통과
              if (isEdit && mainImageUrl) return true;
              if (!value) return false;
              if (value instanceof FileList) return value.length > 0;
              if (Array.isArray(value)) return value.length > 0;
              return false;
            }
          ),
      }),
    [isEdit, mainImageUrl]
  );

  /** ---------- [RHF 세팅] ---------- **/
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      categoryIds: [],
      days: [],
      openTime: "09:00",
      closeTime: "18:00",
    },
  });

  /** ---------- [카테고리 데이터 로드] ---------- **/
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await fetchStoreCategories();
        const parsed = categories.map((item) => ({
          id: item.caId,
          name: item.caName,
        }));
        setOptions({
          category: parsed,
          days: ["월", "화", "수", "목", "금", "토", "일"],
        });
      } catch (err) {
        console.error("카테고리 불러오기 실패:", err);
      }
    };
    loadCategories();
  }, []);

  /** ---------- [빈 폼 기본값] ---------- **/
  const emptyForm = {
    storeName: "",
    branchName: "",
    phone: "",
    addr: "",
    addrDetail: "",
    minPrice: 0,
    origin: "",
    notice: "",
    categoryIds: [],
    openTime: "09:00",
    closeTime: "18:00",
    days: [],
    mainImage: undefined,
  };

  /** ---------- [내 가게 불러오기] ---------- **/
  const loadMyStore = async () => {
    try {
      const myStore = await fetchMyStore();

      if (!myStore || myStore.delYn === "Y") {
        // 등록된 가게가 없으면 “등록 모드” 유지
        if (!didFetchRef.current)
          console.warn("등록된 가게가 없거나 삭제된 상태입니다.");
        reset(emptyForm);
        setIsEdit(false);
        setStoreId(null);
        setMainImageUrl(null);
        return;
      }

      // ✅ 내 가게 존재 → 수정모드로 전환
      setIsEdit(true);
      setStoreId(myStore.storeId);

      // 시간 데이터 세팅
      const hourList = myStore.hourList || [];
      const refHour =
        hourList.find((h) => h.dayOfWeek === 1) || hourList[0] || {};
      const openTime = refHour.openTime?.substring(0, 5) || "09:00";
      const closeTime = refHour.closeTime?.substring(0, 5) || "18:00";

      // 메인 이미지 세팅
      const mainFile = myStore.fileList?.find((f) => f.mainYn === "Y");
      setMainImageUrl(
        mainFile?.storedName
          ? `${API_BASE_URL}/static/imgs/${mainFile.storedName}`
          : null
      );

      // ✅ 폼 데이터 채워넣기
      reset({
        ...emptyForm,
        storeName: myStore.storeName,
        branchName: myStore.branchName,
        phone: myStore.phone,
        addr: myStore.addr,
        addrDetail: myStore.addrDetail,
        minPrice: myStore.minPrice,
        origin: myStore.origin,
        notice: myStore.notice,
        categoryIds: myStore.categoryList.map((c) =>
          c.category.caId.toString()
        ),
        openTime,
        closeTime,
        days: hourList
          .filter((h) => h.closeYn === "Y")
          .map((h) => options.days[h.dayOfWeek - 1]),
      });
    } catch (err) {
      console.error("내 가게 불러오기 실패:", err);
      reset(emptyForm);
      setIsEdit(false);
      setStoreId(null);
    }
  };

  /** ---------- [최초 1회만 실행 - StrictMode 대응] ---------- **/
  useEffect(() => {
    if (!didFetchRef.current && options.days.length > 0) {
      loadMyStore();
      didFetchRef.current = true;
    }
  }, [options.days]);

  /** ---------- [등록/수정 처리] ---------- **/
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

      // 수정모드면 storeId 추가
      if (isEdit) formData.append("storeId", storeId);

      // 이미지
      if (data.mainImage?.[0]) {
        const file = data.mainImage[0];
        const ext = file.name.split(".").pop();
        const safeFile = new File([file], `upload_${Date.now()}.${ext}`, {
          type: file.type,
        });
        formData.append("mainImage", safeFile);
      }

      // 카테고리
      const categoryIds = data.categoryIds.map((id) => Number(id));
      categoryIds.forEach((id) => formData.append("categoryIds", id));

      // 요일 + 시간
      const selectedDays = data.days || [];
      const hourList = options.days.map((day, idx) => ({
        dayOfWeek: idx + 1,
        openTime: `${data.openTime}:00`,
        closeTime: `${data.closeTime}:00`,
        closeYn: selectedDays.includes(day) ? "Y" : "N",
      }));
      hourList.forEach((h, i) => {
        formData.append(`hourList[${i}].dayOfWeek`, h.dayOfWeek);
        formData.append(`hourList[${i}].openTime`, h.openTime);
        formData.append(`hourList[${i}].closeTime`, h.closeTime);
        formData.append(`hourList[${i}].closeYn`, h.closeYn);
      });

      // ✅ 등록 vs 수정 구분 처리
      if (isEdit) {
        await updateStore(formData);
        alert("가게 정보가 수정되었습니다!");
      } else {
        await createStore(formData);
        alert("가게가 성공적으로 등록되었습니다!");
      }

      // ✅ 등록/수정 후 새로고침 없이 즉시 최신 상태 반영
      await loadMyStore();
    } catch (err) {
      console.error("등록/수정 실패:", err.response?.data || err);
      alert(err.response?.data?.message || "처리 중 오류가 발생했습니다.");
    }
  };

  /** ---------- [Soft Delete] ---------- **/
  const handleDelete = async () => {
    if (!window.confirm("정말 가게를 숨기시겠습니까?")) return;
    try {
      await removeStore(storeId);
      alert("가게가 숨김 처리되었습니다!");

      // ✅ 상태 초기화 (등록 폼으로 전환)
      reset(emptyForm);
      setIsEdit(false);
      setStoreId(null);
      setMainImageUrl(null);
    } catch (err) {
      console.error("삭제 실패:", err.response?.data || err);
      alert("삭제 처리 중 오류가 발생했습니다.");
    }
  };

  /** ---------- [렌더링] ---------- **/
  return (
    <Card title={!isEdit ? "가게 등록" : "가게 수정"}>
      <form onSubmit={handleSubmit(onSubmit)} className={stylesLayout.form}>
        {/* ✅ 카테고리 선택 */}
        <div className={stylesLayout.formGroup}>
          <Checkbox
            label="카테고리 선택"
            name="categoryIds"
            options={options.category}
            register={register}
            watch={watch}
            errorMessage={errors.categoryIds?.message}
          />
        </div>

        {/* ✅ 기본 정보 */}
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

        {/* ✅ 이미지 */}
        <ImageUpload
          label="가게 이미지"
          name="mainImage"
          register={register}
          errorMessage={errors.mainImage?.message}
          currentImageUrl={mainImageUrl}
        />

        {/* ✅ 연락처, 주소 */}
        <InputField
          label="전화번호"
          name="phone"
          type="number"
          register={register}
          errorMessage={errors.phone?.message}
        />
        <InputField
          label="주소"
          name="addr"
          register={register}
          errorMessage={errors.addr?.message}
        />
        <InputField label="상세주소" name="addrDetail" register={register} />

        {/* ✅ 최소 주문금액, 원산지, 공지 */}
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

        {/* ✅ 영업시간 */}
        <div className={stylesLayout.formGroup}>
          <label className={stylesCrud.label}>영업시간</label>
          <div className={stylesCrud.timeGroup}>
            <TimeField
              name="openTime"
              register={register}
              errorMessage={errors.openTime?.message}
            />
            <span>~</span>
            <TimeField
              name="closeTime"
              register={register}
              errorMessage={errors.closeTime?.message}
            />
          </div>
        </div>

        {/* ✅ 휴무 요일 */}
        <div className={stylesLayout.formGroup}>
          <Checkbox
            label="휴무 요일"
            name="days"
            options={options.days}
            register={register}
            watch={watch}
          />
        </div>

        {/* ✅ 버튼 (등록 ↔ 수정/삭제) */}
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
