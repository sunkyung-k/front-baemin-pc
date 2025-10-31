import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Checkbox from "@/components/form/Checkbox";
import InputField from "@/form/InputField";
import ImageUpload from "@/components/form/ImageUpload";
import TextareaField from "@/components/form/TextareaField";
import TimeField from "@/components/form/TimeField";
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

function StoreCRUD() {
  const [isEdit, setIsEdit] = useState(false);
  const [storeId, setStoreId] = useState(null);
  const [options, setOptions] = useState({ category: [], days: [] });
  const [mainImageUrl, setMainImageUrl] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  // ✅ yup 검증 스키마
  const schema = useMemo(() => {
    return yup.object().shape({
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
        .test("is-after-open", "종료시간은 시작시간 이후여야 합니다.", function (value) {
          const { openTime } = this.parent;
          if (!openTime || !value) return true;
          return value > openTime;
        }),
      categoryIds: yup
        .array()
        .min(1, "최소 1개 이상의 카테고리를 선택해주세요.")
        .required("카테고리를 선택해주세요."),
      mainImage: yup
        .mixed()
        .test("file-required", "메인 이미지를 업로드해주세요.", function (value) {
          if (isEdit && mainImageUrl) return true;
          if (!value) return false;
          if (value instanceof FileList) return value.length > 0;
          if (Array.isArray(value)) return value.length > 0;
          return false;
        }),
    });
  }, [isEdit, mainImageUrl]);

  // ✅ RHF
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

  // ✅ 카테고리 불러오기
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

  // ✅ 빈 폼
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

  // ✅ 내 가게 불러오기 (localStorage 제거)
  const loadMyStore = async () => {
    try {
      const myStore = await fetchMyStore();

      if (!myStore) {
        reset(emptyForm);
        setIsEdit(false);
        setStoreId(null);
        setMainImageUrl(null);
        return;
      }

      if (myStore.delYn === "Y") {
        console.warn("삭제된 가게입니다.");
        reset(emptyForm);
        setIsEdit(false);
        setStoreId(null);
        return;
      }

      setIsEdit(true);
      setStoreId(myStore.storeId);

      const hourList = myStore.hourList || [];
      const refHour = hourList.find((h) => h.dayOfWeek === 1) || hourList[0] || {};
      const openTime = refHour.openTime?.substring(0, 5) || "09:00";
      const closeTime = refHour.closeTime?.substring(0, 5) || "18:00";

      const mainFile = myStore.fileList?.find((f) => f.mainYn === "Y");
      if (mainFile?.storedName) {
        setMainImageUrl(`${API_BASE_URL}/api/v1/file/download/${mainFile.storedName}`);
      } else {
        setMainImageUrl(null);
      }

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
        categoryIds: myStore.categoryList.map((c) => c.category.caId.toString()),
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

  useEffect(() => {
    if (options.days.length > 0) loadMyStore();
  }, [options.days]);

  // ✅ 등록/수정
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

      // 시간
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

      if (isEdit) {
        await updateStore(formData);
        alert("가게 정보가 수정되었습니다!");
      } else {
        await createStore(formData);
        alert("가게가 성공적으로 등록되었습니다!");
      }

      await loadMyStore();
    } catch (err) {
      console.error("등록/수정 실패:", err.response?.data || err);
      alert(err.response?.data?.message || "처리 중 오류가 발생했습니다.");
    }
  };

  // ✅ 삭제
  const handleDelete = async () => {
    if (!window.confirm("정말 가게를 숨기시겠습니까?")) return;
    try {
      await removeStore(storeId);
      alert("가게가 숨김 처리되었습니다!");
      reset(emptyForm);
      setIsEdit(false);
      setStoreId(null);
      setMainImageUrl(null);
    } catch (err) {
      console.error("삭제 실패:", err.response?.data || err);
      alert("삭제 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <Card title={!isEdit ? "가게 등록" : "가게 수정"}>
      <form onSubmit={handleSubmit(onSubmit)} className={stylesLayout.form}>
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

        <InputField
          label="가게 이름"
          name="storeName"
          register={register}
          errorMessage={errors.storeName?.message}
        />
        <InputField label="지점명 (선택)" name="branchName" register={register} />
        <ImageUpload
          label="가게 이미지"
          name="mainImage"
          register={register}
          errorMessage={errors.mainImage?.message}
          currentImageUrl={mainImageUrl}
        />
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
        <TextareaField label="공지사항 (선택)" name="notice" register={register} />

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

        <div className={stylesLayout.formGroup}>
          <Checkbox
            label="휴무 요일"
            name="days"
            options={options.days}
            register={register}
            watch={watch}
          />
        </div>

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
