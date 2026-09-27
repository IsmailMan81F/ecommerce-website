import React, { useState, useEffect } from "react";
import { useStore } from "@/context/StoreContext";
import { toast } from "sonner";
import {
  Store,
  MapPin,
  Clock,
  Share2,
  Truck,
  Check,
  ExternalLink,
  Globe,
  Building,
  Phone,
  Mail,
  Instagram,
  Facebook,
  MessageCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export const AdminStorePage: React.FC = () => {
  const {
    storeSettings,
    updateStoreGeneral,
    updateStoreLocation,
    updateStoreHours,
    updateStoreSocial,
    updateStoreDelivery,
  } = useStore();

  // Local state initialized from storeSettings
  const [generalForm, setGeneralForm] = useState(storeSettings.general);
  const [locationForm, setLocationForm] = useState(storeSettings.location);
  const [hoursForm, setHoursForm] = useState(storeSettings.hours);
  const [socialForm, setSocialForm] = useState(storeSettings.social);
  const [deliveryForm, setDeliveryForm] = useState(storeSettings.delivery);

  // Sync if storeSettings change externally
  useEffect(() => {
    setGeneralForm(storeSettings.general);
    setLocationForm(storeSettings.location);
    setHoursForm(storeSettings.hours);
    setSocialForm(storeSettings.social);
    setDeliveryForm(storeSettings.delivery);
  }, [storeSettings]);

  // Save Handlers
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!generalForm.storeName.trim()) {
      toast.error("Store name cannot be empty");
      return;
    }
    updateStoreGeneral(generalForm);
    toast.success("General information saved successfully");
  };

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreLocation(locationForm);
    toast.success("Store location saved successfully");
  };

  const handleSaveHours = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreHours(hoursForm);
    toast.success("Opening hours saved successfully");
  };

  const handleSaveSocial = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSocial(socialForm);
    toast.success("Social links saved successfully");
  };

  const handleSaveDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreDelivery(deliveryForm);
    toast.success("Delivery settings saved successfully");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Page Title & Intro */}
      <div>
        <h1 className="text-heading-md font-semibold tracking-tight text-[var(--ink)]">
          Store Information
        </h1>
        <p className="text-body text-[var(--mid-gray)] mt-1 text-[13px]">
          Manage basic information, physical showroom location, opening schedule, and delivery parameters.
        </p>
      </div>

      {/* 1. General Information Card */}
      <Card className="rounded-[24px] border border-[var(--hairline)] bg-[var(--paper)] overflow-hidden shadow-2xs">
        <CardHeader className="border-b border-[var(--hairline)] pb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[var(--surface-alt)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)]">
              <Store className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-subheading font-medium text-[var(--ink)]">
                General Information
              </CardTitle>
              <CardDescription className="text-caption text-[var(--mid-gray)] text-[12px]">
                Core brand identity, atelier summary, and official contact credentials
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSaveGeneral} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Store Name */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="storeName" className="text-[13px] font-medium text-[var(--ink)]">
                  Store Name
                </Label>
                <Input
                  id="storeName"
                  value={generalForm.storeName}
                  onChange={(e) =>
                    setGeneralForm({ ...generalForm, storeName: e.target.value })
                  }
                  placeholder="e.g. KØRD"
                  className="bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="storeDescription" className="text-[13px] font-medium text-[var(--ink)]">
                  Store Description
                </Label>
                <Textarea
                  id="storeDescription"
                  value={generalForm.description}
                  onChange={(e) =>
                    setGeneralForm({ ...generalForm, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Brief description of your store philosophy and collections..."
                  className="bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px] resize-none"
                />
              </div>

              {/* Store Email */}
              <div className="space-y-2">
                <Label htmlFor="storeEmail" className="text-[13px] font-medium text-[var(--ink)]">
                  Store Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mid-gray)]" />
                  <Input
                    id="storeEmail"
                    type="email"
                    value={generalForm.email}
                    onChange={(e) =>
                      setGeneralForm({ ...generalForm, email: e.target.value })
                    }
                    placeholder="studio@kord-objects.com"
                    className="pl-10 bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10"
                    required
                  />
                </div>
              </div>

              {/* Store Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="storePhone" className="text-[13px] font-medium text-[var(--ink)]">
                  Store Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mid-gray)]" />
                  <Input
                    id="storePhone"
                    type="tel"
                    value={generalForm.phone}
                    onChange={(e) =>
                      setGeneralForm({ ...generalForm, phone: e.target.value })
                    }
                    placeholder="+213 550 12 34 56"
                    className="pl-10 bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[var(--hairline)]">
              <Button
                type="submit"
                className="rounded-[14px] px-6 h-10 font-medium text-[13px] bg-[var(--ink)] text-[var(--paper)] hover:opacity-90"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 2. Contact & Location Card */}
      <Card className="rounded-[24px] border border-[var(--hairline)] bg-[var(--paper)] overflow-hidden shadow-2xs">
        <CardHeader className="border-b border-[var(--hairline)] pb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[var(--surface-alt)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)]">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-subheading font-medium text-[var(--ink)]">
                Contact & Location
              </CardTitle>
              <CardDescription className="text-caption text-[var(--mid-gray)] text-[12px]">
                Physical showroom address, territorial jurisdiction, and direct messaging channel
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSaveLocation} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="locCountry" className="text-[13px] font-medium text-[var(--ink)]">
                  Country
                </Label>
                <Input
                  id="locCountry"
                  value={locationForm.country}
                  onChange={(e) =>
                    setLocationForm({ ...locationForm, country: e.target.value })
                  }
                  placeholder="e.g. Algeria"
                  className="bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10"
                />
              </div>

              {/* Wilaya / State */}
              <div className="space-y-2">
                <Label htmlFor="locWilaya" className="text-[13px] font-medium text-[var(--ink)]">
                  Wilaya / State
                </Label>
                <Select
                  value={locationForm.wilaya}
                  onValueChange={(val) =>
                    setLocationForm({ ...locationForm, wilaya: val })
                  }
                >
                  <SelectTrigger
                    id="locWilaya"
                    className="w-full bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10 shadow-2xs"
                  >
                    <SelectValue placeholder="Select Wilaya / State" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {ALGERIAN_WILAYAS.map((w) => (
                      <SelectItem key={w} value={w} className="text-[13px]">
                        {w}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City */}
              <div className="space-y-2 sm:col-span-2 md:col-span-1">
                <Label htmlFor="locCity" className="text-[13px] font-medium text-[var(--ink)]">
                  City
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
                  Address
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
                    Google Maps URL
                  </Label>
                  {locationForm.googleMapsUrl && (
                    <a
                      href={locationForm.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[var(--mid-gray)] hover:text-[var(--ink)] flex items-center gap-1 transition-colors"
                    >
                      <span>Preview Link</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mid-gray)]" />
                  <Input
                    id="locMapsUrl"
                    type="url"
                    value={locationForm.googleMapsUrl}
                    onChange={(e) =>
                      setLocationForm({ ...locationForm, googleMapsUrl: e.target.value })
                    }
                    placeholder="https://maps.google.com/?q=..."
                    className="pl-10 bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10"
                  />
                </div>
              </div>

              {/* WhatsApp Number */}
              <div className="space-y-2 sm:col-span-2 md:col-span-1">
                <Label htmlFor="locWhatsApp" className="text-[13px] font-medium text-[var(--ink)]">
                  WhatsApp Number
                </Label>
                <div className="relative">
                  <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mid-gray)]" />
                  <Input
                    id="locWhatsApp"
                    type="tel"
                    value={locationForm.whatsapp}
                    onChange={(e) =>
                      setLocationForm({ ...locationForm, whatsapp: e.target.value })
                    }
                    placeholder="+213 550 12 34 56"
                    className="pl-10 bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[var(--hairline)]">
              <Button
                type="submit"
                className="rounded-[14px] px-6 h-10 font-medium text-[13px] bg-[var(--ink)] text-[var(--paper)] hover:opacity-90"
              >
                Save Location
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 3. Opening Hours Card */}
      <Card className="rounded-[24px] border border-[var(--hairline)] bg-[var(--paper)] overflow-hidden shadow-2xs">
        <CardHeader className="border-b border-[var(--hairline)] pb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[var(--surface-alt)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)]">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-subheading font-medium text-[var(--ink)]">
                Opening Hours
              </CardTitle>
              <CardDescription className="text-caption text-[var(--mid-gray)] text-[12px]">
                Showroom consultation schedule and atelier access window
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSaveHours} className="space-y-6">
            <div className="divide-y divide-[var(--hairline)] border border-[var(--hairline)] rounded-[18px] bg-[var(--surface-alt)]/40 overflow-hidden">
              {/* Row 1: Saturday - Thursday */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-[var(--ink)]">
                      Saturday – Thursday
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[11px] px-2 py-0.5 rounded-[8px] ${
                        hoursForm.saturdayToThursday.isOpen
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-neutral-500/10 text-[var(--mid-gray)] border-[var(--hairline)]"
                      }`}
                    >
                      {hoursForm.saturdayToThursday.isOpen ? "Open" : "Closed"}
                    </Badge>
                  </div>
                  <p className="text-[12px] text-[var(--mid-gray)]">
                    Standard weekday atelier and showroom operations
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Hours inputs if open (timing in the left) */}
                  {hoursForm.saturdayToThursday.isOpen && (
                    <div className="flex items-center gap-1.5">
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
                        className="w-24 h-9 bg-[var(--paper)] border-[var(--hairline)] rounded-[10px] text-[12px] px-2 text-center"
                      />
                      <span className="text-[var(--mid-gray)] text-[12px]">—</span>
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
                        className="w-24 h-9 bg-[var(--paper)] border-[var(--hairline)] rounded-[10px] text-[12px] px-2 text-center"
                      />
                    </div>
                  )}

                  {/* Status Toggle buttons: Open / Closed (toggle in the right) */}
                  <div className="inline-flex rounded-[12px] p-1 bg-[var(--paper)] border border-[var(--hairline)] shadow-2xs">
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
                      className={`px-3 py-1 text-[12px] font-medium rounded-[8px] transition-colors ${
                        hoursForm.saturdayToThursday.isOpen
                          ? "bg-[var(--ink)] text-[var(--paper)]"
                          : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
                      }`}
                    >
                      Open
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
                      className={`px-3 py-1 text-[12px] font-medium rounded-[8px] transition-colors ${
                        !hoursForm.saturdayToThursday.isOpen
                          ? "bg-[var(--ink)] text-[var(--paper)]"
                          : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
                      }`}
                    >
                      Closed
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: Friday */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-[var(--ink)]">
                      Friday
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[11px] px-2 py-0.5 rounded-[8px] ${
                        hoursForm.friday.isOpen
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-neutral-500/10 text-[var(--mid-gray)] border-[var(--hairline)]"
                      }`}
                    >
                      {hoursForm.friday.isOpen ? "Open" : "Closed"}
                    </Badge>
                  </div>
                  <p className="text-[12px] text-[var(--mid-gray)]">
                    Weekend afternoon consultation schedule
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Hours inputs if open (timing in the left) */}
                  {hoursForm.friday.isOpen && (
                    <div className="flex items-center gap-1.5">
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
                        className="w-24 h-9 bg-[var(--paper)] border-[var(--hairline)] rounded-[10px] text-[12px] px-2 text-center"
                      />
                      <span className="text-[var(--mid-gray)] text-[12px]">—</span>
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
                        className="w-24 h-9 bg-[var(--paper)] border-[var(--hairline)] rounded-[10px] text-[12px] px-2 text-center"
                      />
                    </div>
                  )}

                  {/* Status Toggle buttons: Open / Closed (toggle in the right) */}
                  <div className="inline-flex rounded-[12px] p-1 bg-[var(--paper)] border border-[var(--hairline)] shadow-2xs">
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
                      className={`px-3 py-1 text-[12px] font-medium rounded-[8px] transition-colors ${
                        hoursForm.friday.isOpen
                          ? "bg-[var(--ink)] text-[var(--paper)]"
                          : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
                      }`}
                    >
                      Open
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
                      className={`px-3 py-1 text-[12px] font-medium rounded-[8px] transition-colors ${
                        !hoursForm.friday.isOpen
                          ? "bg-[var(--ink)] text-[var(--paper)]"
                          : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
                      }`}
                    >
                      Closed
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
                Save Hours
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 4. Social Media Card */}
      <Card className="rounded-[24px] border border-[var(--hairline)] bg-[var(--paper)] overflow-hidden shadow-2xs">
        <CardHeader className="border-b border-[var(--hairline)] pb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[var(--surface-alt)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)]">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-subheading font-medium text-[var(--ink)]">
                Social Media
              </CardTitle>
              <CardDescription className="text-caption text-[var(--mid-gray)] text-[12px]">
                Public brand profiles, visual catalogues, and messaging handles
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSaveSocial} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Instagram */}
              <div className="space-y-2">
                <Label htmlFor="socialInstagram" className="text-[13px] font-medium text-[var(--ink)] flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-[var(--mid-gray)]" />
                  <span>Instagram</span>
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
                  <span>Facebook</span>
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
                  <span>TikTok</span>
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
                  <span>WhatsApp</span>
                </Label>
                <Input
                  id="socialWhatsApp"
                  value={socialForm.whatsapp}
                  onChange={(e) =>
                    setSocialForm({ ...socialForm, whatsapp: e.target.value })
                  }
                  placeholder="+213 550 12 34 56 or https://wa.me/..."
                  className="bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[var(--hairline)]">
              <Button
                type="submit"
                className="rounded-[14px] px-6 h-10 font-medium text-[13px] bg-[var(--ink)] text-[var(--paper)] hover:opacity-90"
              >
                Save Social Links
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 5. Delivery Card */}
      <Card className="rounded-[24px] border border-[var(--hairline)] bg-[var(--paper)] overflow-hidden shadow-2xs">
        <CardHeader className="border-b border-[var(--hairline)] pb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[var(--surface-alt)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)]">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-subheading font-medium text-[var(--ink)]">
                Delivery
              </CardTitle>
              <CardDescription className="text-caption text-[var(--mid-gray)] text-[12px]">
                Shipping dispatch availability and standard flat-rate delivery charges
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSaveDelivery} className="space-y-6">
            {/* Delivery Enabled Switch Row */}
            <div className="flex items-center justify-between p-4 rounded-[18px] bg-[var(--surface-alt)]/60 border border-[var(--hairline)]">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-[14px] font-medium text-[var(--ink)]">
                    Delivery Enabled
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[11px] px-2 py-0.5 rounded-[8px] font-medium ${
                      deliveryForm.deliveryEnabled
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-neutral-500/10 text-[var(--mid-gray)] border-[var(--hairline)]"
                    }`}
                  >
                    {deliveryForm.deliveryEnabled ? "Active" : "Disabled"}
                  </Badge>
                </div>
                <p className="text-[12px] text-[var(--mid-gray)]">
                  Toggle whether orders can be dispatched via domestic courier
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
                  Default Fee (To Office)
                </Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-[var(--mid-gray)] font-mono">
                    $
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
                    className="pl-8 bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10 font-mono"
                  />
                </div>
                <p className="text-[11px] text-[var(--mid-gray)]">
                  Flat-rate courier shipping to desk or corporate building
                </p>
              </div>

              {/* Default Fee: To Home */}
              <div className="space-y-2">
                <Label htmlFor="feeHome" className="text-[13px] font-medium text-[var(--ink)]">
                  Default Fee (To Home)
                </Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-[var(--mid-gray)] font-mono">
                    $
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
                    className="pl-8 bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10 font-mono"
                  />
                </div>
                <p className="text-[11px] text-[var(--mid-gray)]">
                  Standard residential courier delivery to doorstep
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[var(--hairline)]">
              <Button
                type="submit"
                className="rounded-[14px] px-6 h-10 font-medium text-[13px] bg-[var(--ink)] text-[var(--paper)] hover:opacity-90"
              >
                Save Delivery
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
