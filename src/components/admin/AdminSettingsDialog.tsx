import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useAdminTheme } from "@/context/AdminThemeContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LogOut, Sun, Moon, Laptop, Check } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface AdminSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdminSettingsDialog: React.FC<AdminSettingsDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation();
  const { username, logout, updateCredentials } = useAuth();
  const { theme, setTheme } = useAdminTheme();

  const [newUsername, setNewUsername] = useState(username);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Sync username if changed
  useEffect(() => {
    setNewUsername(username);
  }, [username, open]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if password change is attempted
    if (newPassword || currentPassword || confirmPassword) {
      if (!currentPassword) {
        toast.error("Current password is required to save credential changes");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("New password and confirm password do not match");
        return;
      }
      if (newPassword.length < 3) {
        toast.error("New password must be at least 3 characters");
        return;
      }

      const res = updateCredentials(currentPassword, newUsername, newPassword);
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onOpenChange(false);
      return;
    }

    // Only username changed
    if (newUsername !== username) {
      if (!currentPassword) {
        toast.error("Please enter your current password to confirm username update");
        return;
      }
      const res = updateCredentials(currentPassword, newUsername);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success("Username updated");
      setCurrentPassword("");
      onOpenChange(false);
      return;
    }

    toast.success("Settings saved");
    onOpenChange(false);
  };

  const handleLogout = () => {
    onOpenChange(false);
    logout();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-subheading font-medium">
            {t("admin.settings")}
          </DialogTitle>
          <DialogDescription className="text-body text-[var(--mid-gray)] text-[13px]">
            {t("admin.storeSettingsSubtitle")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSaveSettings} className="space-y-6 pt-2">
          {/* Language Selection */}
          <div className="space-y-2">
            <Label>{t("common.language")}</Label>
            <LanguageSwitcher variant="card" className="w-full justify-between" />
          </div>

          <Separator />

          {/* Theme Selector */}
          <div className="space-y-2">
            <Label>{t("admin.theme")}</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex items-center justify-center gap-2 h-10 px-3 rounded-[14px] text-[13px] font-medium border transition-colors cursor-pointer ${
                  theme === "light"
                    ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]"
                    : "bg-[var(--surface-alt)] text-[var(--ink)] border-[var(--hairline)] hover:border-[var(--mid-gray)]"
                }`}
              >
                <Sun className="h-4 w-4" />
                <span>{t("common.light")}</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex items-center justify-center gap-2 h-10 px-3 rounded-[14px] text-[13px] font-medium border transition-colors cursor-pointer ${
                  theme === "dark"
                    ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]"
                    : "bg-[var(--surface-alt)] text-[var(--ink)] border-[var(--hairline)] hover:border-[var(--mid-gray)]"
                }`}
              >
                <Moon className="h-4 w-4" />
                <span>{t("common.dark")}</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`flex items-center justify-center gap-2 h-10 px-3 rounded-[14px] text-[13px] font-medium border transition-colors cursor-pointer ${
                  theme === "system"
                    ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]"
                    : "bg-[var(--surface-alt)] text-[var(--ink)] border-[var(--hairline)] hover:border-[var(--mid-gray)]"
                }`}
              >
                <Laptop className="h-4 w-4" />
                <span>{t("common.system")}</span>
              </button>
            </div>
          </div>

          <Separator />

          {/* Change Username */}
          <div className="space-y-2">
            <Label htmlFor="settings-username">{t("admin.username")}</Label>
            <Input
              id="settings-username"
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="h-10 text-[14px]"
              required
            />
          </div>

          {/* Change Password */}
          <div className="space-y-3">
            <p className="text-caption text-[var(--mid-gray)]">{t("admin.updatePassword")}</p>
            <div className="space-y-2">
              <Label htmlFor="settings-current-pass">{t("admin.currentPassword")}</Label>
              <Input
                id="settings-current-pass"
                type="password"
                placeholder={t("admin.currentPassword")}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-10 text-[14px]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="settings-new-pass">{t("admin.newPassword")}</Label>
                <Input
                  id="settings-new-pass"
                  type="password"
                  placeholder={t("admin.newPassword")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-10 text-[14px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="settings-confirm-pass">{t("admin.confirmPassword")}</Label>
                <Input
                  id="settings-confirm-pass"
                  type="password"
                  placeholder={t("admin.confirmPassword")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 text-[14px]"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Log Out Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-[16px] bg-[var(--surface-alt)] border border-[var(--hairline)]">
            <div>
              <p className="text-[14px] font-medium text-[var(--ink)]">{t("admin.terminateSession")}</p>
              <p className="text-[12px] text-[var(--mid-gray)]">Sign out of this console on this machine</p>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 rounded-[14px] px-3.5 bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{t("admin.logOutBtn")}</span>
            </Button>
          </div>

          <DialogFooter className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-[18px] cursor-pointer"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              className="rounded-[18px] bg-[var(--ink-soft)] hover:bg-[var(--ink)] text-[var(--paper)] px-5 gap-1.5 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>{t("common.saveChanges")}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
