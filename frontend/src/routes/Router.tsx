import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Navigate,
} from "react-router-dom";
import { lazy } from "react";
import AuthGuard from "./AuthGuard";
import AppShellLayout from "@components/layout/AppShell";
import RestrictedRoute from "./RestrictedRoute";
import { ROLE_LIST } from "@constants/permissions";

const LoginPage = lazy(() => import("@pages/auth/LoginPage"));
const DashboardPage = lazy(() => import("@pages/dashboard/DashboardPage"));
const ProductsPage = lazy(() => import("@pages/products/ProductsPage"));
const ProductDetailPage = lazy(() => import("@pages/products/ProductDetailPage"));
const RequisitionsLayout = lazy(() => import("@pages/requisitions/RequisitionsLayout"));
const RequisitionsPage = lazy(() => import("@pages/requisitions/RequisitionsPage"));
const RequisitionDetailPage = lazy(() => import("@pages/requisitions/RequisitionDetailPage"));
const PurchaseOrdersPage = lazy(() => import("@pages/purchase-orders/PurchaseOrdersPage"));
const PurchaseOrderDetailPage = lazy(() => import("@pages/purchase-orders/PurchaseOrderDetailPage"));
const InspectionsPage = lazy(() => import("@pages/inspections/InspectionsPage"));
const InspectionDetailPage = lazy(() => import("@pages/inspections/InspectionDetailPage"));
const DispensesLayout = lazy(() => import("@pages/dispenses/DispensesLayout"));
const DispensesPage = lazy(() => import("@pages/dispenses/DispensesPage"));
const DispenseDetailPage = lazy(() => import("@pages/dispenses/DispenseDetailPage"));
const ReportsPage = lazy(() => import("@pages/reports/ReportsPage"));
const SettingsLayout = lazy(() => import("@pages/settings/SettingsLayout"));
const UsersPage = lazy(() => import("@pages/settings/UsersPage"));
const RolesPage = lazy(() => import("@pages/settings/RolesPage"));
const SystemLogsPage = lazy(() => import("@pages/settings/SystemLogsPage"));
const ChangePasswordPage = lazy(() => import("@pages/auth/ChangePasswordPage"));
const MyProfilePage = lazy(() => import("@pages/auth/MyProfilePage"));
const NotFoundPage = lazy(() => import("@pages/errors/NotFoundPage"));

const UnitsPage = lazy(() => import("@pages/libraries/UnitsPage"));
const DepartmentsPage = lazy(() => import("@pages/libraries/DepartmentsPage"));
const SuppliersPage = lazy(() => import("@pages/libraries/SuppliersPage"));
const BrandsPage = lazy(() => import("@pages/libraries/BrandsPage"));
const CategoriesPage = lazy(() => import("@pages/libraries/CategoriesPage"));
const GenericNamesPage = lazy(() => import("@pages/libraries/GenericNamesPage"));
const FundClustersPage = lazy(() => import("@pages/libraries/FundClustersPage"));
const DivisionsPage = lazy(() => import("@pages/libraries/DivisionsPage"));

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AuthGuard />}>
        <Route element={<AppShellLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="requisitions" element={<RequisitionsLayout />}>
            <Route index element={<Navigate to="pending" replace />} />
            <Route path="pending" element={<RequisitionsPage />} />
            <Route path="for-dispensing" element={<RequisitionsPage />} />
            <Route path="dispensed" element={<RequisitionsPage />} />
          </Route>
          <Route path="requisitions/:id" element={<RequisitionDetailPage />} />
          <Route path="requisitions/:id/items" element={<RequisitionDetailPage />} />
          <Route path="requisitions/:id/archive" element={<RequisitionDetailPage />} />
          <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
          <Route path="purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
          <Route path="inspections" element={<InspectionsPage />} />
          <Route path="inspections/to-forward" element={<InspectionsPage />} />
          <Route path="inspections/forwarded" element={<InspectionsPage />} />
          <Route path="inspections/:id" element={<InspectionDetailPage />} />
          <Route path="dispenses" element={<DispensesLayout />}>
            <Route index element={<Navigate to="for-dispense" replace />} />
            <Route path="for-dispense" element={<DispensesPage />} />
            <Route path="dispensed" element={<DispensesPage />} />
          </Route>
          <Route path="dispenses/:id" element={<DispenseDetailPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsLayout />}>
            <Route index element={<Navigate to="/settings/users" replace />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="roles" element={<RestrictedRoute permission={ROLE_LIST}><RolesPage /></RestrictedRoute>} />
            <Route path="logs" element={<SystemLogsPage />} />
          </Route>
          <Route path="change-password" element={<ChangePasswordPage />} />
          <Route path="my-profile" element={<MyProfilePage />} />
          <Route path="libraries/units" element={<UnitsPage />} />
          <Route path="libraries/departments" element={<DepartmentsPage />} />
          <Route path="libraries/suppliers" element={<SuppliersPage />} />
          <Route path="libraries/brands" element={<BrandsPage />} />
          <Route path="libraries/categories" element={<CategoriesPage />} />
          <Route path="libraries/generic-names" element={<GenericNamesPage />} />
          <Route path="libraries/fund-clusters" element={<FundClustersPage />} />
          <Route path="libraries/divisions" element={<DivisionsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </>
  )
);

export default router;
