import ListPage from "../ListPage";

// Dedicated file for the "vehicles" dashboard option — thin wrapper around the
// shared generic ListPage, which reads its columns/fields/rows from
// LIST_CONFIG["vehicles"] in config/appData.js.
export default function VehiclesPage() {
  return <ListPage pageKey="vehicles" />;
}
