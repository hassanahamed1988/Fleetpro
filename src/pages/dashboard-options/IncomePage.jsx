import ListPage from "../ListPage";

// Dedicated file for the "income" dashboard option — thin wrapper around the
// shared generic ListPage, which reads its columns/fields/rows from
// LIST_CONFIG["income"] in config/appData.js.
export default function IncomePage() {
  return <ListPage pageKey="income" />;
}
