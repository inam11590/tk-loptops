import fs from "fs";
import path from "path";
import {
  DEFAULT_STORE_SETTINGS,
  getSettings,
  setRuntimeSettings,
  type StoreSettings,
} from "@/lib/config";

const DATA_DIR = path.join(process.cwd(), ".data");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

/**
 * Reads the current store settings from `.data/settings.json` (or seeds defaults).
 */
export function readStoreSettings(): StoreSettings {
  const current = getSettings();
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(
        SETTINGS_FILE,
        JSON.stringify(DEFAULT_STORE_SETTINGS, null, 2),
        "utf8"
      );
    }
  } catch {
    // Ignore write errors in read-only environments
  }
  return current;
}

/**
 * Updates the store settings in `.data/settings.json` and updates the in-memory runtime cache.
 */
export function saveStoreSettings(
  updates: Partial<StoreSettings>
): StoreSettings {
  const current = getSettings();
  const next: StoreSettings = {
    storeInfo: {
      ...current.storeInfo,
      ...(updates.storeInfo ?? {}),
    },
    currency: {
      ...current.currency,
      ...(updates.currency ?? {}),
    },
    shipping: {
      ...current.shipping,
      ...(updates.shipping ?? {}),
    },
    bankDetails: {
      ...current.bankDetails,
      ...(updates.bankDetails ?? {}),
    },
    enabledPaymentMethods:
      updates.enabledPaymentMethods && updates.enabledPaymentMethods.length > 0
        ? updates.enabledPaymentMethods
        : current.enabledPaymentMethods,
    updatedAt: new Date().toISOString(),
  };

  setRuntimeSettings(next);

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(next, null, 2), "utf8");
  } catch {
    // Keep in-memory runtime settings if disk write is restricted
  }

  return next;
}
