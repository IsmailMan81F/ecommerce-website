import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@/context/StoreContext";
import { toast } from "sonner";
import {
  MapPin,
  Clock,
  Share2,
  Truck,
  ExternalLink,
  Globe,
  Phone,
  Mail,
  Instagram,
  Facebook,
  MessageCircle,
  Palette,
  Plus,
  Ruler,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALGERIAN_WILAYAS } from "@/lib/data";
import { formatWilaya } from "@/i18n/wilayas";

export const AdminStorePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    storeSettings,
    updateStoreGeneral,
    updateStoreLocation,
    updateStoreHours,
    updateStoreSocial,
    updateStoreDelivery,
    updateStoreVariantOptions,
  } = useStore();

  // Local state initialized from storeSettings
  const [generalForm, setGeneralForm] = useState(storeSettings.general);
  const [locationForm, setLocationForm] = useState(storeSettings.location);
  const [hoursForm, setHoursForm] = useState(storeSettings.hours);
  const [socialForm, setSocialForm] = useState(storeSettings.social);
  const [deliveryForm, setDeliveryForm] = useState(storeSettings.delivery);
  const [newSize, setNewSize] = useState("");
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");

  // Sync if storeSettings change externally
  useEffect(() => {
    setGeneralForm(storeSettings.general);
    setLocationForm(storeSettings.location);
    setHoursForm(storeSettings.hours);
    setSocialForm(storeSettings.social);
    setDeliveryForm(storeSettings.delivery);
  }, [
    storeSettings.general,
    storeSettings.location,
    storeSettings.hours,
    storeSettings.social,
    storeSettings.delivery,
  ]);

  const handleAddSize = (e: React.FormEvent) => {
    e.preventDefault();
    const size = newSize.trim();
    if (!size) {
      toast.error(t("admin.variantSizeRequired"));
      return;
    }
    if (storeSettings.variantOptions.sizes.some((item) => item.toLowerCase() === size.toLowerCase())) {
      toast.error(t("admin.variantSizeExists"));
      return;
    }

    updateStoreVariantOptions({
      ...storeSettings.variantOptions,
      sizes: [...storeSettings.variantOptions.sizes, size],
    });
    setNewSize("");
    toast.success(t("admin.variantSizeAdded"));
  };

  const handleRemoveSize = (size: string) => {
    updateStoreVariantOptions({
      ...storeSettings.variantOptions,
      sizes: storeSettings.variantOptions.sizes.filter((item) => item !== size),
    });
    toast.success(t("admin.variantSizeRemoved"));
  };

  const handleAddColor = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newColorName.trim();
    if (!name) {
      toast.error(t("admin.variantColorRequired"));
      return;
    }
    if (storeSettings.variantOptions.colors.some((color) => color.name.toLowerCase() === name.toLowerCase())) {
      toast.error(t("admin.variantColorExists"));
      return;
    }

    updateStoreVariantOptions({
      ...storeSettings.variantOptions,
      colors: [...storeSettings.variantOptions.colors, { name, hex: newColorHex }],
    });
    setNewColorName("");
    setNewColorHex("#000000");
    toast.success(t("admin.variantColorAdded"));
  };

  const handleRemoveColor = (name: string) => {
    updateStoreVariantOptions({
      ...storeSettings.variantOptions,
      colors: storeSettings.variantOptions.colors.filter((color) => color.name !== name),
    });
    toast.success(t("admin.variantColorRemoved"));
  };

  // Save Handlers
  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreGeneral({
      email: generalForm.email,
      phone: generalForm.phone,
    });
    updateStoreLocation(locationForm);
    toast.success(t("admin.saveLocationSuccess"));
  };

  const handleSaveHours = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreHours(hoursForm);
    toast.success(t("admin.saveHoursSuccess"));
  };

  const handleSaveSocial = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSocial(socialForm);
    toast.success(t("admin.saveSocialSuccess"));
  };

  const handleSaveDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreDelivery(deliveryForm);
    toast.success(t("admin.saveDeliverySuccess"));
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-16 overflow-hidden min-w-0">
      {/* Page Title & Intro */}
      <div>
        <h1 className="text-heading-md font-semibold tracking-tight text-[var(--ink)]">
          {t("admin.storeSettingsTitle")}
        </h1>
        <p className="text-body text-[var(--mid-gray)] mt-1 text-[13px]">
          {t("admin.storeSettingsSubtitle")}
        </p>
      </div>

      {/* 1. Contact & Location Card */}
      <Card className="rounded-[24px] border border-[var(--hairline)] bg-[var(--paper)] overflow-hidden shadow-2xs w-full max-w-full">
        <CardHeader className="border-b border-[var(--hairline)] pb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[var(--surface-alt)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)]">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-subheading font-medium text-[var(--ink)]">
                {t("admin.contactLocationTitle")}
              </CardTitle>
              <CardDescription className="text-caption text-[var(--mid-gray)] text-[12px]">
                {t("admin.contactLocationDesc")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSaveLocation} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Store Email */}
              <div className="space-y-2">
                <Label htmlFor="storeEmail" className="text-[13px] font-medium text-[var(--ink)]">
                  {t("admin.storeEmail")}
                </Label>
                <div className="relative">
                  <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mid-gray)]" />
                  <Input
                    id="storeEmail"
                    type="email"
                    value={generalForm.email}
                    onChange={(e) =>
                      setGeneralForm({ ...generalForm, email: e.target.value })
                    }
                    placeholder="studio@kord-objects.com"
                    className="ps-10 bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10"
                    required
                  />
                </div>
              </div>

              {/* Store Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="storePhone" className="text-[13px] font-medium text-[var(--ink)]">
                  {t("admin.storePhone")}
                </Label>
                <div className="relative">
                  <Phone className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mid-gray)]" />
                  <Input
                    id="storePhone"
                    type="tel"
                    value={generalForm.phone}
                    onChange={(e) =>
                      setGeneralForm({ ...generalForm, phone: e.target.value })
                    }
                    placeholder="+213 550 12 34 56"
                    className="ps-10 bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="locCountry" className="text-[13px] font-medium text-[var(--ink)]">
                  {t("admin.country")}
                </Label>
                <Input
                  id="locCountry"
                  value={locationForm.country}
                  onChange={(e) =>
                    setLocationForm({ ...locationForm, country: e.target.value })
                  }
                  placeholder="Algeria"
                  className="bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10"
                />
              </div>

              {/* Wilaya / State */}
              <div className="space-y-2">
                <Label htmlFor="locWilaya" className="text-[13px] font-medium text-[var(--ink)]">
                  {t("admin.wilaya")}
                </Label>
                <Select
                  value={locationForm.wilaya}
                  onValueChange={(val) =>
                    setLocationForm({ ...locationForm, wilaya: val })
                  }
                >
                  <SelectTrigger
                    id="locWilaya"
                    className="w-full max-w-full bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10 shadow-2xs overflow-hidden"
                  >
                    <SelectValue placeholder={t("admin.wilaya")}>
                      {locationForm.wilaya ? formatWilaya(locationForm.wilaya, i18n.language) : t("admin.wilaya")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-64 max-w-[calc(100vw-2.5rem)] w-[var(--radix-select-trigger-width)] overflow-y-auto">
                    {ALGERIAN_WILAYAS.map((w) => (
                      <SelectItem key={w} value={w} className="text-[13px] truncate">
                        {formatWilaya(w, i18n.language)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City */}
              <div className="space-y-2 sm:col-span-2 md:col-span-1">
                <Label htmlFor="locCity" className="text-[13px] font-medium text-[var(--ink)]">
                  {t("admin.cityCommune")}
                </Label>
                <Input
                  id="locCity"
                  value={locationForm.city}
                  onChange={(e) =>
                    setLocationForm({ ...locationForm, city: e.target.value })
                  }
                  placeholder="e.g. Hydra"
                  className="bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10"
                />
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="locAddress" className="text-[13px] font-medium text-[var(--ink)]">
                  {t("admin.streetAddress")}
                </Label>
                <Input
                  id="locAddress"
                  value={locationForm.address}
                  onChange={(e) =>
                    setLocationForm({ ...locationForm, address: e.target.value })
                  }
                  placeholder="e.g. 14 Rue du Plateau, Atelier 4B"
                  className="bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10"
                />
              </div>

              {/* Google Maps URL */}
              <div className="space-y-2 sm:col-span-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="locMapsUrl" className="text-[13px] font-medium text-[var(--ink)]">
                    {t("admin.googleMapsUrl")}
                  </Label>
                  {locationForm.googleMapsUrl && (
                    <a
                      href={locationForm.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[var(--mid-gray)] hover:text-[var(--ink)] flex items-center gap-1 transition-colors"
                    >
                      <span>Preview</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Globe className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mid-gray)]" />
                  <Input
                    id="locMapsUrl"
                    type="url"
                    value={locationForm.googleMapsUrl}
                    onChange={(e) =>
                      setLocationForm({ ...locationForm, googleMapsUrl: e.target.value })
                    }
                    placeholder="https://maps.google.com/?q=..."
                    className="ps-10 bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10"
                  />
                </div>
              </div>

              {/* WhatsApp Number */}
              <div className="space-y-2 sm:col-span-2 md:col-span-1">
                <Label htmlFor="locWhatsApp" className="text-[13px] font-medium text-[var(--ink)]">
                  {t("admin.whatsappBusiness")}
                </Label>
                <div className="relative">
                  <MessageCircle className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mid-gray)]" />
                  <Input
                    id="locWhatsApp"
                    type="tel"
                    value={locationForm.whatsapp}
                    onChange={(e) =>
                      setLocationForm({ ...locationForm, whatsapp: e.target.value })
                    }
                    placeholder="+213 550 12 34 56"
                    className="ps-10 bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[var(--hairline)]">
              <Button
                type="submit"
                className="rounded-[14px] px-6 h-10 font-medium text-[13px] bg-[var(--ink)] text-[var(--paper)] hover:opacity-90"
              >
                {t("common.save")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 2. Product Variant Options Card */}
      <Card className="rounded-[24px] border border-[var(--hairline)] bg-[var(--paper)] overflow-hidden shadow-2xs w-full max-w-full">
        <CardHeader className="border-b border-[var(--hairline)] pb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[var(--surface-alt)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)]">
              <Palette className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-subheading font-medium text-[var(--ink)]">
                {t("admin.variantCustomizationTitle")}
              </CardTitle>
              <CardDescription className="text-caption text-[var(--mid-gray)] text-[12px]">
                {t("admin.variantCustomizationDesc")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="space-y-4 min-w-0">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-[var(--mid-gray)]" />
                <h3 className="text-[14px] font-medium text-[var(--ink)]">
                  {t("admin.variantSizes")}
                </h3>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
                {storeSettings.variantOptions.sizes.length > 0 ? (
                  storeSettings.variantOptions.sizes.map((size) => (
                    <div key={size} className="flex items-center justify-between gap-3 py-2">
                      <span className="text-[13px] text-[var(--ink)]">{size}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="iconSm"
                        onClick={() => handleRemoveSize(size)}
                        title={t("admin.removeVariantSize", { size })}
                        aria-label={t("admin.removeVariantSize", { size })}
                        className="shrink-0 text-[var(--ember)] hover:text-[var(--ember)] hover:bg-[var(--ember)]/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-[13px] text-[var(--mid-gray)]">
                    {t("admin.noVariantSizes")}
                  </p>
                )}
              </div>

              <form onSubmit={handleAddSize} className="flex items-center gap-2">
                <Input
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  placeholder={t("admin.newVariantSizePlaceholder")}
                  aria-label={t("admin.newVariantSizePlaceholder")}
                  className="h-10 min-w-0 bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px]"
                />
                <Button type="submit" className="h-10 shrink-0 gap-1.5 rounded-[14px]">
                  <Plus className="h-4 w-4" />
                  <span>{t("admin.addSize")}</span>
                </Button>
              </form>
            </section>

            <section className="space-y-4 min-w-0">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-[var(--mid-gray)]" />
                <h3 className="text-[14px] font-medium text-[var(--ink)]">
                  {t("admin.variantColors")}
                </h3>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
                {storeSettings.variantOptions.colors.length > 0 ? (
                  storeSettings.variantOptions.colors.map((color) => (
                    <div key={color.name} className="flex items-center justify-between gap-3 py-2">
                      <div
                        className="flex min-w-0 items-center gap-2"
                        dir={i18n.dir(i18n.language)}
                      >
                        <span
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 rounded-full border border-[var(--hairline)]"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="truncate text-[13px] text-[var(--ink)]">
                          {color.name}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="iconSm"
                        onClick={() => handleRemoveColor(color.name)}
                        title={t("admin.removeVariantColor", { color: color.name })}
                        aria-label={t("admin.removeVariantColor", { color: color.name })}
                        className="shrink-0 text-[var(--ember)] hover:text-[var(--ember)] hover:bg-[var(--ember)]/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-[13px] text-[var(--mid-gray)]">
                    {t("admin.noVariantColors")}
                  </p>
                )}
              </div>

              <form onSubmit={handleAddColor} className="flex items-center gap-2">
                <Input
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder={t("admin.newVariantColorPlaceholder")}
                  aria-label={t("admin.newVariantColorPlaceholder")}
                  className="h-10 min-w-0 flex-1 bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px]"
                />
                <Input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  aria-label={t("admin.variantColorSwatch")}
                  title={t("admin.variantColorSwatch")}
                  className="h-10 w-12 shrink-0 cursor-pointer rounded-[12px] p-1"
                />
                <Button type="submit" className="h-10 shrink-0 gap-1.5 rounded-[14px]">
                  <Plus className="h-4 w-4" />
                  <span>{t("admin.addColor")}</span>
                </Button>
              </form>
            </section>
          </div>
        </CardContent>
      </Card>

      {/* 2. Opening Hours Card */}
      <Card className="rounded-[24px] border border-[var(--hairline)] bg-[var(--paper)] overflow-hidden shadow-2xs w-full max-w-full">
        <CardHeader className="border-b border-[var(--hairline)] pb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[var(--surface-alt)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)]">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-subheading font-medium text-[var(--ink)]">
                {t("admin.openingHoursTitle")}
              </CardTitle>
              <CardDescription className="text-caption text-[var(--mid-gray)] text-[12px]">
                {t("admin.openingHoursDesc")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSaveHours} className="space-y-6">
            <div className="divide-y divide-[var(--hairline)] border border-[var(--hairline)] rounded-[18px] bg-[var(--surface-alt)]/40 overflow-hidden">
              {/* Row 1: Saturday - Thursday */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 overflow-hidden">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-[var(--ink)]">
                      {t("admin.satThu")}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[11px] px-2 py-0.5 rounded-[8px] ${
                        hoursForm.saturdayToThursday.isOpen
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-neutral-500/10 text-[var(--mid-gray)] border-[var(--hairline)]"
                      }`}
                    >
                      {hoursForm.saturdayToThursday.isOpen ? t("admin.open") : t("admin.closed")}
                    </Badge>
                  </div>
                  <p className="text-[12px] text-[var(--mid-gray)]">
                    {t("admin.openingHoursDesc")}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Hours inputs if open: spacious inputs for start and finish times */}
                  {hoursForm.saturdayToThursday.isOpen && (
                    <div className="flex items-center gap-2 bg-[var(--paper)] px-3 py-1.5 rounded-[14px] border border-[var(--hairline)] shadow-2xs">
                      <div className="flex flex-col">
                        <Input
                          type="time"
                          value={hoursForm.saturdayToThursday.openTime}
                          onChange={(e) =>
                            setHoursForm({
                              ...hoursForm,
                              saturdayToThursday: {
                                ...hoursForm.saturdayToThursday,
                                openTime: e.target.value,
                              },
                            })
                          }
                          className="w-[110px] sm:w-[124px] h-9 bg-transparent border-0 rounded-[8px] text-[13px] px-1 text-center font-medium focus-visible:ring-1 focus-visible:ring-[var(--ink)]"
                        />
                      </div>
                      <span className="text-[var(--mid-gray)] text-[13px] font-medium shrink-0">—</span>
                      <div className="flex flex-col">
                        <Input
                          type="time"
                          value={hoursForm.saturdayToThursday.closeTime}
                          onChange={(e) =>
                            setHoursForm({
                              ...hoursForm,
                              saturdayToThursday: {
                                ...hoursForm.saturdayToThursday,
                                closeTime: e.target.value,
                              },
                            })
                          }
                          className="w-[110px] sm:w-[124px] h-9 bg-transparent border-0 rounded-[8px] text-[13px] px-1 text-center font-medium focus-visible:ring-1 focus-visible:ring-[var(--ink)]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Status Toggle buttons: Open / Closed */}
                  <div className="inline-flex rounded-[12px] p-1 bg-[var(--paper)] border border-[var(--hairline)] shadow-2xs shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setHoursForm({
                          ...hoursForm,
                          saturdayToThursday: {
                            ...hoursForm.saturdayToThursday,
                            isOpen: true,
                          },
                        })
                      }
                      className={`px-3 py-1 text-[12px] font-medium rounded-[8px] transition-colors cursor-pointer ${
                        hoursForm.saturdayToThursday.isOpen
                          ? "bg-[var(--ink)] text-[var(--paper)]"
                          : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {t("admin.open")}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setHoursForm({
                          ...hoursForm,
                          saturdayToThursday: {
                            ...hoursForm.saturdayToThursday,
                            isOpen: false,
                          },
                        })
                      }
                      className={`px-3 py-1 text-[12px] font-medium rounded-[8px] transition-colors cursor-pointer ${
                        !hoursForm.saturdayToThursday.isOpen
                          ? "bg-[var(--ink)] text-[var(--paper)]"
                          : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {t("admin.closed")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: Friday */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 overflow-hidden">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-[var(--ink)]">
                      {t("admin.friday")}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[11px] px-2 py-0.5 rounded-[8px] ${
                        hoursForm.friday.isOpen
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-neutral-500/10 text-[var(--mid-gray)] border-[var(--hairline)]"
                      }`}
                    >
                      {hoursForm.friday.isOpen ? t("admin.open") : t("admin.closed")}
                    </Badge>
                  </div>
                  <p className="text-[12px] text-[var(--mid-gray)]">
                    {t("admin.openingHoursDesc")}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Hours inputs if open: spacious inputs for start and finish times */}
                  {hoursForm.friday.isOpen && (
                    <div className="flex items-center gap-2 bg-[var(--paper)] px-3 py-1.5 rounded-[14px] border border-[var(--hairline)] shadow-2xs">
                      <div className="flex flex-col">
                        <Input
                          type="time"
                          value={hoursForm.friday.openTime}
                          onChange={(e) =>
                            setHoursForm({
                              ...hoursForm,
                              friday: {
                                ...hoursForm.friday,
                                openTime: e.target.value,
                              },
                            })
                          }
                          className="w-[110px] sm:w-[124px] h-9 bg-transparent border-0 rounded-[8px] text-[13px] px-1 text-center font-medium focus-visible:ring-1 focus-visible:ring-[var(--ink)]"
                        />
                      </div>
                      <span className="text-[var(--mid-gray)] text-[13px] font-medium shrink-0">—</span>
                      <div className="flex flex-col">
                        <Input
                          type="time"
                          value={hoursForm.friday.closeTime}
                          onChange={(e) =>
                            setHoursForm({
                              ...hoursForm,
                              friday: {
                                ...hoursForm.friday,
                                closeTime: e.target.value,
                              },
                            })
                          }
                          className="w-[110px] sm:w-[124px] h-9 bg-transparent border-0 rounded-[8px] text-[13px] px-1 text-center font-medium focus-visible:ring-1 focus-visible:ring-[var(--ink)]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Status Toggle buttons: Open / Closed */}
                  <div className="inline-flex rounded-[12px] p-1 bg-[var(--paper)] border border-[var(--hairline)] shadow-2xs shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setHoursForm({
                          ...hoursForm,
                          friday: {
                            ...hoursForm.friday,
                            isOpen: true,
                          },
                        })
                      }
                      className={`px-3 py-1 text-[12px] font-medium rounded-[8px] transition-colors cursor-pointer ${
                        hoursForm.friday.isOpen
                          ? "bg-[var(--ink)] text-[var(--paper)]"
                          : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {t("admin.open")}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setHoursForm({
                          ...hoursForm,
                          friday: {
                            ...hoursForm.friday,
                            isOpen: false,
                          },
                        })
                      }
                      className={`px-3 py-1 text-[12px] font-medium rounded-[8px] transition-colors cursor-pointer ${
                        !hoursForm.friday.isOpen
                          ? "bg-[var(--ink)] text-[var(--paper)]"
                          : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {t("admin.closed")}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[var(--hairline)]">
              <Button
                type="submit"
                className="rounded-[14px] px-6 h-10 font-medium text-[13px] bg-[var(--ink)] text-[var(--paper)] hover:opacity-90"
              >
                {t("common.save")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 3. Social Links Card */}
      <Card className="rounded-[24px] border border-[var(--hairline)] bg-[var(--paper)] overflow-hidden shadow-2xs w-full max-w-full">
        <CardHeader className="border-b border-[var(--hairline)] pb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[var(--surface-alt)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)]">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-subheading font-medium text-[var(--ink)]">
                {t("admin.socialLinksTitle")}
              </CardTitle>
              <CardDescription className="text-caption text-[var(--mid-gray)] text-[12px]">
                {t("admin.socialLinksDesc")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSaveSocial} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Instagram */}
              <div className="space-y-2">
                <Label htmlFor="socialInstagram" className="text-[13px] font-medium text-[var(--ink)] flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-[var(--mid-gray)]" />
                  <span>{t("admin.instagramUrl")}</span>
                </Label>
                <Input
                  id="socialInstagram"
                  value={socialForm.instagram}
                  onChange={(e) =>
                    setSocialForm({ ...socialForm, instagram: e.target.value })
                  }
                  placeholder="https://instagram.com/kord.objects"
                  className="bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10"
                />
              </div>

              {/* Facebook */}
              <div className="space-y-2">
                <Label htmlFor="socialFacebook" className="text-[13px] font-medium text-[var(--ink)] flex items-center gap-2">
                  <Facebook className="h-4 w-4 text-[var(--mid-gray)]" />
                  <span>{t("admin.facebookUrl")}</span>
                </Label>
                <Input
                  id="socialFacebook"
                  value={socialForm.facebook}
                  onChange={(e) =>
                    setSocialForm({ ...socialForm, facebook: e.target.value })
                  }
                  placeholder="https://facebook.com/kordobjects"
                  className="bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10"
                />
              </div>

              {/* TikTok */}
              <div className="space-y-2">
                <Label htmlFor="socialTikTok" className="text-[13px] font-medium text-[var(--ink)] flex items-center gap-2">
                  <span className="font-semibold text-xs leading-none">TT</span>
                  <span>{t("admin.tiktokUrl")}</span>
                </Label>
                <Input
                  id="socialTikTok"
                  value={socialForm.tiktok}
                  onChange={(e) =>
                    setSocialForm({ ...socialForm, tiktok: e.target.value })
                  }
                  placeholder="https://tiktok.com/@kordobjects"
                  className="bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10"
                />
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <Label htmlFor="socialWhatsApp" className="text-[13px] font-medium text-[var(--ink)] flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-[var(--mid-gray)]" />
                  <span>{t("admin.whatsappBusiness")}</span>
                </Label>
                <Input
                  id="socialWhatsApp"
                  value={socialForm.whatsapp}
                  onChange={(e) =>
                    setSocialForm({ ...socialForm, whatsapp: e.target.value })
                  }
                  placeholder="+213 550 12 34 56"
                  className="bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[var(--hairline)]">
              <Button
                type="submit"
                className="rounded-[14px] px-6 h-10 font-medium text-[13px] bg-[var(--ink)] text-[var(--paper)] hover:opacity-90"
              >
                {t("common.save")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 4. Delivery Card */}
      <Card className="rounded-[24px] border border-[var(--hairline)] bg-[var(--paper)] overflow-hidden shadow-2xs w-full max-w-full">
        <CardHeader className="border-b border-[var(--hairline)] pb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[var(--surface-alt)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)]">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-subheading font-medium text-[var(--ink)]">
                {t("admin.deliveryOptionsTitle")}
              </CardTitle>
              <CardDescription className="text-caption text-[var(--mid-gray)] text-[12px]">
                {t("admin.deliveryOptionsDesc")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSaveDelivery} className="space-y-6">
            {/* Delivery Enabled Switch Row */}
            <div className="flex items-center justify-between p-4 rounded-[18px] bg-[var(--surface-alt)]/60 border border-[var(--hairline)]">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-[14px] font-medium text-[var(--ink)]">
                    {t("admin.enableDelivery")}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[11px] px-2 py-0.5 rounded-[8px] font-medium ${
                      deliveryForm.deliveryEnabled
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-neutral-500/10 text-[var(--mid-gray)] border-[var(--hairline)]"
                    }`}
                  >
                    {deliveryForm.deliveryEnabled ? t("admin.inStock") : t("admin.outOfStock")}
                  </Badge>
                </div>
                <p className="text-[12px] text-[var(--mid-gray)]">
                  {t("admin.enableDeliveryDesc")}
                </p>
              </div>

              <Switch
                checked={deliveryForm.deliveryEnabled}
                onCheckedChange={(checked) =>
                  setDeliveryForm({ ...deliveryForm, deliveryEnabled: checked })
                }
              />
            </div>

            {/* Default Fees Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Default Fee: To Office */}
              <div className="space-y-2">
                <Label htmlFor="feeOffice" className="text-[13px] font-medium text-[var(--ink)]">
                  {t("admin.deskFee")}
                </Label>
                <div className="relative">
                  <span className="absolute start-3.5 top-1/2 -translate-y-1/2 text-[12px] text-[var(--mid-gray)] font-medium">
                    {t("common.currency")}
                  </span>
                  <Input
                    id="feeOffice"
                    type="number"
                    min="0"
                    step="1"
                    value={deliveryForm.officeFee}
                    onChange={(e) =>
                      setDeliveryForm({
                        ...deliveryForm,
                        officeFee: Number(e.target.value) || 0,
                      })
                    }
                    placeholder="15"
                    className="ps-12 bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10 font-mono"
                  />
                </div>
              </div>

              {/* Default Fee: To Home */}
              <div className="space-y-2">
                <Label htmlFor="feeHome" className="text-[13px] font-medium text-[var(--ink)]">
                  {t("admin.homeFee")}
                </Label>
                <div className="relative">
                  <span className="absolute start-3.5 top-1/2 -translate-y-1/2 text-[12px] text-[var(--mid-gray)] font-medium">
                    {t("common.currency")}
                  </span>
                  <Input
                    id="feeHome"
                    type="number"
                    min="0"
                    step="1"
                    value={deliveryForm.homeFee}
                    onChange={(e) =>
                      setDeliveryForm({
                        ...deliveryForm,
                        homeFee: Number(e.target.value) || 0,
                      })
                    }
                    placeholder="25"
                    className="ps-12 bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[var(--hairline)]">
              <Button
                type="submit"
                className="rounded-[14px] px-6 h-10 font-medium text-[13px] bg-[var(--ink)] text-[var(--paper)] hover:opacity-90"
              >
                {t("common.save")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
