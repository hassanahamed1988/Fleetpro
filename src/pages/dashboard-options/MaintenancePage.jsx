import ListPage from "../ListPage";

// Dedicated file for the "maintenance" dashboard option — thin wrapper around the
// shared generic ListPage, which reads its columns/fields/rows from
// LIST_CONFIG["maintenance"] in config/appData.js.
export default function MaintenancePage() {
  return <ListPage pageKey="maintenance" />;
}
