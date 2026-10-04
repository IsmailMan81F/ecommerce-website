import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
  ExternalLink,
  FolderTree,
  Package,
  ShoppingBag,
  Users,
  Clock3,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { getStoreVisitorStats } from "@/lib/visitorStats";
import { Card, CardContent } from "@/components/ui/card";

export const AdminDashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { orders, products, categories } = useStore();
  const visitorStats = getStoreVisitorStats();
  const now = new Date();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const ordersLastMonth = orders.filter((order) => {
    const createdAt = new Date(order.createdAt);
    return createdAt >= lastMonthStart && createdAt < thisMonthStart;
  }).length;
  const pendingOrders = orders.filter((order) => order.status === "pending").length;
  const numberFormat = new Intl.NumberFormat(
    i18n.language === "ar" ? "ar-DZ" : i18n.language === "fr" ? "fr-FR" : "en-US"
  );

  const metrics = [
    { label: t("admin.visitorsToday"), value: visitorStats.today, icon: Users },
    { label: t("admin.visitorsLastMonth"), value: visitorStats.lastMonth, icon: Users },
    { label: t("admin.ordersLastMonth"), value: ordersLastMonth, icon: ShoppingBag },
    { label: t("admin.pendingOrders"), value: pendingOrders, icon: Clock3 },
    { label: t("admin.totalProducts"), value: products.length, icon: Package },
    { label: t("admin.totalCategories"), value: categories.length, icon: FolderTree },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 border-b border-[var(--hairline)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-heading font-semibold text-[var(--ink)]">
            {t("admin.dashboardTitle")}
          </h1>
          <p className="mt-1 text-body text-[var(--mid-gray)]">
            {t("admin.dashboardSubtitle")}
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 w-fit items-center gap-2 rounded-[14px] bg-[var(--ink)] px-4 text-[13px] font-medium text-[var(--paper)] transition-opacity hover:opacity-90"
        >
          <span>{t("admin.openStorefront")}</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </header>

      <section aria-label={t("admin.dashboardMetrics")}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map(({ label, value, icon: Icon }) => (
            <Card key={label} className="rounded-[18px] border-[var(--hairline)] bg-[var(--paper)]">
              <CardContent className="flex items-start justify-between gap-4 p-5">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[var(--mid-gray)]">{label}</p>
                  <p className="mt-3 text-[30px] font-semibold leading-none tabular-nums text-[var(--ink)]">
                    {numberFormat.format(value)}
                  </p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[var(--hairline)] bg-[var(--surface-alt)] text-[var(--ink)]">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-subheading font-medium text-[var(--ink)]">
          {t("admin.quickLinks")}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            to="/admin/products"
            className="group flex min-h-16 items-center justify-between gap-4 rounded-[16px] border border-[var(--hairline)] bg-[var(--paper)] px-4 py-3 transition-colors hover:bg-[var(--surface-alt)]"
          >
            <span className="flex min-w-0 items-center gap-3">
              <Package className="h-4 w-4 shrink-0 text-[var(--mid-gray)]" />
              <span className="min-w-0">
                <span className="block text-[14px] font-medium text-[var(--ink)]">
                  {t("admin.products")}
                </span>
                <span className="block text-[12px] text-[var(--mid-gray)]">
                  {t("admin.viewAllProducts")}
                </span>
              </span>
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--mid-gray)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>

          <Link
            to="/admin/categories"
            className="group flex min-h-16 items-center justify-between gap-4 rounded-[16px] border border-[var(--hairline)] bg-[var(--paper)] px-4 py-3 transition-colors hover:bg-[var(--surface-alt)]"
          >
            <span className="flex min-w-0 items-center gap-3">
              <FolderTree className="h-4 w-4 shrink-0 text-[var(--mid-gray)]" />
              <span className="min-w-0">
                <span className="block text-[14px] font-medium text-[var(--ink)]">
                  {t("admin.categories")}
                </span>
                <span className="block text-[12px] text-[var(--mid-gray)]">
                  {t("admin.visitCategories")}
                </span>
              </span>
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--mid-gray)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <p className="border-t border-[var(--hairline)] pt-4 text-[12px] text-[var(--mid-gray)]">
        {t("admin.visitorStatsNotice")}
      </p>
    </div>
  );
};