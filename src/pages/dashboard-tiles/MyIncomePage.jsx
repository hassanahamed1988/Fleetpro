import IncomePage from "../dashboard-options/IncomePage";

// Dashboard tile "my-income" — reuses the already-built page for this
// section instead of duplicating its logic in a second file.
export default function MyIncomePage(props) {
  return <IncomePage {...props} />;
}
