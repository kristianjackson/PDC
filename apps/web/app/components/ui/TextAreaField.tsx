import type { TextareaHTMLAttributes } from "react";

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
  hint?: string;
  label: string;
};

export function TextAreaField({
  className = "",
  error,
  hint,
  id,
  label,
  name,
  ...props
}: TextAreaFieldProps) {
  const textareaId = id ?? name;

  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <textarea
        {...props}
        className={`field-input field-textarea ${error ? "field-input-error" : ""} ${className}`.trim()}
        id={textareaId}
        name={name}
      />
      {hint ? <span className="field-hint">{hint}</span> : null}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}
