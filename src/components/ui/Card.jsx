import { useState } from "react";
import { T } from "../../constants/theme";

export function Card({ children, style: sx, onClick, hover }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: T.white, borderRadius: 20, padding: 24,
        boxShadow: hover && hovered ? T.shadowHover : T.shadow,
        transition: "all .25s", cursor: onClick ? "pointer" : "default",
        transform: hover && hovered ? "translateY(-2px)" : "none",
        ...sx,
      }}>
      {children}
    </div>
  );
}
