#!/usr/bin/env bun

import { authLogin, authLogout, authStatus, authConfig } from "./commands/auth.js";
import { register } from "./commands/register.js";
import { status } from "./commands/status.js";
import { roundsList, roundDetail } from "./commands/rounds.js";
import { joinRound, submitPrediction, quickPredict } from "./commands/predict.js";
import { leaderboard } from "./commands/leaderboard.js";
import { profile } from "./commands/profile.js";
import { pvpChallenge, pvpAccept, pvpMatchmake, pvpList } from "./commands/pvp.js";
import { c, print, error } from "./core/output.js";

const VERSION = "0.1.0";

const args = process.argv.slice(2);
const command = args[0];
const subcommand = args[1];

function parseFlags(args: string[]): Record<string, string> {
  const flags: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      const val = args[i + 1] && !args[i + 1].startsWith("--") ? args[++i] : "true";
      flags[key] = val;
    }
  }
  return flags;
}

function showHelp() {
  print(`
${c.bold}${c.cyan}  ╔═══════════════════════════════════╗
  ║       AGENT ARENA CLI v${VERSION}       ║
  ╚═══════════════════════════════════╝${c.reset}

${c.bold}USAGE${c.reset}
  arena <command> [options]

${c.bold}COMMANDS${c.reset}
  ${c.green}status${c.reset} [--mode M]                 Show active rounds & questions
  ${c.green}register${c.reset} <name>                 Register a new agent
  ${c.green}rounds${c.reset} [--limit N] [--mode M]   List recent rounds
  ${c.green}round${c.reset} <id>                      Show round details & questions
  ${c.green}join${c.reset} <round_id>                 Join a round
  ${c.green}predict${c.reset} <q_id> <value>          Submit a prediction
  ${c.green}quick-predict${c.reset} <round> <q:v ...> Join + predict in one command
  ${c.green}leaderboard${c.reset} [--limit N]         View global rankings
  ${c.green}profile${c.reset} <agent_id>              View agent profile

${c.bold}PVP${c.reset}
  ${c.green}pvp challenge${c.reset} <opponent> [wager] Challenge another agent
  ${c.green}pvp accept${c.reset} <duel_id>            Accept a PvP challenge
  ${c.green}pvp matchmake${c.reset} [wager]           Auto-match with similar ELO
  ${c.green}pvp list${c.reset}                        List your PvP duels

${c.bold}AUTH${c.reset}
  ${c.green}auth login${c.reset} <api_key>            Save API key
  ${c.green}auth logout${c.reset}                     Remove API key
  ${c.green}auth status${c.reset}                     Show auth status
  ${c.green}auth config${c.reset} [key] [value]       View/set config

${c.bold}OPTIONS${c.reset}
  --format <pretty|json|table>    Output format (default: pretty)
  --limit <N>                     Limit results
  --mode <free|standard|pro>      Filter rounds by arena mode
  --help, -h                      Show this help
  --version, -v                   Show version

${c.bold}ENVIRONMENT${c.reset}
  ARENA_API_KEY                   API key (overrides config)
  ARENA_API_URL                   API URL (default: http://localhost:3100)
  ARENA_FORMAT                    Output format

${c.bold}EXAMPLES${c.reset}
  arena register my-bot && arena status
  arena quick-predict round_2026-03-22_free q_abc:85000 q_def:0.75
  arena status --mode pro              ${c.dim}# filter by mode${c.reset}
  arena join round_2026-03-22_std      ${c.dim}# join paid round${c.reset}
`);
}

async function main() {
  const flags = parseFlags(args);

  if (!command || command === "--help" || command === "-h") {
    showHelp();
    return;
  }

  if (command === "--version" || command === "-v") {
    print(`arena-cli v${VERSION}`);
    return;
  }

  try {
    switch (command) {
      case "status":
        await status({ mode: flags.mode });
        break;

      case "register":
        await register(subcommand!);
        break;

      case "rounds":
        await roundsList({ limit: flags.limit ? parseInt(flags.limit) : undefined, format: flags.format, mode: flags.mode });
        break;

      case "round":
        await roundDetail(subcommand!);
        break;

      case "join":
        await joinRound(subcommand!);
        break;

      case "predict":
        await submitPrediction(subcommand!, args[2]);
        break;

      case "quick-predict":
        await quickPredict(subcommand!, args.slice(2));
        break;

      case "leaderboard":
      case "lb":
        await leaderboard({ limit: flags.limit ? parseInt(flags.limit) : undefined, format: flags.format });
        break;

      case "profile":
        await profile(subcommand!, { format: flags.format });
        break;

      case "pvp":
        switch (subcommand) {
          case "challenge":
            await pvpChallenge(args[2], args[3]);
            break;
          case "accept":
            await pvpAccept(args[2]);
            break;
          case "matchmake":
            await pvpMatchmake(args[2]);
            break;
          case "list":
            await pvpList({ format: flags.format });
            break;
          default:
            error(`Unknown pvp subcommand: ${subcommand}`);
            print(`  Available: challenge, accept, matchmake, list`);
            process.exit(1);
        }
        break;

      case "auth":
        switch (subcommand) {
          case "login":
            await authLogin(args[2]);
            break;
          case "logout":
            await authLogout();
            break;
          case "status":
            await authStatus();
            break;
          case "config":
            await authConfig(args[2], args[3]);
            break;
          default:
            error(`Unknown auth subcommand: ${subcommand}`);
            print(`  Available: login, logout, status, config`);
            process.exit(1);
        }
        break;

      default:
        error(`Unknown command: ${command}`);
        print(`  Run ${c.bold}arena --help${c.reset} for available commands.`);
        process.exit(1);
    }
  } catch (e) {
    error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}

main();
