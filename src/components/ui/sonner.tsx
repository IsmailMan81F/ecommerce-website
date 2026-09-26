import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      richColors
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[var(--paper)] group-[.toaster]:text-[var(--ink)] group-[.toaster]:border-[var(--hairline)] group-[.toaster]:shadow-lg group-[.toaster]:rounded-[18px] group-[.toaster]:p-4",
          description: "group-[.toast]:text-inherit group-[.toast]:opacity-85 text-[13px]",
          actionButton:
            "group-[.toast]:bg-[var(--ink)] group-[.toast]:text-[var(--paper)] group-[.toast]:rounded-[14px]",
          cancelButton:
            "group-[.toast]:bg-[var(--surface-alt)] group-[.toast]:text-[var(--ink)] group-[.toast]:rounded-[14px]",
          success:
            "!bg-emerald-50 !text-emerald-950 !border-emerald-300 dark:!bg-emerald-950 dark:!text-emerald-50 dark:!border-emerald-800 shadow-emerald-500/10",
          error:
            "!bg-rose-50 !text-rose-950 !border-rose-300 dark:!bg-rose-950 dark:!text-rose-50 dark:!border-rose-800 shadow-rose-500/10",
          warning:
            "!bg-amber-50 !text-amber-950 !border-amber-300 dark:!bg-amber-950 dark:!text-amber-50 dark:!border-amber-800",
          info:
            "!bg-sky-50 !text-sky-950 !border-sky-300 dark:!bg-sky-950 dark:!text-sky-50 dark:!border-sky-800",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
