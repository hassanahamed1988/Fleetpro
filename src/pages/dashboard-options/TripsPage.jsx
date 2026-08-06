import ListPage from "../ListPage";

// Dedicated file for the "trips" dashboard option — thin wrapper around the
// shared generic ListPage, which reads its columns/fields/rows from
// LIST_CONFIG["trips"] in config/appData.js.
export default function TripsPage() {
  return <ListPage pageKey="trips" />;
}
