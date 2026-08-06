import TripsPage from "../dashboard-options/TripsPage";

// Dashboard tile "new-trip" — reuses the already-built page for this
// section instead of duplicating its logic in a second file.
export default function NewTripPage(props) {
  return <TripsPage {...props} />;
}
