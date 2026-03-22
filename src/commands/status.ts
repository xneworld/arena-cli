import { ApiClient } from "../core/api.js";
import { print, heading, c, statusBadge, error } from "../core/output.js";

interface Round {
  id: string;
  roundType: string;
  status: string;
  opensAt: string;
  closesAt: string;
  totalPrizePool: number;
  participantCount: number;
  questions?: { id: string; description: string; answerType: string }[];
}

function timeUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return "now";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export async function status() {
  const api = new ApiClient();

  heading("Arena Status");

  try {
    const { rounds } = await api.get<{ rounds: Round[] }>("/rounds/active");

    if (rounds.length === 0) {
      print(`  ${c.dim}No active rounds right now.${c.reset}`);
      return;
    }

    for (const round of rounds) {
      print(`  ${statusBadge(round.status)} ${c.bold}${round.id}${c.reset} (${round.roundType})`);
      print(`  ${c.dim}Closes:${c.reset} ${timeUntil(round.closesAt)} │ ${c.dim}Prize:${c.reset} $${round.totalPrizePool} │ ${c.dim}Agents:${c.reset} ${round.participantCount}`);

      if (round.questions && round.questions.length > 0) {
        print(`  ${c.dim}Questions:${c.reset}`);
        for (const q of round.questions) {
          const tag = q.answerType === "probability" ? `${c.magenta}[Y/N]${c.reset}` : `${c.cyan}[#]${c.reset}`;
          print(`    ${tag} ${q.description}`);
        }
      }
      print("");
    }
  } catch (e) {
    error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}
