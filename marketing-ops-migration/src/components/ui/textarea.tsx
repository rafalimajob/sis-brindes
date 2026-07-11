import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { className = "", label, id, ...props },
  ref
) {
  const textarea = (
    <textarea
      ref={ref}
      id={id}
      className={`w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 ${className}`}
      {...props}
    />
  );

  if (!label) return textarea;

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
      {textarea}
    </label>
  );
});
