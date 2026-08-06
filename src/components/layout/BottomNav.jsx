import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/AppSettingsContext";
import { withAlpha } from "../../lib/theme-colors";
import { BOTTOM_NAV_ITEMS } from "../../config/appData";
import {
  Home,
} from "lucide-react";

/* ============================================================================
   LAYOUT: BOTTOM NAVIGATION (MOBILE ONLY)
   A simple, independent tab strip for small screens. Nothing is active or
   selected by default — tapping any item does not navigate anywhere, it
   just tells the parent to show the "Coming Soon" banner at the top.
============================================================================ */

// Home here uses the exact same click logic as the Dashboard item in the
// sidebar drawer — it calls onNavigate("dashboard") and gets the same
// active-state highlight. The other three items are still unwired and keep
// surfacing the "Coming Soon" banner.
export default function BottomNav({ active, onNavigate, onComingSoon }) {
  const { tokens, accent } = useTheme();
  const { t } = useLang();
  return (
    <nav
      className="flex items-stretch flex-shrink-0"
      style={{
        height: 58,
        background: tokens.chrome,
        borderTop: `1px solid ${tokens.bgBorder}`,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {BOTTOM_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isHome = item.key === "home";
        const isActive = isHome && active === "dashboard";
        const label = t(`bottomNav.${item.key}`, item.label);
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => (isHome ? onNavigate("dashboard") : onComingSoon(label))}
            className="flex-1 flex flex-col items-center justify-center gap-1"
            style={{ color: isActive ? accent("blue") : tokens.bgTextSecondary, cursor: "pointer" }}
            onMouseDown={(e) => (e.currentTarget.style.opacity = "0.6")}
            onMouseUp={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Icon size={20} strokeWidth={2} />
            <span style={{ fontSize: 11, fontWeight: 550 }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
