type SliderFieldProps = {
  error?: string;
  hint?: string;
  label: string;
  max?: number;
  min?: number;
  name: string;
  value: string;
};

export function SliderField({
  error,
  hint,
  label,
  max = 10,
  min = 1,
  name,
  value,
}: SliderFieldProps) {
  const currentValue = Number.parseInt(value, 10);

  return (
    <fieldset className="field">
      <legend className="field-label">
        {label}
        <span className="field-value-chip">{Number.isNaN(currentValue) ? "Unset" : currentValue}</span>
      </legend>
      <div className="rating-grid">
        {Array.from({ length: max - min + 1 }, (_, index) => {
          const option = String(index + min);

          return (
            <label className="rating-option" key={option}>
              <input
                defaultChecked={value === option}
                name={name}
                type="radio"
                value={option}
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
      {hint ? <span className="field-hint">{hint}</span> : null}
      {error ? <span className="field-error">{error}</span> : null}
    </fieldset>
  );
}
