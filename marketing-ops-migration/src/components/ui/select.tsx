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
      className={`w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors hover:border-zinc-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-zinc-600 ${className}`}
      {...props}
    >
      {children}
    </select>
  );

  if (!label) return select;

  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      {select}
    </label>
  );
});
