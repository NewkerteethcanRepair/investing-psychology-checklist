import { DECISIONS, INTERVENTIONS, analyzeOpportunities, opportunityResult } from "./opportunityAnalysis.mjs";
const VALIDATION = { untested: "尚未验证", exploratory: "仅探索 / 历史观察", forward: "自述已做前向检验" };
const KEY = "investing-rule-templates-v1";
const fields = ["Name", "Version", "Setup", "Entry", "Exit", "Risk", "Protocol", "Validation"];

export function initDecisionCards({ $, esc, id, stamp, getTrades }) {
  let local = [];
  try { local = JSON.parse(localStorage.getItem(KEY) || "[]"); if (!Array.isArray(local)) local = []; } catch { /* Preserve the journal if a template cache is invalid. */ }
  const f = $("#trade-form"), field = name => f.elements.namedItem(name);
  const psychologyFields = ["entryStage", "decisionBasis", "emotion", "urgeScore", "trigger", "stateNote", "entryDiscipline", "ruleReference", "skipped", "urgency", "impulse", "relief", "ruleBreak"];
  function lockPsychology(locked) {
    for (const name of psychologyFields) f.querySelectorAll(`[name="${name}"]`).forEach(el => { el.disabled = locked; });
  }
  function templates() {
    const all = [...local, ...getTrades().map(t => t.psychology?.decisionCard?.template).filter(Boolean)];
    return [...new Map(all.filter(t => t?.id).map(t => [t.id, t])).values()];
  }
  function preview() {
    const template = templates().find(t => t.id === field("ruleTemplate").value);
    $("#rule-template-preview").innerHTML = template ? `<strong>${esc(template.name)} · ${esc(template.version)} · ${esc(VALIDATION[template.validation] || "未注明验证状态")}</strong>${[ ["场景", template.setup], ["入场", template.entry], ["退出", template.exit], ["风险边界", template.risk], ["对照方法", template.protocol] ].map(([label, value]) => `<p><b>${label}：</b>${esc(value || "未填写")}</p>`).join("")}` : "没有固定规则时，可记录心理和结果，但不推测 A 对照。";
  }
  function refresh() {
    const selected = field("ruleTemplate").value;
    field("ruleTemplate").innerHTML = '<option value="">尚无固定规则</option>' + templates().map(t => `<option value="${esc(t.id)}">${esc(t.name)} · ${esc(t.version)}</option>`).join("");
    field("ruleTemplate").value = selected;
    preview();
  }
  $("#save-rule-template").addEventListener("click", () => {
    const template = Object.fromEntries(fields.map(k => [k.toLowerCase(), field("template" + k).value.trim()]));
    if (Object.values(template).some(v => !v)) { $("#template-status").textContent = "请填全名称、版本、场景、入场、退出、风险边界与测量方法。"; return; }
    if (templates().some(t => t.name === template.name && t.version === template.version)) { $("#template-status").textContent = "这个名称与版本已存在，请使用新的版本号，旧版本保持不变。"; return; }
    template.id = id(); template.createdAt = stamp();
    const next = [...local, template];
    try { localStorage.setItem(KEY, JSON.stringify(next)); local = next; }
    catch { $("#template-status").textContent = "存储失败，规则版本尚未保存。"; return; }
    refresh(); field("ruleTemplate").value = template.id; preview();
    $("#template-status").textContent = "已新增固定版本。以后修改请保存为另一版本。";
  });
  field("ruleTemplate").addEventListener("change", preview);
  function reset() {
    lockPsychology(false);
    $("#decision-inputs").disabled = false; field("ruleTemplate").disabled = false;
    $("#rule-template-editor").classList.remove("hidden");
    $("#decision-lock-notice").classList.add("hidden"); refresh();
  }
  function edit(t) {
    reset(); const card = t.psychology?.decisionCard;
    if (!card) return;
    for (const [name, value] of Object.entries({ ruleTemplate: card.template?.id || "", baselineDecision: card.baseline,
      actualDecision: card.actual, intervention: card.intervention, comparisonCurrency: card.currency,
      referenceRisk: card.referenceRisk ?? "", interventionReason: card.reason })) field(name).value = value;
    preview(); $("#decision-inputs").disabled = true; field("ruleTemplate").disabled = true;
    lockPsychology(true);
    $("#rule-template-editor").classList.add("hidden"); $("#decision-lock-notice").classList.remove("hidden");
  }
  function validate(editingId) {
    if (editingId) return [];
    const missing = [];
    for (const [name, label] of [["baselineDecision", "A：固定规则的决定"], ["actualDecision", "C：本次实际决定"], ["intervention", "对原规则的改变"]])
      if (!field(name).value) missing.push(label);
    if (!["unknown", ""].includes(field("baselineDecision").value) && !field("ruleTemplate").value) missing.push("明确的 A 对照需要选择固定规则版本");
    if (field("intervention").value && field("intervention").value !== "none" && !field("interventionReason").value.trim()) missing.push("干预理由：我额外相信什么");
    if (field("intervention").value === "none" && ["enter", "skip"].includes(field("baselineDecision").value) && field("actualDecision").value !== field("baselineDecision").value) missing.push("A 与 C 决定不同，请如实选择干预类型");
    if (field("actualDecision").value !== "enter" && f.entryStage.value === "after") missing.push("已经持仓的交易不能标记为未持仓跳过；请改为开仓，或选择事前记录");
    if (!/^[A-Za-z0-9]{2,10}$/.test(field("comparisonCurrency").value.trim())) missing.push("有效的对照币种");
    if (field("referenceRisk").value !== "" && !(Number(field("referenceRisk").value) > 0)) missing.push("参考风险必须大于 0，或留空");
    return missing;
  }
  function capture(stage) {
    return { template: structuredClone(templates().find(t => t.id === field("ruleTemplate").value) || null),
      baseline: field("baselineDecision").value, actual: field("actualDecision").value,
      intervention: field("intervention").value, reason: field("interventionReason").value.trim(),
      referenceRisk: field("referenceRisk").value === "" ? null : Number(field("referenceRisk").value),
      currency: field("comparisonCurrency").value.trim().toUpperCase(), stage, capturedAt: stamp() };
  }
  function snapshot(t) {
    const c = t.psychology?.decisionCard;
    if (!c) return "";
    return `<div class="rule-preview"><strong>${esc(c.template ? `${c.template.name} · ${c.template.version}` : "未固定规则")}</strong><p>A：${esc(DECISIONS[c.baseline])} → C 当时决定：${esc(DECISIONS[c.actual])} · ${esc(INTERVENTIONS[c.intervention])}</p><p>事前理由：${esc(c.reason || "未额外干预")}</p><p>参考风险：${esc(c.referenceRisk ?? "未记录")} ${esc(c.currency)} · ${c.stage === "before" ? "事前留档" : "补记 / 时机不详"}</p>${c.template ? `<details><summary>查看冻结的规则与测量口径</summary><p>场景：${esc(c.template.setup)}</p><p>入场：${esc(c.template.entry)}</p><p>退出：${esc(c.template.exit)}</p><p>风险：${esc(c.template.risk)}</p><p>验证状态：${esc(VALIDATION[c.template.validation])}</p><p>测量方法：${esc(c.template.protocol)}</p></details>` : ""}</div>`;
  }
  function reviewFields(t) {
    const c = t.psychology?.decisionCard, r = t.psychology?.result;
    if (!c) return "";
    return `<div class="field full rule-preview"><strong>A 固定规则对照（模拟）</strong><p>同一次机会，按冻结规则和测量方法补算。与实际资金盈亏分开；不开仓计 0，缺失不计 0。</p>${c.baseline === "enter" && c.template ? `<label class="field"><span>A · 含成本的模拟净盈亏 ${esc(c.currency)}</span><input name="baselinePnl" type="number" step="any" value="${esc(r?.baselinePnl ?? "")}" placeholder="未算清可留空"></label><label class="check"><input name="comparisonConfirmed" type="checkbox" ${r?.comparisonConfirmed && !r?.stale ? "checked" : ""}><span>已按事前冻结的方法核对可成交价格、退出、仓位与所有适用成本</span></label>` : `<p>${c.baseline === "skip" ? "A 按规则不开仓：该机会收益为 0。" : "A 条件不明确，保留记录，不生成模拟收益。"}</p>`}<p>R 基准：${esc(c.referenceRisk ?? "事前未填写，无法计算 R")} ${esc(c.currency)}</p></div>`;
  }
  function comparisonData(fd, t) {
    if (!t.psychology?.decisionCard) return {};
    const raw = String(fd.get("baselinePnl") || "").trim();
    return { baselinePnl: raw === "" ? null : Number(raw), comparisonConfirmed: fd.get("comparisonConfirmed") === "on" };
  }
  function renderAnalysis(filters) {
    const stats = analyzeOpportunities(getTrades(), filters);
    $("#opportunity-scope").textContent = `当前 ${stats.count} 次机会，包括 ${stats.skipped} 次未持仓跳过；${stats.paired} 次有完整 A / C 对照。每行固定规则版本、留档时机、币种与干预类型，避免混合计算。`;
    const num = n => Number(n).toLocaleString("zh-CN", { maximumFractionDigits: 3 });
    $("#opportunity-table").innerHTML = stats.count ? `<table class="analysis-table"><caption>A 固定规则模拟 vs C 实际决定 · 按同一次机会配对</caption><thead><tr><th>规则 / 干预</th><th>机会 / 跳过 / 配对</th><th>A 模拟合计</th><th>C 实际合计</th><th>C − A 合计 / 每机会</th><th>改善 / 变差 / 相同</th><th>平均 ΔR / 有 R 样本</th><th>最大单次绝对差</th></tr></thead><tbody>${stats.groups.map(g => `<tr><th>${esc(g.label)}<small class="sample-warning">${esc(INTERVENTIONS[g.intervention])} · ${g.stage === "before" ? "事前记录" : "补记 / 时机不详"} · ${esc(g.currency)}</small></th><td>${g.count} / ${g.skipped} / ${g.paired}</td><td>${g.paired ? num(g.baseline) : "—"}</td><td>${g.paired ? num(g.actual) : "—"}</td><td>${g.paired ? `${num(g.delta)} / ${num(g.delta / g.paired)}` : "—"}</td><td>${g.improved} / ${g.worsened} / ${g.equal}</td><td>${g.rCount ? num(g.deltaR / g.rCount) : "—"} / ${g.rCount}</td><td>${g.paired ? num(g.maxAbsDelta) : "—"}</td></tr>`).join("")}</tbody></table>` : '<div class="empty">先选择固定规则并记录一次机会，包括没有做的信号。旧交易继续保留在下方心理统计中。</div>';
  }
  refresh();
  return { refresh, reset, edit, validate, capture, snapshot, reviewFields, comparisonData, renderAnalysis, templates, opportunityResult };
}
