import assert from "node:assert/strict";
import { analyzeOpportunities, opportunityResult } from "../src/composables/opportunityAnalysis.mjs";
const make = (overrides = {}) => ({
  id: "opportunity", date: "2026-11-16", status: "closed", actions: [],
  psychology: { decisionCard: { template: { id: "v1", name: "Trend", version: "v1", protocol: "fixed exit, costs" },
    baseline: "enter", actual: "enter", intervention: "early", stage: "before", referenceRisk: 50, currency: "USDT" },
  result: { netPnl: 20, currency: "USDT", baselinePnl: -50, comparisonConfirmed: true } }, ...overrides,
});
const actual = make();
assert.equal(opportunityResult(actual).delta, 70);
assert.equal(opportunityResult(actual).deltaR, 1.4);
const skipped = make({ status: "skipped" });
assert.equal(opportunityResult(skipped).actual, 0);
assert.equal(opportunityResult(skipped).delta, 50);
const missing = make(); missing.psychology.result.baselinePnl = null;
assert.equal(opportunityResult(missing).paired, false);
const unconfirmed = make(); unconfirmed.psychology.result.comparisonConfirmed = false;
assert.equal(opportunityResult(unconfirmed).paired, false);
const unclear = make(); unclear.psychology.decisionCard.baseline = "unknown";
assert.equal(opportunityResult(unclear).paired, false);
const noEntry = make(); noEntry.psychology.decisionCard.baseline = "skip";
assert.equal(opportunityResult(noEntry).baseline, 0);
assert.equal(opportunityResult(noEntry).delta, 20);
const noRisk = make(); noRisk.psychology.decisionCard.referenceRisk = null;
assert.equal(opportunityResult(noRisk).deltaR, null);
const stale = make(); stale.psychology.result.stale = true;
assert.equal(opportunityResult(stale).paired, false);
const otherCoin = make(); otherCoin.psychology.result.currency = "BTC";
assert.equal(opportunityResult(otherCoin).paired, false);
const stillOpen = make({ status: "open" });
assert.equal(opportunityResult(stillOpen).paired, false);
const invalidSkip = make({ status: "skipped", actions: [{ type: "entry" }] });
assert.equal(opportunityResult(invalidSkip).paired, false);
const after = make(); after.psychology.decisionCard.stage = "after";
const nextVersion = make(); nextVersion.psychology.decisionCard.template.id = "v2";
const stats = analyzeOpportunities([actual, skipped, missing, make({status:"cancelled"}), {status:"closed"}, after, nextVersion]);
assert.equal(stats.count, 5);
assert.equal(stats.paired, 4);
assert.equal(stats.groups.length, 3); // Never combine versions or timing.
assert.equal(stats.groups[0].delta, 120);
assert.equal(stats.groups[0].paired, 2);
assert.equal(stats.groups[0].skipped, 1);
assert.equal(stats.groups[0].maxAbsDelta, 70);
assert.equal(analyzeOpportunities([after, actual], {stage:"before"}).count, 1);
assert.equal(analyzeOpportunities([actual], {from:"2026-11-17"}).count, 0);
assert.equal(analyzeOpportunities([actual], {currency:"USD"}).count, 0);
console.log("Opportunity pairing: all checks passed.");
