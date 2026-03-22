const isTTY = process.stdout.isTTY && !process.env.NO_COLOR;

const COLORS = {
  reset: isTTY ? "\x1b[0m" : "",
  bold: isTTY ? "\x1b[1m" : "",
  dim: isTTY ? "\x1b[2m" : "",
  red: isTTY ? "\x1b[31m" : "",
  green: isTTY ? "\x1b[32m" : "",
  yellow: isTTY ? "\x1b[33m" : "",
  blue: isTTY ? "\x1b[34m" : "",
  magenta: isTTY ? "\x1b[35m" : "",
  cyan: isTTY ? "\x1b[36m" : "",
  white: isTTY ? "\x1b[37m" : "",
  bgYellow: isTTY ? "\x1b[43m" : "",
  bgGreen: isTTY ? "\x1b[42m" : "",
  bgRed: isTTY ? "\x1b[41m" : "",
};

export const c = COLORS;

export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function formatTable(headers: string[], rows: string[][]): string {
  const allRows = [headers, ...rows];
  const colWidths = headers.map((_, i) =>
    Math.max(...allRows.map((r) => (r[i] || "").length))
  );

  const sep = colWidths.map((w) => "─".repeat(w + 2)).join("┼");
  const headerLine = headers
    .map((h, i) => ` ${c.bold}${h.padEnd(colWidths[i])}${c.reset} `)
    .join("│");

  const dataLines = rows.map((row) =>
    row.map((cell, i) => ` ${cell.padEnd(colWidths[i])} `).join("│")
  );

  return [headerLine, sep, ...dataLines].join("\n");
}

export function formatPretty(title: string, data: Record<string, unknown>): string {
  const lines: string[] = [
    `${c.bold}${c.cyan}${title}${c.reset}`,
    "",
  ];

  for (const [key, value] of Object.entries(data)) {
    const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
    lines.push(`  ${c.dim}${label}:${c.reset} ${c.bold}${value}${c.reset}`);
  }

  return lines.join("\n");
}

export function statusBadge(status: string): string {
  switch (status) {
    case "open":
      return `${c.bgGreen}${c.bold} OPEN ${c.reset}`;
    case "pending":
      return `${c.bgYellow}${c.bold} PENDING ${c.reset}`;
    case "closed":
    case "scoring":
      return `${c.yellow}${c.bold}${status.toUpperCase()}${c.reset}`;
    case "settled":
      return `${c.dim}SETTLED${c.reset}`;
    default:
      return status.toUpperCase();
  }
}

export function eloDelta(delta: number): string {
  if (delta > 0) return `${c.green}+${delta}${c.reset}`;
  if (delta < 0) return `${c.red}${delta}${c.reset}`;
  return `${c.dim}0${c.reset}`;
}

export function print(msg: string) {
  console.log(msg);
}

export function error(msg: string) {
  console.error(`${c.red}${c.bold}Error:${c.reset} ${msg}`);
}

export function success(msg: string) {
  console.log(`${c.green}${c.bold}✓${c.reset} ${msg}`);
}

export function warn(msg: string) {
  console.log(`${c.yellow}${c.bold}⚠${c.reset} ${msg}`);
}

export function heading(msg: string) {
  console.log(`\n${c.bold}${c.cyan}═══ ${msg} ═══${c.reset}\n`);
}
