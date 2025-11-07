import React from "react";

function Card({ title, children, className = "" }) {
  return (
    <div className={`card ${className}`}>
      {title && <h2 className="cardTit">{title}</h2>}
      <div className="cardBody">{children}</div>
    </div>
  );
}

export default Card;
