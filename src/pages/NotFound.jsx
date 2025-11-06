import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "120px" }}>
      <h1>🚫 페이지를 찾을 수 없습니다.</h1>
      <p style={{ color: "#777", marginBottom: "20px" }}>
        존재하지 않거나 삭제된 페이지입니다.
      </p>
      <button
        onClick={() => navigate("/")}
        style={{
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          background: "#007bff",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        홈으로 돌아가기
      </button>
    </div>
  );
}
