import { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppLayout } from "./components/layout/AppLayout/AppLayout";
import { AdminRoute } from "./components/auth/AdminRoute";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PageLoader } from "./components/ui/PageLoader/PageLoader";
import { AppDataProvider } from "./context/AppDataContext";
import { queryClient } from "./lib/query-client";

const Login = lazy(() => import("./pages/Login/Login").then((m) => ({ default: m.Login })));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard").then((m) => ({ default: m.Dashboard })));
const BudgetEditor = lazy(() => import("./pages/BudgetEditor/BudgetEditor").then((m) => ({ default: m.BudgetEditor })));
const UsersPage = lazy(() => import("./pages/Admin/Users/UsersPage").then((m) => ({ default: m.UsersPage })));
const SettingsPage = lazy(() => import("./pages/Admin/Settings/SettingsPage").then((m) => ({ default: m.SettingsPage })));

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppDataProvider>
        <BrowserRouter>
          <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
          <Routes>
            <Route
              path="/login"
              element={
                <Suspense fallback={<PageLoader className="h-dvh" />}>
                  <Login />
                </Suspense>
              }
            />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="editor" element={<BudgetEditor />} />
                <Route path="editor/:budgetId" element={<BudgetEditor />} />

                <Route element={<AdminRoute />}>
                  <Route path="admin/users" element={<UsersPage />} />
                  <Route path="admin/settings" element={<SettingsPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppDataProvider>
    </QueryClientProvider>
  );
}
