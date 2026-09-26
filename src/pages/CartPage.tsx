import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShoppingBag,
  Building2,
  Home,
  MapPin,
  User,
  Phone,
  MessageSquare,
  PackageCheck,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { CartItemRow } from "@/components/CartItemRow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { useStore } from "@/context/StoreContext";

// Algerian Wilayas list
const ALGERIAN_WILAYAS = [
  "01 - Adrar",
  "02 - Chlef",
  "03 - Laghouat",
  "04 - Oum El Bouaghi",
  "05 - Batna",
  "06 - Béjaïa",
  "07 - Biskra",
  "08 - Béchar",
  "09 - Blida",
  "10 - Bouira",
  "11 - Tamanrasset",
  "12 - Tébessa",
  "13 - Tlemcen",
  "14 - Tiaret",
  "15 - Tizi Ouzou",
  "16 - Alger (Algiers)",
  "17 - Djelfa",
  "18 - Jijel",
  "19 - Sétif",
  "20 - Saïda",
  "21 - Skikda",
  "22 - Sidi Bel Abbès",
  "23 - Annaba",
  "24 - Guelma",
  "25 - Constantine",
  "26 - Médéa",
  "27 - Mostaganem",
  "28 - M'Sila",
  "29 - Mascara",
  "30 - Ouargla",
  "31 - Oran",
  "32 - El Bayadh",
  "33 - Illizi",
  "34 - Bordj Bou Arréridj",
  "35 - Boumerdès",
  "36 - El Tarf",
  "37 - Tindouf",
  "38 - Tissemsilt",
  "39 - El Oued",
  "40 - Khenchela",
  "41 - Souk Ahras",
  "42 - Tipaza",
  "43 - Mila",
  "44 - Aïn Defla",
  "45 - Naâma",
  "46 - Aïn Témouchent",
  "47 - Ghardaïa",
  "48 - Relizane",
  "49 - El M'Ghair",
  "50 - El Meniaa",
  "51 - Ouled Djellal",
  "52 - Bordj Baji Mokhtar",
  "53 - Béni Abbès",
  "54 - Timimoun",
  "55 - Touggourt",
  "56 - Djanet",
  "57 - In Salah",
  "58 - In Guezzam",
];

// Delivery pricing templates
const OFFICE_DELIVERY_PRICE = 15;
const HOME_DELIVERY_PRICE = 25;

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { createOrder } = useStore();

  // Workflow Step State (1: Bag, 2: Form, 3: Summary)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [commune, setCommune] = useState("");
  const [deliveryType, setDeliveryType] = useState<"home" | "office">("home");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Order Complete State
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState("");

  // Calculate delivery fee dynamically based on selected delivery type
  const deliveryFee = deliveryType === "home" ? HOME_DELIVERY_PRICE : OFFICE_DELIVERY_PRICE;
  const grandTotal = subtotal + deliveryFee;

  // Validation before going to Step 3
  const handleValidateFormAndProceed = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";
    if (!phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^[0-9+() -]{7,20}$/.test(phoneNumber.trim())) {
      errors.phoneNumber = "Please enter a valid phone number";
    }

    if (!wilaya) {
      errors.wilaya = "Please select your Wilaya";
    }
    if (!commune.trim()) {
      errors.commune = "Please enter your Commune / City";
    }

    if (deliveryType === "home" && !deliveryAddress.trim()) {
      errors.deliveryAddress = "Street address is required for home delivery";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill in all required shipping fields");
      return;
    }

    setFormErrors({});
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final Order Submission in Step 3
  const handleFinalOrderSubmit = () => {
    if (items.length === 0) {
      toast.error("Your bag is empty");
      setStep(1);
      return;
    }

    // Create real order in shared store
    const created = createOrder({
      customer: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        wilaya,
        commune: commune.trim(),
        deliveryType,
        address: deliveryType === "home" ? deliveryAddress.trim() : undefined,
        notes: notes.trim() || undefined,
      },
      items: [...items],
      subtotal,
      shippingFee: deliveryFee,
      total: grandTotal,
      status: "confirmed",
    });

    setConfirmedOrderId(created.id);
    setOrderConfirmed(true);
    clearCart();

    toast.success("Order Placed Successfully", {
      description: `Order #${created.id} has been registered for atelier dispatch.`,
      duration: 4500,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Empty Bag state (when not just confirmed)
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
              <span>Explore Collections</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Order Confirmed Celebration Screen
  if (orderConfirmed) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="rounded-[28px] border border-[var(--hairline)] bg-[var(--paper)] p-8 sm:p-12 text-center space-y-6 shadow-xs">
          <div className="h-16 w-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <p className="text-caption text-[var(--mid-gray)] uppercase tracking-wider font-medium">
              Order Confirmed
            </p>
            <h1 className="text-heading text-[var(--ink)]">Thank You for Your Acquisition</h1>
            <p className="text-body text-[var(--mid-gray)] text-[14px] max-w-md mx-auto leading-relaxed">
              Order <span className="font-mono font-medium text-[var(--ink)]">#{confirmedOrderId}</span> has
              been submitted to our dispatch desk. Our concierge will contact you via phone prior to courier departure.
            </p>
          </div>

          <div className="rounded-[18px] bg-[var(--surface-alt)] p-4 text-left text-[13px] space-y-2 border border-[var(--hairline)]">
            <div className="flex items-center justify-between text-[var(--mid-gray)]">
              <span>Recipient</span>
              <span className="text-[var(--ink)] font-medium">{firstName} {lastName}</span>
            </div>
            <div className="flex items-center justify-between text-[var(--mid-gray)]">
              <span>Destination</span>
              <span className="text-[var(--ink)] font-medium">{commune}, {wilaya}</span>
            </div>
            <div className="flex items-center justify-between text-[var(--mid-gray)]">
              <span>Delivery Method</span>
              <span className="text-[var(--ink)] font-medium">
                {deliveryType === "home" ? "Direct Home Delivery" : "Office / Stop Desk Pickup"}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-[18px] px-8">
                Return to Atelier Storefront
              </Button>
            </Link>
            <Link to="/categories" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-[18px]">
                Browse Other Objects
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header and Back Link */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-caption text-[var(--mid-gray)] mb-1">
            <Link to="/" className="hover:text-[var(--ink)] transition-colors">
              Storefront
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-[var(--ink)] font-medium">Acquisition Workflow</span>
          </div>
          <h1 className="text-heading-lg text-[var(--ink)]">Checkout Bag</h1>
        </div>

        <Link to="/categories">
          <Button variant="ghost" size="sm" className="gap-1.5 text-[var(--mid-gray)] hover:text-[var(--ink)]">
            <ArrowLeft className="h-4 w-4" />
            <span>Continue Browsing</span>
          </Button>
        </Link>
      </div>

      {/* 3-Bar Interactive Step Timeline */}
      <nav aria-label="Checkout Progress" className="w-full space-y-2.5 pt-2">
        {/* Dedicated 3-Bar Track: 100% horizontally aligned across all screen sizes */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full items-center">
          <div
            onClick={() => setStep(1)}
            role="button"
            tabIndex={0}
            aria-label="Go to Bag Review"
            onKeyDown={(e) => e.key === "Enter" && setStep(1)}
            className={`h-1.5 sm:h-2 w-full rounded-full transition-all duration-300 cursor-pointer ${
              step >= 1 ? "bg-[var(--ink)]" : "bg-[var(--hairline)]"
            }`}
          />
          <div
            onClick={() => step > 1 && setStep(2)}
            role="button"
            tabIndex={step >= 2 ? 0 : -1}
            aria-label="Go to Shipping Details"
            onKeyDown={(e) => e.key === "Enter" && step > 1 && setStep(2)}
            className={`h-1.5 sm:h-2 w-full rounded-full transition-all duration-300 ${
              step >= 2 ? "bg-[var(--ink)] cursor-pointer" : "bg-[var(--hairline)] cursor-default"
            }`}
          />
          <div
            onClick={() => {
              if (firstName && lastName && phoneNumber && wilaya && commune) {
                setStep(3);
              }
            }}
            role="button"
            tabIndex={step >= 3 ? 0 : -1}
            aria-label="Go to Summary & Order"
            onKeyDown={(e) => {
              if (e.key === "Enter" && firstName && lastName && phoneNumber && wilaya && commune) {
                setStep(3);
              }
            }}
            className={`h-1.5 sm:h-2 w-full rounded-full transition-all duration-300 ${
              step >= 3 ? "bg-[var(--ink)] cursor-pointer" : "bg-[var(--hairline)] cursor-default"
            }`}
          />
        </div>

        {/* Labels Track: Perfectly synchronized with the 3 bars */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full items-start">
          {/* Step 1 Label */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-left w-full cursor-pointer focus:outline-hidden group"
          >
            <span
              className={`block text-[11px] sm:text-[12px] font-medium leading-tight transition-colors truncate ${
                step === 1 ? "text-[var(--ink)] font-semibold" : "text-[var(--mid-gray)]"
              }`}
            >
              <span className="sm:hidden">1. Bag</span>
              <span className="hidden sm:inline">01. Bag Review</span>
            </span>
            <span className="hidden md:block text-[10px] text-[var(--mid-gray)] font-mono mt-0.5">
              {items.reduce((acc, i) => acc + i.quantity, 0)} items
            </span>
          </button>

          {/* Step 2 Label */}
          <button
            type="button"
            onClick={() => step > 1 && setStep(2)}
            disabled={step < 2}
            className={`text-left w-full focus:outline-hidden group ${
              step >= 2 ? "cursor-pointer" : "cursor-default"
            }`}
          >
            <span
              className={`block text-[11px] sm:text-[12px] font-medium leading-tight transition-colors truncate ${
                step === 2 ? "text-[var(--ink)] font-semibold" : "text-[var(--mid-gray)]"
              }`}
            >
              <span className="sm:hidden">2. Shipping</span>
              <span className="hidden sm:inline">02. Shipping & Details</span>
            </span>
            <span className="hidden md:block text-[10px] text-[var(--mid-gray)] font-mono mt-0.5">
              Wilaya & Mode
            </span>
          </button>

          {/* Step 3 Label */}
          <button
            type="button"
            onClick={() => {
              if (firstName && lastName && phoneNumber && wilaya && commune) {
                setStep(3);
              }
            }}
            disabled={step < 3}
            className={`text-left w-full focus:outline-hidden group ${
              step >= 3 ? "cursor-pointer" : "cursor-default"
            }`}
          >
            <span
              className={`block text-[11px] sm:text-[12px] font-medium leading-tight transition-colors truncate ${
                step === 3 ? "text-[var(--ink)] font-semibold" : "text-[var(--mid-gray)]"
              }`}
            >
              <span className="sm:hidden">3. Summary</span>
              <span className="hidden sm:inline">03. Summary & Order</span>
            </span>
            <span className="hidden md:block text-[10px] text-[var(--mid-gray)] font-mono mt-0.5">
              Final Review
            </span>
          </button>
        </div>
      </nav>

      {/* STEP 1: Bag Container (View & Update Items) */}
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in-50 duration-300">
          <Card className="rounded-[24px]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-subheading font-medium">
                    Selected Objects ({items.reduce((acc, i) => acc + i.quantity, 0)})
                  </CardTitle>
                  <p className="text-caption text-[var(--mid-gray)] mt-0.5">
                    Review and adjust quantities or remove items prior to checkout dispatch.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-[var(--hairline)]">
                {items.map((item) => (
                  <CartItemRow key={item.id} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step 1 Bottom Action & Preliminary Price Card */}
          <div className="rounded-[24px] border border-[var(--hairline)] bg-[var(--paper)] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-body">
              <div>
                <span className="text-[13px] text-[var(--mid-gray)] block font-normal">
                  Items Subtotal
                </span>
                <span className="text-[24px] font-semibold tabular-nums text-[var(--ink)]">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <Button
                type="button"
                size="lg"
                onClick={() => {
                  setStep(2);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="rounded-[18px] px-8 gap-2 bg-[var(--ink)] hover:bg-[var(--ink-soft)] text-[var(--paper)] h-12 text-[15px]"
              >
                <span>Continue to Shipping Form</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Shipping Form Container */}
      {step === 2 && (
        <div className="space-y-8 animate-in fade-in-50 duration-300">
          <form onSubmit={handleValidateFormAndProceed}>
            <Card className="rounded-[24px]">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-subheading font-medium">
                      Recipient & Delivery Details
                    </CardTitle>
                    <p className="text-body text-[var(--mid-gray)] text-[13px] mt-0.5">
                      Provide recipient contact info, select your Wilaya, and choose your preferred delivery method.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStep(1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-[var(--mid-gray)] hover:text-[var(--ink)] gap-1 text-[13px]"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to Bag</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
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
                      <p className="text-[11px] text-[var(--ember)]">{formErrors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="e.g. Vestergaard"
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
                      <p className="text-[11px] text-[var(--ember)]">{formErrors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="phoneNumber">Phone Number (Required for Courier Dispatch) *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="e.g. 0550 12 34 56 or +213 550 12 34 56"
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
                    <p className="text-[11px] text-[var(--ember)]">{formErrors.phoneNumber}</p>
                  )}
                </div>

                {/* Wilaya & Commune Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="wilaya">Wilaya (Province) *</Label>
                    <Select
                      value={wilaya}
                      onValueChange={(val) => {
                        setWilaya(val);
                        if (formErrors.wilaya) {
                          setFormErrors((prev) => ({ ...prev, wilaya: "" }));
                        }
                      }}
                    >
                      <SelectTrigger id="wilaya" className={`h-11 ${formErrors.wilaya ? "border-[var(--ember)]" : ""}`}>
                        <SelectValue placeholder="Select your Wilaya" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {ALGERIAN_WILAYAS.map((w) => (
                          <SelectItem key={w} value={w}>
                            {w}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.wilaya && (
                      <p className="text-[11px] text-[var(--ember)]">{formErrors.wilaya}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="commune">Commune (City / District) *</Label>
                    <Input
                      id="commune"
                      type="text"
                      placeholder="e.g. Sidi M'Hamed, Hydra, Bab Ezzouar"
                      value={commune}
                      onChange={(e) => {
                        setCommune(e.target.value);
                        if (formErrors.commune) {
                          setFormErrors((prev) => ({ ...prev, commune: "" }));
                        }
                      }}
                      className={formErrors.commune ? "border-[var(--ember)]" : ""}
                    />
                    {formErrors.commune && (
                      <p className="text-[11px] text-[var(--ember)]">{formErrors.commune}</p>
                    )}
                  </div>
                </div>

                {/* Delivery Type Option Selector */}
                <div className="space-y-2.5 pt-2">
                  <Label>Delivery Type *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Home Delivery Card */}
                    <div
                      onClick={() => setDeliveryType("home")}
                      className={`p-4 rounded-[18px] border transition-all cursor-pointer space-y-1.5 ${
                        deliveryType === "home"
                          ? "border-[var(--ink)] bg-[var(--surface-alt)] shadow-xs"
                          : "border-[var(--hairline)] hover:border-[var(--mid-gray)]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-[var(--ink)]" />
                          <span className="text-[14px] font-medium text-[var(--ink)]">
                            Home Delivery
                          </span>
                        </div>
                        <span className="font-mono text-[13px] font-semibold text-[var(--ink)]">
                          {formatPrice(HOME_DELIVERY_PRICE)}
                        </span>
                      </div>
                      <p className="text-[12px] text-[var(--mid-gray)] leading-relaxed">
                        Hand-delivered directly to your residential or office address.
                      </p>
                    </div>

                    {/* Delivery to Office / Stop Desk Card */}
                    <div
                      onClick={() => setDeliveryType("office")}
                      className={`p-4 rounded-[18px] border transition-all cursor-pointer space-y-1.5 ${
                        deliveryType === "office"
                          ? "border-[var(--ink)] bg-[var(--surface-alt)] shadow-xs"
                          : "border-[var(--hairline)] hover:border-[var(--mid-gray)]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-[var(--ink)]" />
                          <span className="text-[14px] font-medium text-[var(--ink)]">
                            Delivery Office (Stop Desk)
                          </span>
                        </div>
                        <span className="font-mono text-[13px] font-semibold text-[var(--ink)]">
                          {formatPrice(OFFICE_DELIVERY_PRICE)}
                        </span>
                      </div>
                      <p className="text-[12px] text-[var(--mid-gray)] leading-relaxed">
                        Pickup package at the local courier office desk in your commune.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Conditional Address Label when Home Delivery is selected */}
                {deliveryType === "home" && (
                  <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
                    <Label htmlFor="deliveryAddress">Street Address & Residence Details *</Label>
                    <Input
                      id="deliveryAddress"
                      type="text"
                      placeholder="e.g. 14 Rue Didouche Mourad, Building B, 3rd Floor"
                      value={deliveryAddress}
                      onChange={(e) => {
                        setDeliveryAddress(e.target.value);
                        if (formErrors.deliveryAddress) {
                          setFormErrors((prev) => ({ ...prev, deliveryAddress: "" }));
                        }
                      }}
                      className={formErrors.deliveryAddress ? "border-[var(--ember)]" : ""}
                    />
                    {formErrors.deliveryAddress && (
                      <p className="text-[11px] text-[var(--ember)]">{formErrors.deliveryAddress}</p>
                    )}
                  </div>
                )}

                {/* More Details / Special Notes Label */}
                <div className="space-y-1.5 pt-1">
                  <Label htmlFor="notes">More Details / Delivery Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Nearby landmarks, preferred delivery times, or building entry code..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Step 2 Bottom Navigation */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep(1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full sm:w-auto rounded-[18px] gap-2 h-11"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous: Bag Review</span>
              </Button>

              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto rounded-[18px] px-8 gap-2 bg-[var(--ink)] hover:bg-[var(--ink-soft)] text-[var(--paper)] h-12 text-[15px]"
              >
                <span>Next: Review & Summary</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3: Summary Container (Items Summary, User Info Summary, Order Now) */}
      {step === 3 && (
        <div className="space-y-8 animate-in fade-in-50 duration-300">
          <Card className="rounded-[24px]">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-subheading font-medium">
                    Order Verification & Summary
                  </CardTitle>
                  <p className="text-body text-[var(--mid-gray)] text-[13px] mt-0.5">
                    Verify purchased pieces and recipient dispatch coordination before confirming.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStep(2);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-[var(--mid-gray)] hover:text-[var(--ink)] gap-1 text-[13px]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Edit Shipping Details</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* 1. Items List Summary with Images */}
              <div className="space-y-3">
                <p className="text-caption text-[var(--ink)] font-semibold">
                  Purchased Pieces ({items.reduce((acc, i) => acc + i.quantity, 0)})
                </p>
                <div className="rounded-[18px] border border-[var(--hairline)] divide-y divide-[var(--hairline)] overflow-hidden">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 flex items-center justify-between gap-4 bg-[var(--paper)] hover:bg-[var(--surface-alt)]/40 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-16 w-16 rounded-[12px] object-cover bg-[var(--canvas)] border border-[var(--hairline)] shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-[14px] font-medium text-[var(--ink)] truncate">
                            {item.product.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--mid-gray)] mt-0.5">
                            {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                            {item.selectedSize && item.selectedColor && <span>·</span>}
                            {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                            <span>·</span>
                            <span className="font-mono text-[var(--ink)] font-medium">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[14px] font-semibold tabular-nums text-[var(--ink)] block">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[11px] text-[var(--mid-gray)] block font-mono">
                            {formatPrice(item.price)} each
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. User & Delivery Information Summary Box */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-caption text-[var(--ink)] font-semibold">
                    Recipient & Dispatch Information
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(2);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-[12px] text-[var(--ink)] underline hover:opacity-80 cursor-pointer"
                  >
                    Edit details
                  </button>
                </div>

                <div className="rounded-[18px] bg-[var(--surface-alt)] border border-[var(--hairline)] p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-[var(--mid-gray)] font-medium block">
                      Recipient
                    </span>
                    <p className="font-medium text-[var(--ink)]">
                      {firstName} {lastName}
                    </p>
                    <p className="text-[var(--mid-gray)] font-mono">{phoneNumber}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-[var(--mid-gray)] font-medium block">
                      Delivery Location
                    </span>
                    <p className="font-medium text-[var(--ink)]">
                      {commune}, {wilaya}
                    </p>
                    {deliveryType === "home" ? (
                      <p className="text-[var(--mid-gray)]">{deliveryAddress}</p>
                    ) : (
                      <p className="text-[var(--mid-gray)] italic">
                        Pickup at courier delivery office (Stop Desk)
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2 pt-2 border-t border-[var(--hairline)] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {deliveryType === "home" ? (
                        <Home className="h-4 w-4 text-[var(--ink)]" />
                      ) : (
                        <Building2 className="h-4 w-4 text-[var(--ink)]" />
                      )}
                      <span className="font-medium text-[var(--ink)]">
                        {deliveryType === "home" ? "Home Delivery" : "Office Stop Desk Delivery"}
                      </span>
                    </div>
                    <span className="font-mono text-[13px] text-[var(--ink)] font-medium">
                      Fee: {formatPrice(deliveryFee)}
                    </span>
                  </div>

                  {notes && (
                    <div className="sm:col-span-2 pt-2 border-t border-[var(--hairline)] text-[12px]">
                      <span className="text-[var(--mid-gray)] font-medium">Special Notes: </span>
                      <span className="text-[var(--ink)] italic">&ldquo;{notes}&rdquo;</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Financial Summary Card */}
              <div className="rounded-[18px] border border-[var(--hairline)] p-5 space-y-2.5 bg-[var(--paper)]">
                <div className="flex items-center justify-between text-[14px] text-[var(--mid-gray)]">
                  <span>Items Subtotal</span>
                  <span className="text-[var(--ink)] font-medium tabular-nums">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[14px] text-[var(--mid-gray)]">
                  <span>
                    Delivery ({deliveryType === "home" ? "Home Delivery" : "Office Stop Desk"})
                  </span>
                  <span className="text-[var(--ink)] font-medium tabular-nums">
                    {formatPrice(deliveryFee)}
                  </span>
                </div>

                <Separator className="my-2" />

                <div className="flex items-baseline justify-between text-[18px] font-semibold text-[var(--ink)] pt-1">
                  <span>Total Amount</span>
                  <span className="text-[26px] tabular-nums font-semibold">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Actions for Step 3: Previous and ORDER NOW */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStep(2);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-full sm:w-auto rounded-[18px] gap-2 h-11"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous: Edit Details</span>
            </Button>

            <Button
              type="button"
              size="lg"
              onClick={handleFinalOrderSubmit}
              className="w-full sm:w-auto rounded-[18px] px-10 gap-2.5 bg-[var(--ink)] hover:bg-[var(--ink-soft)] text-[var(--paper)] h-12 text-[15px] font-medium shadow-xs"
            >
              <PackageCheck className="h-4 w-4" />
              <span>Order Now · {formatPrice(grandTotal)}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
