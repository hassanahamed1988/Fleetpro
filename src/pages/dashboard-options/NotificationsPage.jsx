import ListPage from "../ListPage";

// Dedicated file for the "notifications" dashboard option — thin wrapper around the
// shared generic ListPage, which reads its columns/fields/rows from
// LIST_CONFIG["notifications"] in config/appData.js.
export default function NotificationsPage() {
  return <ListPage pageKey="notifications" />;
}
