type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
};

export function Checkbox({ checked, onChange, label, disabled }: CheckboxProps) {
  return (
    <label className="inline-flex min-h-11 cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="size-6 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
      {label ? <span className="text-sm text-slate-700">{label}</span> : null}
    </label>
  );
}
