import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className = "", label, children, id, ...props },
  ref
) {
  const select = (
    <select
      ref={ref}
      id={id}
      className={`w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 ${className}`}
      {...props}
    >
      {children}
    </select>
  );

  if (!label) return select;

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
      {select}
    </label>
  );
});
