import ExpensesPage from "../dashboard-options/ExpensesPage";

// Dashboard tile "invoice" — reuses the already-built page for this
// section instead of duplicating its logic in a second file.
export default function InvoicePage(props) {
  return <ExpensesPage {...props} />;
}
