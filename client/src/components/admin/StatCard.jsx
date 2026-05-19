export default function StatCard({ title, value, helper, icon: Icon }) {
  return (
    <div className="rounded-[2rem] border border-ms-border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-ms-muted">{title}</p>
          <p className="mt-3 text-3xl font-black text-ms-navy">{value}</p>
          {helper && <p className="mt-2 text-xs text-ms-muted">{helper}</p>}
        </div>

        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ms-cream text-ms-navy">
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
}