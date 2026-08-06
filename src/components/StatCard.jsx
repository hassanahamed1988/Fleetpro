import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { withAlpha } from "../lib/theme-colors";
import {
  TrendingUp, TrendingDown,
} from "lucide-react";

/* ============================================================================
   DASHBOARD
============================================================================ */

// Top-of-page summary card. Uses the same app-wide theme tokens as every
// other card, so in dark mode it automatically picks up the #002843-derived
// surface, border, shadow, and high-contrast text — and reverts to the
// normal light card look when light mode is active.
export default function StatCard({ item }) {
  const { tokens, accent } = useTheme();
  const color = accent(item.tone);
  const positiveColor = accent("green");
  const negativeColor = accent("red");
  const Icon = item.icon;
  const [hover, setHover] = useState(false);

  return (
    <div
      className="rounded-2xl"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: tokens.surface,
        border: `1px solid ${hover ? tokens.borderStrong : tokens.border}`,
        boxShadow: hover ? tokens.shadow : tokens.shadowSm,
        padding: 18,
        transition: "background-color 240ms ease, border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="flex items-center justify-center rounded-xl"
          style={{ width: 38, height: 38, background: withAlpha(color, tokens.isDark ? 0.20 : 0.14) }}
        >
          <Icon size={19} color={color} strokeWidth={2} />
        </div>
        {item.up !== null && (
          <span
            className="inline-flex items-center gap-1 rounded-full"
            style={{
              fontSize: 11.5, fontWeight: 650, padding: "2.5px 8px",
              color: item.up ? positiveColor : negativeColor,
              background: withAlpha(item.up ? positiveColor : negativeColor, tokens.isDark ? 0.20 : 0.12),
            }}
          >
            {item.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {item.trend}
          </span>
        )}
        {item.up === null && (
          <span
            style={{
              fontSize: 11.5, fontWeight: 650, padding: "2.5px 8px", borderRadius: 999,
              color, background: withAlpha(color, tokens.isDark ? 0.20 : 0.12),
            }}
          >
            {item.trend}
          </span>
        )}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: tokens.textPrimary, letterSpacing: "-0.02em" }}>
        {item.value}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: tokens.textPrimary, marginTop: 3 }}>{item.label}</div>
      {item.sub && <div style={{ fontSize: 11, color: tokens.textSecondary, marginTop: 1 }}>{item.sub}</div>}
    </div>
  );
}

// Single tappable tile in the Dashboard quick-action grid: a tinted icon
// chip over a short label, matching the same card/hover language used by
// StatCard elsewhere in the app.
export function DashboardIconTile({ item, label, onClick }) {
  const { tokens, accent } = useTheme();
  const [hover, setHover] = useState(false);
  const color = accent(item.tone);
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex flex-col items-center gap-2 rounded-2xl"
      style={{
        padding: "16px 6px",
        background: tokens.surface,
        border: `1px solid ${hover ? tokens.borderStrong : tokens.border}`,
        boxShadow: hover ? tokens.shadow : tokens.shadowSm,
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        transition: "background-color 200ms ease, border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease",
        cursor: "pointer",
      }}
    >
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{ width: 42, height: 42, background: withAlpha(color, tokens.isDark ? 0.20 : 0.13) }}
      >
        <Icon size={20} color={color} strokeWidth={2} />
      </div>
      <span
        style={{
          fontSize: 11.5, fontWeight: 600, color: tokens.textPrimary,
          textAlign: "center", lineHeight: 1.25,
        }}
      >
        {label}
      </span>
    </button>
  );
}

