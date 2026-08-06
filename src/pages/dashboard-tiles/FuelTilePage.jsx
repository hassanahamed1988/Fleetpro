import FuelPage from "../dashboard-options/FuelPage";

// Dashboard tile "fuel-dash" — reuses the already-built page for this
// section instead of duplicating its logic in a second file.
export default function FuelTilePage(props) {
  return <FuelPage {...props} />;
}
