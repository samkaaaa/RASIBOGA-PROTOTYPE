export default function Field({
  label,
  hint,
  error,
  required = false,
  children,
  className = '',
}) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="admin-label">
          {label}
          {required && <span className="ml-1 text-brick">*</span>}
        </span>
      )}
      {children}
      {error ? (
        <span className="mt-1 block font-sans text-[11px] text-brick">{error}</span>
      ) : (
        hint && <span className="mt-1 block font-sans text-[11px] text-cocoa-faint">{hint}</span>
      )}
    </label>
  );
}
