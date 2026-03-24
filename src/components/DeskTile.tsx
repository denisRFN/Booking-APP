import { cn } from "../lib/utils";
import deskBaseImage from "../assets/desk-base.svg";

type DeskTone = "available" | "mine" | "occupied" | "neutral";

interface DeskTileProps {
  label: string;
  tone?: DeskTone;
  selected?: boolean;
  className?: string;
}

export function DeskTile({ label, tone = "neutral", selected = false, className }: DeskTileProps) {
  const toneClass =
    tone === "available"
      ? "desk-tile--available"
      : tone === "mine"
        ? "desk-tile--mine"
        : tone === "occupied"
          ? "desk-tile--occupied"
          : "desk-tile--neutral";

  return (
    <div className={cn("desk-tile", toneClass, selected && "desk-tile--selected", className)}>
      <img src={deskBaseImage} alt="" aria-hidden="true" className="desk-tile__base" draggable={false} />
      <div className="desk-tile__overlay" />
      <div className="desk-tile__badge">
        <span className="desk-tile__label">{label}</span>
      </div>
    </div>
  );
}

