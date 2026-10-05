import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/context/StoreContext";
import { supabase } from "@/lib/supabase";
import { formatWilaya } from "@/i18n/wilayas";

interface StoreContactData {
  email: string;
  phoneNumber: string;
  country: string;
  wilaya: string;
  commune: string;
  streetAddress: string;
  googleMapsUrl: string;
  openingSchedule: any;
}

export const ContactPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { addMessage, storeSettings } = useStore();

  const [storeData, setStoreData] = useState<StoreContactData | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [inquiryType, setInquiryType] = useState("Product Inquiry");
  const [orderNumber, setOrderNumber] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchContactDetails = async () => {
      try {
        const { data, error } = await supabase
          .from("store")
          .select("email,phone_number,country,wilaya,commune,street_address,google_maps_url,opening_schedule")
          .order("id", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (!isMounted) return;

        if (error) {
          console.error("Failed to fetch contact information from Supabase:", error);
        } else if (data) {
          setStoreData({
            email: data.email || "",
            phoneNumber: data.phone_number || "",
            country: data.country || "",
            wilaya: data.wilaya || "",
            commune: data.commune || "",
            streetAddress: data.street_address || "",
            googleMapsUrl: data.google_maps_url || "",
            openingSchedule: data.opening_schedule,
          });
        }
      } catch (err) {
        console.error("Error loading store contact info:", err);
      } finally {
        if (isMounted) setStoreLoading(false);
      }
    };

    void fetchContactDetails();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentEmail = storeData?.email || storeSettings?.general?.email || "";
  const currentPhone = storeData?.phoneNumber || storeSettings?.general?.phone || "";
  const currentCountry = storeData?.country || storeSettings?.location?.country || "";
  const currentWilaya = storeData?.wilaya || storeSettings?.location?.wilaya || "";
  const currentCommune = storeData?.commune || storeSettings?.location?.city || "";
  const currentAddress = storeData?.streetAddress || storeSettings?.location?.address || "";
  const currentMapsUrl = storeData?.googleMapsUrl || storeSettings?.location?.googleMapsUrl || "";
  const currentSchedule = storeData?.openingSchedule || storeSettings?.hours;

  const formattedWilaya = formatWilaya(currentWilaya, i18n.language) || currentWilaya;
  const locationParts = [
    currentAddress,
    currentCommune && currentCommune.toLowerCase() !== currentWilaya.toLowerCase() ? currentCommune : null,
    formattedWilaya,
    currentCountry,
  ].filter(Boolean);
  const combinedLocation = locationParts.length > 0
    ? locationParts.join(", ")
    : [formattedWilaya, currentCountry].filter(Boolean).join(", ");

  const scheduleData = currentSchedule as any;
  const satThu = scheduleData?.saturday_thursday;
  const friday = scheduleData?.friday;
  const satThuOpen = satThu?.status === "open" && satThu?.time?.open && satThu?.time?.close;
  const fridayOpen = friday?.status === "open" && friday?.time?.open && friday?.time?.close;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error(t("contact.fillRequiredFields"));
      return;
    }

    addMessage({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      subject: subject.trim() || `${inquiryType} from ${name.trim()}`,
      inquiryType: inquiryType,
      orderNumber: orderNumber.trim() || undefined,
      message: message.trim(),
      status: "unread",
      isRead: false,
    });

    setSubmitted(true);
    toast.success(t("contact.successToastTitle"), {
      description: t("contact.successToastDesc"),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12">
      <div className="max-w-2xl space-y-3">
        <p className="text-caption text-[var(--mid-gray)]">{t("contact.badge")}</p>
        <h1 className="text-heading-lg text-[var(--ink)]">{t("contact.title")}</h1>
        <p className="text-body-lg text-[var(--mid-gray)]">
          {t("contact.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Contact Information Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-[24px] border border-[var(--hairline)] bg-[var(--surface-alt)] p-6 sm:p-8 space-y-6">
            <h3 className="text-subheading font-medium text-[var(--ink)]">
              {t("contact.directChannelsTitle")}
            </h3>

            <div className="space-y-5 text-body">
              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-[var(--paper)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)] shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-caption text-[var(--mid-gray)]">Email</p>
                  {storeLoading ? (
                    <div className="h-4 w-44 rounded bg-[var(--hairline)]/80 animate-pulse mt-1" />
                  ) : currentEmail ? (
                    <a
                      href={`mailto:${currentEmail}`}
                      className="font-medium text-[var(--ink)] hover:underline"
                    >
                      {currentEmail}
                    </a>
                  ) : (
                    <span className="text-[var(--mid-gray)] text-[14px]">N/A</span>
                  )}
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-[var(--paper)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)] shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-caption text-[var(--mid-gray)]">{t("cart.phoneNumber")}</p>
                  {storeLoading ? (
                    <div className="h-4 w-32 rounded bg-[var(--hairline)]/80 animate-pulse mt-1" />
                  ) : currentPhone ? (
                    <a
                      href={`tel:${currentPhone}`}
                      className="font-medium text-[var(--ink)] hover:underline tabular-nums"
                    >
                      {currentPhone}
                    </a>
                  ) : (
                    <span className="text-[var(--mid-gray)] text-[14px]">N/A</span>
                  )}
                </div>
              </div>

              {/* Location (Combined Country, Wilaya, Address) */}
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-[var(--paper)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)] shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-caption text-[var(--mid-gray)]">{t("footer.locationTitle")}</p>
                  {storeLoading ? (
                    <div className="h-4 w-52 rounded bg-[var(--hairline)]/80 animate-pulse mt-1" />
                  ) : combinedLocation ? (
                    currentMapsUrl ? (
                      <a
                        href={currentMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[var(--ink)] hover:underline inline-flex items-center gap-1.5 leading-relaxed"
                      >
                        <span>{combinedLocation}</span>
                        <ExternalLink className="h-3.5 w-3.5 text-[var(--mid-gray)] shrink-0" />
                      </a>
                    ) : (
                      <p className="font-medium text-[var(--ink)] leading-relaxed">
                        {combinedLocation}
                      </p>
                    )
                  ) : (
                    <span className="text-[var(--mid-gray)] text-[14px]">N/A</span>
                  )}
                </div>
              </div>

              {/* Opening Hours */}
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-[var(--paper)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)] shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-caption text-[var(--mid-gray)]">{t("footer.hoursTitle")}</p>
                  {storeLoading ? (
                    <div className="space-y-1.5 mt-1">
                      <div className="h-3.5 w-40 rounded bg-[var(--hairline)]/80 animate-pulse" />
                      <div className="h-3.5 w-28 rounded bg-[var(--hairline)]/80 animate-pulse" />
                    </div>
                  ) : (
                    <div className="space-y-1 font-medium text-[var(--ink)] text-[14px] mt-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--mid-gray)] text-[13px]">{t("footer.satThu")}:</span>
                        <span>
                          {satThuOpen
                            ? `${satThu.time.open} – ${satThu.time.close}`
                            : t("admin.closed")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--mid-gray)] text-[13px]">{t("footer.friOnly")}:</span>
                        <span>
                          {fridayOpen
                            ? `${friday.time.open} – ${friday.time.close}`
                            : t("admin.closed")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="lg:col-span-7">
          <Card className="rounded-[24px]">
            <CardHeader className="text-start">
              <CardTitle className="text-subheading font-medium">
                {t("contact.inquiryFormTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-[var(--surface-alt)] border border-[var(--hairline)] flex items-center justify-center mx-auto text-[var(--ink)]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <h3 className="text-subheading font-medium text-[var(--ink)]">
                    {t("contact.successToastTitle")}
                  </h3>
                  <p className="text-body text-[var(--mid-gray)] max-w-sm mx-auto">
                    {t("contact.successToastDesc")}
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSubmitted(false);
                      setMessage("");
                      setSubject("");
                    }}
                    className="rounded-[18px] cursor-pointer"
                  >
                    {t("contact.sendMessageBtn")}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">{t("contact.nameLabel")} *</Label>
                      <Input
                        id="contactName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Maya Lin"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">{t("contact.emailLabel")} *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. maya@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">{t("contact.phoneLabel")}</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +213 550 12 34 56"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactInquiryType">{t("contact.inquiryTypeLabel")}</Label>
                      <Select value={inquiryType} onValueChange={setInquiryType}>
                        <SelectTrigger id="contactInquiryType" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Product Inquiry">{t("contact.generalInquiry")}</SelectItem>
                          <SelectItem value="Order & Shipping Support">{t("contact.orderSupport")}</SelectItem>
                          <SelectItem value="Bespoke / Custom Order">{t("contact.bespokeRequest")}</SelectItem>
                          <SelectItem value="Press & Architectural Specification">{t("contact.pressInquiry")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactSubject">{t("contact.subjectLabel")}</Label>
                      <Input
                        id="contactSubject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Custom finish inquiry"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactOrderNumber">{t("contact.orderNumberLabel")}</Label>
                      <Input
                        id="contactOrderNumber"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        placeholder="e.g. KRD-104820"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactMessage">{t("contact.messageLabel")} *</Label>
                    <Textarea
                      id="contactMessage"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Provide any details regarding your space, material preference, or questions..."
                      rows={5}
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <Button type="submit" size="lg" className="w-full rounded-[18px] cursor-pointer">
                      {t("contact.sendMessageBtn")}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
