import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DollarSign,
  ShoppingBag,
  Boxes,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Eye,
  Clock,
  Truck,
  Building2,
  Home,
  CheckCircle2,
  Package,
  Layers,
  Calendar,
  ArrowUpRight,
  Check,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, products, categories } = useStore();

  // 1. Calculations: Revenue, Orders, Products
  const validOrders = orders.filter((o) => o.status !== "cancelled");
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const totalProductsCount = products.length;

  const confirmedOrShippedCount = orders.filter(
    (o) => o.status === "confirmed" || o.status === "processing" || o.status === "shipped"
  ).length;

  const averageOrderValue =
    validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;

  // 2. Low Stock Alerts (products or variants with stock <= 5 or 0)
  interface LowStockItem {
    id: string;
    productId: string;
    productName: string;
    image: string;
    variantName?: string;
    stock: number;
    isAvailable: boolean;
  }

  const lowStockItems: LowStockItem[] = [];

  products.forEach((product) => {
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((v) => {
        if (v.stock <= 5 || !v.isAvailable) {
          lowStockItems.push({
            id: `${product.id}-${v.id}`,
            productId: product.id,
            productName: product.name,
            image: product.images[0] || "",
            variantName: `${v.size} / ${v.color}`,
            stock: v.stock,
            isAvailable: v.isAvailable,
          });
        }
      });
    } else {
      if (product.stock <= 5 || !product.isAvailable) {
        lowStockItems.push({
          id: product.id,
          productId: product.id,
          productName: product.name,
          image: product.images[0] || "",
          stock: product.stock,
          isAvailable: product.isAvailable,
        });
      }
    }
  });

  // 3. Recent 5 Orders
  const recentOrders = [...orders]
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  // 4. Order Status Distribution
  const statusCounts: Record<string, number> = {
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  // 5. Delivery Mode Breakdown (Algerian Logistics)
  const homeDeliveryOrders = orders.filter(
    (o) => o.customer.deliveryType === "home" || !o.customer.deliveryType
  );
  const officeDeliveryOrders = orders.filter(
    (o) => o.customer.deliveryType === "office"
  );
  const homeRatio =
    orders.length > 0
      ? Math.round((homeDeliveryOrders.length / orders.length) * 100)
      : 50;

  // Helper badge for order status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 font-medium">
            Confirmed
          </Badge>
        );
      case "delivered":
        return (
          <Badge className="bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 font-medium">
            Delivered
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 font-medium">
            Cancelled
          </Badge>
        );
      case "shipped":
        return (
          <Badge className="bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800 font-medium">
            Shipped
          </Badge>
        );
      case "processing":
      default:
        return (
          <Badge className="bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 font-medium">
            Processing
          </Badge>
        );
    }
  };

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Top Welcome & Atelier Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--hairline)]">
        <div>
          <div className="flex items-center gap-2 text-caption text-[var(--mid-gray)] mb-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{currentDateFormatted}</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
              Storefront Live
            </span>
          </div>
          <h1 className="text-heading text-[var(--ink)]">Atelier Dashboard</h1>
          <p className="text-body text-[var(--mid-gray)] text-[13px] mt-0.5">
            Operational telemetry, real-time client orders, revenue metrics, and inventory health.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/admin/products">
            <Button
              variant="outline"
              size="sm"
              className="rounded-[16px] text-[13px] gap-1.5 border-[var(--hairline)]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Product</span>
            </Button>
          </Link>

          <Link to="/admin/orders">
            <Button
              variant="outline"
              size="sm"
              className="rounded-[16px] text-[13px] gap-1.5 border-[var(--hairline)]"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>All Orders</span>
            </Button>
          </Link>

          <Link to="/" target="_blank" rel="noreferrer">
            <Button
              size="sm"
              className="rounded-[16px] text-[13px] gap-1.5 bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--ink-soft)]"
            >
              <span>Visit Store</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards: Revenue, Orders, Products, AOV */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="rounded-[20px] p-5 border-[var(--hairline)] bg-[var(--paper)]">
          <div className="flex items-center justify-between text-[var(--mid-gray)] mb-3">
            <span className="text-[12px] font-medium uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-[28px] font-semibold text-[var(--ink)] tabular-nums tracking-tight">
              {formatPrice(totalRevenue)}
            </h2>
            <p className="text-[12px] text-[var(--mid-gray)] flex items-center gap-1.5">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {validOrders.length} settled
              </span>
              <span>across all client sales</span>
            </p>
          </div>
        </Card>

        {/* Total Orders */}
        <Card className="rounded-[20px] p-5 border-[var(--hairline)] bg-[var(--paper)]">
          <div className="flex items-center justify-between text-[var(--mid-gray)] mb-3">
            <span className="text-[12px] font-medium uppercase tracking-wider">
              Total Orders
            </span>
            <div className="h-8 w-8 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-[28px] font-semibold text-[var(--ink)] tabular-nums tracking-tight">
              {totalOrdersCount}
            </h2>
            <p className="text-[12px] text-[var(--mid-gray)] flex items-center gap-1.5">
              <span className="text-sky-600 dark:text-sky-400 font-medium">
                {confirmedOrShippedCount} active
              </span>
              <span>orders in courier queue</span>
            </p>
          </div>
        </Card>

        {/* Number of Products */}
        <Card className="rounded-[20px] p-5 border-[var(--hairline)] bg-[var(--paper)]">
          <div className="flex items-center justify-between text-[var(--mid-gray)] mb-3">
            <span className="text-[12px] font-medium uppercase tracking-wider">
              Catalog Objects
            </span>
            <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-[28px] font-semibold text-[var(--ink)] tabular-nums tracking-tight">
              {totalProductsCount}
            </h2>
            <p className="text-[12px] text-[var(--mid-gray)] flex items-center gap-1.5">
              <span className="text-[var(--ink)] font-medium">
                {categories.length} categories
              </span>
              <span>curated in atelier</span>
            </p>
          </div>
        </Card>

        {/* Average Order Value (AOV) */}
        <Card className="rounded-[20px] p-5 border-[var(--hairline)] bg-[var(--paper)]">
          <div className="flex items-center justify-between text-[var(--mid-gray)] mb-3">
            <span className="text-[12px] font-medium uppercase tracking-wider">
              Avg Order Value
            </span>
            <div className="h-8 w-8 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-[28px] font-semibold text-[var(--ink)] tabular-nums tracking-tight">
              {formatPrice(averageOrderValue)}
            </h2>
            <p className="text-[12px] text-[var(--mid-gray)] flex items-center gap-1.5">
              <span>Healthy basket size per buyer</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Main 2-Column Section: Recent Orders (left) & Low Stock + Logistics (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Recent Orders with "View All" */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="rounded-[24px] border-[var(--hairline)] bg-[var(--paper)] overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-[var(--hairline)] flex flex-row items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-subheading font-medium text-[var(--ink)]">
                  Recent Orders
                </CardTitle>
                <p className="text-caption text-[var(--mid-gray)] mt-0.5">
                  Latest client acquisitions received from the storefront checkout workflow.
                </p>
              </div>

              <Link to="/admin/orders">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-[16px] text-[13px] gap-1.5 text-[var(--ink)] hover:text-[var(--ink)]"
                >
                  <span>View All Orders ({orders.length})</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              {recentOrders.length === 0 ? (
                <div className="p-12 text-center text-[var(--mid-gray)] space-y-2">
                  <ShoppingBag className="h-8 w-8 mx-auto opacity-40" />
                  <p className="text-[14px]">No orders recorded yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--hairline)]">
                  {recentOrders.map((order) => {
                    const itemCount = order.items.reduce(
                      (acc, i) => acc + i.quantity,
                      0
                    );
                    const formattedDate = new Date(order.createdAt).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                    );

                    return (
                      <div
                        key={order.id}
                        onClick={() => navigate("/admin/orders")}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--surface-alt)]/50 transition-colors cursor-pointer group"
                      >
                        {/* Order identifier & Customer */}
                        <div className="flex items-start gap-3.5">
                          <div className="h-10 w-10 rounded-[12px] bg-[var(--surface-alt)] border border-[var(--hairline)] flex items-center justify-center shrink-0 text-[var(--ink)]">
                            {order.customer.deliveryType === "office" ? (
                              <Building2 className="h-4 w-4" />
                            ) : (
                              <Home className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[13px] font-semibold text-[var(--ink)]">
                                #{order.id}
                              </span>
                              <span className="text-[var(--hairline)]">·</span>
                              <span className="text-[14px] font-medium text-[var(--ink)]">
                                {order.customer.firstName} {order.customer.lastName}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--mid-gray)] mt-0.5">
                              <span>
                                {order.customer.commune ? `${order.customer.commune}, ` : ""}
                                {order.customer.wilaya || "Algiers"}
                              </span>
                              <span>·</span>
                              <span>
                                {order.customer.deliveryType === "office"
                                  ? "Stop Desk"
                                  : "Home Delivery"}
                              </span>
                              <span>·</span>
                              <span>{formattedDate}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status, Item Count & Price */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-13 sm:pl-0">
                          <div className="text-right">
                            <span className="text-[15px] font-semibold text-[var(--ink)] tabular-nums block">
                              {formatPrice(order.total)}
                            </span>
                            <span className="text-[11px] text-[var(--mid-gray)] block">
                              {itemCount} {itemCount === 1 ? "item" : "items"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {getStatusBadge(order.status)}
                            <ChevronRight className="h-4 w-4 text-[var(--mid-gray)] group-hover:text-[var(--ink)] group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Order Status Distribution Bar */}
          <Card className="rounded-[24px] border-[var(--hairline)] bg-[var(--paper)] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-medium text-[var(--ink)]">
                  Fulfillment Status Breakdown
                </h3>
                <p className="text-[12px] text-[var(--mid-gray)]">
                  Overview of current delivery states across all registered orders.
                </p>
              </div>
              <span className="text-[12px] font-mono text-[var(--mid-gray)]">
                {orders.length} total
              </span>
            </div>

            {/* Segmented Progress Track */}
            <div className="h-3 w-full rounded-full bg-[var(--surface-alt)] overflow-hidden flex">
              {orders.length > 0 ? (
                <>
                  <div
                    style={{
                      width: `${(statusCounts.confirmed / orders.length) * 100}%`,
                    }}
                    className="bg-emerald-500 h-full transition-all"
                    title={`Confirmed: ${statusCounts.confirmed}`}
                  />
                  <div
                    style={{
                      width: `${(statusCounts.processing / orders.length) * 100}%`,
                    }}
                    className="bg-amber-500 h-full transition-all"
                    title={`Processing: ${statusCounts.processing}`}
                  />
                  <div
                    style={{
                      width: `${(statusCounts.shipped / orders.length) * 100}%`,
                    }}
                    className="bg-sky-500 h-full transition-all"
                    title={`Shipped: ${statusCounts.shipped}`}
                  />
                  <div
                    style={{
                      width: `${(statusCounts.delivered / orders.length) * 100}%`,
                    }}
                    className="bg-indigo-500 h-full transition-all"
                    title={`Delivered: ${statusCounts.delivered}`}
                  />
                  <div
                    style={{
                      width: `${(statusCounts.cancelled / orders.length) * 100}%`,
                    }}
                    className="bg-rose-500 h-full transition-all"
                    title={`Cancelled: ${statusCounts.cancelled}`}
                  />
                </>
              ) : (
                <div className="w-full bg-[var(--hairline)]" />
              )}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-[12px]">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[var(--mid-gray)]">Confirmed:</span>
                <span className="font-semibold text-[var(--ink)]">{statusCounts.confirmed}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-[var(--mid-gray)]">Processing:</span>
                <span className="font-semibold text-[var(--ink)]">{statusCounts.processing}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-500 shrink-0" />
                <span className="text-[var(--mid-gray)]">Shipped:</span>
                <span className="font-semibold text-[var(--ink)]">{statusCounts.shipped}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 shrink-0" />
                <span className="text-[var(--mid-gray)]">Delivered:</span>
                <span className="font-semibold text-[var(--ink)]">{statusCounts.delivered}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0" />
                <span className="text-[var(--mid-gray)]">Cancelled:</span>
                <span className="font-semibold text-[var(--ink)]">{statusCounts.cancelled}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (4 cols): Low Stock Alerts & Logistics Boxes */}
        <div className="lg:col-span-4 space-y-6">
          {/* Low Stock Alerts Box */}
          <Card className="rounded-[24px] border-[var(--hairline)] bg-[var(--paper)] overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b border-[var(--hairline)] flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-3.5 w-3.5" />
                </div>
                <div>
                  <CardTitle className="text-[15px] font-medium text-[var(--ink)]">
                    Low Stock Alerts
                  </CardTitle>
                  <p className="text-[11px] text-[var(--mid-gray)]">
                    Items requiring atelier replenishment (≤ 5 units).
                  </p>
                </div>
              </div>

              <Link to="/admin/products">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[12px] h-7 px-2 text-[var(--ink)] hover:text-[var(--ink)]"
                >
                  Manage
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              {lowStockItems.length === 0 ? (
                <div className="p-6 text-center text-[var(--mid-gray)] space-y-2">
                  <CheckCircle2 className="h-6 w-6 mx-auto text-emerald-500" />
                  <p className="text-[13px] font-medium text-[var(--ink)]">
                    All Inventory Healthy
                  </p>
                  <p className="text-[11px]">All objects have 6+ pieces in reserve.</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--hairline)] max-h-[340px] overflow-y-auto">
                  {lowStockItems.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigate("/admin/products")}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-[var(--surface-alt)]/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="h-10 w-10 rounded-[10px] object-cover bg-[var(--surface-alt)] border border-[var(--hairline)] shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-[10px] bg-[var(--surface-alt)] flex items-center justify-center shrink-0 text-[var(--mid-gray)]">
                            <Package className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-[13px] font-medium text-[var(--ink)] truncate group-hover:underline">
                            {item.productName}
                          </h4>
                          {item.variantName && (
                            <p className="text-[11px] text-[var(--mid-gray)] truncate">
                              {item.variantName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {item.stock === 0 ? (
                          <Badge
                            variant="destructive"
                            className="text-[10px] px-2 py-0.5 rounded-full"
                          >
                            Out of stock
                          </Badge>
                        ) : (
                          <span className="text-[12px] font-mono font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                            {item.stock} left
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logistics & Delivery Distribution Box */}
          <Card className="rounded-[24px] border-[var(--hairline)] bg-[var(--paper)] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-[var(--ink)]" />
                <h3 className="text-[14px] font-medium text-[var(--ink)]">
                  Logistics Distribution
                </h3>
              </div>
              <span className="text-[11px] text-[var(--mid-gray)] font-mono">
                {orders.length} dispatches
              </span>
            </div>

            <div className="space-y-3 text-[13px]">
              {/* Home Delivery */}
              <div className="p-3 rounded-[16px] bg-[var(--surface-alt)] border border-[var(--hairline)] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Home className="h-4 w-4 text-[var(--mid-gray)]" />
                  <div>
                    <p className="font-medium text-[var(--ink)]">Direct Home Delivery</p>
                    <p className="text-[11px] text-[var(--mid-gray)]">$25 template fee</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold font-mono text-[var(--ink)]">
                    {homeDeliveryOrders.length}
                  </span>
                  <span className="text-[11px] text-[var(--mid-gray)] block font-mono">
                    ({homeRatio}%)
                  </span>
                </div>
              </div>

              {/* Office Delivery */}
              <div className="p-3 rounded-[16px] bg-[var(--surface-alt)] border border-[var(--hairline)] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-4 w-4 text-[var(--mid-gray)]" />
                  <div>
                    <p className="font-medium text-[var(--ink)]">Office Desk (Stop Desk)</p>
                    <p className="text-[11px] text-[var(--mid-gray)]">$15 template fee</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold font-mono text-[var(--ink)]">
                    {officeDeliveryOrders.length}
                  </span>
                  <span className="text-[11px] text-[var(--mid-gray)] block font-mono">
                    ({100 - homeRatio}%)
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Categories Overview Box */}
          <Card className="rounded-[24px] border-[var(--hairline)] bg-[var(--paper)] p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[var(--ink)]" />
                <h3 className="text-[14px] font-medium text-[var(--ink)]">
                  Active Categories
                </h3>
              </div>
              <span className="text-[11px] text-[var(--mid-gray)] font-mono">
                {categories.length} total
              </span>
            </div>

            <div className="space-y-2">
              {categories.slice(0, 4).map((cat) => {
                const count = products.filter((p) => p.categorySlug === cat.slug).length;
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between text-[12px] py-1 border-b border-[var(--hairline)] last:border-0"
                  >
                    <span className="text-[var(--ink)] font-medium truncate max-w-[180px]">
                      {cat.name}
                    </span>
                    <span className="font-mono text-[var(--mid-gray)]">
                      {count} {count === 1 ? "item" : "items"}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
