import crypto from "crypto";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { sanitizeText } from "@/lib/validations/auth";

export const MAX_SAVED_ADDRESSES = 5;
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOGIN_LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
export const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

export type UserRole = "customer" | "admin";

export interface SavedAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  passwordHash: string;
  provider: "credentials" | "google";
  role: UserRole;
  disabled?: boolean;
  createdAt: string;
  updatedAt: string;
  addresses: SavedAddress[];
  wishlistProductIds: string[];
}

/**
 * Client-safe user representation that never includes `passwordHash`.
 */
export type SafeUser = Omit<UserRecord, "passwordHash">;

export interface PasswordResetTokenRecord {
  token: string;
  userId: string;
  email: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
}

interface LoginAttemptState {
  failedCount: number;
  lockedUntil: number | null;
  lastAttemptAt: number;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const TOKENS_FILE = path.join(DATA_DIR, "reset-tokens.json");

const DEMO_PASSWORD_HASH = bcrypt.hashSync("Password123", 10);

const SEED_USERS: UserRecord[] = [
  {
    id: "usr-demo-alex",
    fullName: "Alex Rivera",
    email: "alex@example.com",
    phone: "+1 (415) 555-0142",
    avatarUrl: "",
    passwordHash: DEMO_PASSWORD_HASH,
    provider: "credentials",
    role: "customer",
    disabled: false,
    createdAt: "2026-09-15T10:00:00.000Z",
    updatedAt: "2026-10-05T14:20:00.000Z",
    addresses: [
      {
        id: "addr-demo-1",
        label: "Office",
        fullName: "Alex Rivera",
        phone: "+1 (415) 555-0142",
        streetAddress: "742 Tech Plaza",
        apartment: "Suite 400",
        city: "San Francisco",
        stateProvince: "CA",
        postalCode: "94107",
        country: "United States",
        isDefault: true,
      },
    ],
    wishlistProductIds: ["hp-01"],
  },
  {
    id: "usr-demo-sarah",
    fullName: "Sarah Jenkins",
    email: "sarah.jenkins@example.com",
    phone: "+1 (206) 555-0188",
    avatarUrl: "",
    passwordHash: DEMO_PASSWORD_HASH,
    provider: "credentials",
    role: "customer",
    disabled: false,
    createdAt: "2026-09-22T09:15:00.000Z",
    updatedAt: "2026-10-04T11:30:00.000Z",
    addresses: [
      {
        id: "addr-demo-2",
        label: "Home",
        fullName: "Sarah Jenkins",
        phone: "+1 (206) 555-0188",
        streetAddress: "1200 Pine Street",
        apartment: "Apt 12B",
        city: "Seattle",
        stateProvince: "WA",
        postalCode: "98101",
        country: "United States",
        isDefault: true,
      },
    ],
    wishlistProductIds: ["dell-01", "hp-03"],
  },
  {
    id: "usr-demo-marcus",
    fullName: "Marcus Vance",
    email: "marcus.vance@example.com",
    phone: "+1 (312) 555-0194",
    avatarUrl: "",
    passwordHash: DEMO_PASSWORD_HASH,
    provider: "credentials",
    role: "customer",
    disabled: false,
    createdAt: "2026-10-01T16:45:00.000Z",
    updatedAt: "2026-10-06T08:10:00.000Z",
    addresses: [
      {
        id: "addr-demo-3",
        label: "Studio",
        fullName: "Marcus Vance",
        phone: "+1 (312) 555-0194",
        streetAddress: "400 N Michigan Ave",
        apartment: "Floor 9",
        city: "Chicago",
        stateProvince: "IL",
        postalCode: "60611",
        country: "United States",
        isDefault: true,
      },
    ],
    wishlistProductIds: ["dell-03"],
  },
];

const globalForUsers = globalThis as unknown as {
  __tkUsersCache?: UserRecord[];
  __tkResetTokensCache?: PasswordResetTokenRecord[];
  __tkLoginAttempts?: Map<string, LoginAttemptState>;
  __tkDeletedUserIds?: Set<string>;
};

function getDeletedUserIds(): Set<string> {
  if (!globalForUsers.__tkDeletedUserIds) {
    globalForUsers.__tkDeletedUserIds = new Set<string>();
  }
  return globalForUsers.__tkDeletedUserIds;
}

/**
 * Normalizes a user record so `role` and `disabled` are always defined.
 */
function normalizeUserRecord(u: UserRecord): UserRecord {
  return {
    ...u,
    role: u.role === "admin" ? "admin" : "customer",
    disabled: Boolean(u.disabled),
    addresses: Array.isArray(u.addresses) ? u.addresses : [],
    wishlistProductIds: Array.isArray(u.wishlistProductIds)
      ? u.wishlistProductIds
      : [],
  };
}

/**
 * Seeds the initial admin user from `process.env.ADMIN_EMAIL` and `process.env.ADMIN_PASSWORD`
 * if both environment variables are configured and that email is not yet present.
 * Never hardcodes admin credentials.
 */
function ensureEnvAdminSeeded(users: UserRecord[]): {
  users: UserRecord[];
  changed: boolean;
} {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!adminEmail || !adminPassword) {
    return { users, changed: false };
  }

  const existingIdx = users.findIndex(
    (u) => u.email.toLowerCase() === adminEmail
  );

  if (existingIdx !== -1) {
    const current = users[existingIdx]!;
    if (current.role !== "admin") {
      const next = [...users];
      next[existingIdx] = {
        ...current,
        role: "admin",
        disabled: false,
      };
      return { users: next, changed: true };
    }
    return { users, changed: false };
  }

  const now = "2026-09-01T08:00:00.000Z";
  const seededAdmin: UserRecord = {
    id: "usr-admin-seed",
    fullName: "TK Store Administrator",
    email: adminEmail,
    phone: "+1 (800) 555-0199",
    avatarUrl: "",
    passwordHash: bcrypt.hashSync(adminPassword, 10),
    provider: "credentials",
    role: "admin",
    disabled: false,
    createdAt: now,
    updatedAt: now,
    addresses: [],
    wishlistProductIds: [],
  };

  return { users: [seededAdmin, ...users], changed: true };
}

function readUsersFromDisk(): UserRecord[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, "utf8");
      const parsed = JSON.parse(raw) as UserRecord[];
      if (Array.isArray(parsed)) {
        const normalized = parsed.map(normalizeUserRecord);
        const { users: withAdmin, changed } = ensureEnvAdminSeeded(normalized);
        globalForUsers.__tkUsersCache = withAdmin;
        if (changed) {
          writeUsersToDisk(withAdmin);
        }
        return withAdmin;
      }
    }
  } catch {
    // Fallback to in-memory store
  }

  if (!globalForUsers.__tkUsersCache) {
    const initial = SEED_USERS.map(normalizeUserRecord);
    const { users: withAdmin } = ensureEnvAdminSeeded(initial);
    globalForUsers.__tkUsersCache = withAdmin;
    writeUsersToDisk(withAdmin);
  }
  return globalForUsers.__tkUsersCache;
}

function writeUsersToDisk(users: UserRecord[]): void {
  globalForUsers.__tkUsersCache = users;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
  } catch {
    // Keep in-memory store if disk write is restricted
  }
}

function readTokensFromDisk(): PasswordResetTokenRecord[] {
  try {
    if (fs.existsSync(TOKENS_FILE)) {
      const raw = fs.readFileSync(TOKENS_FILE, "utf8");
      const parsed = JSON.parse(raw) as PasswordResetTokenRecord[];
      if (Array.isArray(parsed)) {
        globalForUsers.__tkResetTokensCache = parsed;
        return parsed;
      }
    }
  } catch {
    // Fallback to in-memory store
  }

  if (!globalForUsers.__tkResetTokensCache) {
    globalForUsers.__tkResetTokensCache = [];
  }
  return globalForUsers.__tkResetTokensCache;
}

function writeTokensToDisk(tokens: PasswordResetTokenRecord[]): void {
  globalForUsers.__tkResetTokensCache = tokens;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2), "utf8");
  } catch {
    // Keep in-memory store if disk write is restricted
  }
}

/**
 * Strips sensitive fields (`passwordHash`) before returning a user object to any caller/UI.
 */
export function toSafeUser(user: UserRecord): SafeUser {
  const normalized = normalizeUserRecord(user);
  const { passwordHash: _ignored, ...safe } = normalized;
  void _ignored;
  return safe;
}

/**
 * Returns all users as SafeUser objects (never exposes passwordHash), sorted newest-first.
 */
export function getAllSafeUsers(): SafeUser[] {
  const users = readUsersFromDisk();
  return users
    .map(toSafeUser)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

/**
 * Counts how many active (non-disabled) admin accounts exist.
 */
export function countActiveAdmins(usersList?: UserRecord[]): number {
  const users = usersList ?? readUsersFromDisk();
  return users.filter((u) => u.role === "admin" && !u.disabled).length;
}

/**
 * Looks up a full UserRecord by email (case-insensitive). Server-internal only.
 */
export function getUserByEmail(email: string): UserRecord | null {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const users = readUsersFromDisk();
  return users.find((u) => u.email.toLowerCase() === normalized) ?? null;
}

/**
 * Looks up a full UserRecord by ID. Server-internal only.
 */
export function getUserById(id: string): UserRecord | null {
  const trimmed = id.trim();
  if (!trimmed) return null;
  const users = readUsersFromDisk();
  return users.find((u) => u.id === trimmed) ?? null;
}

/**
 * Looks up a SafeUser by ID (never includes passwordHash).
 */
export function getSafeUserById(id: string): SafeUser | null {
  const user = getUserById(id);
  return user ? toSafeUser(user) : null;
}

/**
 * Looks up a SafeUser by email (never includes passwordHash).
 */
export function getSafeUserByEmail(email: string): SafeUser | null {
  const user = getUserByEmail(email);
  return user ? toSafeUser(user) : null;
}

/**
 * Resolves a SafeUser from a NextAuth session user object (by ID first, then email fallback).
 * On serverless platforms (e.g. Vercel) where each function invocation may have an isolated memory store,
 * hydrates the user record from the verified JWT session claims if not yet present in memory.
 */
export function getSafeUserFromSession(
  sessionUser?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: UserRole | null;
  } | null
): SafeUser | null {
  if (!sessionUser) return null;
  const deletedIds = getDeletedUserIds();
  if (sessionUser.id && deletedIds.has(sessionUser.id)) {
    return null;
  }
  if (sessionUser.id) {
    const byId = getSafeUserById(sessionUser.id);
    if (byId) return byId.disabled ? null : byId;
  }
  if (sessionUser.email) {
    const byEmail = getSafeUserByEmail(sessionUser.email);
    if (byEmail) return byEmail.disabled ? null : byEmail;
  }
  if (sessionUser.id && sessionUser.email) {
    const now = new Date().toISOString();
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const isEnvAdmin =
      Boolean(adminEmail) && sessionUser.email.trim().toLowerCase() === adminEmail;
    const role: UserRole =
      sessionUser.role === "admin" || isEnvAdmin ? "admin" : "customer";

    const hydrated: UserRecord = {
      id: sessionUser.id,
      fullName:
        sanitizeText(sessionUser.name ?? "") ||
        sessionUser.email.split("@")[0] ||
        "TK Customer",
      email: sessionUser.email.trim().toLowerCase(),
      phone: "",
      avatarUrl: sessionUser.image ?? "",
      passwordHash: DEMO_PASSWORD_HASH,
      provider: "credentials",
      role,
      disabled: false,
      createdAt: now,
      updatedAt: now,
      addresses: [],
      wishlistProductIds: [],
    };
    const users = readUsersFromDisk();
    writeUsersToDisk([hydrated, ...users]);
    return toSafeUser(hydrated);
  }
  return null;
}

/**
 * Creates a new user with a bcrypt-hashed password. Throws if the email is already registered.
 */
export async function createUser(input: {
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
  avatarUrl?: string;
  provider?: "credentials" | "google";
  role?: UserRole;
  addresses?: SavedAddress[];
  wishlistProductIds?: string[];
}): Promise<SafeUser> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = getUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error("DUPLICATE_EMAIL");
  }

  const rawPassword = input.password || crypto.randomBytes(16).toString("hex");
  const passwordHash = await bcrypt.hash(rawPassword, 10);
  const now = new Date().toISOString();

  const newUser: UserRecord = {
    id: `usr-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    fullName: sanitizeText(input.fullName),
    email: normalizedEmail,
    phone: input.phone ? sanitizeText(input.phone) : "",
    avatarUrl: input.avatarUrl ?? "",
    passwordHash,
    provider: input.provider ?? "credentials",
    role: input.role ?? "customer",
    disabled: false,
    createdAt: now,
    updatedAt: now,
    addresses: input.addresses ?? [],
    wishlistProductIds: input.wishlistProductIds ?? [],
  };

  const users = readUsersFromDisk();
  writeUsersToDisk([newUser, ...users]);

  return toSafeUser(newUser);
}

/**
 * Verifies a plaintext password against the stored bcrypt hash.
 */
export async function verifyUserPassword(
  user: UserRecord,
  plainPassword: string
): Promise<boolean> {
  if (!user.passwordHash) return false;
  return bcrypt.compare(plainPassword, user.passwordHash);
}

/**
 * Updates non-sensitive user fields and persists to the user store.
 */
export function updateUser(
  userId: string,
  updates: Partial<
    Pick<
      UserRecord,
      "fullName" | "phone" | "avatarUrl" | "addresses" | "wishlistProductIds"
    >
  >
): SafeUser | null {
  const users = readUsersFromDisk();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  const current = users[idx]!;
  const updated: UserRecord = {
    ...current,
    fullName:
      updates.fullName !== undefined
        ? sanitizeText(updates.fullName)
        : current.fullName,
    phone:
      updates.phone !== undefined ? sanitizeText(updates.phone) : current.phone,
    avatarUrl:
      updates.avatarUrl !== undefined ? updates.avatarUrl : current.avatarUrl,
    addresses:
      updates.addresses !== undefined ? updates.addresses : current.addresses,
    wishlistProductIds:
      updates.wishlistProductIds !== undefined
        ? updates.wishlistProductIds
        : current.wishlistProductIds,
    updatedAt: new Date().toISOString(),
  };

  const nextUsers = [...users];
  nextUsers[idx] = updated;
  writeUsersToDisk(nextUsers);

  return toSafeUser(updated);
}

/**
 * Admin action: Enables or disables a user account.
 * Safeguard: The last active admin account cannot be disabled.
 */
export function setUserDisabledStatus(
  userId: string,
  disabled: boolean
): { success: true; user: SafeUser } | { success: false; error: string } {
  const users = readUsersFromDisk();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) {
    return { success: false, error: "Customer account not found." };
  }

  const target = users[idx]!;
  if (disabled && target.role === "admin" && !target.disabled) {
    const activeAdmins = countActiveAdmins(users);
    if (activeAdmins <= 1) {
      return {
        success: false,
        error: "Cannot disable the last active administrator account.",
      };
    }
  }

  const updated: UserRecord = {
    ...target,
    disabled,
    updatedAt: new Date().toISOString(),
  };

  const nextUsers = [...users];
  nextUsers[idx] = updated;
  writeUsersToDisk(nextUsers);

  return { success: true, user: toSafeUser(updated) };
}

/**
 * Admin action: Promotes or demotes a user's role ("customer" | "admin").
 * Safeguard: The last active admin account cannot be demoted.
 */
export function setUserRole(
  userId: string,
  role: UserRole
): { success: true; user: SafeUser } | { success: false; error: string } {
  const users = readUsersFromDisk();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) {
    return { success: false, error: "Customer account not found." };
  }

  const target = users[idx]!;
  if (target.role === "admin" && role !== "admin" && !target.disabled) {
    const activeAdmins = countActiveAdmins(users);
    if (activeAdmins <= 1) {
      return {
        success: false,
        error: "Cannot demote the last active administrator account.",
      };
    }
  }

  const updated: UserRecord = {
    ...target,
    role,
    updatedAt: new Date().toISOString(),
  };

  const nextUsers = [...users];
  nextUsers[idx] = updated;
  writeUsersToDisk(nextUsers);

  return { success: true, user: toSafeUser(updated) };
}

/**
 * Updates a user's password hash using bcrypt.
 */
export async function updateUserPassword(
  userId: string,
  newPlainPassword: string
): Promise<boolean> {
  const users = readUsersFromDisk();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return false;

  const passwordHash = await bcrypt.hash(newPlainPassword, 10);
  const nextUsers = [...users];
  nextUsers[idx] = {
    ...nextUsers[idx]!,
    passwordHash,
    updatedAt: new Date().toISOString(),
  };
  writeUsersToDisk(nextUsers);
  return true;
}

/**
 * Permanently deletes a user account by ID.
 * Safeguard: Refuses to delete the last active admin account.
 */
export function deleteUser(userId: string): boolean {
  const users = readUsersFromDisk();
  const target = users.find((u) => u.id === userId);
  if (!target) return false;

  if (target.role === "admin" && !target.disabled) {
    const activeAdmins = countActiveAdmins(users);
    if (activeAdmins <= 1) {
      throw new Error("LAST_ADMIN_CANNOT_BE_DELETED");
    }
  }

  getDeletedUserIds().add(userId);
  const filtered = users.filter((u) => u.id !== userId);
  writeUsersToDisk(filtered);
  return true;
}

/**
 * Adds or updates a saved address for a user (max 5 addresses).
 */
export function upsertUserAddress(
  userId: string,
  input: Omit<SavedAddress, "id"> & { id?: string }
): { addresses: SavedAddress[]; error?: string } {
  const user = getUserById(userId);
  if (!user) {
    return { addresses: [], error: "User account not found." };
  }

  const existing = [...user.addresses];
  const existingIdx = input.id
    ? existing.findIndex((a) => a.id === input.id)
    : -1;

  if (existingIdx === -1 && existing.length >= MAX_SAVED_ADDRESSES) {
    return {
      addresses: existing,
      error: `You can save up to ${MAX_SAVED_ADDRESSES} addresses. Please edit or delete an existing address first.`,
    };
  }

  const sanitized: SavedAddress = {
    id:
      existingIdx !== -1 && input.id
        ? input.id
        : `addr-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    label: sanitizeText(input.label || "Home"),
    fullName: sanitizeText(input.fullName),
    phone: sanitizeText(input.phone),
    streetAddress: sanitizeText(input.streetAddress),
    apartment: input.apartment ? sanitizeText(input.apartment) : "",
    city: sanitizeText(input.city),
    stateProvince: sanitizeText(input.stateProvince),
    postalCode: sanitizeText(input.postalCode),
    country: sanitizeText(input.country),
    isDefault: existing.length === 0 ? true : Boolean(input.isDefault),
  };

  let nextAddresses: SavedAddress[];
  if (existingIdx !== -1) {
    nextAddresses = existing.map((a, i) => (i === existingIdx ? sanitized : a));
  } else {
    nextAddresses = [...existing, sanitized];
  }

  if (sanitized.isDefault) {
    nextAddresses = nextAddresses.map((a) => ({
      ...a,
      isDefault: a.id === sanitized.id,
    }));
  } else if (!nextAddresses.some((a) => a.isDefault) && nextAddresses[0]) {
    nextAddresses[0] = { ...nextAddresses[0], isDefault: true };
  }

  updateUser(userId, { addresses: nextAddresses });
  return { addresses: nextAddresses };
}

/**
 * Deletes a saved address from a user's profile and ensures a default address remains if any exist.
 */
export function deleteUserAddress(
  userId: string,
  addressId: string
): SavedAddress[] {
  const user = getUserById(userId);
  if (!user) return [];

  const filtered = user.addresses.filter((a) => a.id !== addressId);
  if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
    filtered[0] = { ...filtered[0]!, isDefault: true };
  }
  updateUser(userId, { addresses: filtered });
  return filtered;
}

/**
 * Marks a specific saved address as the user's default shipping address.
 */
export function setDefaultUserAddress(
  userId: string,
  addressId: string
): SavedAddress[] {
  const user = getUserById(userId);
  if (!user) return [];

  const updated = user.addresses.map((a) => ({
    ...a,
    isDefault: a.id === addressId,
  }));
  updateUser(userId, { addresses: updated });
  return updated;
}

/**
 * Merges client localStorage wishlist product IDs with the user's server-saved wishlist.
 */
export function mergeUserWishlist(
  userId: string,
  clientIds: string[]
): string[] {
  const user = getUserById(userId);
  if (!user) return clientIds;

  const combined = Array.from(
    new Set([...clientIds, ...(user.wishlistProductIds ?? [])])
  ).filter((id) => typeof id === "string" && id.trim().length > 0);

  updateUser(userId, { wishlistProductIds: combined });
  return combined;
}

/**
 * Replaces the user's saved wishlist product IDs on the server.
 */
export function setUserWishlist(userId: string, productIds: string[]): string[] {
  const unique = Array.from(new Set(productIds)).filter(
    (id) => typeof id === "string" && id.trim().length > 0
  );
  updateUser(userId, { wishlistProductIds: unique });
  return unique;
}

/**
 * Generates a password reset token (valid for 30 minutes by default).
 * Returns null if no user exists for the email.
 */
export function createPasswordResetToken(
  email: string,
  ttlMs: number = RESET_TOKEN_TTL_MS
): { token: string; expiresAt: string; user: SafeUser } | null {
  const user = getUserByEmail(email);
  if (!user) return null;

  const token = crypto.randomBytes(24).toString("hex");
  const now = Date.now();
  const expiresAt = new Date(now + ttlMs).toISOString();

  const existing = readTokensFromDisk().filter(
    (t) => t.userId !== user.id || t.used
  );
  const record: PasswordResetTokenRecord = {
    token,
    userId: user.id,
    email: user.email,
    createdAt: new Date(now).toISOString(),
    expiresAt,
    used: false,
  };

  writeTokensToDisk([record, ...existing]);
  return { token, expiresAt, user: toSafeUser(user) };
}

/**
 * Validates a password reset token without consuming it.
 */
export function verifyPasswordResetToken(
  token: string
):
  | { valid: true; userId: string; email: string }
  | { valid: false; reason: "not_found" | "expired" | "used" } {
  const trimmed = token.trim();
  if (!trimmed) return { valid: false, reason: "not_found" };

  const tokens = readTokensFromDisk();
  const record = tokens.find((t) => t.token === trimmed);
  if (!record) return { valid: false, reason: "not_found" };
  if (record.used) return { valid: false, reason: "used" };

  if (new Date(record.expiresAt).getTime() <= Date.now()) {
    return { valid: false, reason: "expired" };
  }

  return { valid: true, userId: record.userId, email: record.email };
}

/**
 * Consumes a password reset token and updates the user's password hash.
 */
export async function consumePasswordResetToken(
  token: string,
  newPlainPassword: string
): Promise<{ success: true; email: string } | { success: false; error: string }> {
  const check = verifyPasswordResetToken(token);
  if (!check.valid) {
    const message =
      check.reason === "expired"
        ? "This password reset link has expired (valid for 30 minutes). Please request a new reset link."
        : check.reason === "used"
        ? "This password reset link has already been used. Please request a new link if needed."
        : "Invalid password reset token. Please request a new password reset link.";
    return { success: false, error: message };
  }

  const updated = await updateUserPassword(check.userId, newPlainPassword);
  if (!updated) {
    return {
      success: false,
      error: "Unable to update password for this account.",
    };
  }

  const tokens = readTokensFromDisk().map((t) =>
    t.token === token.trim() ? { ...t, used: true } : t
  );
  writeTokensToDisk(tokens);
  clearLoginAttempts(check.email);

  return { success: true, email: check.email };
}

// ============================================================================
// In-Memory Login Rate Limiter (5 failed attempts -> 15-minute lockout)
// ============================================================================

function getAttemptsMap(): Map<string, LoginAttemptState> {
  if (!globalForUsers.__tkLoginAttempts) {
    globalForUsers.__tkLoginAttempts = new Map<string, LoginAttemptState>();
  }
  return globalForUsers.__tkLoginAttempts;
}

export function getLoginLockoutStatus(email: string): {
  locked: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
} {
  const key = email.trim().toLowerCase();
  const map = getAttemptsMap();
  const entry = map.get(key);

  if (!entry) {
    return {
      locked: false,
      remainingAttempts: MAX_LOGIN_ATTEMPTS,
      retryAfterSeconds: 0,
    };
  }

  if (entry.lockedUntil) {
    const diffMs = entry.lockedUntil - Date.now();
    if (diffMs > 0) {
      return {
        locked: true,
        remainingAttempts: 0,
        retryAfterSeconds: Math.ceil(diffMs / 1000),
      };
    }
    // Lockout window elapsed — reset
    map.delete(key);
    return {
      locked: false,
      remainingAttempts: MAX_LOGIN_ATTEMPTS,
      retryAfterSeconds: 0,
    };
  }

  return {
    locked: false,
    remainingAttempts: Math.max(0, MAX_LOGIN_ATTEMPTS - entry.failedCount),
    retryAfterSeconds: 0,
  };
}

export function recordFailedLoginAttempt(email: string): {
  locked: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
} {
  const key = email.trim().toLowerCase();
  const map = getAttemptsMap();
  const current = map.get(key) ?? {
    failedCount: 0,
    lockedUntil: null,
    lastAttemptAt: Date.now(),
  };

  // If previously locked and expired, start fresh
  if (current.lockedUntil && current.lockedUntil <= Date.now()) {
    current.failedCount = 0;
    current.lockedUntil = null;
  }

  const nextFailedCount = current.failedCount + 1;
  const isNowLocked = nextFailedCount >= MAX_LOGIN_ATTEMPTS;
  const lockedUntil = isNowLocked
    ? Date.now() + LOGIN_LOCKOUT_DURATION_MS
    : null;

  map.set(key, {
    failedCount: nextFailedCount,
    lockedUntil,
    lastAttemptAt: Date.now(),
  });

  return {
    locked: isNowLocked,
    remainingAttempts: Math.max(0, MAX_LOGIN_ATTEMPTS - nextFailedCount),
    retryAfterSeconds: isNowLocked
      ? Math.ceil(LOGIN_LOCKOUT_DURATION_MS / 1000)
      : 0,
  };
}

export function clearLoginAttempts(email: string): void {
  const key = email.trim().toLowerCase();
  getAttemptsMap().delete(key);
}
