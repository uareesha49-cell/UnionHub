import { createBrowserRouter, Outlet } from "react-router-dom";
import { AuthProvider } from "../auth/AuthContext";
import { NetworkGuard } from "../components/NetworkGuard";
import { ScrollToTop } from "../components/ScrollToTop";
import { publicRoutes } from "./PublicRoutes";
import { authRoutes } from "./AuthRoutes";

/** Auth + network UI must wrap the data router tree so useAuth works under RouterProvider (RR v7). */
function RootLayout() {
  return (
    <AuthProvider>
      <NetworkGuard>
        <ScrollToTop />
        <Outlet />
      </NetworkGuard>
    </AuthProvider>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [...publicRoutes, ...authRoutes],
  },
]);