import React, { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";

// Layout
const AppShell = lazy(() => import("../components/layout/AppShell"));

// Pages
const LoginPage = lazy(() => import("../pages/LoginPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const ProjectPaymentsPage = lazy(() => import("../pages/ProjectPaymentsPage"));
const OpExPage = lazy(() => import("../pages/OpExPage"));
const ProfitsPage = lazy(() => import("../pages/ProfitsPage"));

// Auth Guard
import { isAuthenticated } from "../utils/auth";
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

// Add Pages
const AddPaymentPage = lazy(() => import("../pages/AddPaymentPage"));
const AddExpensePage = lazy(() => import("../pages/AddExpensePage"));
const AddProfitPage = lazy(() => import("../pages/AddProfitPage"));

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <Suspense fallback={<div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">Loading Security Module...</div>}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<div className="p-8 text-center text-gray-400 font-bold">Initializing Khata Shell...</div>}>
          <AppShell />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<div className="p-8">Loading dashboard...</div>}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: "project-payments",
        element: (
          <Suspense fallback={<div className="p-8">Loading payments...</div>}>
            <ProjectPaymentsPage />
          </Suspense>
        ),
      },
      {
        path: "project-payments/add",
        element: (
          <Suspense fallback={<div className="p-8">Loading form...</div>}>
            <AddPaymentPage />
          </Suspense>
        ),
      },
      {
        path: "opex-infrastructure",
        element: (
          <Suspense fallback={<div className="p-8">Loading infrastructure...</div>}>
            <OpExPage />
          </Suspense>
        ),
      },
      {
        path: "opex-infrastructure/add",
        element: (
          <Suspense fallback={<div className="p-8">Loading form...</div>}>
            <AddExpensePage />
          </Suspense>
        ),
      },
      {
        path: "profit-dividends",
        element: (
          <Suspense fallback={<div className="p-8">Loading profits...</div>}>
            <ProfitsPage />
          </Suspense>
        ),
      },
      {
        path: "profit-dividends/add",
        element: (
          <Suspense fallback={<div className="p-8">Loading form...</div>}>
            <AddProfitPage />
          </Suspense>
        ),
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
