import type { ReactNode } from "react";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-bold text-white/85">{label}</span>
        {hint ? <span className="text-xs text-white/40">{hint}</span> : null}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

export function TextInput({
  name,
  type = "text",
  placeholder,
  disabled = true,
}: {
  name: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <input
      className="input-dark"
      name={name}
      type={type}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}

export function TextArea({
  name,
  placeholder,
  disabled = true,
  rows = 5,
}: {
  name: string;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}) {
  return (
    <textarea
      className="input-dark min-h-32 resize-y"
      name={name}
      rows={rows}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}

export function Select({
  name,
  options,
  disabled = true,
}: {
  name: string;
  options: readonly string[];
  disabled?: boolean;
}) {
  return (
    <select className="input-dark" name={name} disabled={disabled}>
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}

export function FormNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-sm leading-6 text-white/50">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sun" />
      <span>{children}</span>
    </p>
  );
}
