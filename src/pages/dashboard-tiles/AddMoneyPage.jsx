import { ControlPanelItemPage } from "../ControlPanel";
import { CONTROL_PANEL_ITEMS } from "../../config/appData";

// Dashboard tile "add-money" — opens the same Control Panel > Add Money
// subpage (same form, same saved entries) rather than a disconnected
// duplicate screen, so entries stay in sync either way they're added.
export default function AddMoneyPage() {
  const item = CONTROL_PANEL_ITEMS.find((i) => i.key === "add-money");
  return <ControlPanelItemPage item={item} />;
}
