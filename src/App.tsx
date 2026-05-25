import { useState } from "react";
import {
  Factory,
  LayoutDashboard,
  LogOut,
  Menu,
  PackagePlus,
  Settings,
  SendToBack,
  X,
  type LucideIcon,
} from "lucide-react";
import { BrowserRouter, Link, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { LoginPage } from "@/components/auth/LoginPage";
import { PrivateRoute, PublicRoute } from "@/components/auth/RouteGuards";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { InventoryEntriesPage } from "@/components/dashboard/InventoryEntriesPage";
import { ProductionMaterialLogsPage } from "@/components/dashboard/ProductionMaterialLogsPage";
import { DispatchEntriesPage } from "@/components/departure/DispatchEntriesPage";
import { ProductDepartureForm } from "@/components/departure/ProductDepartureForm";
import { ManufacturingEntryForm } from "@/components/manufacturing/ManufacturingEntryForm";
import { ManufacturingEntriesPage } from "@/components/manufacturing/ManufacturingEntriesPage";
import { PurchaseEntryForm } from "@/components/purchase/PurchaseEntryForm";
import { PurchaseEntriesPage } from "@/components/purchase/PurchaseEntriesPage";
import { Button } from "@/components/ui/button";
import newLogo from "@/assets/new_logo.png";
import { AUTH_STORAGE_KEY } from "@/lib/auth";

const navItems: Array<{ icon: LucideIcon; label: string; path: string }> = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: PackagePlus, label: "Purchase Entry", path: "/purchase-entry" },
  { icon: Factory, label: "Production", path: "/manufacturing-entry" },
  { icon: SendToBack, label: "Dispatch", path: "/product-departure" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-semibold tracking-normal">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">This route is ready for the next screen.</p>
    </div>
  );
}

function Brand({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full px-2 py-2 ${className}`}>
      <div className="flex h-16 w-full items-center justify-center overflow-hidden rounded-md border border-red-100 bg-white px-2 py-2 shadow-sm">
        <img alt="Kamdhenu Adhesive" className="h-full w-full object-contain" src={newLogo} />
      </div>
      <div className="mt-3 text-center">
        <p className="text-sm font-bold tracking-normal text-foreground">Kamdhenu Adhesive</p>
        <p className="mt-0.5 text-xs font-medium text-muted-foreground">Inventory Management</p>
      </div>
    </div>
  );
}

function SidebarNav({ onNavigate, onLogout }: { onNavigate?: () => void; onLogout: () => void }) {
  const location = useLocation();

  return (
    <div className="mt-4 flex h-full min-h-0 flex-col">
      <nav className="flex h-full min-h-0 flex-col gap-1">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;

          return (
            <Link
              className={`flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              key={label}
              onClick={onNavigate}
              to={path}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}


        <div className="mt-auto pt-6">
          <Button className="w-full justify-start gap-3" onClick={onLogout} type="button" variant="outline">
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </nav>
    </div>
  );
}

function AppShellLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isPurchasePage = location.pathname === "/purchase-entry";
  const isPurchaseEntriesPage = location.pathname === "/purchase-entries";
  const isInventoryEntriesPage = location.pathname === "/inventory-entries";
  const isProductionMaterialLogsPage = location.pathname === "/production-material-logs";
  const isManufacturingPage = location.pathname === "/manufacturing-entry";
  const isManufacturingEntriesPage = location.pathname === "/manufacturing-entries";
  const isDeparturePage = location.pathname === "/product-departure";
  const isDispatchEntriesPage = location.pathname === "/dispatch-entries";
  const pageTitle = isPurchasePage
    ? "Purchase Entry"
    : isPurchaseEntriesPage
      ? "Purchase Entries"
      : isInventoryEntriesPage
        ? "Inventory Entries"
        : isProductionMaterialLogsPage
          ? "Production Material Logs"
      : isManufacturingPage
        ? "Production Entry"
        : isManufacturingEntriesPage
          ? "Production Entries"
          : isDeparturePage
            ? "Product Dispatch"
            : isDispatchEntriesPage
              ? "Dispatch Entries"
              : "Dashboard";
  const handleLogout = () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setMobileSidebarOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.12),_transparent_28rem),linear-gradient(180deg,_#f8fafc_0%,_#eef4f5_100%)]">
      <div className="flex w-full items-start gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <aside className="hidden w-64 shrink-0 rounded-lg border bg-card p-4 shadow-soft lg:sticky lg:top-5 lg:flex lg:h-[calc(100vh-2.5rem)] lg:flex-col">
          <Brand />
          <SidebarNav onLogout={handleLogout} />
        </aside>

        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ease-out lg:hidden ${mobileSidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
        >
          <button
            aria-label="Close sidebar"
            className="absolute inset-0 bg-slate-950/45"
            onClick={() => setMobileSidebarOpen(false)}
            type="button"
          />
          <aside
            className={`relative h-full w-72 max-w-[85vw] border-r bg-card p-4 shadow-soft transition-transform duration-300 ease-out ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
          >
            <div className="flex items-start justify-between gap-3">
              <Brand className="min-w-0 flex-1 px-0 py-0" />
              <Button
                aria-label="Close sidebar"
                className="mt-1 shrink-0"
                onClick={() => setMobileSidebarOpen(false)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <X />
              </Button>
            </div>

            <hr className="mt-4 border-muted" />
            <SidebarNav onNavigate={() => setMobileSidebarOpen(false)} onLogout={handleLogout} />
          </aside>
        </div>

        <section className="min-w-0 flex-1">
          <header className="flex flex-col gap-4 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Button
                aria-label="Open sidebar"
                className="mt-1 lg:hidden"
                onClick={() => setMobileSidebarOpen(true)}
                size="icon"
                type="button"
                variant="outline"
              >
                <Menu />
              </Button>
              <div>
                <h1 className="mt-1 text-3xl font-bold tracking-normal text-foreground">{pageTitle}</h1>
              </div>
            </div>
          </header>


          <Outlet />
        </section>
      </div>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route element={<LoginPage />} path="/login" />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route element={<AppShellLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/inventory-entries" element={<InventoryEntriesPage />} />
            <Route path="/production-material-logs" element={<ProductionMaterialLogsPage />} />
            <Route path="/purchase-entry" element={<PurchaseEntryForm />} />
            <Route path="/purchase-entries" element={<PurchaseEntriesPage />} />
            <Route path="/manufacturing-entry" element={<ManufacturingEntryForm />} />
            <Route path="/manufacturing-entries" element={<ManufacturingEntriesPage />} />
            <Route path="/product-departure" element={<ProductDepartureForm />} />
            <Route path="/dispatch-entries" element={<DispatchEntriesPage />} />
            <Route path="/orders" element={<PlaceholderPage title="Orders" />} />
            <Route path="/suppliers" element={<PlaceholderPage title="Suppliers" />} />
            <Route path="/sheets" element={<PlaceholderPage title="Sheets" />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
