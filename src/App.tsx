import { Toaster } from "react-hot-toast";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppLayout } from "./components/layout/AppLayout/AppLayout";
import { AdminRoute } from "./components/auth/AdminRoute";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppDataProvider } from "./context/AppDataContext";
import { queryClient } from "./lib/query-client";
import { BudgetEditor } from "./pages/BudgetEditor/BudgetEditor";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { Login } from "./pages/Login/Login";
import { UsersPage } from "./pages/Admin/Users/UsersPage";
import { SettingsPage } from "./pages/Admin/Settings/SettingsPage";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppDataProvider>
        <BrowserRouter>
          <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
          <Routes>
            <Route path="/login" element={<Login />} />

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
