import ListPage from "../ListPage";

// Dedicated file for the "fuel" dashboard option — thin wrapper around the
// shared generic ListPage, which reads its columns/fields/rows from
// LIST_CONFIG["fuel"] in config/appData.js.
export default function FuelPage() {
  return <ListPage pageKey="fuel" />;
}
