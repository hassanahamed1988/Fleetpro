import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/AppSettingsContext";
import { withAlpha, logoFrameRadius } from "../../lib/theme-colors";
import { NAV_ITEMS } from "../../config/appData";
import {
  Route, ChevronLeft, ChevronRight, X, LogOut,
} from "lucide-react";

/* ============================================================================
   LAYOUT: SIDEBAR
============================================================================ */

export default function Sidebar({ active, onNavigate, collapsed, onToggleCollapse, mobileOpen, onCloseMobile, isMobile, onLogout }) {
  const { tokens, accent, appLogo, logoRadiusFraction } = useTheme();
  const { t } = useLang();
  const width = collapsed && !isMobile ? 76 : 256;

  return (
    <>
      {isMobile && (
        <div
          onClick={onCloseMobile}
          style={{
            position: "fixed", inset: 0, zIndex: 40,
            background: tokens.overlay,
            opacity: mobileOpen ? 1 : 0,
            pointerEvents: mobileOpen ? "auto" : "none",
            transition: "opacity 220ms ease",
          }}
        />
      )}
      <aside
        style={{
          position: isMobile ? "fixed" : "relative",
          top: 0, left: 0, height: "100vh", zIndex: 50,
          width: isMobile ? 264 : width,
          transform: isMobile ? `translateX(${mobileOpen ? "0" : "-100%"})` : "none",
          background: tokens.sidebarChrome,
          borderRight: `1px solid ${tokens.bgBorder}`,
          display: "flex", flexDirection: "column",
          transition: "width 240ms cubic-bezier(.2,.8,.2,1), transform 240ms cubic-bezier(.2,.8,.2,1)",
          flexShrink: 0,
        }}
      >
        <div
          className="flex items-center gap-3 px-4"
          style={{ height: 60, borderBottom: `1px solid ${tokens.bgDivider}` }}
        >
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 34, height: 34,
              borderRadius: appLogo ? logoFrameRadius(logoRadiusFraction, 34) : 12,
              background: appLogo ? "transparent" : accent("blue"),
              overflow: "hidden",
              transition: "border-radius 200ms ease",
            }}
          >
            {appLogo ? (
              <img src={appLogo} alt="App logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <Route size={18} color="#fff" strokeWidth={2.25} />
            )}
          </div>
          {(!collapsed || isMobile) && (
            <div className="overflow-hidden">
              <div style={{ fontSize: 14.5, fontWeight: 700, color: tokens.bgTextPrimary, whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>
                RouteWise TMS
              </div>
              <div style={{ fontSize: 11, color: tokens.bgTextTertiary, whiteSpace: "nowrap" }}>
                Fleet & Logistics
              </div>
            </div>
          )}
          {isMobile && (
            <button
              onClick={onCloseMobile}
              className="ml-auto rounded-lg flex items-center justify-center"
              style={{ width: 30, height: 30, color: tokens.bgTextSecondary }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2.5">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.key;
            const Icon = item.icon;
            const label = t(`nav.${item.key}`, item.label);
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                title={collapsed && !isMobile ? label : undefined}
                className="w-full flex items-center gap-3 rounded-xl mb-1 relative"
                style={{
                  padding: collapsed && !isMobile ? "10px" : "10px 12px",
                  justifyContent: collapsed && !isMobile ? "center" : "flex-start",
                  background: isActive ? tokens.activeTint : "transparent",
                  color: isActive ? accent("blue") : tokens.bgTextSecondary,
                  transition: "background-color 160ms ease, color 160ms ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = tokens.hoverTint; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                {isActive && (
                  <span
                    style={{
                      position: "absolute", left: -10, top: "50%", transform: "translateY(-50%)",
                      width: 3, height: 18, borderRadius: 999, background: accent("blue"),
                    }}
                  />
                )}
                <Icon size={21} strokeWidth={2} style={{ flexShrink: 0 }} />
                {(!collapsed || isMobile) && (
                  <span style={{ fontSize: 13.5, fontWeight: isActive ? 620 : 500, whiteSpace: "nowrap" }}>
                    {label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-2.5 flex flex-col gap-1" style={{ borderTop: `1px solid ${tokens.bgDivider}` }}>
          {!isMobile && (
            <button
              onClick={onToggleCollapse}
              className="w-full flex items-center gap-2 rounded-xl justify-center"
              style={{ padding: "9px", color: tokens.bgTextSecondary, transition: "background-color 160ms ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = tokens.hoverTint)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {collapsed ? <ChevronRight size={21} /> : <><ChevronLeft size={21} /><span style={{ fontSize: 13 }}>{t("common.collapse", "Collapse")}</span></>}
            </button>
          )}
          <button
            onClick={onLogout}
            title={collapsed && !isMobile ? t("common.logout", "Logout") : undefined}
            className="w-full flex items-center gap-2 rounded-xl"
            style={{
              padding: collapsed && !isMobile ? "9px" : "9px 12px",
              justifyContent: collapsed && !isMobile ? "center" : "flex-start",
              color: accent("red"),
              transition: "background-color 160ms ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = tokens.hoverTint)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <LogOut size={21} strokeWidth={2} style={{ flexShrink: 0 }} />
            {(!collapsed || isMobile) && <span style={{ fontSize: 13.5, fontWeight: 500 }}>{t("common.logout", "Logout")}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
