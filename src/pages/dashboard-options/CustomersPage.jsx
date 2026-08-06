import ListPage from "../ListPage";

// Dedicated file for the "customers" dashboard option — thin wrapper around the
// shared generic ListPage, which reads its columns/fields/rows from
// LIST_CONFIG["customers"] in config/appData.js.
export default function CustomersPage() {
  return <ListPage pageKey="customers" />;
}
