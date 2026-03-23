import { ApiClient } from "../core/api.js";
import { print, success, error, heading, c, warn } from "../core/output.js";

export async function joinRound(roundId: string) {
  if (!roundId) {
    error("Usage: arena join <round_id>");
    process.exit(1);
  }

  const api = new ApiClient();
  if (!api.hasApiKey()) {
    error("Not authenticated. Run: arena auth login <api_key>");
    process.exit(1);
  }

  try {
    await api.post("/predict/join", { roundId }, true);
    success(`Joined round ${roundId}`);
  } catch (e) {
    error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}

export async function submitPrediction(questionId: string, value: string) {
  if (!questionId || !value) {
    error("Usage: arena predict <question_id> <value>");
    print(`\n  Examples:`);
    print(`    ${c.dim}arena predict q_abc123 85000${c.reset}     # numeric: BTC price`);
    print(`    ${c.dim}arena predict q_def456 0.75${c.reset}      # probability: 75% chance`);
    process.exit(1);
  }

  const api = new ApiClient();
  if (!api.hasApiKey()) {
    error("Not authenticated. Run: arena auth login <api_key>");
    process.exit(1);
  }

  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    error(`Invalid value: "${value}". Must be a number.`);
    process.exit(1);
  }

  try {
    const result = await api.post<{ predictionId: string }>(
      "/predict/submit",
      { questionId, value: numValue },
      true
    );
    success(`Prediction submitted: ${c.bold}${numValue}${c.reset}`);
    print(`  ${c.dim}Prediction ID:${c.reset} ${result.predictionId}`);
  } catch (e) {
    error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}

export async function quickPredict(roundId: string, predictions: string[]) {
  if (!roundId || predictions.length === 0) {
    error("Usage: arena quick-predict <round_id> <q_id:value> [q_id:value ...]");
    print(`\n  Example: ${c.dim}arena quick-predict round_2026-03-22 q_abc:85000 q_def:0.75${c.reset}`);
    process.exit(1);
  }

  const api = new ApiClient();
  if (!api.hasApiKey()) {
    error("Not authenticated. Run: arena auth login <api_key>");
    process.exit(1);
  }

  heading(`Quick Predict: ${roundId}`);

  // Join first
  try {
    await api.post("/predict/join", { roundId }, true);
    success("Joined round");
  } catch {
    warn("Already joined or join failed — continuing...");
  }

  // Submit each prediction
  for (const pred of predictions) {
    const [qId, val] = pred.split(":");
    if (!qId || !val) {
      warn(`Skipping invalid format: "${pred}" (expected q_id:value)`);
      continue;
    }

    const numVal = parseFloat(val);
    if (isNaN(numVal)) {
      warn(`Skipping invalid value: "${val}" for ${qId}`);
      continue;
    }

    try {
      await api.post("/predict/submit", { questionId: qId, value: numVal }, true);
      success(`${qId}: ${c.bold}${numVal}${c.reset}`);
    } catch (e) {
      error(`${qId}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}
