import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AdminDeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  cancelLabel: string;
  confirmLabel: string;
  onCancel?: () => void;
  onConfirm: () => void;
  children?: React.ReactNode;
}

export const AdminDeleteConfirmationDialog: React.FC<AdminDeleteConfirmationDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  children,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[420px] p-6 text-center">
      <div className="h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
        <Trash2 className="h-7 w-7" />
      </div>
      <DialogHeader className="text-center sm:text-center">
        <DialogTitle className="text-heading-sm text-[var(--ink)]">
          {title}
        </DialogTitle>
        <DialogDescription className="text-body text-[var(--mid-gray)] text-[13px] pt-1">
          {description}
        </DialogDescription>
      </DialogHeader>
      {children}
      <DialogFooter className="flex flex-wrap items-center justify-end gap-2.5 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel ?? (() => onOpenChange(false))}
          className="rounded-[18px]"
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={onConfirm}
          className="rounded-[18px] px-5 bg-rose-600 hover:bg-rose-700 text-white"
        >
          {confirmLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);