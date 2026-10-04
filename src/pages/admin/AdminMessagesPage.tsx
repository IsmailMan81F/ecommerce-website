import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@/context/StoreContext";
import { ContactMessage } from "@/types";
import { toast } from "sonner";
import {
  Search,
  Mail,
  MailOpen,
  Phone,
  Calendar,
  User,
  Clock,
  Trash2,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  FileText,
  Copy,
  Check,
  Tag,
  ArrowUpRight,
  Reply,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { lockViewportScroll } from "@/lib/scrollLock";
import { AdminDeleteConfirmationDialog } from "@/components/admin/AdminDeleteConfirmationDialog";

export const AdminMessagesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const {
    messages,
    unreadMessagesCount,
    markMessageRead,
    toggleMessageRead,
    updateMessageStatus,
    deleteMessage,
    updateMessageNotes,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read" | "replied">("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [internalNotes, setInternalNotes] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(null);

  // Fix height of main screen and lock background scroll when message detail or delete modal is open
  React.useEffect(() => {
    if (selectedMessage || deleteConfirmOpen) {
      return lockViewportScroll();
    }
  }, [selectedMessage, deleteConfirmOpen]);

  // Filter messages based on search query (name, email, phone, subject, content) and status
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      // Status filter
      if (statusFilter === "unread" && msg.status !== "unread" && msg.isRead !== false) {
        return false;
      }
      if (statusFilter === "read" && (msg.status === "unread" || msg.isRead === false)) {
        return false;
      }
      if (statusFilter === "replied" && msg.status !== "replied") {
        return false;
      }

      // Search query - client name is the primary match as requested
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = msg.name.toLowerCase().includes(query);
        const emailMatch = msg.email.toLowerCase().includes(query);
        const phoneMatch = msg.phone?.toLowerCase().includes(query) ?? false;
        const subjectMatch = msg.subject?.toLowerCase().includes(query) ?? false;
        const messageMatch = msg.message.toLowerCase().includes(query);
        const orderMatch = msg.orderNumber?.toLowerCase().includes(query) ?? false;

        if (!nameMatch && !emailMatch && !phoneMatch && !subjectMatch && !messageMatch && !orderMatch) {
          return false;
        }
      }

      return true;
    });
  }, [messages, statusFilter, searchQuery]);

  const handleOpenMessage = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setInternalNotes(msg.notes || "");
    // Automatically mark message as read upon opening
    if (msg.status === "unread" || msg.isRead === false) {
      markMessageRead(msg.id, true);
    }
  };

  const handleToggleReadStatus = (msgId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    toggleMessageRead(msgId);
    if (selectedMessage && selectedMessage.id === msgId) {
      const nextIsRead = !(selectedMessage.status === "read" || selectedMessage.isRead === true);
      setSelectedMessage({
        ...selectedMessage,
        isRead: nextIsRead,
        status: nextIsRead ? "read" : "unread",
      });
    }
    toast.success(t("admin.messageStatusUpdated"));
  };

  const handleSaveNotes = () => {
    if (!selectedMessage) return;
    updateMessageNotes(selectedMessage.id, internalNotes);
    setSelectedMessage({ ...selectedMessage, notes: internalNotes });
    toast.success(t("admin.noteSaved"));
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(t("admin.copiedToClipboard", { field }));
    setTimeout(() => setCopiedField(null), 2000);
  };

  const confirmDelete = (msg: ContactMessage, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setMessageToDelete(msg);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = () => {
    if (!messageToDelete) return;
    deleteMessage(messageToDelete.id);
    if (selectedMessage?.id === messageToDelete.id) {
      setSelectedMessage(null);
    }
    toast.success(t("admin.deleteTransmission"));
    setDeleteConfirmOpen(false);
    setMessageToDelete(null);
  };

  const handleMarkAllAsRead = () => {
    messages.forEach((m) => {
      if (m.status === "unread" || m.isRead === false) {
        markMessageRead(m.id, true);
      }
    });
    toast.success(t("admin.allMarkedRead"));
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(i18n.language === "ar" ? "ar-DZ" : i18n.language === "fr" ? "fr-FR" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSec < 60) return t("admin.justNow");
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return t("admin.minutesAgo", { count: diffMin });
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return t("admin.hoursAgo", { count: diffHours });
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return t("admin.daysAgo", { count: diffDays });
      return date.toLocaleDateString(i18n.language === "ar" ? "ar-DZ" : i18n.language === "fr" ? "fr-FR" : "en-US", { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0 overflow-x-clip">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full max-w-full min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-heading-md font-semibold tracking-tight text-[var(--ink)]">
              {t("admin.inquiriesTitle")}
            </h1>
            {unreadMessagesCount > 0 ? (
              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[12px] px-2 py-0.5 font-medium shrink-0">
                {t("admin.unreadBadge", { count: unreadMessagesCount })}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[12px] text-[var(--mid-gray)] shrink-0">
                {t("admin.allReadBadge")}
              </Badge>
            )}
          </div>
          <p className="text-body text-[var(--mid-gray)] mt-1 text-[13px] truncate">
            {t("admin.inquiriesSubtitle")}
          </p>
        </div>

        {unreadMessagesCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-[13px] rounded-[14px] border-[var(--hairline)] hover:bg-[var(--canvas)] self-start sm:self-auto shrink-0 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 text-[var(--mid-gray)]" />
            <span>{t("admin.markAllRead")}</span>
          </Button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[var(--surface-alt)] p-3 sm:p-4 rounded-[20px] border border-[var(--hairline)] space-y-3 w-full max-w-full min-w-0 overflow-hidden">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 w-full min-w-0 max-w-full">
          {/* Client Name Search Input */}
          <div className="relative flex-1 min-w-0 w-full">
            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mid-gray)]" />
            <Input
              id="client-search"
              type="text"
              placeholder={t("admin.searchMessages")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-10 pe-9 bg-[var(--paper)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10 shadow-2xs placeholder:text-[var(--mid-gray)] w-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-[var(--mid-gray)] hover:text-[var(--ink)] p-0.5 rounded-full cursor-pointer"
                aria-label={t("admin.clearSearch")}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Status Tabs: 2 on first line, 2 on second line on mobile/tablet/narrower space, and all 4 on a single line when enough space is available (xl:grid-cols-4 / flex on wide viewports) */}
          <div className="w-full xl:w-auto grid grid-cols-2 xl:flex xl:flex-row items-center gap-1.5 bg-[var(--paper)] p-1.5 rounded-[16px] border border-[var(--hairline)] shrink-0 max-w-full">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-2 rounded-[10px] text-[12px] font-medium transition-colors cursor-pointer text-center justify-center flex items-center whitespace-nowrap ${
                statusFilter === "all"
                  ? "bg-[var(--surface-alt)] text-[var(--ink)] shadow-2xs font-semibold"
                  : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
              }`}
            >
              <span>{t("admin.tabAll", { count: messages.length })}</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("unread")}
              className={`px-3 py-2 rounded-[10px] text-[12px] font-medium transition-colors cursor-pointer text-center justify-center flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === "unread"
                  ? "bg-[var(--surface-alt)] text-[var(--ink)] shadow-2xs font-semibold"
                  : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>{t("admin.tabUnread", { count: unreadMessagesCount })}</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("read")}
              className={`px-3 py-2 rounded-[10px] text-[12px] font-medium transition-colors cursor-pointer text-center justify-center flex items-center whitespace-nowrap ${
                statusFilter === "read"
                  ? "bg-[var(--surface-alt)] text-[var(--ink)] shadow-2xs font-semibold"
                  : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
              }`}
            >
              <span>{t("admin.tabRead", { count: messages.length - unreadMessagesCount })}</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("replied")}
              className={`px-3 py-2 rounded-[10px] text-[12px] font-medium transition-colors cursor-pointer text-center justify-center flex items-center whitespace-nowrap ${
                statusFilter === "replied"
                  ? "bg-[var(--surface-alt)] text-[var(--ink)] shadow-2xs font-semibold"
                  : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
              }`}
            >
              <span>{t("admin.tabReplied", { count: messages.filter((m) => m.status === "replied").length })}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-[var(--paper)] rounded-[20px] border border-[var(--hairline)] shadow-2xs w-full max-w-full">
        {filteredMessages.length > 0 ? (
          <div className="w-full max-w-full space-y-3 p-3 sm:p-4">
            {filteredMessages.map((msg) => {
              const isUnread = msg.status === "unread" || msg.isRead === false;

              return (
                <div
                  key={msg.id}
                  onClick={() => handleOpenMessage(msg)}
                  className={`group grid w-full min-w-0 grid-cols-1 gap-4 rounded-[16px] border border-[var(--hairline)] p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5 transition-colors cursor-pointer ${
                    isUnread
                      ? "bg-[var(--surface-alt)]/60 hover:bg-[var(--surface-alt)]"
                      : "bg-[var(--paper)] hover:bg-[var(--surface-alt)]/60"
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="pt-1.5 shrink-0">
                      {isUnread ? (
                        <span
                          className="block h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/20"
                          aria-label={t("admin.statusUnread")}
                        />
                      ) : (
                        <span
                          className="block h-2.5 w-2.5 rounded-full bg-transparent border border-[var(--mid-gray)]/40"
                          aria-label={t("admin.statusRead")}
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                        <span
                          className={`min-w-0 break-words text-[15px] tracking-tight ${
                            isUnread
                              ? "font-semibold text-[var(--ink)]"
                              : "font-medium text-[var(--ink)]/80"
                          }`}
                        >
                          {msg.name}
                        </span>
                        <span className="max-w-full text-[12px] text-[var(--mid-gray)] tabular-nums sm:ms-auto">
                          {formatRelativeTime(msg.createdAt)}
                        </span>
                      </div>

                      <p
                        className={`break-words text-[13px] ${
                          isUnread
                            ? "font-medium text-[var(--ink)]"
                            : "text-[var(--mid-gray)]"
                        }`}
                      >
                        {msg.subject || t("contact.subject")}
                      </p>

                      <div className="grid min-w-0 grid-cols-1 gap-x-6 gap-y-1 pt-1 text-[12px] text-[var(--mid-gray)] sm:grid-cols-2">
                        <span className="flex min-w-0 items-start gap-1.5">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="min-w-0 break-all">{msg.email}</span>
                        </span>
                        <span className="flex min-w-0 items-start gap-1.5 tabular-nums">
                          <Phone className="h-3 w-3 shrink-0" />
                          <span className="min-w-0 break-words">{msg.phone || "-"}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex min-w-0 flex-wrap items-center justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleToggleReadStatus(msg.id, e)}
                      title={isUnread ? t("admin.markAsRead") : t("admin.markAsUnread")}
                      className="h-auto min-h-9 max-w-full whitespace-normal rounded-[10px] px-2.5 py-1 text-start text-[12px] text-[var(--mid-gray)] hover:text-[var(--ink)]"
                    >
                      {isUnread ? (
                        <>
                          <MailOpen className="h-3.5 w-3.5 mr-1.5 text-amber-600 dark:text-amber-400" />
                          <span>{t("admin.markAsRead")}</span>
                        </>
                      ) : (
                        <>
                          <Mail className="h-3.5 w-3.5 mr-1.5" />
                          <span>{t("admin.markAsUnread")}</span>
                        </>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="iconSm"
                      onClick={(e) => confirmDelete(msg, e)}
                      title={t("admin.deleteTransmission")}
                      aria-label={t("admin.deleteTransmission")}
                      className="h-8 w-8 text-[var(--mid-gray)] hover:text-rose-600 hover:bg-rose-500/10 rounded-[10px]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-[var(--surface-alt)] border border-[var(--hairline)] flex items-center justify-center mx-auto text-[var(--mid-gray)]">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="text-subheading font-medium text-[var(--ink)]">
              {t("admin.noMessages")}
            </h3>
            <p className="text-body text-[var(--mid-gray)] text-[13px] max-w-sm mx-auto">
              {searchQuery
                ? t("admin.noMessagesDesc")
                : t("admin.noMessagesDesc")}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="rounded-[14px]"
              >
                {t("admin.reset")}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Right Sidebar Detail Drawer (Reversed for RTL) */}
      <Sheet open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <SheetContent side={isRtl ? "left" : "right"} className="w-full max-w-[100vw] sm:w-[clamp(360px,30vw,560px)] sm:max-w-[calc(100vw-3rem)] p-6 overflow-y-auto space-y-6">
          {selectedMessage && (
            <>
              {/* Sheet Header */}
              <SheetHeader className="text-start space-y-2 border-b border-[var(--hairline)] pb-5">
                <div className="flex items-center justify-between">
                  <span className="text-caption font-mono text-[var(--mid-gray)]">
                    {selectedMessage.id}
                  </span>
                  <Badge
                    variant="outline"
                    className={`capitalize text-[11px] px-2 py-0.5 rounded-[8px] ${
                      selectedMessage.status === "unread" || selectedMessage.isRead === false
                        ? "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 font-medium"
                        : selectedMessage.status === "replied"
                        ? "bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800 font-medium"
                        : "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 font-medium"
                    }`}
                  >
                    {selectedMessage.status === "unread" || selectedMessage.isRead === false
                      ? t("admin.statusUnread")
                      : selectedMessage.status === "replied"
                      ? t("admin.statusReplied")
                      : t("admin.statusRead")}
                  </Badge>
                </div>

                <SheetTitle className="text-heading-sm font-semibold tracking-tight text-[var(--ink)]">
                  {selectedMessage.name}
                </SheetTitle>

                <SheetDescription className="text-caption text-[var(--mid-gray)] flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>{t("admin.transmissionDetailsDesc", { date: formatDate(selectedMessage.createdAt) })}</span>
                </SheetDescription>
              </SheetHeader>

              {/* Status Switcher & Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-[16px] bg-[var(--surface-alt)] border border-[var(--hairline)]">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <Button
                    variant={selectedMessage.isRead || selectedMessage.status !== "unread" ? "secondary" : "default"}
                    size="sm"
                    onClick={() => handleToggleReadStatus(selectedMessage.id)}
                    className="h-8 text-[12px] rounded-[10px] whitespace-normal text-start"
                  >
                    {selectedMessage.isRead || selectedMessage.status !== "unread" ? (
                      <>
                        <Mail className="h-3.5 w-3.5 mr-1.5" />
                        {t("admin.markAsUnread")}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                        {t("admin.markAsRead")}
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      updateMessageStatus(selectedMessage.id, "replied");
                      setSelectedMessage({ ...selectedMessage, status: "replied", isRead: true });
                      toast.success(t("admin.markReplied"));
                    }}
                    className="h-8 text-[12px] rounded-[10px] text-[var(--mid-gray)] hover:text-[var(--ink)] whitespace-normal text-start"
                  >
                    {t("admin.markReplied")}
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="iconSm"
                  onClick={() => confirmDelete(selectedMessage)}
                  className="h-8 w-8 text-[var(--mid-gray)] hover:text-rose-600 rounded-[10px]"
                  title={t("admin.deleteTransmission")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Client Contact Profile Card */}
              <div className="space-y-3">
                <p className="text-caption text-[var(--ink)] font-semibold tracking-wider uppercase">
                  {t("admin.senderInfo")}
                </p>

                <div className="rounded-[18px] border border-[var(--hairline)] p-4 bg-[var(--surface-alt)] space-y-3 text-[13px]">
                  {/* Full Name */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <User className="h-4 w-4 text-[var(--mid-gray)] shrink-0" />
                      <div>
                        <span className="text-[11px] text-[var(--mid-gray)] block">{t("admin.clientName")}</span>
                        <span className="font-medium text-[var(--ink)]">{selectedMessage.name}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="iconSm"
                      onClick={() => handleCopy(selectedMessage.name, "name")}
                      className="h-7 w-7 text-[var(--mid-gray)] hover:text-[var(--ink)]"
                    >
                      {copiedField === "name" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>

                  {/* Email */}
                  <div className="flex items-start justify-between gap-2 pt-2 border-t border-[var(--hairline)]/60">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Mail className="h-4 w-4 text-[var(--mid-gray)] shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[11px] text-[var(--mid-gray)] block">{t("admin.emailAddress")}</span>
                        <a
                          href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || "Atelier Inquiry")}`}
                          className="font-medium text-[var(--ink)] hover:underline truncate block"
                        >
                          {selectedMessage.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="iconSm"
                        onClick={() => handleCopy(selectedMessage.email, "email")}
                        className="h-7 w-7 text-[var(--mid-gray)] hover:text-[var(--ink)]"
                        title={t("admin.emailAddress")}
                      >
                        {copiedField === "email" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                      <a
                        href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || "Atelier Inquiry")}`}
                        className="h-7 w-7 inline-flex items-center justify-center rounded-[8px] text-[var(--mid-gray)] hover:text-[var(--ink)] hover:bg-[var(--paper)] transition-colors"
                        title="Draft email"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="flex items-start justify-between gap-2 pt-2 border-t border-[var(--hairline)]/60">
                    <div className="flex items-center gap-2.5">
                      <Phone className="h-4 w-4 text-[var(--mid-gray)] shrink-0" />
                      <div>
                        <span className="text-[11px] text-[var(--mid-gray)] block">{t("admin.phoneNumber")}</span>
                        {selectedMessage.phone ? (
                          <a
                            href={`tel:${selectedMessage.phone}`}
                            className="font-medium text-[var(--ink)] tabular-nums hover:underline"
                          >
                            {selectedMessage.phone}
                          </a>
                        ) : (
                          <span className="text-[var(--mid-gray)] italic">-</span>
                        )}
                      </div>
                    </div>
                    {selectedMessage.phone && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="iconSm"
                          onClick={() => handleCopy(selectedMessage.phone!, "phone")}
                          className="h-7 w-7 text-[var(--mid-gray)] hover:text-[var(--ink)]"
                          title={t("admin.phoneNumber")}
                        >
                          {copiedField === "phone" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        </Button>
                        <a
                          href={`tel:${selectedMessage.phone}`}
                          className="h-7 w-7 inline-flex items-center justify-center rounded-[8px] text-[var(--mid-gray)] hover:text-[var(--ink)] hover:bg-[var(--paper)] transition-colors"
                          title="Call phone"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Inquiry & Context Details */}
              <div className="space-y-3">
                <p className="text-caption text-[var(--ink)] font-semibold tracking-wider uppercase">
                  {t("admin.inquiryType")}
                </p>

                <div className="rounded-[18px] border border-[var(--hairline)] p-4 bg-[var(--surface-alt)] space-y-3 text-[13px]">
                  {/* Department */}
                  <div>
                    <span className="text-[11px] text-[var(--mid-gray)] block mb-1">{t("admin.inquiryType")}</span>
                    <Badge variant="outline" className="bg-[var(--paper)] text-[12px]">
                      {selectedMessage.inquiryType || t("contact.generalInquiry")}
                    </Badge>
                  </div>

                  {/* Subject */}
                  <div className="pt-2 border-t border-[var(--hairline)]/60">
                    <span className="text-[11px] text-[var(--mid-gray)] block mb-1">{t("contact.subject")}</span>
                    <p className="font-medium text-[var(--ink)] text-[14px]">
                      {selectedMessage.subject || "-"}
                    </p>
                  </div>

                  {/* Order Reference if applicable */}
                  {selectedMessage.orderNumber && (
                    <div className="pt-2 border-t border-[var(--hairline)]/60 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-[var(--mid-gray)] block">{t("admin.orderReference")}</span>
                        <span className="font-mono font-medium text-[var(--ink)]">
                          {selectedMessage.orderNumber}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-[11px]">
                        {t("admin.orderReference")}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Full Message Body */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-caption text-[var(--ink)] font-semibold tracking-wider uppercase">
                    {t("admin.messageContent")}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(selectedMessage.message, "message")}
                    className="h-6 px-2 text-[11px] text-[var(--mid-gray)] hover:text-[var(--ink)]"
                  >
                    {copiedField === "message" ? (
                      <>
                        <Check className="h-3 w-3 mr-1 text-emerald-600" />
                        {t("admin.noteSaved")}
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        {t("common.search")}
                      </>
                    )}
                  </Button>
                </div>

                <div className="rounded-[18px] border border-[var(--hairline)] p-4 bg-[var(--paper)] text-[13px] leading-relaxed text-[var(--ink)] whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Internal Atelier Notes */}
              <div className="space-y-2 pt-2 border-t border-[var(--hairline)]">
                <label htmlFor="staff-notes" className="text-caption text-[var(--ink)] font-semibold block">
                  {t("admin.internalNotes")}
                </label>
                <Textarea
                  id="staff-notes"
                  placeholder={t("admin.internalNotesPlaceholder")}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={3}
                  className="text-[13px] bg-[var(--surface-alt)] border-[var(--hairline)] rounded-[14px]"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveNotes}
                  className="rounded-[12px] text-[12px] h-8 mt-1"
                >
                  {t("admin.saveNote")}
                </Button>
              </div>

              {/* Reply Email Action */}
              <div className="pt-4 border-t border-[var(--hairline)]">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                    selectedMessage.subject || "Atelier Inquiry"
                  )}`}
                  className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[16px] bg-[var(--ink)] text-[var(--paper)] font-medium text-[13px] hover:opacity-90 transition-opacity"
                >
                  <Reply className="h-4 w-4" />
                  <span>{t("admin.replyViaEmail")}</span>
                </a>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AdminDeleteConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t("admin.deleteInquiryTitle")}
        description={t("admin.deleteInquiryConfirm", { name: messageToDelete?.name })}
        cancelLabel={t("common.cancel")}
        confirmLabel={t("admin.deleteInquiryBtn")}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={executeDelete}
      />
    </div>
  );
};
