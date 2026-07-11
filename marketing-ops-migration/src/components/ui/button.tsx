import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-brand-primary text-white hover:bg-brand-primary-dark disabled:opacity-50",
  secondary:
    "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700",
  ghost:
    "bg-transparent text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
  danger: "bg-brand-crit text-white hover:opacity-90 disabled:opacity-50",
  success: "bg-brand-ok text-white hover:opacity-90 disabled:opacity-70",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className = "", variant = "primary", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
});
