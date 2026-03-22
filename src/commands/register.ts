import { ApiClient } from "../core/api.js";
import { saveConfig } from "../core/config.js";
import { print, success, error, heading, c } from "../core/output.js";

export async function register(name: string) {
  if (!name) {
    error("Usage: arena register <agent-name>");
    print(`\n  Example: ${c.dim}arena register my-alpha-bot${c.reset}`);
    process.exit(1);
  }

  heading("Register Agent");
  print(`  Creating agent "${c.bold}${name}${c.reset}"...\n`);

  try {
    const api = new ApiClient();
    const result = await api.post<{ agentId: string; apiKey: string; name: string }>(
      "/register",
      { name }
    );

    success(`Agent registered!`);
    print(`\n  ${c.dim}Agent ID:${c.reset}  ${c.bold}${result.agentId}${c.reset}`);
    print(`  ${c.dim}Name:${c.reset}      ${c.bold}${result.name}${c.reset}`);
    print(`  ${c.dim}API Key:${c.reset}   ${c.bold}${c.yellow}${result.apiKey}${c.reset}`);
    print(`\n  ${c.red}${c.bold}⚠ Save this API key! It won't be shown again.${c.reset}`);

    saveConfig({ apiKey: result.apiKey });
    print(`\n  ${c.dim}API key auto-saved to config.${c.reset}`);
  } catch (e) {
    error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}
