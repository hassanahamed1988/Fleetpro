import { AppSettingsProvider } from "./context/AppSettingsContext";
import { ThemeProvider } from "./context/ThemeContext";
import { FeedbackProvider } from "./context/FeedbackContext";
import { ConfirmDialogProvider } from "./context/ConfirmDialogContext";
import AuthGate from "./AuthGate";

export default function App() {
  return (
    <AppSettingsProvider>
      <ThemeProvider>
        <FeedbackProvider>
          <ConfirmDialogProvider>
            <AuthGate />
          </ConfirmDialogProvider>
        </FeedbackProvider>
      </ThemeProvider>
    </AppSettingsProvider>
  );
}
