import React, { useRef, useState, useEffect } from "react";

export default function ImageUpload({
  label = "이미지 업로드",
  name = "image",
  register,
  errorMessage,
  onChange,
  className = "",
  currentImageUrl = null, // 💡 추가: 현재 저장된 이미지 URL을 받음
}) {
  // 💡 수정: 상태를 currentImageUrl로 초기화
  const [preview, setPreview] = useState(currentImageUrl);
  const fileInputRef = useRef(null);

  // 💡 추가: currentImageUrl이 변경될 때 preview를 업데이트 (데이터 로딩 또는 초기화 시점)
  useEffect(() => {
    // 새 파일이 선택되지 않은 상태에서만 기존 URL을 사용
    if (currentImageUrl && !fileInputRef.current?.files[0]) {
      setPreview(currentImageUrl);
    } else if (!currentImageUrl && !fileInputRef.current?.files[0]) {
      // currentImageUrl이 null이고 새 파일도 없으면 미리보기 초기화
      setPreview(null);
    }
  }, [currentImageUrl]);

  // 파일 변경 시 미리보기 처리
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      // 파일 선택 취소 시, 기존 URL이 있다면 복원
      setPreview(currentImageUrl);
      return;
    }
    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
    if (onChange) onChange(file);
  };

  const { ref, ...rest } = register(name);

  return (
    <div className={`image-upload ${className}`}>
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
        </label>
      )}

      <div
        className={`image-preview ${errorMessage ? "error" : ""}`}
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="미리보기" className="preview-img" />
        ) : (
          <span className="plus-icon">+</span>
        )}
      </div>

      <input
        type="file"
        id={name}
        accept="image/*"
        {...rest}
        ref={(el) => {
          ref(el);
          fileInputRef.current = el;
        }}
        onChange={(e) => {
          rest.onChange(e);
          handleFileChange(e);
        }}
        style={{ display: "none" }}
      />

      {errorMessage && <p className="input-error">{errorMessage}</p>}
    </div>
  );
}
