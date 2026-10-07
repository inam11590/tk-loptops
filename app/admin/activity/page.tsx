import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { requireAdminPage } from "@/lib/admin/guard";
import { getAuditLogs } from "@/lib/auditLog";

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  await requireAdminPage();
  const entries = getAuditLogs({ limit: 200 });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-card">
        <h1 className="font-heading text-xl font-extrabold text-foreground sm:text-2xl">
          Admin Activity &amp; Audit Log ({entries.length})
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Immutable audit trail of product edits, order status changes, coupon
          updates, customer moderation, and settings changes.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-xs text-muted-foreground">
            <Activity className="h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 font-semibold text-foreground">
              No audit log entries recorded yet
            </p>
            <p className="mt-0.5">
              Actions performed in the Admin Panel will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-surface/60 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Administrator</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-surface/40">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">
                        {entry.actorName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {entry.actorEmail}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="uppercase text-[10px]">
                        {entry.entityType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-accent">
                      {entry.action}
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground">
                      {entry.summary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
