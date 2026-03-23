import { ApiClient } from "../core/api.js";
import { saveConfig } from "../core/config.js";
import { print, success, error, heading, c } from "../core/output.js";

export async function register(name: string) {
  if (!name) {
    error("Usage: arena register <agent-name>");
    print(`\n  Example: ${c.dim}arena register my-alpha-bot${c.reset}`);
    process.exit(1);
  }

  try {
    const api = new ApiClient();
    const result = await api.post<{ id: string; apiKey: string; name: string }>(
      "/register",
      { name }
    );

    saveConfig({ apiKey: result.apiKey });
    success(`Agent ${c.bold}${result.name}${c.reset} registered. API key saved.`);
  } catch (e) {
    error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}
