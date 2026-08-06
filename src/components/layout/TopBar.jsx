import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/AppSettingsContext";
import { withAlpha } from "../../lib/theme-colors";
import { NAV_ITEMS, NOTIFICATIONS } from "../../config/appData";
import { IconButton, Dot } from "../ui-kit";
import {
  Bell, ChevronLeft, Menu, Sun, Moon, ChevronDown,
} from "lucide-react";

/* ============================================================================
   LAYOUT: TOP APP BAR
============================================================================ */

export default function TopBar({ onMenuClick, activeLabel, onNavigate, onBack, hasSubpage }) {
  const { tokens, accent, mode, setMode } = useTheme();
  const { t } = useLang();
  const [notifOpen, setNotifOpen] = useState(false);
  const ref = useRef(null);

  const isDark = mode === "dark" || (mode === "system" && tokens.isDark);
  const toggleDarkLight = () => {
    if (mode === "system") {
      setMode(tokens.isDark ? "light" : "dark");
    } else {
      setMode(mode === "dark" ? "light" : "dark");
    }
  };

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header
      className="flex items-center gap-3 px-4 sm:px-5 flex-shrink-0"
      style={{
        height: 60, background: tokens.chrome, borderBottom: `1px solid ${tokens.bgBorder}`,
        position: "sticky", top: 0, zIndex: 30,
      }}
    >
      {/* When a subpage is open show a back arrow; otherwise the hamburger menu */}
      {hasSubpage ? (
        <button
          onClick={onBack}
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ width: 38, height: 38, color: tokens.bgTextSecondary }}
          onMouseEnter={(e) => (e.currentTarget.style.background = tokens.hoverTint)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <ChevronLeft size={20} />
        </button>
      ) : (
        <button
          onClick={onMenuClick}
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ width: 38, height: 38, color: tokens.bgTextSecondary }}
          onMouseEnter={(e) => (e.currentTarget.style.background = tokens.hoverTint)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <Menu size={24} />
        </button>
      )}

      <div
        style={{
          fontSize: 15.5,
          fontWeight: 650,
          color: tokens.bgTextPrimary,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          flex: "0 1 auto",
          minWidth: 0,
        }}
      >
        {activeLabel}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <div className="relative" ref={ref}>
          <IconButton icon={Bell} label={t("common.notifications", "Notifications")} active={notifOpen} onLiveBg onClick={() => setNotifOpen((v) => !v)} />
          <span
            style={{
              position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: 999,
              background: accent("red"), border: `1.5px solid ${tokens.surface}`,
            }}
          />
          {notifOpen && (
            <div
              className="absolute right-0 mt-2 rounded-2xl overflow-hidden"
              style={{
                width: 320, background: tokens.surfaceRaised, border: `1px solid ${tokens.borderStrong}`,
                boxShadow: tokens.shadow, zIndex: 50,
              }}
            >
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${tokens.divider}`, fontSize: 13.5, fontWeight: 650, color: tokens.textPrimary }}>
                {t("common.notifications", "Notifications")}
              </div>
              {NOTIFICATIONS.map((n) => (
                <div key={n.id} className="flex items-start gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${tokens.divider}` }}>
                  <div style={{ marginTop: 5 }}><Dot tone={n.tone} /></div>
                  <div>
                    <div style={{ fontSize: 13, color: tokens.textPrimary, lineHeight: 1.4 }}>{n.title}</div>
                    <div style={{ fontSize: 11.5, color: tokens.textTertiary, marginTop: 2 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Light / Dark mode toggle */}
        <IconButton
          icon={isDark ? Sun : Moon}
          label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          onLiveBg
          onClick={toggleDarkLight}
        />

        <div
          className="hidden sm:flex items-center gap-2 rounded-xl pl-1 pr-3"
          style={{ height: 38, cursor: "pointer" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = tokens.hoverTint)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <div
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{ width: 30, height: 30, background: accent("violet"), color: "#fff", fontSize: 12.5, fontWeight: 650 }}
          >
            AM
          </div>
          <div className="leading-tight">
            <div style={{ fontSize: 12.5, fontWeight: 620, color: tokens.bgTextPrimary }}>Ava Morgan</div>
            <div style={{ fontSize: 10.5, color: tokens.bgTextTertiary }}>Fleet Manager</div>
          </div>
          <ChevronDown size={14} color={tokens.bgTextTertiary} />
        </div>
      </div>
    </header>
  );
}
