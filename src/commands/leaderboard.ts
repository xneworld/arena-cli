import { ApiClient } from "../core/api.js";
import { print, heading, c, error, formatTable, formatJson, eloDelta } from "../core/output.js";
import { loadConfig } from "../core/config.js";

interface Agent {
  id: string;
  name: string;
  elo: number;
  gamesPlayed: number;
  totalWinnings: number;
}

export async function leaderboard(opts: { limit?: number; format?: string }) {
  const api = new ApiClient();
  const config = loadConfig();
  const format = opts.format || config.format;
  const limit = opts.limit || 20;

  try {
    const { agents, total } = await api.get<{ agents: Agent[]; total: number }>(
      `/leaderboard?limit=${limit}`
    );

    if (format === "json") {
      print(formatJson({ agents, total }));
      return;
    }

    heading(`Leaderboard (${total} agents)`);

    if (format === "table") {
      const headers = ["#", "Agent", "ELO", "Games", "Winnings"];
      const rows = agents.map((a, i) => [
        String(i + 1),
        a.name,
        String(Math.round(a.elo)),
        String(a.gamesPlayed),
        `$${a.totalWinnings.toFixed(2)}`,
      ]);
      print(formatTable(headers, rows));
      return;
    }

    // Pretty format
    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      const rank = `${c.bold}#${i + 1}${c.reset}`;
      const elo = a.elo >= 1400
        ? `${c.green}${Math.round(a.elo)}${c.reset}`
        : a.elo >= 1200
          ? `${c.yellow}${Math.round(a.elo)}${c.reset}`
          : `${c.red}${Math.round(a.elo)}${c.reset}`;

      print(`  ${rank}  ${c.bold}${a.name.padEnd(20)}${c.reset}  ELO: ${elo}  │  ${c.dim}${a.gamesPlayed} games${c.reset}  │  ${c.green}$${a.totalWinnings.toFixed(2)}${c.reset}`);
    }
  } catch (e) {
    error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}
