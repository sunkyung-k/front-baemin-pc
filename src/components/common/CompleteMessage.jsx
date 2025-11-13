import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

export default function CompleteMessage({
  title,
  description,
  redirectPath = "/",
  redirectDelay = 5,
  subText,
}) {
  const navigate = useNavigate();
  const [count, setCount] = useState(redirectDelay);

  useEffect(() => {
    const countdown = setInterval(() => {
      setCount((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const redirect = setTimeout(() => {
      navigate(redirectPath);
    }, redirectDelay * 1000);

    return () => {
      clearInterval(countdown);
      clearTimeout(redirect);
    };
  }, [navigate, redirectPath, redirectDelay]);

  return (
    <main className="complete-wrap">
      <FaCheckCircle className="complete-icon" />
      <h2 className="complete-title">{title}</h2>

      <div className="complete-desc-box">
        <p className="complete-desc">{description}</p>
        {subText && (
          <p className="complete-sub">
            <strong>{count}</strong>초 후 {subText}
          </p>
        )}
      </div>

      <div className="btnWrap">
        <button
          className="btn btn-default btn-primary-line"
          onClick={() => navigate("/")}
        >
          메인으로 가기
        </button>
        <button
          className="btn btn-default btn-primary"
          onClick={() => navigate(redirectPath)}
        >
          이동하기
        </button>
      </div>
    </main>
  );
}
