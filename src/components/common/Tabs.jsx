export function Tabs({ children, variant = "service", className = "" }) {
  return <div className={`tabs tabs--${variant} ${className}`}>{children}</div>;
}

export function TabButton({ active, onClick, children }) {
  return (
    <button
      className={`tab-btn ${active ? "active" : ""}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
