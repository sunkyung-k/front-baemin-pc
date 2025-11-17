import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FaStar } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import FormModal from "@/components/form/FormModal";
import TextareaField from "@/components/form/TextareaField";
import ImageUpload from "@/components/form/ImageUpload";
import OrderList from "@/components/mypage/OrderList";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";

import { createRoot } from "react-dom/client";
import ReviewSwiper from "./ReviewSwiper";

/* 전역 스와이퍼 실행 */
function openReviewSwiperGlobal(images) {
  const root = document.getElementById("global-modal-root");
  if (!root) return;

  root.innerHTML = "";

  const container = document.createElement("div");
  root.appendChild(container);

  const modalRoot = createRoot(container);

  modalRoot.render(
    <ReviewSwiper
      images={images}
      onClose={() => {
        modalRoot.unmount();
        root.innerHTML = "";
      }}
    />
  );
}

/* yup 스키마 */
const schema = yup.object().shape({
  rating: yup.number().min(1, "별점을 선택해주세요.").required(),
  content: yup
    .string()
    .max(500, "최대 500자까지 입력 가능합니다.")
    .required("리뷰 내용을 입력해주세요."),
});

export default function ReviewModal({
  isOpen,
  onClose,
  mode = "create",
  order,
  defaultValues = null,
  onSubmit,
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      rating: defaultValues?.rating || 0,
      content: defaultValues?.content || "",
    },
  });

  const rating = watch("rating");

  /** 이미지 상태 */
  const [images, setImages] = useState(() => {
    const existing =
      defaultValues?.fileList?.map((f) => ({
        rfId: f.rfId,
        file: null,
        preview: getAbsoluteImageUrl(f),
        isExisting: true,
      })) || [];

    if (existing.length === 0) return [null];
    if (existing.length < 3 && !existing.includes(null))
      return [...existing, null];

    return existing;
  });

  /** 파일 변경 */
  const handleFileChange = (e, idx) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);

    const updated = [...images];
    updated[idx] = { file, preview, isExisting: false };

    const filled = updated.filter(Boolean).length;
    if (filled < 3 && !updated.includes(null)) updated.push(null);

    setImages(updated);
    setValue("imageList", updated.map((img) => img?.file).filter(Boolean));
  };

  /** 이미지 삭제 */
  const handleRemove = (idx) => {
    const updated = images.filter((_, i) => i !== idx);
    const filled = updated.filter(Boolean).length;

    if (filled < 3 && !updated.includes(null)) updated.push(null);

    setImages(updated);
    setValue("imageList", updated.map((img) => img?.file).filter(Boolean));
  };

  /** 제출 */
  const handleReviewSubmit = async (data) => {
    const formData = new FormData();
    const active = images.filter(Boolean);

    // 필드
    if (mode === "edit" && defaultValues?.reviewId) {
      formData.append("reviewId", defaultValues.reviewId);
    }
    formData.append("orderId", order.orderId);
    formData.append("userId", order.userId || "user");
    formData.append("rating", data.rating);
    formData.append("content", data.content);

    // 기존 이미지 유지 목록
    const keepImageList = active
      .filter((img) => img.isExisting && img.rfId)
      .map((img) => img.rfId);

    keepImageList.forEach((rfId, idx) =>
      formData.append(`keepImageList[${idx}]`, rfId)
    );

    // 새 이미지
    const newFiles = active
      .filter((img) => img.file instanceof File)
      .slice(0, 3);

    newFiles.forEach((img, idx) => {
      formData.append(`imageList[${idx}].image`, img.file);
      formData.append(`imageList[${idx}].displayOrder`, idx + 1);
    });

    onSubmit(formData, mode);
  };

  if (!isOpen) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "리뷰 작성" : "리뷰 수정"}
      onSubmit={handleSubmit(handleReviewSubmit)}
      submitLabel={mode === "create" ? "등록" : "수정"}
    >
      <div className="review-modal">
        {/* 주문 정보 */}
        {order && (
          <div className="review-order-info">
            <OrderList data={[order]} type="user" />
          </div>
        )}

        {/* 별점 */}
        <div className="review-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              size={28}
              className={`star ${star <= rating ? "active" : ""}`}
              onClick={() => setValue("rating", star, { shouldValidate: true })}
            />
          ))}
        </div>
        {errors.rating && (
          <p className="rating-error">{errors.rating.message}</p>
        )}

        {/* 리뷰 내용 */}
        <TextareaField
          label="리뷰 내용"
          name="content"
          placeholder="가게 이용 후기를 남겨주세요. (최대 500자)"
          register={register}
          errorMessage={errors.content?.message}
        />

        {/* 이미지 */}
        <div className="review-images">
          <label className="upload-label">이미지 업로드</label>

          <div className="image-list">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`image-box ${img ? "filled" : "empty"}`}
                style={{ position: "relative" }}
              >
                <ImageUpload
                  name={`imageList.${idx}`}
                  register={register}
                  currentImageUrl={img?.preview || null}
                  onExternalChange={(e) => handleFileChange(e, idx)}
                  showLabel={false}
                  showHint={false}
                  showError={false}
                />

                {/* 삭제 버튼 */}
                {img && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemove(idx)}
                  >
                    <MdClose />
                  </button>
                )}
              </div>
            ))}
          </div>

          <p className="hint">
            JPG, PNG 형식 / 최대 3장, 50MB 이하 파일만 업로드 가능합니다.
          </p>
        </div>
      </div>
    </FormModal>
  );
}
