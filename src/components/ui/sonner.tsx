import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[var(--paper)] group-[.toaster]:text-[var(--ink)] group-[.toaster]:border-[var(--hairline)] group-[.toaster]:shadow-lg group-[.toaster]:rounded-[18px] group-[.toaster]:p-4",
          description: "group-[.toast]:text-[var(--mid-gray)] text-[13px]",
          actionButton:
            "group-[.toast]:bg-[var(--ink)] group-[.toast]:text-[var(--paper)] group-[.toast]:rounded-[14px]",
          cancelButton:
            "group-[.toast]:bg-[var(--surface-alt)] group-[.toast]:text-[var(--ink)] group-[.toast]:rounded-[14px]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
