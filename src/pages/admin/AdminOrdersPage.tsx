import React, { useState, useMemo } from "react";
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

const STATUS_OPTIONS: { label: string; value: OrderStatus }[] = [
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
    if (newStatus === "cancelled") {
      toast.error("Order Cancelled", {
        description: `Order #${orderId} was updated to Cancelled.`,
      });
    } else {
      toast.success("Order Status Updated", {
        description: `Order #${orderId} marked as ${newStatus}.`,
      });
    }
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case "confirmed":
      case "delivered":
        return "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 font-medium";
      case "cancelled":
        return "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 font-medium";
      case "processing":
      case "pending":
        return "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 font-medium";
      case "shipped":
        return "bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800 font-medium";
      default:
        return "bg-[var(--surface-alt)] text-[var(--ink)] border-[var(--hairline)]";
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(d);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-heading text-[var(--ink)]">Client Orders</h1>
          <p className="text-body text-[var(--mid-gray)] text-[14px]">
            Manage client reservations, monitor dispatch status, and review customer notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-caption text-[var(--mid-gray)] tabular-nums bg-[var(--paper)] px-3 py-1.5 rounded-[14px] border border-[var(--hairline)]">
            Total Orders: {orders.length}
          </span>
        </div>
      </div>

      {/* Main Card with Filter Bar and Orders Table */}
      <Card className="rounded-[24px]">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mid-gray)]" />
              <Input
                type="search"
                placeholder="Search by customer name, phone, or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-[14px] rounded-[18px]"
              />
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-[170px] min-w-[170px] max-w-[170px] shrink-0">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[170px] h-10 text-[13px] rounded-[18px]">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent className="w-[170px]">
                    <SelectItem value="all">All Statuses</SelectItem>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(searchQuery || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  className="h-10 px-3 text-[12px] text-[var(--mid-gray)] rounded-[18px] gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="rounded-[18px] border border-[var(--hairline)] overflow-hidden bg-[var(--paper)]">
            {/* Desktop View: Full horizontal table with standard columns */}
            <div className="hidden md:block">
              <Table className="table-fixed w-full">
                <TableHeader className="bg-[var(--surface-alt)]">
                  <TableRow>
                    <TableHead className="w-[140px]">Order ID</TableHead>
                    <TableHead className="w-auto">Customer Name</TableHead>
                    <TableHead className="hidden lg:table-cell w-[140px]">Phone</TableHead>
                    <TableHead className="w-[110px] text-right">Total</TableHead>
                    <TableHead className="w-[130px]">Date</TableHead>
                    <TableHead className="w-[160px] text-left">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="cursor-pointer transition-colors hover:bg-[var(--surface-alt)]/50 group"
                      >
                        {/* Order ID */}
                        <TableCell className="font-mono text-[13px] font-medium text-[var(--ink)]">
                          <div className="flex items-center gap-1.5">
                            <span>{order.id}</span>
                            <Eye className="h-3.5 w-3.5 text-[var(--mid-gray)] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </TableCell>

                        {/* Customer Name */}
                        <TableCell className="font-medium text-[var(--ink)] truncate">
                          {order.customer.firstName} {order.customer.lastName}
                        </TableCell>

                        {/* Phone */}
                        <TableCell className="hidden lg:table-cell text-[var(--mid-gray)] tabular-nums text-[13px]">
                          {order.customer.phoneNumber}
                        </TableCell>

                        {/* Total */}
                        <TableCell className="text-right font-medium tabular-nums text-[var(--ink)]">
                          {formatPrice(order.total)}
                        </TableCell>

                        {/* Date */}
                        <TableCell className="text-[13px] text-[var(--mid-gray)]">
                          {formatDate(order.createdAt)}
                        </TableCell>

                        {/* Status Column: Inline Select Dropdown per row with strictly fixed width */}
                        <TableCell
                          className="w-[160px] text-left"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="w-[140px] min-w-[140px] max-w-[140px] shrink-0">
                            <Select
                              value={order.status}
                              onValueChange={(val) =>
                                handleStatusChange(order.id, val as OrderStatus)
                              }
                            >
                              <SelectTrigger className={`w-[140px] min-w-[140px] max-w-[140px] h-8 text-[12px] rounded-[14px] border truncate transition-colors ${getStatusBadgeClass(order.status)}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="w-[140px] min-w-[140px] max-w-[140px]">
                                {STATUS_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value} className="text-[12px]">
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-[var(--mid-gray)]">
                        No orders found matching the filter criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile / Small Screens: Spreading items inside each order row into clean, well-spaced lines */}
            <div className="md:hidden divide-y divide-[var(--hairline)]">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="p-4 space-y-3 cursor-pointer transition-colors hover:bg-[var(--surface-alt)]/50 active:bg-[var(--surface-alt)]"
                  >
                    {/* Line 1: Order ID Badge + Date + Quick Eye Icon */}
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

                    {/* Line 2: Customer Name + Phone Number */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[14px]">
                      <span className="font-medium text-[var(--ink)]">
                        {order.customer.firstName} {order.customer.lastName}
                      </span>
                      <span className="text-[13px] text-[var(--mid-gray)] tabular-nums">
                        {order.customer.phoneNumber}
                      </span>
                    </div>

                    {/* Line 3: Order Total + Inline Status Select dropdown with fixed container width */}
                    <div
                      className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[var(--hairline)]/60"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-[var(--mid-gray)] block font-medium">
                          Total
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
                          <SelectTrigger className={`w-[140px] min-w-[140px] max-w-[140px] h-9 text-[12px] rounded-[14px] border truncate transition-colors ${getStatusBadgeClass(order.status)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="w-[140px] min-w-[140px] max-w-[140px]">
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value} className="text-[12px]">
                                {opt.label}
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
                  No orders found matching the filter criteria.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Side Sheet showing Full Order Details */}
      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md p-6 overflow-y-auto space-y-6">
          {selectedOrder && (
            <>
              <SheetHeader className="text-left space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-caption text-[var(--mid-gray)]">Order Details</span>
                  <Badge variant="outline" className={`capitalize text-[11px] border ${getStatusBadgeClass(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                <SheetTitle className="text-heading-sm font-semibold tracking-tight">
                  {selectedOrder.id}
                </SheetTitle>
                <SheetDescription className="text-caption text-[var(--mid-gray)]">
                  Registered on {formatDate(selectedOrder.createdAt)}
                </SheetDescription>
              </SheetHeader>

              {/* Status Switcher in Sheet */}
              <div className="p-3.5 rounded-[16px] bg-[var(--surface-alt)] border border-[var(--hairline)] space-y-2">
                <label className="text-caption text-[var(--mid-gray)]">Update Order Status</label>
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
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Information */}
              <div className="space-y-3">
                <p className="text-caption text-[var(--ink)] font-semibold">Customer & Delivery</p>
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
                          {selectedOrder.customer.wilaya}
                        </p>
                        {selectedOrder.customer.deliveryType && (
                          <span className="text-[11px] text-[var(--mid-gray)] block">
                            Mode: {selectedOrder.customer.deliveryType === "home" ? "Direct Home Delivery" : "Office Stop Desk"}
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
                        <p className="text-caption text-[var(--mid-gray)] mb-0.5">Customer Comment</p>
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
                  Items Ordered ({selectedOrder.items.reduce((s, i) => s + i.quantity, 0)})
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

                      <div className="text-right text-[13px] font-medium tabular-nums text-[var(--ink)] shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Financials Breakdown */}
              <div className="space-y-2 pt-2 border-t border-[var(--hairline)] text-[13px]">
                <div className="flex justify-between text-[var(--mid-gray)]">
                  <span>Subtotal</span>
                  <span className="text-[var(--ink)] font-medium tabular-nums">
                    {formatPrice(selectedOrder.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[var(--mid-gray)]">
                  <span>Insured Delivery</span>
                  <span className="text-[var(--ink)] font-medium tabular-nums">
                    {selectedOrder.shippingFee === 0
                      ? "Complimentary"
                      : formatPrice(selectedOrder.shippingFee)}
                  </span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between text-[15px] font-semibold text-[var(--ink)] pt-1">
                  <span>Total</span>
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
