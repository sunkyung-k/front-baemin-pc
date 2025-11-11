import React, { useRef, useState, useEffect } from "react";

export default function ImageUpload({
  label = "이미지 업로드",
  name = "image",
  hint = "",
  register,
  errorMessage,
  currentImageUrl = null,
  onExternalChange, //  외부 제어용 prop 추가
}) {
  const [preview, setPreview] = useState(currentImageUrl);
  const fileInputRef = useRef(null);

  const {
    ref,
    onChange = () => {},
    ...rest
  } = register ? register(name) : { ref: () => {}, onChange: () => {} };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
    } else {
      setPreview(currentImageUrl);
    }

    onChange(e);
    onExternalChange?.(e); // 외부 함수 호출
  };

  useEffect(() => {
    if (currentImageUrl && !fileInputRef.current?.files[0]) {
      setPreview(currentImageUrl);
    } else if (!currentImageUrl) {
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
          ref(el);
          fileInputRef.current = el;
        }}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {errorMessage && <p className="input-error">{errorMessage}</p>}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}
