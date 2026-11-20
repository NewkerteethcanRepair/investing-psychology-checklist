export const BASES = {
  rules: "规则信号", feeling: "纯靠感觉", impulse: "临时冲动",
  fomo: "害怕错过", revenge: "想追回亏损", mixed: "多种动机", other: "其他", unknown: "未记录动机",
};
export const DISCIPLINES = {
  followed: "完全按规则", partial: "部分偏离", broken: "明显违规",
  "no-rules": "没有明确规则", unknown: "尚未核对规则",
};
export const EMOTIONS = ["平静", "兴奋 / 急迫", "焦虑 / 害怕错过", "害怕亏损", "懊恼 / 想追回", "过度自信", "疲惫 / 分心"];

export function finiteValue(value) {
  if (value == null || String(value).trim() === "") return null;
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

export function tradeResult(trade) {
  const result = trade.psychology?.result;
  const total = finiteValue(result?.netPnl);
  const actions = (trade.actions || []).filter(a => a.type !== "mark" && finiteValue(a.pnl) !== null);
  return {
    // A reviewed total already includes the trade's partial exits and costs.
    // It replaces the sum of actions; it must never be added to that sum.
    pnl: total ?? actions.reduce((sum, a) => sum + Number(a.pnl), 0),
    known: !result?.stale && (total !== null || actions.length > 0),
    // Existing action forms explicitly collect USD. A plan's settlement coin
    // must not silently relabel those action amounts.
    currency: String(result?.currency || (actions.length ? "USD" : trade.psychology?.plan?.settlementCurrency) || "USD").trim().toUpperCase(),
  };
}

export function basisOf(trade) {
  const value = trade.psychology?.decisionBasis;
  return Object.hasOwn(BASES, value) ? value : "unknown";
}

export function disciplineOf(trade) {
  // Pre-trade intentions and unselected legacy checkboxes are not evidence of execution.
  const value = trade.psychology?.result?.stale ? "unknown" : trade.psychology?.result?.discipline;
  return Object.hasOwn(DISCIPLINES, value) ? value : "unknown";
}

export function groupOf(trade, dimension) {
  if (dimension === "basis-discipline") return `${BASES[basisOf(trade)]} × ${DISCIPLINES[disciplineOf(trade)]}`;
  if (dimension === "discipline") return disciplineOf(trade);
  if (dimension === "emotion") return trade.psychology?.emotion || "未记录情绪";
  if (dimension === "urge") {
    const score = finiteValue(trade.psychology?.urgeScore);
    return score === null || score < 0 || score > 10 ? "未记录冲动强度" : score <= 3 ? "0–3 · 低" : score <= 6 ? "4–6 · 中" : "7–10 · 高";
  }
  return basisOf(trade);
}

function summarize(trades) {
  const settled = trades.filter(t => t.status === "closed" && tradeResult(t).known);
  const currencies = {};
  let wins = 0, losses = 0, flats = 0;
  for (const t of settled) {
    const { pnl, currency } = tradeResult(t);
    const entry = currencies[currency] ||= { net: 0, loss: 0, count: 0 };
    entry.net += pnl;
    entry.loss += Math.max(0, -pnl);
    entry.count++;
    if (pnl > 0) wins++;
    else if (pnl < 0) losses++;
    else flats++;
  }
  return { count: trades.length, settled: settled.length, pending: trades.length - settled.length,
    wins, losses, flats, winRate: settled.length ? wins / settled.length : null, currencies };
}

export function analyzeTrades(trades, filters = {}) {
  const executed = trades.filter(t => ["open", "closed"].includes(t.status));
  const sample = executed.filter(t => {
    const stage = t.psychology?.stage || "unknown";
    return (!filters.from || t.date >= filters.from) && (!filters.to || t.date <= filters.to) &&
      (!filters.stage || filters.stage === "all" || filters.stage === stage) &&
      (!filters.currency || filters.currency === "all" || tradeResult(t).currency === filters.currency);
  });
  const dimension = filters.dimension || "basis";
  const buckets = new Map();
  for (const trade of sample) {
    const key = groupOf(trade, dimension);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(trade);
  }
  const total = summarize(sample);
  const groups = [...buckets].map(([key, items]) => ({ key,
    label: dimension === "basis" ? BASES[key] : dimension === "discipline" ? DISCIPLINES[key] : key,
    ...summarize(items), share: sample.length ? items.length / sample.length : 0,
  })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "zh-CN"));
  const discipline = Object.entries(DISCIPLINES).map(([key, label]) => ({
    key, label, ...summarize(sample.filter(t => disciplineOf(t) === key)),
  }));
  return { ...total, groups, discipline, sample, executed: executed.length,
    missingBasis: sample.filter(t => basisOf(t) === "unknown").length,
    reviewed: sample.filter(t => disciplineOf(t) !== "unknown").length,
    missingResult: sample.filter(t => t.status === "closed" && !tradeResult(t).known).length,
    open: sample.filter(t => t.status === "open").length,
    retrospective: sample.filter(t => t.psychology?.stage === "after").length,
    unknownStage: sample.filter(t => !["before", "after"].includes(t.psychology?.stage)).length,
  };
}
