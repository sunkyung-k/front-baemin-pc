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

/* 유효성 검사 스키마 */
const schema = yup.object().shape({
  rating: yup
    .number()
    .min(1, "별점을 선택해주세요.")
    .required("별점을 선택해주세요."),
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

  const [hoverRating, setHoverRating] = useState(0);
  const rating = watch("rating");

  /** 이미지 리스트 상태 */
  const [images, setImages] = useState(() => {
    const existingImages =
      defaultValues?.fileList?.map((f) => ({
        file: null,
        preview: getAbsoluteImageUrl(f),
      })) || [];

    if (existingImages.length === 0) return [null];
    if (existingImages.length < 3 && !existingImages.includes(null))
      return [...existingImages, null];
    return existingImages;
  });

  /** 파일 추가 */
  const handleFileChange = (e, idx) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);

    const newImages = [...images];
    newImages[idx] = { file, preview };

    const filled = newImages.filter(Boolean).length;
    if (filled < 3 && !newImages.includes(null)) newImages.push(null);

    setImages(newImages);
    setValue("imageList", newImages.map((img) => img?.file).filter(Boolean), {
      shouldDirty: true,
    });
  };

  /** 삭제 */
  const handleRemove = (idx) => {
    const newImages = images.filter((_, i) => i !== idx);
    const filled = newImages.filter(Boolean).length;
    if (filled < 3 && !newImages.includes(null)) newImages.push(null);
    setImages(newImages);
    setValue("imageList", newImages.map((img) => img?.file).filter(Boolean), {
      shouldDirty: true,
    });
  };

  /** 리뷰 등록/수정 요청 */
  const handleReviewSubmit = async (data) => {
    const formData = new FormData();

    if (mode === "edit" && defaultValues?.reviewId) {
      formData.append("reviewId", defaultValues.reviewId);
    }

    formData.append("orderId", order.orderId);
    formData.append("userId", order.userId || "user");
    formData.append("rating", data.rating);
    formData.append("content", data.content);

    // ✅ 현재 보여지는 이미지 전체를 순회
    for (const [idx, img] of images.entries()) {
      if (!img) continue;

      if (img.file instanceof File) {
        // 새 이미지
        formData.append(`imageList[${idx}].image`, img.file);
        formData.append(`imageList[${idx}].displayOrder`, idx + 1);
      } else if (img.preview?.startsWith("http")) {
        // ✅ 기존 이미지도 fetch해서 다시 File로 append
        const fileBlob = await fetch(img.preview).then((r) => r.blob());
        const file = new File([fileBlob], `existing_${idx}.jpg`, {
          type: fileBlob.type || "image/jpeg",
        });
        formData.append(`imageList[${idx}].image`, file);
        formData.append(`imageList[${idx}].displayOrder`, idx + 1);
      }
    }

    // ✅ 부모 onSubmit 호출
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
        {order && (
          <div className="review-order-info">
            <OrderList data={[order]} type="user" />
          </div>
        )}

        {/* 별점 */}
        <div className="review-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              className={`star ${star <= rating ? "active" : ""}`}
              key={star}
              size={28}
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

        {/* 이미지 업로드 */}
        <div className="review-images">
          <label className="upload-label">이미지 업로드</label>
          <div className="image-list">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`image-box ${img ? "filled" : "empty"}`}
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
            JPG, PNG 형식 / 최대 50MB까지 업로드 가능합니다.
          </p>
        </div>
      </div>
    </FormModal>
  );
}
