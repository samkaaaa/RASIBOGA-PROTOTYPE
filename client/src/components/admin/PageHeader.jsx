export default function AdminPageHeader({ eyebrow = 'Manajemen konten', title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-brick">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-display text-3xl text-cocoa">{title}</h1>
        {description && (
          <p className="mt-2 font-sans text-xs leading-relaxed text-cocoa-soft">{description}</p>
        )}
      </div>
      {action && (
        <button type="button" onClick={action.onClick} className="btn-primary btn-sm shrink-0">
          {action.icon}
          {action.label}
        </button>
      )}
    </div>
  );
}
