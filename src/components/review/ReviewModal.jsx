import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FaStar } from "react-icons/fa";
import FormModal from "@/components/form/FormModal";
import TextareaField from "@/components/form/TextareaField";
import ImageUpload from "@/components/form/ImageUpload";
import OrderList from "@/components/mypage/OrderList";
import { getAbsoluteImageUrl } from "@/utills/imageUtills";

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
    defaultValues: {
      rating: defaultValues?.rating || 0,
      content: defaultValues?.content || "",
    },
  });

  const [hoverRating, setHoverRating] = useState(0);
  const rating = watch("rating");

  /** ✅ 이미지 리스트 상태 */
  const [images, setImages] = useState(
    defaultValues?.fileList?.map((f) => ({
      file: null,
      preview: getAbsoluteImageUrl(f),
    })) || [null] // 처음엔 빈칸 하나
  );

  /** ✅ 파일 추가 */
  const handleFileChange = (e, idx) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);

    const newImages = [...images];
    newImages[idx] = { file, preview };

    // 자동으로 다음 칸 생성 (3장 제한)
    const filled = newImages.filter(Boolean).length;
    if (filled < 3 && !newImages.includes(null)) newImages.push(null);

    setImages(newImages);
    setValue("imageList", newImages.map((img) => img?.file).filter(Boolean));
  };

  /** ✅ 삭제 */
  const handleRemove = (idx) => {
    const newImages = images.filter((_, i) => i !== idx);
    if (newImages.length < 3 && !newImages.includes(null)) newImages.push(null);

    setImages(newImages);
    setValue("imageList", newImages.map((img) => img?.file).filter(Boolean));
  };

  /** ✅ 제출 */
  const onFormSubmit = (data) => {
    const formData = new FormData();
    formData.append("orderId", order.orderId);
    formData.append("userId", order.userId || "user");
    formData.append("rating", data.rating);
    formData.append("content", data.content);

    images.forEach((img, idx) => {
      if (img?.file instanceof File) {
        formData.append(`imageList[${idx}].image`, img.file);
        formData.append(`imageList[${idx}].displayOrder`, idx + 1);
      }
    });

    onSubmit?.(formData);
  };

  if (!isOpen) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "리뷰 작성" : "리뷰 수정"}
      onSubmit={handleSubmit(onFormSubmit)}
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
              key={star}
              size={28}
              className={`star ${star <= rating ? "active" : ""}`}
              onClick={() => setValue("rating", star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            />
          ))}
        </div>

        <TextareaField
          label="리뷰 내용"
          name="content"
          placeholder="가게 이용 후기를 남겨주세요. (최대 500자)"
          register={register}
          errorMessage={errors.content?.message}
        />

        <div className="review-images">
          <div className="image-list">
            {images.map((img, idx) => (
              <div key={idx} className="image-box">
                <ImageUpload
                  name={`imageList.${idx}`}
                  register={register}
                  currentImageUrl={img?.preview || null}
                  onExternalChange={(e) => handleFileChange(e, idx)}
                  hint="JPG, PNG 형식 / 최대 50MB까지 업로드 가능합니다."
                />
                {img && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemove(idx)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </FormModal>
  );
}
