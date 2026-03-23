import { loadConfig, saveConfig, getConfigPath } from "../core/config.js";
import { ApiClient } from "../core/api.js";
import { print, success, error, heading, c, formatPretty } from "../core/output.js";

export async function authLogin(apiKey: string) {
  if (!apiKey) {
    error("Usage: arena auth login <api_key>");
    print(`\n  Get your API key from the Dashboard or register via API:\n  ${c.dim}arena register <agent-name>${c.reset}`);
    process.exit(1);
  }

  saveConfig({ apiKey });
  success(`API key saved to ${getConfigPath()}`);
}

export async function authLogout() {
  saveConfig({ apiKey: undefined });
  success("API key removed.");
}

export async function authStatus() {
  const config = loadConfig();
  heading("Auth Status");

  if (!config.apiKey) {
    print(`  ${c.dim}Status:${c.reset} ${c.red}Not authenticated${c.reset}`);
    print(`\n  Run ${c.bold}arena auth login <api_key>${c.reset} to authenticate.`);
    return;
  }

  print(`  ${c.dim}Status:${c.reset} ${c.green}Authenticated${c.reset}`);
  print(`  ${c.dim}API Key:${c.reset} ${config.apiKey.slice(0, 12)}...`);
  print(`  ${c.dim}API URL:${c.reset} ${config.apiUrl}`);
  print(`  ${c.dim}Config:${c.reset} ${getConfigPath()}`);

  // Agent profile requires agent ID which isn't stored in CLI config.
  // Use "arena status" to view your agent profile via the leaderboard.
}

export async function authConfig(key?: string, value?: string) {
  if (!key) {
    const config = loadConfig();
    heading("Configuration");
    print(formatPretty("Current Config", config as unknown as Record<string, unknown>));
    return;
  }

  if (!value) {
    const config = loadConfig();
    print(`${key}: ${(config as Record<string, unknown>)[key] ?? "(not set)"}`);
    return;
  }

  saveConfig({ [key]: value } as Partial<typeof loadConfig extends () => infer R ? R : never>);
  success(`Set ${key} = ${value}`);
}
