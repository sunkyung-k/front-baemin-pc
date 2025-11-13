import React from "react";
import { Link } from "react-router-dom";

/**
 * AuthLayout
 * ------------------------------------------------------------
 * - 로그인, 아이디찾기, 비밀번호찾기, 재설정 등 공통 레이아웃
 * - title + description + form + footer 구조
 */
export default function AuthLayout({
  title,
  description,
  children,
  footer,
  subFooter = false,
}) {
  return (
    <main className="authContainer">
      <div className="authBox">
        {title && <h2 className="authTitle">{title}</h2>}

        {description && <p className="authDesc">{description}</p>}

        <div className="authContent">{children}</div>

        {footer && <p className="authText">{footer}</p>}
        {subFooter && (
          <div className="authFind">
            <Link to="/find-id" className="btn-hv">
              아이디 찾기
            </Link>
            /
            <Link to="/find-password" className="btn-hv">
              비밀번호 찾기
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
