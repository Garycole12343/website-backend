export function Checkbox({ checked, onCheckedChange, children, className, ...props }) {
  return (
    <label className={className}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="mr-2"
        {...props}
      />
      {children}
    </label>
  );
}
