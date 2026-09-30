import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@/context/StoreContext";
import { Order, OrderStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Calendar, User, Phone, MapPin, MessageSquare, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatWilaya } from "@/i18n/wilayas";
import { lockViewportScroll } from "@/lib/scrollLock";

export const AdminOrdersPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { orders, updateOrderStatus } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Lock background screen scroll when view order details modal is open on mobile
  React.useEffect(() => {
    if (selectedOrder) {
      return lockViewportScroll();
    }
  }, [selectedOrder]);

  const statusOptions: { label: string; value: OrderStatus }[] = useMemo(
    () => [
      { label: t("admin.statusPending"), value: "pending" },
      { label: t("admin.statusConfirmed"), value: "confirmed" },
      { label: t("admin.statusProcessing"), value: "processing" },
      { label: t("admin.statusShipped"), value: "shipped" },
      { label: t("admin.statusDelivered"), value: "delivered" },
      { label: t("admin.statusCancelled"), value: "cancelled" },
    ],
    [t]
  );

  // Filter orders by search and status
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
      }

      // Search query (customer name, phone, order ID)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const fullName = `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase();
        const idMatch = order.id.toLowerCase().includes(query);
        const nameMatch = fullName.includes(query);
        const phoneMatch = order.customer.phoneNumber.toLowerCase().includes(query);
        if (!idMatch && !nameMatch && !phoneMatch) {
          return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    toast.success(t("admin.changeStatusSuccess"), {
      description: `Order #${orderId} -> ${newStatus}.`,
    });
  };

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case "confirmed":
        return {
          label: t("admin.statusConfirmed"),
          badgeClass: "bg-white text-zinc-900 border-zinc-200/90 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 font-medium",
        };
      case "delivered":
        return {
          label: t("admin.statusDelivered"),
          badgeClass: "bg-white text-zinc-900 border-zinc-200/90 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60 font-medium",
        };
      case "processing":
        return {
          label: t("admin.statusProcessing"),
          badgeClass: "bg-white text-zinc-900 border-zinc-200/90 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60 font-medium",
        };
      case "shipped":
        return {
          label: t("admin.statusShipped"),
          badgeClass: "bg-white text-zinc-900 border-zinc-200/90 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/60 font-medium",
        };
      case "pending":
        return {
          label: t("admin.statusPending"),
          badgeClass: "bg-white text-zinc-900 border-zinc-200/90 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 font-medium",
        };
      case "cancelled":
        return {
          label: t("admin.statusCancelled"),
          badgeClass: "bg-white text-zinc-900 border-zinc-200/90 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60 font-medium",
        };
      default:
        return {
          label: status,
          badgeClass: "bg-white text-zinc-900 border-zinc-200 font-medium dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-800",
        };
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(i18n.language === "ar" ? "ar-DZ" : i18n.language === "fr" ? "fr-FR" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-heading font-semibold text-[var(--ink)] tracking-tight">
            {t("admin.orderManagement")}
          </h1>
          <p className="text-body text-[var(--mid-gray)] mt-0.5">
            {t("admin.storeSettingsSubtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[13px] px-3 py-1 font-mono">
            {orders.length} {t("admin.orders")}
          </Badge>
        </div>
      </div>

      {/* Filter / Search Bar Card */}
      <Card className="rounded-[24px]">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mid-gray)]" />
              <Input
                type="search"
                placeholder={t("admin.searchOrders")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-10 pe-4 h-10 rounded-[16px] text-[13px]"
              />
            </div>

            {/* Status Filter Dropdown */}
            <div className="w-full sm:w-[180px] shrink-0">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 rounded-[16px] text-[13px]">
                  <SelectValue placeholder={t("admin.statusAll")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.statusAll")}</SelectItem>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reset Filters button */}
            {(searchQuery || statusFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="gap-1.5 text-[12px] text-[var(--mid-gray)] hover:text-[var(--ink)] cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{t("common.reset")}</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders Table Container Card */}
      <Card className="rounded-[24px] overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pb-2">
          <CardTitle className="text-subheading font-medium">
            {t("admin.orders")} ({filteredOrders.length})
          </CardTitle>
          <CardDescription className="text-caption text-[var(--mid-gray)]">
            Click on any order row to inspect parcel tracking details and change statuses.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--hairline)] hover:bg-transparent">
                    <TableHead className="w-[120px] text-caption">{t("admin.orderId")}</TableHead>
                    <TableHead className="text-caption">{t("admin.customer")}</TableHead>
                    <TableHead className="text-caption">{t("admin.date")}</TableHead>
                    <TableHead className="text-caption">{t("admin.itemsCount")}</TableHead>
                    <TableHead className="text-caption">{t("common.total")}</TableHead>
                    <TableHead className="text-caption">{t("admin.statusLabel")}</TableHead>
                    <TableHead className="text-caption text-end">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="cursor-pointer transition-colors hover:bg-[var(--surface-alt)]/60"
                      >
                        <TableCell className="font-mono text-[12px] font-semibold text-[var(--ink)]">
                          {order.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-[var(--ink)] text-[14px]">
                              {order.customer.firstName} {order.customer.lastName}
                            </p>
                            <p className="text-[12px] text-[var(--mid-gray)] tabular-nums">
                              {order.customer.phoneNumber}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-[13px] text-[var(--mid-gray)] tabular-nums">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell className="text-[13px] text-[var(--ink)] tabular-nums">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} pcs
                        </TableCell>
                        <TableCell className="font-semibold text-[var(--ink)] tabular-nums text-[14px]">
                          {formatPrice(order.total)}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="w-[140px] min-w-[140px] max-w-[140px]">
                            <Select
                              value={order.status}
                              onValueChange={(val) =>
                                handleStatusChange(order.id, val as OrderStatus)
                              }
                            >
                              <SelectTrigger className={`w-[140px] min-w-[140px] max-w-[140px] h-8 text-[12px] rounded-[12px] border truncate transition-colors cursor-pointer px-3 ${getStatusConfig(order.status).badgeClass}`}>
                                <span className="truncate font-medium">{getStatusConfig(order.status).label}</span>
                              </SelectTrigger>
                              <SelectContent className="w-[140px] min-w-[140px] max-w-[140px]">
                                {statusOptions.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value} className="text-[12px] cursor-pointer">
                                    <span>{opt.label}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell className="text-end" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="iconSm"
                            onClick={() => setSelectedOrder(order)}
                            className="text-[var(--mid-gray)] hover:text-[var(--ink)] cursor-pointer"
                            aria-label={`View order ${order.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-[var(--mid-gray)] text-[14px]">
                        No orders found matching the filter criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile / Small Screens View */}
            <div className="md:hidden divide-y divide-[var(--hairline)]">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="p-4 space-y-3 cursor-pointer transition-colors hover:bg-[var(--surface-alt)]/50 active:bg-[var(--surface-alt)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[12px] font-semibold text-[var(--ink)] px-2.5 py-1 rounded-[10px] bg-[var(--surface-alt)] border border-[var(--hairline)]">
                          {order.id}
                        </span>
                        <Eye className="h-3.5 w-3.5 text-[var(--mid-gray)]" />
                      </div>
                      <span className="text-[12px] text-[var(--mid-gray)] tabular-nums">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[14px]">
                      <span className="font-medium text-[var(--ink)]">
                        {order.customer.firstName} {order.customer.lastName}
                      </span>
                      <span className="text-[13px] text-[var(--mid-gray)] tabular-nums">
                        {order.customer.phoneNumber}
                      </span>
                    </div>

                    <div
                      className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[var(--hairline)]/60"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-[var(--mid-gray)] block font-medium">
                          {t("common.total")}
                        </span>
                        <span className="text-[16px] font-semibold tabular-nums text-[var(--ink)]">
                          {formatPrice(order.total)}
                        </span>
                      </div>

                      <div className="w-[140px] min-w-[140px] max-w-[140px] shrink-0">
                        <Select
                          value={order.status}
                          onValueChange={(val) =>
                            handleStatusChange(order.id, val as OrderStatus)
                          }
                        >
                          <SelectTrigger className={`w-[140px] min-w-[140px] max-w-[140px] h-9 text-[12px] rounded-[14px] border truncate transition-colors px-3 ${getStatusConfig(order.status).badgeClass}`}>
                            <span className="truncate font-medium">{getStatusConfig(order.status).label}</span>
                          </SelectTrigger>
                          <SelectContent className="w-[140px] min-w-[140px] max-w-[140px]">
                            {statusOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value} className="text-[12px]">
                                <span>{opt.label}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-[var(--mid-gray)] text-[14px]">
                  {t("admin.noOrdersFound")}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Side Sheet showing Full Order Details: Side reversed for RTL */}
      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent side={isRtl ? "left" : "right"} className="w-full sm:max-w-md p-6 overflow-y-auto space-y-6">
          {selectedOrder && (
            <>
              <SheetHeader className="text-start space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-caption text-[var(--mid-gray)]">{t("admin.orderDetails")}</span>
                  <div className={`inline-flex items-center px-3 py-1 rounded-[10px] text-[12px] font-medium border ${getStatusConfig(selectedOrder.status).badgeClass}`}>
                    <span>{getStatusConfig(selectedOrder.status).label}</span>
                  </div>
                </div>
                <SheetTitle className="text-heading-sm font-semibold tracking-tight">
                  {selectedOrder.id}
                </SheetTitle>
                <SheetDescription className="text-caption text-[var(--mid-gray)]">
                  {formatDate(selectedOrder.createdAt)}
                </SheetDescription>
              </SheetHeader>

              {/* Status Switcher in Sheet */}
              <div className="p-3.5 rounded-[16px] bg-[var(--surface-alt)] border border-[var(--hairline)] space-y-2">
                <label className="text-caption text-[var(--mid-gray)]">{t("admin.updateStatus")}</label>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(val) => {
                    handleStatusChange(selectedOrder.id, val as OrderStatus);
                    setSelectedOrder({ ...selectedOrder, status: val as OrderStatus });
                  }}
                >
                  <SelectTrigger className="h-9 text-[13px] rounded-[14px] bg-[var(--paper)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Information */}
              <div className="space-y-3">
                <p className="text-caption text-[var(--ink)] font-semibold">{t("cart.shippingDetailsTitle")}</p>
                <div className="space-y-2.5 text-[13px] rounded-[18px] border border-[var(--hairline)] p-4 bg-[var(--surface-alt)]">
                  <div className="flex items-start gap-2.5">
                    <User className="h-4 w-4 text-[var(--mid-gray)] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[var(--ink)]">
                        {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Phone className="h-4 w-4 text-[var(--mid-gray)] shrink-0 mt-0.5" />
                    <p className="text-[var(--mid-gray)] tabular-nums">
                      {selectedOrder.customer.phoneNumber}
                    </p>
                  </div>

                  {(selectedOrder.customer.wilaya || selectedOrder.customer.commune) && (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="h-4 w-4 text-[var(--mid-gray)] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[var(--ink)] font-medium">
                          {selectedOrder.customer.commune ? `${selectedOrder.customer.commune}, ` : ""}
                          {formatWilaya(selectedOrder.customer.wilaya, i18n.language)}
                        </p>
                        {selectedOrder.customer.deliveryType && (
                          <span className="text-[11px] text-[var(--mid-gray)] block">
                            {t("common.shipping")}: {selectedOrder.customer.deliveryType === "home" ? t("cart.homeDelivery") : t("cart.officeDelivery")}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedOrder.customer.address && (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="h-4 w-4 text-[var(--mid-gray)] shrink-0 mt-0.5" />
                      <p className="text-[var(--mid-gray)]">
                        {selectedOrder.customer.address}
                      </p>
                    </div>
                  )}

                  {selectedOrder.customer.notes && (
                    <div className="flex items-start gap-2.5 pt-2 border-t border-[var(--hairline)]">
                      <MessageSquare className="h-4 w-4 text-[var(--mid-gray)] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-caption text-[var(--mid-gray)] mb-0.5">{t("cart.orderNotes")}</p>
                        <p className="text-[var(--ink)] italic text-[12px]">
                          &ldquo;{selectedOrder.customer.notes}&rdquo;
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ordered Items List */}
              <div className="space-y-3">
                <p className="text-caption text-[var(--ink)] font-semibold">
                  {t("cart.itemsOrdered")} ({selectedOrder.items.reduce((s, i) => s + i.quantity, 0)})
                </p>
                <div className="divide-y divide-[var(--hairline)] border border-[var(--hairline)] rounded-[18px] overflow-hidden bg-[var(--paper)]">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-12 w-12 rounded-[10px] object-cover bg-[var(--canvas)] border border-[var(--hairline)] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-[var(--ink)] truncate">
                            {item.product.name}
                          </p>
                          <p className="text-[11px] text-[var(--mid-gray)] truncate">
                            {item.selectedSize || "Standard"}
                            {item.selectedColor ? ` · ${item.selectedColor}` : ""}
                          </p>
                          <p className="text-[11px] text-[var(--mid-gray)] tabular-nums">
                            Qty: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>

                      <div className="text-end text-[13px] font-medium tabular-nums text-[var(--ink)] shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Financials Breakdown */}
              <div className="space-y-2 pt-2 border-t border-[var(--hairline)] text-[13px]">
                <div className="flex justify-between text-[var(--mid-gray)]">
                  <span>{t("common.subtotal")}</span>
                  <span className="text-[var(--ink)] font-medium tabular-nums">
                    {formatPrice(selectedOrder.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[var(--mid-gray)]">
                  <span>{t("common.shipping")}</span>
                  <span className="text-[var(--ink)] font-medium tabular-nums">
                    {selectedOrder.shippingFee === 0
                      ? t("common.free")
                      : formatPrice(selectedOrder.shippingFee)}
                  </span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between text-[15px] font-semibold text-[var(--ink)] pt-1">
                  <span>{t("common.total")}</span>
                  <span className="tabular-nums">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
