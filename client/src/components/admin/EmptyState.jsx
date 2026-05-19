export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-ms-border bg-white p-10 text-center">
      <h3 className="text-xl font-black text-ms-navy">{title}</h3>
      {description && (
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ms-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}