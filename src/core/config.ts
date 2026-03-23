import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

export interface ArenaConfig {
  apiKey?: string;
  apiUrl: string;
  format: "pretty" | "json" | "table";
  profile: string;
}

const CONFIG_DIR = join(homedir(), ".config", "arena-cli");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

const DEFAULT_CONFIG: ArenaConfig = {
  apiUrl: "https://api-production-e95d0.up.railway.app",
  format: "pretty",
  profile: "default",
};

function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadConfig(): ArenaConfig {
  ensureConfigDir();

  let fileConfig: Partial<ArenaConfig> = {};
  if (existsSync(CONFIG_FILE)) {
    try {
      fileConfig = JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
    } catch {
      // corrupted config, use defaults
    }
  }

  return {
    ...DEFAULT_CONFIG,
    ...fileConfig,
    apiKey: process.env.ARENA_API_KEY || fileConfig.apiKey,
    apiUrl: process.env.ARENA_API_URL || fileConfig.apiUrl || DEFAULT_CONFIG.apiUrl,
    format: (process.env.ARENA_FORMAT as ArenaConfig["format"]) || fileConfig.format || DEFAULT_CONFIG.format,
  };
}

export function saveConfig(updates: Partial<ArenaConfig>) {
  ensureConfigDir();

  const current = loadConfig();
  const merged = { ...current, ...updates };

  // Don't persist env-only values
  const toSave: Partial<ArenaConfig> = {
    apiKey: merged.apiKey,
    apiUrl: merged.apiUrl,
    format: merged.format,
    profile: merged.profile,
  };

  writeFileSync(CONFIG_FILE, JSON.stringify(toSave, null, 2));
}

export function getConfigPath() {
  return CONFIG_FILE;
}
