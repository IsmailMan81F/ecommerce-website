import React, { useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Clock, ArrowRight, Send } from "lucide-react";
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
import { CONTACT_INFO } from "@/lib/data";
import { useStore } from "@/context/StoreContext";

export const ContactPage: React.FC = () => {
  const { addMessage, storeSettings } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [inquiryType, setInquiryType] = useState("Product Inquiry");
  const [orderNumber, setOrderNumber] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in your name, email and message");
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
    toast.success("Inquiry Dispatched", {
      description: "Our concierge team will respond within 24 hours.",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12">
      <div className="max-w-2xl space-y-3">
        <p className="text-caption text-[var(--mid-gray)]">Client Services & Inquiries</p>
        <h1 className="text-heading-lg text-[var(--ink)]">Contact the Atelier</h1>
        <p className="text-body-lg text-[var(--mid-gray)]">
          For custom dimension requests, private consultations, or shipping assistance, please connect directly with our studio concierge.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Contact Information Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-[24px] border border-[var(--hairline)] bg-[var(--surface-alt)] p-6 sm:p-8 space-y-6">
            <h3 className="text-subheading font-medium text-[var(--ink)]">
              Direct Channels
            </h3>

            <div className="space-y-5 text-body">
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-[var(--paper)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)] shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-caption text-[var(--mid-gray)]">Concierge Email</p>
                  <a
                    href={`mailto:${storeSettings?.general?.email || CONTACT_INFO.conciergeEmail}`}
                    className="font-medium text-[var(--ink)] hover:underline"
                  >
                    {storeSettings?.general?.email || CONTACT_INFO.conciergeEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-[var(--paper)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)] shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-caption text-[var(--mid-gray)]">Order Inquiries</p>
                  <a
                    href={`tel:${storeSettings?.general?.phone || CONTACT_INFO.orderAssistance}`}
                    className="font-medium text-[var(--ink)] hover:underline tabular-nums"
                  >
                    {storeSettings?.general?.phone || CONTACT_INFO.orderAssistance}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-[var(--paper)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)] shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-caption text-[var(--mid-gray)]">Studio & Showroom</p>
                  <p className="font-medium text-[var(--ink)]">
                    {storeSettings?.location?.address
                      ? `${storeSettings.location.address}, ${storeSettings.location.city}, ${storeSettings.location.country}`
                      : CONTACT_INFO.studioAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-[var(--paper)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)] shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-caption text-[var(--mid-gray)]">Consultation Hours</p>
                  <p className="font-medium text-[var(--ink)]">
                    {storeSettings?.hours?.saturdayToThursday
                      ? `Sat – Thu: ${storeSettings.hours.saturdayToThursday.isOpen ? `${storeSettings.hours.saturdayToThursday.openTime} – ${storeSettings.hours.saturdayToThursday.closeTime}` : "Closed"} · Fri: ${storeSettings.hours.friday.isOpen ? `${storeSettings.hours.friday.openTime} – ${storeSettings.hours.friday.closeTime}` : "Closed"}`
                      : CONTACT_INFO.hours}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="lg:col-span-7">
          <Card className="rounded-[24px]">
            <CardHeader>
              <CardTitle className="text-subheading font-medium">
                Send a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-[var(--surface-alt)] border border-[var(--hairline)] flex items-center justify-center mx-auto text-[var(--ink)]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <h3 className="text-subheading font-medium text-[var(--ink)]">
                    Message Received
                  </h3>
                  <p className="text-body text-[var(--mid-gray)] max-w-sm mx-auto">
                    Thank you, {name}. A member of our atelier team will respond to {email} promptly.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSubmitted(false);
                      setMessage("");
                      setSubject("");
                    }}
                    className="rounded-[18px]"
                  >
                    Send Another Note
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Your Name *</Label>
                      <Input
                        id="contactName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Maya Lin"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email Address *</Label>
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
                      <Label htmlFor="contactPhone">Phone Number</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +213 550 12 34 56"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactInquiryType">Inquiry Department</Label>
                      <Select value={inquiryType} onValueChange={setInquiryType}>
                        <SelectTrigger id="contactInquiryType" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Product Inquiry">Product Inquiry</SelectItem>
                          <SelectItem value="Custom Atelier Commission">Custom Atelier Commission</SelectItem>
                          <SelectItem value="Order & Shipping Support">Order & Shipping Support</SelectItem>
                          <SelectItem value="Technical & Hardware">Technical & Hardware</SelectItem>
                          <SelectItem value="Trade & Commercial">Trade & Commercial</SelectItem>
                          <SelectItem value="Product Care & Maintenance">Product Care & Maintenance</SelectItem>
                          <SelectItem value="General">General Inquiries</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactSubject">Subject / Piece of Interest</Label>
                      <Input
                        id="contactSubject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Custom finish inquiry for K-01 Turntable"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactOrderNumber">Order Reference (Optional)</Label>
                      <Input
                        id="contactOrderNumber"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        placeholder="e.g. KRD-104820"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactMessage">Message *</Label>
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
                    <Button type="submit" size="lg" className="w-full rounded-[18px]">
                      Transmit Inquiry
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
