import { InputHTMLAttributes, forwardRef } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className = "", ...props },
  ref
) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
      <input
        ref={ref}
        type="checkbox"
        className={`h-4 w-4 shrink-0 rounded border-zinc-300 text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30 dark:border-zinc-700 dark:bg-zinc-900 ${className}`}
        {...props}
      />
      {label}
    </label>
  );
});
