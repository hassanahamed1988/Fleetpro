import SettingsPage from "../settings/SettingsPage";

// Dashboard tile "settings" — reuses the already-built page for this
// section instead of duplicating its logic in a second file.
export default function SettingsTilePage(props) {
  return <SettingsPage {...props} />;
}
