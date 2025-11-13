import React, { useState, useEffect, useRef } from "react";
import { FaAngleDown } from "react-icons/fa";

export default function Footer() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("관련 사이트");
  const selectRef = useRef(null);

  const siteList = [
    { name: "기술 블로그", url: "https://techblog.woowahan.com/" },
    { name: "배민닷컴", url: "https://baemin.com/" },
    { name: "Delivery Hero", url: "https://www.deliveryhero.com/" },
    { name: "우아한청년들", url: "https://www.woowayouths.com/" },
    { name: "우아한사장님살핌기금", url: "https://woowasajangnim.or.kr/" },
    { name: "우아한사장님자녀장학금지원", url: "https://woowa.janghak.org/" },
    { name: "배민방학도시락", url: "https://baemin.dosirak.or.kr/" },
  ];

  const footerLinks = [
    { name: "오시는 길", href: "https://www.woowahan.com/place" },
    { name: "공지사항", href: "https://www.woowahan.com/notice?page=1" },
    {
      name: "개인정보처리방침",
      href: "https://www.woowahan.com/policy",
      strong: true,
    },
    { name: "제휴문의", href: "https://www.woowahan.com/question/partnership" },
    {
      name: "제보센터",
      href: "https://www.woowahan.com/information-center/consult",
    },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (name, url) => {
    setSelected(name);
    setIsOpen(false);
    window.open(url, "_blank");
  };

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* 네비게이션 */}
        <nav className="footer-nav">
          <ul>
            {footerLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className={link.strong ? "font-strong" : ""}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* 셀렉트 박스 */}
        <div className="family-select" ref={selectRef}>
          <button
            type="button"
            className={`select-trigger ${isOpen ? "active" : ""}`}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <span>{selected}</span>
            <FaAngleDown size={15} className="arrow-icon" />
          </button>

          <ul className={`select-list ${isOpen ? "open" : ""}`}>
            {siteList.map((site) => (
              <li key={site.name}>
                <a
                  href={site.url}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelect(site.name, site.url);
                  }}
                  className="select-item"
                >
                  {site.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 회사 정보 */}
      <div className="footer-company">
        <p className="footer-company-name">(주)우아한형제들</p>
        <p className="footer-company-detail">
          <span>
            사업자등록번호 : 120-87-65763 | CEO : 김범석 | 주소 : 서울시 송파구
            위례성대로 2 (방이동, 장은빌딩)
          </span>
          <span>© 2025 배민 PC 프로젝트 | UI/UX A 1조</span>
        </p>
      </div>
    </footer>
  );
}
