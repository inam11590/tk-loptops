export default function AdminSettingsLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-20 rounded-2xl border border-border/60 bg-secondary/40" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-96 rounded-2xl border border-border/60 bg-secondary/40" />
        <div className="h-96 rounded-2xl border border-border/60 bg-secondary/40" />
      </div>
    </div>
  );
}
