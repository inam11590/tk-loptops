import fs from "fs";
import path from "path";

export type AuditEntityType =
  | "product"
  | "order"
  | "customer"
  | "coupon"
  | "review"
  | "settings"
  | "auth";

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  action: string;
  entityType: AuditEntityType;
  entityId: string;
  summary: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const AUDIT_FILE = path.join(DATA_DIR, "audit-log.json");

const SEED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "aud-seed-1",
    actorId: "usr-admin-seed",
    actorName: "TK Store Administrator",
    actorEmail: process.env.ADMIN_EMAIL || "admin@tklaptop.com",
    action: "settings.initialize",
    entityType: "settings",
    entityId: "store-settings",
    summary: "Initialized store settings and default shipping & tax rules",
    createdAt: "2026-10-01T09:00:00.000Z",
  },
  {
    id: "aud-seed-2",
    actorId: "usr-admin-seed",
    actorName: "TK Store Administrator",
    actorEmail: process.env.ADMIN_EMAIL || "admin@tklaptop.com",
    action: "order.status_change",
    entityType: "order",
    entityId: "TK-20261005-1042",
    summary: "Updated order TK-20261005-1042 status from Confirmed to Shipped",
    metadata: {
      previousStatus: "Confirmed",
      newStatus: "Shipped",
      courier: "FedEx Priority Air",
      trackingNumber: "FX-8849201948",
    },
    createdAt: "2026-10-05T18:00:00.000Z",
  },
];

const globalForAudit = globalThis as unknown as {
  __tkAuditLogCache?: AuditLogEntry[];
};

function readAuditLogsFromDisk(): AuditLogEntry[] {
  try {
    if (fs.existsSync(AUDIT_FILE)) {
      const raw = fs.readFileSync(AUDIT_FILE, "utf8");
      const parsed = JSON.parse(raw) as AuditLogEntry[];
      if (Array.isArray(parsed)) {
        globalForAudit.__tkAuditLogCache = parsed;
        return parsed;
      }
    }
  } catch {
    // Fallback to in-memory cache
  }

  if (!globalForAudit.__tkAuditLogCache) {
    globalForAudit.__tkAuditLogCache = [...SEED_AUDIT_LOGS];
    writeAuditLogsToDisk(globalForAudit.__tkAuditLogCache);
  }
  return globalForAudit.__tkAuditLogCache;
}

function writeAuditLogsToDisk(logs: AuditLogEntry[]): void {
  globalForAudit.__tkAuditLogCache = logs;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2), "utf8");
  } catch {
    // Keep in-memory cache if disk write is restricted
  }
}

/**
 * Appends a new audit log entry and persists to `.data/audit-log.json`.
 */
export function recordAuditLog(input: {
  actor: { id: string; fullName: string; email: string };
  action: string;
  entityType: AuditEntityType;
  entityId: string;
  summary: string;
  metadata?: Record<string, unknown>;
}): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: `aud-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    actorId: input.actor.id,
    actorName: input.actor.fullName,
    actorEmail: input.actor.email,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    summary: input.summary,
    metadata: input.metadata,
    createdAt: new Date().toISOString(),
  };

  const existing = readAuditLogsFromDisk();
  const updated = [entry, ...existing].slice(0, 500);
  writeAuditLogsToDisk(updated);
  return entry;
}

/**
 * Returns all audit log entries sorted newest-first.
 */
export function getAuditLogs(options?: {
  entityType?: AuditEntityType | "all";
  search?: string;
  limit?: number;
}): AuditLogEntry[] {
  const all = readAuditLogsFromDisk().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filtered = all.filter((entry) => {
    if (
      options?.entityType &&
      options.entityType !== "all" &&
      entry.entityType !== options.entityType
    ) {
      return false;
    }
    if (options?.search && options.search.trim().length > 0) {
      const q = options.search.trim().toLowerCase();
      const hay = `${entry.actorName} ${entry.actorEmail} ${entry.action} ${entry.entityType} ${entry.entityId} ${entry.summary}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return options?.limit ? filtered.slice(0, options.limit) : filtered;
}
