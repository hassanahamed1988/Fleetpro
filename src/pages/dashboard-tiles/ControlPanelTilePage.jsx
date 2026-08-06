import Page from "../ControlPanel";

// Dashboard tile "control-panel" — reuses the already-built page for this
// section instead of duplicating its logic in a second file.
export default function ControlPanelTilePage(props) {
  return <Page {...props} />;
}
