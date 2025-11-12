import React, { useRef, useState, useEffect } from "react";

/**
 * ImageUpload (범용)
 *
 * Props:
 * - label (string) 기본: "이미지 업로드"
 * - name (string) 기본: "image"
 * - hint (string) 기본: ""
 * - register (function) react-hook-form register (optional)
 * - errorMessage (string) 기본: null
 * - currentImageUrl (string|null) 기본: null
 * - onExternalChange (function) 외부에서 파일 선택 이벤트 받는 콜백
 * - showLabel (bool) 기본: true
 * - showHint (bool) 기본: true
 * - showError (bool) 기본: true
 *
 * 기존 API와 완전 호환됨. 필요한 곳에서 showLabel/hint/error를 false로 꺼서 쓰면 됨.
 */
export default function ImageUpload({
  label = "이미지 업로드",
  name = "image",
  hint = "",
  register,
  errorMessage = null,
  currentImageUrl = null,
  onExternalChange,
  showLabel = true,
  showHint = true,
  showError = true,
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

    // react-hook-form onChange 호출 (기존 동작 유지)
    onChange(e);
    // 외부 제어 콜백 (옵션)
    onExternalChange?.(e);
  };

  // currentImageUrl 변경 시 preview 동기화
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
      {showLabel && (
        <label htmlFor={name} className="input-label">
          {label}
        </label>
      )}

      <div
        className={`image-preview ${errorMessage ? "error" : ""}`}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
        }}
        aria-label={label}
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

      {showError && errorMessage && (
        <p className="input-error">{errorMessage}</p>
      )}
      {showHint && hint && <p className="hint">{hint}</p>}
    </div>
  );
}
