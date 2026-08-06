import SettingsPage from "../settings/SettingsPage";

// Dashboard tile "theme" — reuses the already-built page for this
// section instead of duplicating its logic in a second file.
export default function ThemePage(props) {
  return <SettingsPage {...props} />;
}
