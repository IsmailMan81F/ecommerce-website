import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { CartItemRow } from "@/components/CartItemRow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useStore } from "@/context/StoreContext";

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, shippingFee, total, clearCart } = useCart();
  const { createOrder } = useStore();

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState("");

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";
    if (!phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^[0-9+() -]{7,20}$/.test(phoneNumber.trim())) {
      errors.phoneNumber = "Please enter a valid phone number";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please complete the required contact fields");
      return;
    }

    // Create real order in shared store
    const created = createOrder({
      customer: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        address: deliveryAddress.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      items: [...items],
      subtotal,
      shippingFee,
      total,
      status: "confirmed",
    });

    setConfirmedOrderId(created.id);
    setOrderConfirmed(true);

    toast.success("Order Placed Successfully", {
      description: `Order #${created.id} has been registered for atelier dispatch.`,
      duration: 4000,
    });
  };

  const handleFinishOrder = () => {
    clearCart();
    setOrderConfirmed(false);
    navigate("/");
  };

  if (items.length === 0 && !orderConfirmed) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="h-16 w-16 mx-auto rounded-full bg-[var(--surface-alt)] border border-[var(--hairline)] flex items-center justify-center text-[var(--mid-gray)]">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-heading text-[var(--ink)]">Your Bag is Empty</h1>
          <p className="text-body text-[var(--mid-gray)] max-w-sm mx-auto">
            You have not selected any design pieces yet. Explore our curated collections.
          </p>
        </div>
        <div>
          <Link to="/categories">
            <Button size="lg" className="rounded-[18px] gap-2 px-8">
              <span>Explore Collection</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Title & Back Link */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-caption text-[var(--mid-gray)] mb-1">
            <Link to="/" className="hover:text-[var(--ink)] transition-colors">
              Storefront
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-[var(--ink)] font-medium">Checkout Bag</span>
          </div>
          <h1 className="text-heading-lg text-[var(--ink)]">Shopping Bag</h1>
        </div>

        <Link to="/categories">
          <Button variant="ghost" size="sm" className="gap-1.5 text-[var(--mid-gray)] hover:text-[var(--ink)]">
            <ArrowLeft className="h-4 w-4" />
            <span>Continue Browsing</span>
          </Button>
        </Link>
      </div>

      {/* Cart Items Card */}
      <Card className="rounded-[24px]">
        <CardHeader className="pb-4">
          <CardTitle className="text-subheading font-medium">
            Order Items ({items.reduce((acc, i) => acc + i.quantity, 0)})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-[var(--hairline)]">
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>

          {/* Order Summary Sub-Block */}
          <div className="mt-6 pt-6 border-t border-[var(--hairline)] space-y-2.5">
            <div className="flex items-center justify-between text-body text-[var(--mid-gray)]">
              <span>Subtotal</span>
              <span className="text-[var(--ink)] font-medium tabular-nums">
                {formatPrice(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-body text-[var(--mid-gray)]">
              <span>Atelier Insured Delivery</span>
              <span className="text-[var(--ink)] font-medium tabular-nums">
                {shippingFee === 0 ? "Complimentary" : formatPrice(shippingFee)}
              </span>
            </div>
            {shippingFee > 0 && (
              <p className="text-[12px] text-[var(--mid-gray)]">
                Complimentary insured delivery applies automatically on orders over $500.
              </p>
            )}
            <Separator className="my-2" />
            <div className="flex items-baseline justify-between text-[18px] font-semibold text-[var(--ink)] pt-1">
              <span>Total</span>
              <span className="text-[22px] tabular-nums font-semibold">
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checkout Form Card */}
      <Card className="rounded-[24px]">
        <CardHeader>
          <CardTitle className="text-subheading font-medium">
            Dispatch Details & Verification
          </CardTitle>
          <p className="text-body text-[var(--mid-gray)] text-[13px]">
            Please enter your recipient contact information for direct dispatch coordination.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            {/* First Name + Last Name Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="e.g. Henrik"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (formErrors.firstName) {
                      setFormErrors((prev) => ({ ...prev, firstName: "" }));
                    }
                  }}
                  className={formErrors.firstName ? "border-[var(--ember)]" : ""}
                />
                {formErrors.firstName && (
                  <p className="text-[12px] text-[var(--ember)]">{formErrors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="e.g. Lindqvist"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (formErrors.lastName) {
                      setFormErrors((prev) => ({ ...prev, lastName: "" }));
                    }
                  }}
                  className={formErrors.lastName ? "border-[var(--ember)]" : ""}
                />
                {formErrors.lastName && (
                  <p className="text-[12px] text-[var(--ember)]">{formErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="e.g. +1 (555) 019-2834"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (formErrors.phoneNumber) {
                    setFormErrors((prev) => ({ ...prev, phoneNumber: "" }));
                  }
                }}
                className={formErrors.phoneNumber ? "border-[var(--ember)]" : ""}
              />
              {formErrors.phoneNumber && (
                <p className="text-[12px] text-[var(--ember)]">{formErrors.phoneNumber}</p>
              )}
            </div>

            {/* Delivery Address (Optional / Recommended) */}
            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">Destination Address (Optional)</Label>
              <Input
                id="deliveryAddress"
                type="text"
                placeholder="Street, City, Postal Code"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            </div>

            {/* Optional More Details Textarea */}
            <div className="space-y-2">
              <Label htmlFor="notes">More Details / Special Instructions (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Packaging requests, gate codes, or delivery timeframe notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Full-width "Order Now" Button */}
            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 rounded-[18px] bg-[var(--ink-soft)] hover:bg-[var(--ink)] text-[var(--paper)] text-[15px] font-medium"
              >
                Order Now · {formatPrice(total)}
              </Button>
              <p className="text-center text-[12px] text-[var(--mid-gray)] mt-3">
                By placing this order, you confirm delivery details. Payment will be arranged upon atelier verification.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Order Confirmation Dialog */}
      <Dialog open={orderConfirmed} onOpenChange={setOrderConfirmed}>
        <DialogContent className="sm:max-w-[500px] text-center p-8">
          <div className="h-16 w-16 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-xs">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <DialogHeader className="text-center sm:text-center mt-2">
            <DialogTitle className="text-heading-sm text-[var(--ink)]">
              Order Confirmed
            </DialogTitle>
            <DialogDescription className="text-body text-[var(--mid-gray)] pt-1">
              Thank you, {firstName}. Your reservation reference is{" "}
              <span className="font-semibold text-emerald-700 tabular-nums font-mono">
                {confirmedOrderId}
              </span>
              . Our concierge will contact you at {phoneNumber} with dispatch tracking.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 p-4 rounded-[18px] bg-[var(--surface-alt)] border border-[var(--hairline)] text-left text-[13px] space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[var(--mid-gray)]">Recipient:</span>
              <span className="font-medium text-[var(--ink)]">{firstName} {lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--mid-gray)]">Total Amount:</span>
              <span className="font-medium text-[var(--ink)] tabular-nums">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--mid-gray)]">Status:</span>
              <span className="font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-[8px] text-[12px]">
                Confirmed · Atelier Batch
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={handleFinishOrder}
              className="w-full rounded-[18px] bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              Back to Storefront
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
