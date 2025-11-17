import React, { useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function ReviewSwiper({ images = [], onClose }) {
  /** ESC 키 방지 */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") e.preventDefault();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /** 오버레이 클릭 시 닫기 */
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("review-swiper-overlay")) {
      onClose();
    }
  };

  return (
    <div
      className="review-swiper-overlay active"
      onClick={handleOverlayClick}
      role="dialog"
    >
      <div className="review-swiper-container">
        <button className="swiper-close-btn" onClick={onClose}>
          <IoClose />
        </button>

        <Swiper
          modules={[Pagination, Navigation]}
          pagination={{ clickable: true }}
          navigation
          spaceBetween={30}
          slidesPerView={1}
          loop
          className="review-swiper"
        >
          {images.map((src, idx) => (
            <SwiperSlide key={idx}>
              <img src={src} alt={`리뷰 이미지 ${idx + 1}`} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
