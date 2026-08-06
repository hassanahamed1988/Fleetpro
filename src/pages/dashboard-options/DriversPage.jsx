import ListPage from "../ListPage";

// Dedicated file for the "drivers" dashboard option — thin wrapper around the
// shared generic ListPage, which reads its columns/fields/rows from
// LIST_CONFIG["drivers"] in config/appData.js.
export default function DriversPage() {
  return <ListPage pageKey="drivers" />;
}
