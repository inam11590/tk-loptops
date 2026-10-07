export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-8 w-56 rounded-xl bg-secondary" />
        <div className="h-9 w-36 rounded-xl bg-secondary" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-2xl border border-border/60 bg-secondary/40"
          />
        ))}
      </div>
      <div className="h-80 rounded-2xl border border-border/60 bg-secondary/40" />
    </div>
  );
}
