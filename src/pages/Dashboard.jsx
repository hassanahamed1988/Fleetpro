import { useTheme } from "../context/ThemeContext";
import { useLang } from "../context/AppSettingsContext";
import { useNavigator } from "../context/NavigationContext";
import { DashboardIconTile } from "../components/StatCard";
import { ControlPanelItemPage } from "./ControlPanel";
import { DASHBOARD_ICONS, CONTROL_PANEL_ITEMS } from "../config/appData";

export default function Dashboard({ onNavigate, onComingSoon }) {
  const { tokens } = useTheme();
  const { t } = useLang();
  const nav = useNavigator();

  // The dashboard's "Add Money" tile has no page of its own — it opens the
  // exact same Control Panel > Add Money subpage (same form, same saved
  // entries, same data via ControlPanelDataProvider) rather than a
  // duplicate/disconnected screen, so entries added from either entry
  // point stay in sync automatically.
  const handleTileClick = (item) => {
    if (item.key === "add-money") {
      const cpItem = CONTROL_PANEL_ITEMS.find((i) => i.key === "add-money");
      const label = t(`controlPanel.${cpItem.key}.label`, cpItem.label);
      nav.push(label, <ControlPanelItemPage item={cpItem} />);
      return;
    }
    if (item.navKey) {
      onNavigate(item.navKey);
      return;
    }
    onComingSoon();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {DASHBOARD_ICONS.map((item) => (
          <DashboardIconTile
            key={item.key}
            item={item}
            label={t(`dashboardTile.${item.key}`, item.label)}
            onClick={() => handleTileClick(item)}
          />
        ))}
      </div>
    </div>
  );
}

