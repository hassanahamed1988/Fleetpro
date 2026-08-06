import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/AppSettingsContext";
import { useNavigator, useIsMobile, NavigationOverlayOutlet, PageTransition } from "../../context/NavigationContext";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";
import { NAV_ITEMS } from "../../config/appData";
import Dashboard from "../../pages/Dashboard";
import ControlPanelPage from "../../pages/ControlPanel";
import SettingsPage from "../../pages/settings/SettingsPage";
import { ComingSoonBanner } from "../../pages/settings/SettingsShared";
// One dedicated file per dashboard/sidebar option — see pages/dashboard-options/
import VehiclesPage from "../../pages/dashboard-options/VehiclesPage";
import DriversPage from "../../pages/dashboard-options/DriversPage";
import CustomersPage from "../../pages/dashboard-options/CustomersPage";
import TripsPage from "../../pages/dashboard-options/TripsPage";
import BookingPage from "../../pages/dashboard-options/BookingPage";
import ExpensesPage from "../../pages/dashboard-options/ExpensesPage";
import IncomePage from "../../pages/dashboard-options/IncomePage";
import FuelPage from "../../pages/dashboard-options/FuelPage";
import MaintenancePage from "../../pages/dashboard-options/MaintenancePage";
import ReportsPage from "../../pages/dashboard-options/ReportsPage";
import NotificationsPage from "../../pages/dashboard-options/NotificationsPage";

const OPTION_PAGES = {
  vehicles: VehiclesPage,
  drivers: DriversPage,
  customers: CustomersPage,
  trips: TripsPage,
  booking: BookingPage,
  expenses: ExpensesPage,
  income: IncomePage,
  fuel: FuelPage,
  maintenance: MaintenancePage,
  reports: ReportsPage,
  notifications: NotificationsPage,
};

export default function AppShell({ onLogout }) {
  const { tokens, pageBgStyle } = useTheme();
  const { t } = useLang();
  const nav = useNavigator();
  const active = nav.section;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const isMobile = useIsMobile();
  const comingSoonTimer = useRef(null);

  const pageBaseLabel = active === "control-panel"
    ? t("nav.control-panel", "Control Panel")
    : t(`nav.${active}`, NAV_ITEMS.find((n) => n.key === active)?.label || "");

  // TopBar shows the pushed subpage's label when one is open, else the
  // current section's own label — driven entirely by the global navigator.
  const activeLabel = nav.top?.label || pageBaseLabel;

  // Keep browser tab title in sync — "SubPage · RouteWise TMS" or "Page · RouteWise TMS"
  useEffect(() => {
    document.title = activeLabel ? `${activeLabel} · RouteWise TMS` : "RouteWise TMS";
  }, [activeLabel]);

  // Switching top-level section always closes any open subpage first — you
  // can't "back" into a previously visited section, only into a subpage
  // drilled into from whichever one is currently active. navigateToSection
  // itself also updates the real back stack (see NavigationContext.jsx),
  // so the phone's Back button returns to Dashboard from any section.
  const handleNavigate = (key) => {
    nav.navigateToSection(key);
    if (isMobile) setMobileOpen(false);
  };

  const handleBottomNavClick = () => {
    setComingSoon(true);
    clearTimeout(comingSoonTimer.current);
    comingSoonTimer.current = setTimeout(() => setComingSoon(false), 2200);
  };

  useEffect(() => () => clearTimeout(comingSoonTimer.current), []);

  const renderPage = () => {
    if (active === "dashboard") return (
      <Dashboard onNavigate={handleNavigate} onComingSoon={handleBottomNavClick} />
    );
    if (active === "settings") return <SettingsPage />;
    if (active === "control-panel") return <ControlPanelPage />;
    const OptionPage = OPTION_PAGES[active];
    return OptionPage ? <OptionPage /> : null;
  };

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <Sidebar
        active={active}
        onNavigate={handleNavigate}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        isMobile={isMobile}
        onLogout={onLogout}
      />
      <div className="flex-1 flex flex-col min-w-0" style={{ height: "100vh", overflow: "hidden" }}>
        <TopBar
          onMenuClick={() => (isMobile ? setMobileOpen((v) => !v) : setCollapsed((v) => !v))}
          activeLabel={activeLabel}
          hasSubpage={nav.canGoBack}
          onBack={nav.pop}
        />
        <ComingSoonBanner show={comingSoon} />
        <div
          className="flex-1"
          style={{ ...pageBgStyle, transition: "background-color 260ms ease", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", minHeight: 0 }}
        >
          <NavigationOverlayOutlet>
            <PageTransition pageKey={active} direction="forward">
              {renderPage()}
            </PageTransition>
          </NavigationOverlayOutlet>
        </div>
        {isMobile && <BottomNav active={active} onNavigate={handleNavigate} onComingSoon={handleBottomNavClick} />}
      </div>
    </div>
  );
}

