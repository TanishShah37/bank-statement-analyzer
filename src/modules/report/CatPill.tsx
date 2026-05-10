// ─────────────────────────────────────────────────────────────────────────────
// CatPill — category badge
// ─────────────────────────────────────────────────────────────────────────────
import { T } from "../../styles/theme";

interface CatPillProps {
  cat: string;
}

export function CatPill({ cat }: CatPillProps) {
  const col = T.catColors[cat] || "#6B7280";
  return (
    <span
      className="cat-pill"
      style={{ background: `${col}18`, color: col, border: `1px solid ${col}30` }}
    >
      {cat}
    </span>
  );
}
