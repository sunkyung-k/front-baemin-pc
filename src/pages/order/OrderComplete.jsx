import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import styles from "./OrderComplete.module.scss";
import { useState } from "react";

export default function OrderComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const [count, setCount] = useState(5);

  useEffect(() => {
    // 잘못된 접근 방지
    if (!location.state?.fromOrder) {
      alert("잘못된 접근입니다.");
      navigate("/");
      return;
    }

    // 1초마다 count 감소
    const countdown = setInterval(() => {
      setCount((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // count가 0이 되면 자동 이동
    const redirect = setTimeout(() => {
      navigate("/mypage/order/info");
    }, 5000);

    return () => {
      clearInterval(countdown);
      clearTimeout(redirect);
    };
  }, [location, navigate]);

  return (
    <main className={styles.completeWrap}>
      <FaCheckCircle className={styles.icon} />
      <h2 className={styles.title}>결제가 완료되었습니다.</h2>

      <div className={styles.descBox}>
        <p className={styles.desc}>
          주문내역은 <strong>마이페이지 &gt; 주문내역</strong>에서 확인하실 수
          있습니다.
        </p>
        <p className={styles.sub}>
          <strong>{count}</strong>초 후 자동으로 이동합니다.
        </p>
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
          onClick={() => navigate("/mypage/order/info")}
        >
          주문내역 보기
        </button>
      </div>
    </main>
  );
}
