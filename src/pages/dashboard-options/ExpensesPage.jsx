import ListPage from "../ListPage";

// Dedicated file for the "expenses" dashboard option — thin wrapper around the
// shared generic ListPage, which reads its columns/fields/rows from
// LIST_CONFIG["expenses"] in config/appData.js.
export default function ExpensesPage() {
  return <ListPage pageKey="expenses" />;
}
