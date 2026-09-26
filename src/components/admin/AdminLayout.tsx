import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Settings,
  Menu,
  X,
  Shield,
  CircleDot,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAdminTheme } from "@/context/AdminThemeContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AdminSettingsDialog } from "./AdminSettingsDialog";

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { username } = useAuth();
  const { theme, resolvedTheme, setTheme } = useAdminTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: ClipboardList,
      exact: false,
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: Package,
      exact: false,
    },
  ];

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <div className="min-h-screen flex bg-[var(--canvas)] text-[var(--ink)] transition-colors duration-200">
      {/* Mobile Top Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-[var(--surface-alt)] border-b border-[var(--hairline)] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-[18px] font-semibold tracking-tight text-[var(--ink)]">
            KØRD
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--mid-gray)] bg-[var(--canvas)] px-2 py-0.5 rounded-[12px] border border-[var(--hairline)]">
            Console
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Theme Cycle Button for Mobile */}
          <Button
            variant="ghost"
            size="iconSm"
            onClick={cycleTheme}
            title={`Current theme: ${theme} (${resolvedTheme}). Click to change.`}
            aria-label="Cycle theme"
            className="text-[var(--mid-gray)] hover:text-[var(--ink)]"
          >
            {theme === "light" && <Sun className="h-4 w-4" />}
            {theme === "dark" && <Moon className="h-4 w-4" />}
            {theme === "system" && <Laptop className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            aria-label="Toggle admin sidebar"
          >
            {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar: Fixed full height, surface-alt background, ~260px wide */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[260px] bg-[var(--surface-alt)] border-r border-[var(--hairline)] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top: Logo / Brand Mark */}
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2.5">
              <span className="text-[20px] font-semibold tracking-[-0.03em] text-[var(--ink)]">
                KØRD
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--mid-gray)] bg-[var(--paper)] px-2 py-0.5 rounded-[12px] border border-[var(--hairline)]">
                Console
              </span>
            </div>

            <div className="hidden lg:flex items-center text-[var(--mid-gray)]" title="System secure">
              <CircleDot className="h-3 w-3 text-emerald-500 fill-emerald-500" />
            </div>
          </div>

          {/* Navigation Items: Orders, Products */}
          <nav className="p-4 space-y-1.5">
            <p className="text-caption text-[var(--mid-gray)] px-3 py-1">
              Store Management
            </p>
            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[16px] text-[14px] font-medium transition-all ${
                    isActive
                      ? "bg-[var(--paper)] text-[var(--ink)] shadow-xs border border-[var(--hairline)]"
                      : "text-[var(--mid-gray)] hover:text-[var(--ink)] hover:bg-[var(--canvas)]/60"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-[var(--ink)]" : "text-[var(--mid-gray)]"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Area: User info + Theme Switcher + Pinned Settings Button */}
        <div className="p-4 space-y-2">
          <Separator className="mb-2" />

          {/* Quick Theme Selector in Sidebar */}
          <div className="px-3 py-1.5 flex items-center justify-between text-[12px] text-[var(--mid-gray)]">
            <span className="font-medium">Theme</span>
            <div className="flex items-center gap-0.5 bg-[var(--paper)] p-1 rounded-[12px] border border-[var(--hairline)]">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`p-1.5 rounded-[8px] transition-colors cursor-pointer ${
                  theme === "light"
                    ? "bg-[var(--surface-alt)] text-[var(--ink)] font-semibold shadow-2xs"
                    : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
                }`}
                title="Light mode"
                aria-label="Light mode"
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-1.5 rounded-[8px] transition-colors cursor-pointer ${
                  theme === "dark"
                    ? "bg-[var(--surface-alt)] text-[var(--ink)] font-semibold shadow-2xs"
                    : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
                }`}
                title="Dark mode"
                aria-label="Dark mode"
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`p-1.5 rounded-[8px] transition-colors cursor-pointer ${
                  theme === "system"
                    ? "bg-[var(--surface-alt)] text-[var(--ink)] font-semibold shadow-2xs"
                    : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
                }`}
                title="System preference"
                aria-label="System preference"
              >
                <Laptop className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Admin User Badge */}
          <div className="px-3 py-1 flex items-center justify-between text-[12px] text-[var(--mid-gray)]">
            <span className="truncate">Logged as <strong className="text-[var(--ink)]">{username}</strong></span>
            <Shield className="h-3.5 w-3.5 shrink-0 opacity-70" />
          </div>

          {/* Pinned Settings item triggering Dialog popup */}
          <button
            type="button"
            onClick={() => {
              setMobileSidebarOpen(false);
              setSettingsOpen(true);
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[16px] text-[14px] font-medium text-[var(--mid-gray)] hover:text-[var(--ink)] hover:bg-[var(--canvas)]/60 transition-colors cursor-pointer"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area: canvas background, offset by 260px on desktop */}
      <div className="flex-1 lg:pl-[260px] pt-16 lg:pt-0 flex flex-col min-h-screen">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Settings Dialog */}
      <AdminSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  );
};
