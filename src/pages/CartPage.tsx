import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShoppingBag,
  Building2,
  Home,
  PackageCheck,
  AlertCircle,
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
import { ALGERIAN_WILAYAS } from "@/lib/data";
import { formatWilaya } from "@/i18n/wilayas";
import { supabase } from "@/lib/supabase";
import { StoreDeliverySettings } from "@/types";

export const CartPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { createOrder, storeSettings, updateStoreDelivery } = useStore();

  // Delivery Configuration fetched from Supabase store table
  const [deliveryLoading, setDeliveryLoading] = useState(true);
  const [deliveryConfig, setDeliveryConfig] = useState<StoreDeliverySettings>({
    deliveryEnabled: storeSettings.delivery.deliveryEnabled,
    officeFee: storeSettings.delivery.officeFee,
    homeFee: storeSettings.delivery.homeFee,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchDeliveryInfo = async () => {
      try {
        const { data, error } = await supabase
          .from("store")
          .select("delivery_service, office_fee, home_fee")
          .order("id", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (!isMounted) return;

        if (error) {
          console.error("Failed to fetch delivery information from Supabase:", error);
        } else if (data) {
          const config: StoreDeliverySettings = {
            deliveryEnabled: typeof data.delivery_service === "boolean" ? data.delivery_service : false,
            officeFee: typeof data.office_fee === "number" ? data.office_fee : 0,
            homeFee: typeof data.home_fee === "number" ? data.home_fee : 0,
          };
          setDeliveryConfig(config);
          updateStoreDelivery(config);
        }
      } catch (err) {
        console.error("Error fetching delivery info from Supabase:", err);
      } finally {
        if (isMounted) {
          setDeliveryLoading(false);
        }
      }
    };

    void fetchDeliveryInfo();

    return () => {
      isMounted = false;
    };
  }, [updateStoreDelivery]);

  // Keep in sync with storeSettings if modified elsewhere
  useEffect(() => {
    if (!deliveryLoading) {
      setDeliveryConfig(storeSettings.delivery);
    }
  }, [storeSettings.delivery, deliveryLoading]);

  // Pull delivery config (live from DB)
  const deliveryEnabled = deliveryConfig.deliveryEnabled;
  const HOME_DELIVERY_PRICE = deliveryConfig.homeFee;
  const OFFICE_DELIVERY_PRICE = deliveryConfig.officeFee;

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
  const deliveryFee = !deliveryEnabled
    ? 0
    : deliveryType === "home"
    ? HOME_DELIVERY_PRICE
    : OFFICE_DELIVERY_PRICE;
  const grandTotal = subtotal + deliveryFee;

  // Validation before going to Step 3
  const handleValidateFormAndProceed = (e: React.FormEvent) => {
    e.preventDefault();

    if (!deliveryEnabled) {
      toast.error(t("cart.deliveryServiceDisabled"));
      return;
    }

    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = t("common.required");
    if (!lastName.trim()) errors.lastName = t("common.required");
    if (!phoneNumber.trim()) {
      errors.phoneNumber = t("common.required");
    } else if (!/^[0-9+() -]{7,20}$/.test(phoneNumber.trim())) {
      errors.phoneNumber = "Please enter a valid phone number";
    }

    if (!wilaya) {
      errors.wilaya = t("common.required");
    }
    if (!commune.trim()) {
      errors.commune = t("common.required");
    }

    if (deliveryType === "home" && !deliveryAddress.trim()) {
      errors.deliveryAddress = t("common.required");
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error(t("cart.fillRequiredShipping"));
      return;
    }

    setFormErrors({});
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final Order Submission in Step 3
  const handleFinalOrderSubmit = () => {
    if (!deliveryEnabled) {
      toast.error(t("cart.deliveryServiceDisabled"));
      return;
    }

    if (items.length === 0) {
      toast.error(t("cart.emptyTitle"));
      setStep(1);
      return;
    }

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

    toast.success(t("cart.orderConfirmedTitle"), {
      description: t("cart.orderRegisteredDesc", { id: created.id }),
      duration: 4500,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Empty Bag state
  if (items.length === 0 && !orderConfirmed) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="h-16 w-16 mx-auto rounded-full bg-[var(--surface-alt)] border border-[var(--hairline)] flex items-center justify-center text-[var(--mid-gray)]">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-heading text-[var(--ink)]">{t("cart.emptyTitle")}</h1>
          <p className="text-body text-[var(--mid-gray)] max-w-sm mx-auto">
            {t("cart.emptyDesc")}
          </p>
        </div>
        <div>
          <Link to="/categories">
            <Button size="lg" className="rounded-[18px] gap-2 px-8 cursor-pointer">
              <span>{t("cart.exploreButton")}</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Order Confirmed Screen
  if (orderConfirmed) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="rounded-[28px] border border-[var(--hairline)] bg-[var(--paper)] p-8 sm:p-12 text-center space-y-6 shadow-xs">
          <div className="h-16 w-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <p className="text-caption text-[var(--mid-gray)] uppercase tracking-wider font-medium">
              {t("cart.orderConfirmedTitle")}
            </p>
            <h1 className="text-heading text-[var(--ink)]">{t("cart.orderConfirmedSubtitle")}</h1>
            <p className="text-body text-[var(--mid-gray)] text-[14px] max-w-md mx-auto leading-relaxed">
              {t("cart.orderRefNumber")}: <span className="font-mono font-medium text-[var(--ink)]">#{confirmedOrderId}</span>. {t("cart.orderNotice")}
            </p>
          </div>

          <div className="rounded-[18px] bg-[var(--surface-alt)] p-4 text-start text-[13px] space-y-2 border border-[var(--hairline)]">
            <div className="flex items-center justify-between text-[var(--mid-gray)]">
              <span>{t("cart.recipient")}</span>
              <span className="text-[var(--ink)] font-medium">{firstName} {lastName}</span>
            </div>
            <div className="flex items-center justify-between text-[var(--mid-gray)]">
              <span>{t("cart.destination")}</span>
              <span className="text-[var(--ink)] font-medium">{commune}, {wilaya}</span>
            </div>
            <div className="flex items-center justify-between text-[var(--mid-gray)]">
              <span>{t("cart.method")}</span>
              <span className="text-[var(--ink)] font-medium">
                {deliveryType === "home" ? t("cart.homeDelivery") : t("cart.officeDelivery")}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-[18px] px-8 cursor-pointer">
                {t("nav.home")}
              </Button>
            </Link>
            <Link to="/categories" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-[18px] cursor-pointer">
                {t("cart.continueShopping")}
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
              {t("categories.breadcrumbsHome")}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-[var(--ink)] font-medium">{t("cart.title")}</span>
          </div>
          <h1 className="text-heading-lg text-[var(--ink)]">{t("cart.title")}</h1>
        </div>

        <Link to="/categories">
          <Button variant="ghost" size="sm" className="gap-1.5 text-[var(--mid-gray)] hover:text-[var(--ink)] cursor-pointer">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            <span>{t("cart.continueShopping")}</span>
          </Button>
        </Link>
      </div>

      {/* 3-Bar Interactive Step Timeline */}
      <nav aria-label="Checkout Progress" className="w-full space-y-2.5 pt-2">
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

        {/* Labels Track */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full items-start">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-start w-full cursor-pointer focus:outline-hidden group"
          >
            <span
              className={`block text-[11px] sm:text-[12px] font-medium leading-tight transition-colors truncate ${
                step === 1 ? "text-[var(--ink)] font-semibold" : "text-[var(--mid-gray)]"
              }`}
            >
              {t("cart.step1")}
            </span>
            <span className="hidden md:block text-[10px] text-[var(--mid-gray)] font-mono mt-0.5">
              {items.reduce((acc, i) => acc + i.quantity, 0)} {t("cart.itemsOrdered")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => step > 1 && setStep(2)}
            disabled={step < 2}
            className={`text-start w-full focus:outline-hidden group ${
              step >= 2 ? "cursor-pointer" : "cursor-default"
            }`}
          >
            <span
              className={`block text-[11px] sm:text-[12px] font-medium leading-tight transition-colors truncate ${
                step === 2 ? "text-[var(--ink)] font-semibold" : "text-[var(--mid-gray)]"
              }`}
            >
              {t("cart.step2")}
            </span>
            <span className="hidden md:block text-[10px] text-[var(--mid-gray)] font-mono mt-0.5">
              {t("cart.wilaya")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (firstName && lastName && phoneNumber && wilaya && commune) {
                setStep(3);
              }
            }}
            disabled={step < 3}
            className={`text-start w-full focus:outline-hidden group ${
              step >= 3 ? "cursor-pointer" : "cursor-default"
            }`}
          >
            <span
              className={`block text-[11px] sm:text-[12px] font-medium leading-tight transition-colors truncate ${
                step === 3 ? "text-[var(--ink)] font-semibold" : "text-[var(--mid-gray)]"
              }`}
            >
              {t("cart.step3")}
            </span>
            <span className="hidden md:block text-[10px] text-[var(--mid-gray)] font-mono mt-0.5">
              {t("cart.reviewOrder")}
            </span>
          </button>
        </div>
      </nav>

      {/* STEP 1: Bag Container */}
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in-50 duration-300">
          <Card className="rounded-[24px]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-subheading font-medium">
                    {t("cart.itemsOrdered")} ({items.reduce((acc, i) => acc + i.quantity, 0)})
                  </CardTitle>
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

          {/* Step 1 Bottom Action */}
          <div className="rounded-[24px] border border-[var(--hairline)] bg-[var(--paper)] p-6 space-y-4">
            {!deliveryLoading && !deliveryEnabled && (
              <div className="rounded-[18px] border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/25 p-4 flex items-start gap-3 text-amber-900 dark:text-amber-200 text-[13px]">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold block">
                    {t("cart.deliveryServiceDisabled")}
                  </span>
                  <span className="text-[12px] text-amber-800/80 dark:text-amber-300/80 block">
                    {t("cart.deliveryServiceDisabledDesc")}
                  </span>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-body">
              <div>
                <span className="text-[13px] text-[var(--mid-gray)] block font-normal">
                  {t("common.subtotal")}
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
                className="rounded-[18px] px-8 gap-2 bg-[var(--ink)] hover:bg-[var(--ink-soft)] text-[var(--paper)] h-12 text-[15px] cursor-pointer"
              >
                <span>{t("cart.proceedToShipping")}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
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
                      {t("cart.shippingDetailsTitle")}
                    </CardTitle>
                    <p className="text-body text-[var(--mid-gray)] text-[13px] mt-0.5">
                      {t("cart.shippingDetailsSubtitle")}
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
                    className="text-[var(--mid-gray)] hover:text-[var(--ink)] gap-1 text-[13px] cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                    <span>{t("cart.backToBag")}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">{t("cart.firstName")} *</Label>
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
                    <Label htmlFor="lastName">{t("cart.lastName")} *</Label>
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
                  <Label htmlFor="phoneNumber">{t("cart.phoneNumber")} *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder={t("cart.phonePlaceholder")}
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
                    <Label htmlFor="wilaya">{t("cart.wilaya")} *</Label>
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
                        <SelectValue placeholder={t("cart.selectWilaya")}>
                          {wilaya ? formatWilaya(wilaya, i18n.language) : t("cart.selectWilaya")}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {ALGERIAN_WILAYAS.map((w) => (
                          <SelectItem key={w} value={w}>
                            {formatWilaya(w, i18n.language)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.wilaya && (
                      <p className="text-[11px] text-[var(--ember)]">{formErrors.wilaya}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="commune">{t("cart.commune")} *</Label>
                    <Input
                      id="commune"
                      type="text"
                      placeholder={t("cart.communePlaceholder")}
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
                  <div className="flex items-center justify-between">
                    <Label>{t("cart.deliveryTypeLabel")} *</Label>
                    {!deliveryLoading && !deliveryEnabled && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                        {t("cart.serviceDisabled")}
                      </span>
                    )}
                  </div>

                  {deliveryLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="p-4 rounded-[18px] border border-[var(--hairline)] bg-[var(--surface-alt)]/50 animate-pulse space-y-2 h-[88px]" />
                      <div className="p-4 rounded-[18px] border border-[var(--hairline)] bg-[var(--surface-alt)]/50 animate-pulse space-y-2 h-[88px]" />
                    </div>
                  ) : !deliveryEnabled ? (
                    <div className="space-y-3.5">
                      <div className="rounded-[18px] border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/25 p-4 sm:p-5 flex items-start gap-3.5 text-amber-900 dark:text-amber-200">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-[14px] font-semibold text-amber-900 dark:text-amber-100">
                            {t("cart.deliveryServiceDisabled")}
                          </p>
                          <p className="text-[13px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                            {t("cart.deliveryServiceDisabledDesc")}
                          </p>
                        </div>
                      </div>

                      {/* Delivery pricing preview cards (muted/disabled with accurate prices from Supabase) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 opacity-60 pointer-events-none select-none">
                        <div className="p-4 rounded-[18px] border border-[var(--hairline)] bg-[var(--surface-alt)]/40 space-y-1.5 cursor-not-allowed">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Home className="h-4 w-4 text-[var(--mid-gray)]" />
                              <span className="text-[14px] font-medium text-[var(--mid-gray)]">
                                {t("cart.homeDelivery")}
                              </span>
                            </div>
                            <span className="font-mono text-[13px] font-semibold text-[var(--mid-gray)]">
                              {formatPrice(HOME_DELIVERY_PRICE)}
                            </span>
                          </div>
                          <p className="text-[12px] text-[var(--mid-gray)] leading-relaxed">
                            {t("cart.homeDeliveryDesc")}
                          </p>
                        </div>

                        <div className="p-4 rounded-[18px] border border-[var(--hairline)] bg-[var(--surface-alt)]/40 space-y-1.5 cursor-not-allowed">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-[var(--mid-gray)]" />
                              <span className="text-[14px] font-medium text-[var(--mid-gray)]">
                                {t("cart.officeDelivery")}
                              </span>
                            </div>
                            <span className="font-mono text-[13px] font-semibold text-[var(--mid-gray)]">
                              {formatPrice(OFFICE_DELIVERY_PRICE)}
                            </span>
                          </div>
                          <p className="text-[12px] text-[var(--mid-gray)] leading-relaxed">
                            {t("cart.officeDeliveryDesc")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
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
                              {t("cart.homeDelivery")}
                            </span>
                          </div>
                          <span className="font-mono text-[13px] font-semibold text-[var(--ink)]">
                            {formatPrice(HOME_DELIVERY_PRICE)}
                          </span>
                        </div>
                        <p className="text-[12px] text-[var(--mid-gray)] leading-relaxed">
                          {t("cart.homeDeliveryDesc")}
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
                              {t("cart.officeDelivery")}
                            </span>
                          </div>
                          <span className="font-mono text-[13px] font-semibold text-[var(--ink)]">
                            {formatPrice(OFFICE_DELIVERY_PRICE)}
                          </span>
                        </div>
                        <p className="text-[12px] text-[var(--mid-gray)] leading-relaxed">
                          {t("cart.officeDeliveryDesc")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Street Address */}
                {deliveryType === "home" && (
                  <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
                    <Label htmlFor="deliveryAddress">{t("cart.streetAddress")} *</Label>
                    <Input
                      id="deliveryAddress"
                      type="text"
                      placeholder={t("cart.streetAddressPlaceholder")}
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

                {/* Order Notes */}
                <div className="space-y-1.5 pt-1">
                  <Label htmlFor="notes">{t("cart.orderNotes")}</Label>
                  <Textarea
                    id="notes"
                    placeholder={t("cart.orderNotesPlaceholder")}
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
                className="w-full sm:w-auto rounded-[18px] gap-2 h-11 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                <span>{t("cart.backToBag")}</span>
              </Button>

              <Button
                type="submit"
                size="lg"
                disabled={!deliveryEnabled || deliveryLoading}
                className="w-full sm:w-auto rounded-[18px] px-8 gap-2 bg-[var(--ink)] hover:bg-[var(--ink-soft)] text-[var(--paper)] h-12 text-[15px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>
                  {!deliveryEnabled
                    ? t("cart.deliveryServiceDisabled")
                    : t("cart.reviewOrder")}
                </span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3: Summary Container */}
      {step === 3 && (
        <div className="space-y-8 animate-in fade-in-50 duration-300">
          <Card className="rounded-[24px]">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-subheading font-medium">
                    {t("cart.confirmationTitle")}
                  </CardTitle>
                  <p className="text-body text-[var(--mid-gray)] text-[13px] mt-0.5">
                    {t("cart.confirmationSubtitle")}
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
                  className="text-[var(--mid-gray)] hover:text-[var(--ink)] gap-1 text-[13px] cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                  <span>{t("cart.step2")}</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Items List Summary */}
              <div className="space-y-3">
                <p className="text-caption text-[var(--ink)] font-semibold">
                  {t("cart.itemsOrdered")} ({items.reduce((acc, i) => acc + i.quantity, 0)})
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
                            {item.selectedSize && <span>{item.selectedSize}</span>}
                            {item.selectedSize && item.selectedColor && <span>·</span>}
                            {item.selectedColor && <span>{item.selectedColor}</span>}
                            <span>·</span>
                            <span className="font-mono text-[var(--ink)] font-medium">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-end shrink-0">
                        <span className="text-[14px] font-semibold tabular-nums text-[var(--ink)] block">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[11px] text-[var(--mid-gray)] block font-mono">
                            {formatPrice(item.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User & Delivery Information Summary Box */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-caption text-[var(--ink)] font-semibold">
                    {t("cart.shippingDetailsTitle")}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(2);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-[12px] text-[var(--ink)] underline hover:opacity-80 cursor-pointer"
                  >
                    {t("common.edit")}
                  </button>
                </div>

                <div className="rounded-[18px] bg-[var(--surface-alt)] border border-[var(--hairline)] p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-[var(--mid-gray)] font-medium block">
                      {t("cart.recipient")}
                    </span>
                    <p className="font-medium text-[var(--ink)]">
                      {firstName} {lastName}
                    </p>
                    <p className="text-[var(--mid-gray)] font-mono">{phoneNumber}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-[var(--mid-gray)] font-medium block">
                      {t("cart.destination")}
                    </span>
                    <p className="font-medium text-[var(--ink)]">
                      {commune}, {formatWilaya(wilaya, i18n.language)}
                    </p>
                    {deliveryType === "home" ? (
                      <p className="text-[var(--mid-gray)]">{deliveryAddress}</p>
                    ) : (
                      <p className="text-[var(--mid-gray)] italic">
                        {t("cart.officeDeliveryDesc")}
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
                        {deliveryType === "home" ? t("cart.homeDelivery") : t("cart.officeDelivery")}
                      </span>
                    </div>
                    <span className="font-mono text-[13px] text-[var(--ink)] font-medium">
                      {t("common.shipping")}: {deliveryEnabled ? formatPrice(deliveryFee) : t("cart.serviceDisabled")}
                    </span>
                  </div>

                  {notes && (
                    <div className="sm:col-span-2 pt-2 border-t border-[var(--hairline)] text-[12px]">
                      <span className="text-[var(--mid-gray)] font-medium">{t("cart.orderNotes")}: </span>
                      <span className="text-[var(--ink)] italic">&ldquo;{notes}&rdquo;</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Summary Card */}
              <div className="rounded-[18px] border border-[var(--hairline)] p-5 space-y-2.5 bg-[var(--paper)]">
                <div className="flex items-center justify-between text-[14px] text-[var(--mid-gray)]">
                  <span>{t("common.subtotal")}</span>
                  <span className="text-[var(--ink)] font-medium tabular-nums">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[14px] text-[var(--mid-gray)]">
                  <span>
                    {t("common.shipping")} ({deliveryType === "home" ? t("cart.homeDelivery") : t("cart.officeDelivery")})
                  </span>
                  <span className="text-[var(--ink)] font-medium tabular-nums">
                    {deliveryEnabled ? formatPrice(deliveryFee) : t("cart.serviceDisabled")}
                  </span>
                </div>

                <Separator className="my-2" />

                <div className="flex items-baseline justify-between text-[18px] font-semibold text-[var(--ink)] pt-1">
                  <span>{t("cart.grandTotal")}</span>
                  <span className="text-[26px] tabular-nums font-semibold">
                    {formatPrice(grandTotal)}
                  </span>
                </div>

                <p className="text-[12px] text-[var(--mid-gray)] pt-1">
                  {t("cart.cashOnDeliveryNotice")}
                </p>
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
              className="w-full sm:w-auto rounded-[18px] gap-2 h-11 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              <span>{t("cart.step2")}</span>
            </Button>

            <Button
              type="button"
              size="lg"
              disabled={!deliveryEnabled}
              onClick={handleFinalOrderSubmit}
              className="w-full sm:w-auto rounded-[18px] px-10 gap-2.5 bg-[var(--ink)] hover:bg-[var(--ink-soft)] text-[var(--paper)] h-12 text-[15px] font-medium shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PackageCheck className="h-4 w-4" />
              <span>
                {!deliveryEnabled
                  ? t("cart.deliveryServiceDisabled")
                  : `${t("cart.placeOrderBtn")} · ${formatPrice(grandTotal)}`}
              </span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
