import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/AppSettingsContext";
import { withAlpha } from "../../lib/theme-colors";
import {
  Home,
} from "lucide-react";

export function ModeOption({ value, label, icon: Icon, current, onSelect }) {
  const { tokens, accent } = useTheme();
  const active = current === value;
  return (
    <button
      onClick={() => onSelect(value)}
      className="flex flex-col items-center gap-2 rounded-2xl flex-1"
      style={{
        padding: "18px 12px",
        background: active ? withAlpha(accent("blue"), 0.1) : tokens.surfaceSunken,
        border: `1.5px solid ${active ? accent("blue") : tokens.bgBorder}`,
        transition: "all 180ms ease",
        cursor: "pointer",
      }}
    >
      <Icon size={22} color={active ? accent("blue") : tokens.bgTextSecondary} strokeWidth={2} />
      <span style={{ fontSize: 13, fontWeight: 600, color: active ? accent("blue") : tokens.bgTextPrimary }}>
        {label}
      </span>
    </button>
  );
}

/* ============================================================================
   COMING SOON BANNER — shown at the top of the page when a bottom-nav
   item (Home / Trips / Payment / Profile) is tapped; those items aren't
   wired to any page yet.
============================================================================ */

export function ComingSoonBanner({ show }) {
  const { tokens, accent } = useTheme();
  const { t } = useLang();
  const blue = accent("blue");
  return (
    <div
      style={{
        maxHeight: show ? 46 : 0,
        opacity: show ? 1 : 0,
        overflow: "hidden",
        flexShrink: 0,
        background: withAlpha(blue, 0.12),
        borderBottom: show ? `1px solid ${tokens.border}` : "none",
        transition: "max-height 220ms ease, opacity 200ms ease, border-color 200ms ease",
      }}
    >
      <div
        className="flex items-center justify-center gap-2 px-4"
        style={{ height: 46, fontSize: 13.5, fontWeight: 650, color: blue }}
      >
        {t("common.comingSoon", "Coming Soon")}
      </div>
    </div>
  );
}

