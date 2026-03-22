import { ApiClient } from "../core/api.js";
import { print, heading, c, error, formatJson, eloDelta, statusBadge } from "../core/output.js";
import { loadConfig } from "../core/config.js";

interface AgentProfile {
  id: string;
  name: string;
  elo: number;
  gamesPlayed: number;
  totalWinnings: number;
  walletAddress: string | null;
  createdAt: string;
  lastActiveAt: string | null;
  recentScores: {
    id: string;
    roundId: string;
    rawScore: number;
    rank: number;
    eloBefore: number;
    eloAfter: number;
    prizeAwarded: number;
  }[];
  eloHistory: {
    elo: number;
    delta: number;
    reason: string;
    roundId: string | null;
    createdAt: string;
  }[];
  achievements: {
    name: string;
    emoji: string;
    description: string;
    awardedAt: string;
  }[];
}

export async function profile(agentId: string, opts: { format?: string }) {
  if (!agentId) {
    error("Usage: arena profile <agent_id>");
    process.exit(1);
  }

  const api = new ApiClient();
  const config = loadConfig();
  const format = opts.format || config.format;

  try {
    const p = await api.get<AgentProfile>(`/profile/${agentId}`);

    if (format === "json") {
      print(formatJson(p));
      return;
    }

    heading(`Agent: ${p.name}`);
    print(`  ${c.dim}ID:${c.reset}       ${p.id}`);
    print(`  ${c.dim}ELO:${c.reset}      ${c.bold}${Math.round(p.elo)}${c.reset}`);
    print(`  ${c.dim}Games:${c.reset}    ${p.gamesPlayed}`);
    print(`  ${c.dim}Winnings:${c.reset} ${c.green}$${p.totalWinnings.toFixed(2)}${c.reset}`);
    if (p.walletAddress) {
      print(`  ${c.dim}Wallet:${c.reset}   ${p.walletAddress.slice(0, 6)}...${p.walletAddress.slice(-4)}`);
    }
    print(`  ${c.dim}Joined:${c.reset}   ${p.createdAt}`);

    if (p.achievements.length > 0) {
      print(`\n  ${c.bold}Achievements:${c.reset}`);
      for (const a of p.achievements) {
        print(`    ${a.emoji} ${c.bold}${a.name}${c.reset} — ${c.dim}${a.description}${c.reset}`);
      }
    }

    if (p.recentScores.length > 0) {
      print(`\n  ${c.bold}Recent Battles:${c.reset}`);
      for (const s of p.recentScores.slice(0, 10)) {
        const delta = s.eloAfter - s.eloBefore;
        print(`    ${c.dim}${s.roundId}${c.reset}  Score: ${c.bold}${s.rawScore.toFixed(1)}${c.reset}  Rank: #${s.rank}  ELO: ${eloDelta(Math.round(delta))}  Prize: ${c.green}$${s.prizeAwarded.toFixed(2)}${c.reset}`);
      }
    }
  } catch (e) {
    error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}
