import type { ReactNode } from "react";

const controlClass =
  "mt-2 w-full rounded-xl border border-line bg-cream/60 px-3.5 py-2.5 text-[15px] text-navy placeholder:text-muted/60 disabled:cursor-not-allowed";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-bold text-navy">{label}</span>
      {children}
    </label>
  );
}

export function TextInput({
  name,
  type = "text",
  placeholder,
}: {
  name: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
}) {
  return (
    <input
      className={controlClass}
      name={name}
      type={type}
      placeholder={placeholder}
      disabled
    />
  );
}

export function TextArea({
  name,
  placeholder,
}: {
  name: string;
  placeholder?: string;
}) {
  return (
    <textarea
      className={`${controlClass} min-h-32`}
      name={name}
      placeholder={placeholder}
      disabled
    />
  );
}

export function Select({
  name,
  options,
}: {
  name: string;
  options: readonly string[];
}) {
  return (
    <select className={controlClass} name={name} disabled>
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}

export function FormNote({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-6 text-muted">{children}</p>;
}
