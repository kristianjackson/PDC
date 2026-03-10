type ToggleFieldProps = {
  checked: boolean;
  description?: string;
  label: string;
  name: string;
};

export function ToggleField({
  checked,
  description,
  label,
  name,
}: ToggleFieldProps) {
  return (
    <label className="toggle-field">
      <span className="toggle-copy">
        <span className="field-label">{label}</span>
        {description ? <span className="field-hint">{description}</span> : null}
      </span>
      <span className="toggle-control">
        <input defaultChecked={checked} name={name} type="checkbox" value="true" />
        <span className="toggle-indicator" />
      </span>
    </label>
  );
}
