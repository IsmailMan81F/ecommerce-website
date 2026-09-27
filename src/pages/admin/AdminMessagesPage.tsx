import React, { useState, useMemo } from "react";
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
  AlertTriangle,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export const AdminMessagesPage: React.FC = () => {
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
    toast.success("Message status updated");
  };

  const handleSaveNotes = () => {
    if (!selectedMessage) return;
    updateMessageNotes(selectedMessage.id, internalNotes);
    setSelectedMessage({ ...selectedMessage, notes: internalNotes });
    toast.success("Concierge notes updated");
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Copied ${field} to clipboard`);
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
    toast.success("Message removed");
    setDeleteConfirmOpen(false);
    setMessageToDelete(null);
  };

  const handleMarkAllAsRead = () => {
    messages.forEach((m) => {
      if (m.status === "unread" || m.isRead === false) {
        markMessageRead(m.id, true);
      }
    });
    toast.success("All messages marked as read");
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
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
      if (diffSec < 60) return "Just now";
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-heading-md font-semibold tracking-tight text-[var(--ink)]">
              Client Inquiries
            </h1>
            {unreadMessagesCount > 0 ? (
              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[12px] px-2 py-0.5 font-medium">
                {unreadMessagesCount} Unread
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[12px] text-[var(--mid-gray)]">
                All Read
              </Badge>
            )}
          </div>
          <p className="text-body text-[var(--mid-gray)] mt-1 text-[13px]">
            Incoming customer support transmissions, custom commissions, and private consultation inquiries.
          </p>
        </div>

        {unreadMessagesCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-[13px] rounded-[14px] border-[var(--hairline)] hover:bg-[var(--canvas)] self-start sm:self-auto"
          >
            <CheckCircle2 className="h-4 w-4 mr-2 text-[var(--mid-gray)]" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[var(--surface-alt)] p-4 rounded-[20px] border border-[var(--hairline)] space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Client Name Search Input with explicit label as requested */}
          <div className="relative flex-1">
            <label htmlFor="client-search" className="sr-only">
              Search by client name
            </label>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mid-gray)]" />
            <Input
              id="client-search"
              type="text"
              placeholder="Search by client name, email, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-9 bg-[var(--paper)] border-[var(--hairline)] rounded-[14px] text-[13px] h-10 shadow-2xs placeholder:text-[var(--mid-gray)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mid-gray)] hover:text-[var(--ink)] p-0.5 rounded-full"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Status Tabs */}
          <div className="flex items-center gap-1 bg-[var(--paper)] p-1 rounded-[14px] border border-[var(--hairline)] self-start sm:self-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-[10px] text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === "all"
                  ? "bg-[var(--surface-alt)] text-[var(--ink)] shadow-2xs font-semibold"
                  : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
              }`}
            >
              All ({messages.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("unread")}
              className={`px-3 py-1.5 rounded-[10px] text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === "unread"
                  ? "bg-[var(--surface-alt)] text-[var(--ink)] shadow-2xs font-semibold"
                  : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Unread ({unreadMessagesCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("read")}
              className={`px-3 py-1.5 rounded-[10px] text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === "read"
                  ? "bg-[var(--surface-alt)] text-[var(--ink)] shadow-2xs font-semibold"
                  : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
              }`}
            >
              Read ({messages.length - unreadMessagesCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("replied")}
              className={`px-3 py-1.5 rounded-[10px] text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === "replied"
                  ? "bg-[var(--surface-alt)] text-[var(--ink)] shadow-2xs font-semibold"
                  : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
              }`}
            >
              Replied ({messages.filter((m) => m.status === "replied").length})
            </button>
          </div>
        </div>

        {searchQuery && (
          <p className="text-[12px] text-[var(--mid-gray)] px-1">
            Found {filteredMessages.length} message{filteredMessages.length !== 1 ? "s" : ""} matching &ldquo;
            <span className="text-[var(--ink)] font-medium">{searchQuery}</span>&rdquo;
          </p>
        )}
      </div>

      {/* Messages List */}
      <div className="bg-[var(--paper)] rounded-[20px] border border-[var(--hairline)] overflow-hidden shadow-2xs">
        {filteredMessages.length > 0 ? (
          <div className="divide-y divide-[var(--hairline)]">
            {filteredMessages.map((msg) => {
              const isUnread = msg.status === "unread" || msg.isRead === false;

              return (
                <div
                  key={msg.id}
                  onClick={() => handleOpenMessage(msg)}
                  className={`group p-4 sm:p-5 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isUnread
                      ? "bg-[var(--surface-alt)]/50 hover:bg-[var(--surface-alt)]"
                      : "hover:bg-[var(--surface-alt)]/40"
                  }`}
                >
                  {/* Left Column: Avatar/Status Dot + Client Details + Message snippet */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Read / Unread Indicator Dot */}
                    <div className="pt-1.5 shrink-0">
                      {isUnread ? (
                        <span
                          className="block h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/20"
                          title="Unread message"
                        />
                      ) : (
                        <span
                          className="block h-2.5 w-2.5 rounded-full bg-transparent border border-[var(--mid-gray)]/40"
                          title="Read"
                        />
                      )}
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      {/* Line 1: Client Name + Department Tag + Relative Time */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[15px] tracking-tight ${
                            isUnread
                              ? "font-semibold text-[var(--ink)]"
                              : "font-medium text-[var(--ink)]/80"
                          }`}
                        >
                          {msg.name}
                        </span>

                        {msg.inquiryType && (
                          <Badge
                            variant="secondary"
                            className="text-[11px] font-normal py-0 px-2 rounded-[8px] bg-[var(--canvas)] border border-[var(--hairline)] text-[var(--mid-gray)]"
                          >
                            {msg.inquiryType}
                          </Badge>
                        )}

                        {msg.orderNumber && (
                          <span className="text-[11px] font-mono text-[var(--mid-gray)] bg-[var(--surface-alt)] px-1.5 py-0.5 rounded border border-[var(--hairline)]">
                            Ref: {msg.orderNumber}
                          </span>
                        )}

                        <span className="text-[12px] text-[var(--mid-gray)] ml-auto shrink-0 tabular-nums">
                          {formatRelativeTime(msg.createdAt)}
                        </span>
                      </div>

                      {/* Line 2: Subject */}
                      <p
                        className={`text-[13px] truncate ${
                          isUnread
                            ? "font-medium text-[var(--ink)]"
                            : "text-[var(--mid-gray)]"
                        }`}
                      >
                        {msg.subject || "No subject provided"}
                      </p>

                      {/* Line 3: Message Snippet */}
                      <p className="text-[13px] text-[var(--mid-gray)] line-clamp-1 text-ellipsis">
                        {msg.message}
                      </p>

                      {/* Line 4: Client Contact metadata (email & phone) */}
                      <div className="flex flex-wrap items-center gap-4 pt-1 text-[12px] text-[var(--mid-gray)]">
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate max-w-[200px]">{msg.email}</span>
                        </span>
                        {msg.phone && (
                          <span className="flex items-center gap-1.5 tabular-nums">
                            <Phone className="h-3 w-3 shrink-0" />
                            <span>{msg.phone}</span>
                          </span>
                        )}
                        {msg.notes && (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <MessageSquare className="h-3 w-3 shrink-0" />
                            <span>Has studio notes</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions (Mark Read / Unread toggle + Delete) */}
                  <div
                    className="flex items-center gap-1.5 self-end md:self-center shrink-0 pt-2 md:pt-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleToggleReadStatus(msg.id, e)}
                      title={isUnread ? "Mark as Read" : "Mark as Unread"}
                      className="h-8 px-2.5 text-[12px] rounded-[10px] text-[var(--mid-gray)] hover:text-[var(--ink)]"
                    >
                      {isUnread ? (
                        <>
                          <MailOpen className="h-3.5 w-3.5 mr-1.5 text-amber-600 dark:text-amber-400" />
                          <span>Mark Read</span>
                        </>
                      ) : (
                        <>
                          <Mail className="h-3.5 w-3.5 mr-1.5" />
                          <span>Mark Unread</span>
                        </>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="iconSm"
                      onClick={(e) => confirmDelete(msg, e)}
                      title="Delete inquiry"
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
              No inquiries found
            </h3>
            <p className="text-body text-[var(--mid-gray)] text-[13px] max-w-sm mx-auto">
              {searchQuery
                ? `No messages match your search "${searchQuery}". Try searching another client name or keyword.`
                : "Your customer support inbox is clear. Messages submitted through the Contact page will appear here."}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="rounded-[14px]"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Right Sidebar Detail Drawer (Sheet side="right") */}
      <Sheet open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md p-6 overflow-y-auto space-y-6">
          {selectedMessage && (
            <>
              {/* Sheet Header */}
              <SheetHeader className="text-left space-y-2 border-b border-[var(--hairline)] pb-5">
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
                      ? "Unread"
                      : selectedMessage.status}
                  </Badge>
                </div>

                <SheetTitle className="text-heading-sm font-semibold tracking-tight text-[var(--ink)]">
                  {selectedMessage.name}
                </SheetTitle>

                <SheetDescription className="text-caption text-[var(--mid-gray)] flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>Received {formatDate(selectedMessage.createdAt)}</span>
                </SheetDescription>
              </SheetHeader>

              {/* Status Switcher & Quick Actions */}
              <div className="flex items-center justify-between gap-2 p-3 rounded-[16px] bg-[var(--surface-alt)] border border-[var(--hairline)]">
                <div className="flex items-center gap-2">
                  <Button
                    variant={selectedMessage.isRead || selectedMessage.status !== "unread" ? "secondary" : "default"}
                    size="sm"
                    onClick={() => handleToggleReadStatus(selectedMessage.id)}
                    className="h-8 text-[12px] rounded-[10px]"
                  >
                    {selectedMessage.isRead || selectedMessage.status !== "unread" ? (
                      <>
                        <Mail className="h-3.5 w-3.5 mr-1.5" />
                        Mark as Unread
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                        Mark as Read
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      updateMessageStatus(selectedMessage.id, "replied");
                      setSelectedMessage({ ...selectedMessage, status: "replied", isRead: true });
                      toast.success("Marked as Replied");
                    }}
                    className="h-8 text-[12px] rounded-[10px] text-[var(--mid-gray)] hover:text-[var(--ink)]"
                  >
                    Mark Replied
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="iconSm"
                  onClick={() => confirmDelete(selectedMessage)}
                  className="h-8 w-8 text-[var(--mid-gray)] hover:text-rose-600 rounded-[10px]"
                  title="Delete message"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Client Contact Profile Card */}
              <div className="space-y-3">
                <p className="text-caption text-[var(--ink)] font-semibold tracking-wider uppercase">
                  Client Coordinates
                </p>

                <div className="rounded-[18px] border border-[var(--hairline)] p-4 bg-[var(--surface-alt)] space-y-3 text-[13px]">
                  {/* Full Name */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <User className="h-4 w-4 text-[var(--mid-gray)] shrink-0" />
                      <div>
                        <span className="text-[11px] text-[var(--mid-gray)] block">Client Name</span>
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
                        <span className="text-[11px] text-[var(--mid-gray)] block">Email Address</span>
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
                        title="Copy email"
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
                        <span className="text-[11px] text-[var(--mid-gray)] block">Phone Number</span>
                        {selectedMessage.phone ? (
                          <a
                            href={`tel:${selectedMessage.phone}`}
                            className="font-medium text-[var(--ink)] tabular-nums hover:underline"
                          >
                            {selectedMessage.phone}
                          </a>
                        ) : (
                          <span className="text-[var(--mid-gray)] italic">Not provided</span>
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
                          title="Copy phone"
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
                  Inquiry Specifications
                </p>

                <div className="rounded-[18px] border border-[var(--hairline)] p-4 bg-[var(--surface-alt)] space-y-3 text-[13px]">
                  {/* Department */}
                  <div>
                    <span className="text-[11px] text-[var(--mid-gray)] block mb-1">Inquiry Department</span>
                    <Badge variant="outline" className="bg-[var(--paper)] text-[12px]">
                      {selectedMessage.inquiryType || "General Inquiry"}
                    </Badge>
                  </div>

                  {/* Subject */}
                  <div className="pt-2 border-t border-[var(--hairline)]/60">
                    <span className="text-[11px] text-[var(--mid-gray)] block mb-1">Subject / Piece</span>
                    <p className="font-medium text-[var(--ink)] text-[14px]">
                      {selectedMessage.subject || "No subject specified"}
                    </p>
                  </div>

                  {/* Order Reference if applicable */}
                  {selectedMessage.orderNumber && (
                    <div className="pt-2 border-t border-[var(--hairline)]/60 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-[var(--mid-gray)] block">Order Reference</span>
                        <span className="font-mono font-medium text-[var(--ink)]">
                          {selectedMessage.orderNumber}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-[11px]">
                        Linked Order
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Full Message Body */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-caption text-[var(--ink)] font-semibold tracking-wider uppercase">
                    Message Content
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
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy text
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
                  Studio Concierge Notes
                </label>
                <Textarea
                  id="staff-notes"
                  placeholder="Record internal notes (e.g. Quotation sent, follow-up scheduled for next Tuesday, telephone discussion summary)..."
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
                  Save Internal Note
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
                  <span>Reply via Email Client</span>
                </a>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md rounded-[24px]">
          <DialogHeader className="space-y-2">
            <div className="h-10 w-10 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-subheading font-medium">
              Delete Client Inquiry?
            </DialogTitle>
            <DialogDescription className="text-body text-[var(--mid-gray)] text-[13px]">
              Are you sure you want to permanently remove this inquiry from{" "}
              <strong className="text-[var(--ink)]">{messageToDelete?.name}</strong>? This action cannot be reversed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              className="rounded-[14px]"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={executeDelete}
              className="rounded-[14px]"
            >
              Delete Inquiry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
