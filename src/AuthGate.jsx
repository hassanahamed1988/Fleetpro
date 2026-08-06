import { useState } from "react";
import { useConfirmDialog, useExitGuard } from "./context/ConfirmDialogContext";
import { useLang } from "./context/AppSettingsContext";
import { NavigationProvider } from "./context/NavigationContext";
import { ControlPanelDataProvider } from "./pages/ControlPanel";
import LoginScreen from "./pages/LoginScreen";
import AppShell from "./components/layout/AppShell";

/* ============================================================================
   AUTH GATE — sits directly under the global providers so BOTH the Login
   screen and the full app share the exact same Exit-confirmation guard, and
   the exact same confirm() dialog is used for Logout as for Exit. This is
   the only place either flow is wired up. NavigationProvider now wraps BOTH
   branches below (not just the logged-in one) so the phone's Back button
   behaves consistently everywhere, Login screen included.
============================================================================ */

// useExitGuard() needs useNavigator(), so it has to run inside
// NavigationProvider — this tiny bridge is that: declared once here, shared
// by both the Login screen and the logged-in app.
function ExitGuardBridge() {
  useExitGuard(); // Back button at the true root → "Exit Application" dialog
  return null;
}

export default function AuthGate() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { confirm } = useConfirmDialog();
  const { t } = useLang();

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: t("dialog.logoutTitle", "Logout"),
      message: t("dialog.logoutMessage", "Are you sure you want to close your current session and log out?"),
      danger: true,
    });
    if (confirmed) setIsLoggedIn(false);
  };

  return (
    <NavigationProvider>
      <ExitGuardBridge />
      {isLoggedIn ? (
        <ControlPanelDataProvider>
          <AppShell onLogout={handleLogout} />
        </ControlPanelDataProvider>
      ) : (
        <LoginScreen onLogin={() => setIsLoggedIn(true)} />
      )}
    </NavigationProvider>
  );
}

