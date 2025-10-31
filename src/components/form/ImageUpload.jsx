import React, { useRef, useState, useEffect } from "react";

export default function ImageUpload({
  label = "이미지 업로드",
  name = "image",
  register,
  errorMessage,
  currentImageUrl = null,
}) {
  const [preview, setPreview] = useState(currentImageUrl);
  const fileInputRef = useRef(null);

  // RHF 등록
  const { ref, onChange, ...rest } = register(name);

  // 파일 선택 시 미리보기
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
    } else {
      setPreview(currentImageUrl);
    }
    onChange(e); // 💥 반드시 RHF의 onChange 호출해줘야 RHF가 인식함
  };

  useEffect(() => {
    if (currentImageUrl && !fileInputRef.current?.files[0]) {
      setPreview(currentImageUrl);
    }
  }, [currentImageUrl]);

  return (
    <div className="image-upload">
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
        id={name}
        type="file"
        accept="image/*"
        {...rest}
        ref={(el) => {
          ref(el); // RHF ref 연결
          fileInputRef.current = el; // 로컬 ref도 연결
        }}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {errorMessage && <p className="input-error">{errorMessage}</p>}
    </div>
  );
}
