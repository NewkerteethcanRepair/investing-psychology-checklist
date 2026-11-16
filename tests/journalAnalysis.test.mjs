import assert from "node:assert/strict";
import { analyzeTrades, basisOf, disciplineOf, tradeResult } from "../src/composables/journalAnalysis.mjs";

const trade = (id, pnl, basis = "impulse", discipline = "broken", overrides = {}) => ({
  id, date: "2026-11-15", status: "closed", actions: [],
  psychology: { stage: "before", decisionBasis: basis, urgeScore: 8, emotion: "兴奋 / 急迫",
    result: { netPnl: pnl, currency: "USDT", discipline } }, ...overrides,
});

// A zero outcome is an explicit breakeven; missing/invalid amounts are unknown.
assert.equal(tradeResult({ actions: [{ pnl: null }, { pnl: "" }, { pnl: "invalid" }] }).known, false);
assert.equal(tradeResult({ actions: [{ type: "mark", pnl: 50, unrealizedPnl: 100 }] }).known, false);
assert.equal(tradeResult(trade("flat", 0)).known, true);

// Final trade total replaces all partial-exit amounts and can include costs.
const split = trade("split", -35, "feeling", "partial", {
  actions: [{ type: "take", pnl: 100 }, { type: "exit", pnl: -120 }, { type: "mark", pnl: 999 }],
});
assert.equal(tradeResult(split).pnl, -35);
assert.equal(tradeResult({ actions: split.actions }).pnl, -20);
assert.equal(tradeResult({ actions: [{ type: "exit", pnl: 5 }], psychology: { plan: { settlementCurrency: "BTC" } } }).currency, "USD");
const stale = trade("edited-after-review", 10);
stale.psychology.result.stale = true;
assert.equal(tradeResult(stale).known, false);
assert.equal(disciplineOf(stale), "unknown");
assert.equal(analyzeTrades([stale]).settled, 0);

const samples = [
  trade("impulse-win", 100), trade("impulse-loss", -50), trade("rule-loss", -20, "rules", "followed"),
  trade("feeling-flat", 0, "feeling", "no-rules"), split,
  trade("open", 500, "rules", "followed", { status: "open" }),
  { id: "missing", date: "2026-11-15", status: "closed", actions: [] },
  trade("unexecuted", 900, "rules", "followed", { status: "planned" }),
  trade("cancelled", -900, "rules", "followed", { status: "cancelled" }),
  trade("usd", 10, "rules", "followed", { psychology: { stage: "after", decisionBasis: "rules", result: { netPnl: 10, currency: "USD", discipline: "followed" } } }),
];
const stats = analyzeTrades(samples);
assert.equal(stats.count, 8);
assert.equal(stats.settled, 6);
assert.equal(stats.open, 1);
assert.equal(stats.missingResult, 1);
assert.equal(stats.wins, 2);
assert.equal(stats.losses, 3);
assert.equal(stats.flats, 1);
assert.equal(stats.winRate, 2 / 6);
assert.equal(stats.currencies.USDT.net, -5);
assert.equal(stats.currencies.USDT.loss, 105);
assert.equal(stats.currencies.USD.net, 10);
assert.equal(stats.groups.find(g => g.key === "impulse").share, 2 / 8);
assert.equal(stats.groups.find(g => g.key === "impulse").winRate, 1 / 2);
assert.equal(stats.groups.find(g => g.key === "unknown").winRate, null);
assert.equal(stats.discipline.find(g => g.key === "broken").wins, 1); // Violating rules can win.
assert.equal(stats.discipline.find(g => g.key === "followed").losses, 1); // Following rules can lose.

// Do not infer discipline from an intention, empty checkboxes, or legacy flags.
const legacy = { psychology: { impulse: true, ruleBreak: false, entryDiscipline: "followed", gates: { setup: true } } };
assert.equal(basisOf(legacy), "unknown");
assert.equal(disciplineOf(legacy), "unknown");
assert.equal(analyzeTrades([]).winRate, null);
assert.deepEqual(analyzeTrades([]).currencies, {});

// Filters use trade date, capture timing and currency; groups remain exhaustive.
assert.equal(analyzeTrades(samples, { currency: "USD" }).count, 2); // Also includes the legacy record awaiting a result.
assert.equal(analyzeTrades(samples, { currency: "USD" }).settled, 1);
assert.equal(analyzeTrades(samples, { currency: "USDT" }).settled, 5);
assert.equal(analyzeTrades(samples, { stage: "after" }).count, 1);
assert.equal(analyzeTrades(samples, { stage: "unknown" }).count, 1);
assert.equal(analyzeTrades(samples, { from: "2026-11-16" }).count, 0);
assert.equal(analyzeTrades(samples, { to: "2026-11-14" }).count, 0);
for (const dimension of ["basis", "emotion", "urge", "discipline", "basis-discipline"]) {
  const byDimension = analyzeTrades(samples, { dimension });
  assert.equal(byDimension.groups.reduce((sum, g) => sum + g.count, 0), stats.count);
  assert.ok(Math.abs(byDimension.groups.reduce((sum, g) => sum + g.share, 0) - 1) < 1e-12);
}
console.log("Psychology analysis: all checks passed.");
