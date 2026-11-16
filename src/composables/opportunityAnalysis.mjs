import { finiteValue, tradeResult } from "./journalAnalysis.mjs";

export const DECISIONS = { enter: "开仓", skip: "跳过", wait: "继续等待", unknown: "不明确" };
export const INTERVENTIONS = { none: "按原规则", early: "提前入场", skip: "过滤 / 跳过", size: "改变仓位", extra: "规则外开仓", other: "其他干预" };

export function opportunityResult(t) {
  const card = t.psychology?.decisionCard;
  if (!card) return null;
  const result = t.psychology?.result;
  const currency = card.currency;
  const skipped = t.status === "skipped" && !(t.actions || []).some(a => ["entry", "add"].includes(a.type));
  const actual = tradeResult(t);
  const actualKnown = skipped || (t.status === "closed" && actual.known && actual.currency === currency);
  const baseline = card.baseline === "skip" ? 0 : card.baseline === "enter" ? finiteValue(result?.baselinePnl) : null;
  const baselineKnown = baseline !== null && !result?.stale && (card.baseline === "skip" || (result?.comparisonConfirmed === true && result?.currency === currency));
  const risk = finiteValue(card.referenceRisk);
  const eligible = !!card.template && !!card.template.protocol && ["enter", "skip"].includes(card.baseline);
  const paired = eligible && actualKnown && baselineKnown;
  const c = skipped ? 0 : actual.pnl;
  return { card, currency, skipped, eligible, paired, actual: actualKnown ? c : null, baseline: baselineKnown ? baseline : null,
    delta: paired ? c - baseline : null,
    actualR: paired && risk > 0 ? c / risk : null,
    baselineR: paired && risk > 0 ? baseline / risk : null,
    deltaR: paired && risk > 0 ? (c - baseline) / risk : null };
}

export function analyzeOpportunities(trades, filters = {}) {
  const sample = trades.filter(t => t.psychology?.decisionCard && t.status !== "cancelled" &&
    (!filters.from || t.date >= filters.from) && (!filters.to || t.date <= filters.to) &&
    (!filters.stage || filters.stage === "all" || t.psychology.decisionCard.stage === filters.stage) &&
    (!filters.currency || filters.currency === "all" || t.psychology.decisionCard.currency === filters.currency));
  const groups = new Map();
  for (const t of sample) {
    const r = opportunityResult(t), card = r.card, template = card.template;
    const key = JSON.stringify([template?.id || "none", card.stage, card.currency, card.intervention]);
    if (!groups.has(key)) groups.set(key, { label: template ? `${template.name} · ${template.version}` : "未固定规则",
      stage: card.stage, intervention: card.intervention, currency: card.currency, count: 0, skipped: 0, paired: 0,
      baseline: 0, actual: 0, delta: 0, improved: 0, worsened: 0, equal: 0, rCount: 0, deltaR: 0, maxAbsDelta: 0 });
    const g = groups.get(key); g.count++; if (r.skipped) g.skipped++;
    if (r.paired) {
      g.paired++; g.baseline += r.baseline; g.actual += r.actual; g.delta += r.delta;
      g.maxAbsDelta = Math.max(g.maxAbsDelta, Math.abs(r.delta));
      if (r.delta > 0) g.improved++; else if (r.delta < 0) g.worsened++; else g.equal++;
      if (r.deltaR !== null) { g.rCount++; g.deltaR += r.deltaR; }
    }
  }
  return { count: sample.length, skipped: sample.filter(t => opportunityResult(t).skipped).length,
    paired: sample.filter(t => opportunityResult(t).paired).length, groups: [...groups.values()] };
}
