import { ApiClient } from "../core/api.js";
import { print, heading, c, statusBadge, error, formatTable, formatJson } from "../core/output.js";
import { loadConfig } from "../core/config.js";

interface Round {
  id: string;
  roundType: string;
  status: string;
  opensAt: string;
  closesAt: string;
  totalPrizePool: number;
  participantCount: number;
  questions?: { id: string; description: string; answerType: string; assetSymbol: string }[];
}

export async function roundsList(opts: { limit?: number; format?: string }) {
  const api = new ApiClient();
  const config = loadConfig();
  const format = opts.format || config.format;
  const limit = opts.limit || 10;

  try {
    const rounds = await api.get<Round[]>(`/rounds/recent?limit=${limit}`);

    if (format === "json") {
      print(formatJson(rounds));
      return;
    }

    heading("Recent Rounds");

    if (format === "table") {
      const headers = ["ID", "Type", "Status", "Prize", "Agents", "Questions"];
      const rows = rounds.map((r) => [
        r.id,
        r.roundType,
        r.status.toUpperCase(),
        `$${r.totalPrizePool}`,
        String(r.participantCount),
        String(r.questions?.length || "?"),
      ]);
      print(formatTable(headers, rows));
      return;
    }

    for (const round of rounds) {
      print(`  ${statusBadge(round.status)} ${c.bold}${round.id}${c.reset} (${round.roundType})`);
      print(`    ${c.dim}Prize:${c.reset} $${round.totalPrizePool} │ ${c.dim}Agents:${c.reset} ${round.participantCount} │ ${c.dim}Qs:${c.reset} ${round.questions?.length || "?"}`);
      print("");
    }
  } catch (e) {
    error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}

export async function roundDetail(id: string) {
  if (!id) {
    error("Usage: arena round <round_id>");
    process.exit(1);
  }

  const api = new ApiClient();

  try {
    const round = await api.get<Round>(`/rounds/${id}`);

    heading(`Round: ${round.id}`);
    print(`  ${c.dim}Type:${c.reset}    ${round.roundType}`);
    print(`  ${c.dim}Status:${c.reset}  ${statusBadge(round.status)}`);
    print(`  ${c.dim}Opens:${c.reset}   ${round.opensAt}`);
    print(`  ${c.dim}Closes:${c.reset}  ${round.closesAt}`);
    print(`  ${c.dim}Prize:${c.reset}   $${round.totalPrizePool}`);
    print(`  ${c.dim}Agents:${c.reset}  ${round.participantCount}`);

    if (round.questions && round.questions.length > 0) {
      print(`\n  ${c.bold}Questions:${c.reset}`);
      for (let i = 0; i < round.questions.length; i++) {
        const q = round.questions[i];
        const tag = q.answerType === "probability" ? `${c.magenta}[Y/N]${c.reset}` : `${c.cyan}[NUM]${c.reset}`;
        print(`    ${c.dim}${i + 1}.${c.reset} ${tag} ${q.description}`);
        print(`       ${c.dim}ID: ${q.id} │ Asset: ${q.assetSymbol}${c.reset}`);
      }
    }
  } catch (e) {
    error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}
