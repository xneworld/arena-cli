import { ApiClient } from "../core/api.js";
import { print, success, error, heading, c, formatJson, warn } from "../core/output.js";
import { loadConfig } from "../core/config.js";

interface Duel {
  id: string;
  challengerId: string;
  opponentId: string | null;
  roundId: string | null;
  status: string;
  matchType: string;
  wagerAmount: number;
  winnerId: string | null;
  createdAt: string;
  expiresAt: string;
}

export async function pvpChallenge(opponentId: string, wager: string) {
  if (!opponentId) {
    error("Usage: arena pvp challenge <opponent_id> [wager]");
    process.exit(1);
  }

  const api = new ApiClient();
  if (!api.hasApiKey()) {
    error("Not authenticated. Run: arena auth login <api_key>");
    process.exit(1);
  }

  const wagerAmount = wager ? parseFloat(wager) : 0;

  try {
    const result = await api.post<{ duelId: string; expiresAt: string }>(
      "/pvp/challenge",
      { opponentId, wagerAmount },
      true
    );
    success(`Challenge sent!`);
    print(`  ${c.dim}Duel ID:${c.reset}   ${result.duelId}`);
    print(`  ${c.dim}Opponent:${c.reset}  ${opponentId}`);
    print(`  ${c.dim}Wager:${c.reset}     $${wagerAmount}`);
    print(`  ${c.dim}Expires:${c.reset}   ${result.expiresAt}`);
  } catch (e) {
    error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}

export async function pvpAccept(duelId: string) {
  if (!duelId) {
    error("Usage: arena pvp accept <duel_id>");
    process.exit(1);
  }

  const api = new ApiClient();
  if (!api.hasApiKey()) {
    error("Not authenticated. Run: arena auth login <api_key>");
    process.exit(1);
  }

  try {
    await api.post(`/pvp/accept/${duelId}`, {}, true);
    success(`Accepted duel ${duelId}`);
  } catch (e) {
    error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}

export async function pvpMatchmake(wager: string) {
  const api = new ApiClient();
  if (!api.hasApiKey()) {
    error("Not authenticated. Run: arena auth login <api_key>");
    process.exit(1);
  }

  const wagerAmount = wager ? parseFloat(wager) : 0;

  try {
    const result = await api.post<{ duelId: string; matched: boolean; roundId?: string }>(
      "/pvp/matchmake",
      { wagerAmount },
      true
    );
    success(result.matched ? `Matched! Round: ${result.roundId}` : `Queued for matchmaking`);
    print(`  ${c.dim}Duel ID:${c.reset}   ${result.duelId}`);
    print(`  ${c.dim}Matched:${c.reset}   ${result.matched ? "Yes" : "Waiting..."}`);
    print(`  ${c.dim}Wager:${c.reset}     $${wagerAmount}`);
  } catch (e) {
    error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}

export async function pvpList(opts: { format?: string }) {
  const api = new ApiClient();
  if (!api.hasApiKey()) {
    error("Not authenticated. Run: arena auth login <api_key>");
    process.exit(1);
  }

  const config = loadConfig();
  const format = opts.format || config.format;

  try {
    const { duels } = await api.get<{ duels: Duel[] }>("/pvp/pending", true);

    if (format === "json") {
      print(formatJson(duels));
      return;
    }

    heading("My PvP Duels");

    if (duels.length === 0) {
      print(`  ${c.dim}No active duels.${c.reset}`);
      return;
    }

    for (const d of duels) {
      const statusColor = d.status === "pending" ? c.yellow : d.status === "active" ? c.green : c.dim;
      print(`  ${c.bold}${d.id}${c.reset}  ${statusColor}${d.status.toUpperCase()}${c.reset}  ${d.matchType}`);
      print(`    ${c.dim}Wager:${c.reset} $${d.wagerAmount} │ ${c.dim}Opponent:${c.reset} ${d.opponentId || "waiting..."}`);
      print("");
    }
  } catch (e) {
    error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}
