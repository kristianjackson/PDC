import type { InputHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  hint?: string;
  label: string;
};

export function InputField({
  className = "",
  error,
  hint,
  id,
  label,
  name,
  ...props
}: InputFieldProps) {
  const inputId = id ?? name;

  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input
        {...props}
        className={`field-input ${error ? "field-input-error" : ""} ${className}`.trim()}
        id={inputId}
        name={name}
      />
      {hint ? <span className="field-hint">{hint}</span> : null}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}
