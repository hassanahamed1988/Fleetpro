import ListPage from "../ListPage";

// Dedicated file for the "booking" dashboard option — thin wrapper around the
// shared generic ListPage, which reads its columns/fields/rows from
// LIST_CONFIG["booking"] in config/appData.js.
export default function BookingPage() {
  return <ListPage pageKey="booking" />;
}
