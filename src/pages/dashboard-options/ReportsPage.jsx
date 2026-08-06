import ListPage from "../ListPage";

// Dedicated file for the "reports" dashboard option — thin wrapper around the
// shared generic ListPage, which reads its columns/fields/rows from
// LIST_CONFIG["reports"] in config/appData.js.
export default function ReportsPage() {
  return <ListPage pageKey="reports" />;
}
