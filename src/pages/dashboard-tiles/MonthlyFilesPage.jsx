import ReportsPage from "../dashboard-options/ReportsPage";

// Dashboard tile "monthly-files" — reuses the already-built page for this
// section instead of duplicating its logic in a second file.
export default function MonthlyFilesPage(props) {
  return <ReportsPage {...props} />;
}
