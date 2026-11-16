<template>
  <form id="trade-form" class="panel form-panel" novalidate>
    <div class="section-head">
      <div><h2 id="form-title">记下此刻的自己</h2><p>先记动机、情绪和规则。平仓后再回来核对结果。</p></div>
      <el-button id="cancel-edit" class="quiet hidden" native-type="button">取消编辑并关闭弹框</el-button>
    </div>
    <div id="form-mode-notice" class="form-mode-notice" role="status"><strong id="form-mode-title">新建记录</strong><span id="form-mode-description">不需要写完整分析，先留下当时的真实想法。</span></div>
    <section class="form-section timing-section">
      <div class="timing-options">
        <label class="timing-option"><input name="entryStage" type="radio" value="before" checked><span><strong>下单前记录</strong><small>保留做决定时的状态。</small></span></label>
        <label class="timing-option"><input name="entryStage" type="radio" value="after"><span><strong>已经下单，补记状态</strong><small>分析时可单独查看补记样本。</small></span></label>
        <label id="unknown-stage-option" class="timing-option hidden"><input name="entryStage" type="radio" value="unknown"><span><strong>原记录时机不详</strong><small>保留未知状态，不推测当时何时记录。</small></span></label>
      </div>
    </section>
    <section class="form-section">
      <div class="section-head batch-heading"><div><h3>01 · 这笔交易</h3><p>每笔单独记录，避免把不同心理混在一起。</p></div><el-button id="add-position" class="secondary" native-type="button">＋ 同状态的其他品种</el-button></div>
      <div class="form-grid"><label class="field"><span>交易日期</span><el-date-picker id="trade-date" v-model="journalDates.trade" class="journal-date-picker" type="date" format="YYYY-MM-DD" value-format="YYYY-MM-DD" placeholder="选择交易日期" :editable="false" /></label></div>
      <div id="position-list" class="position-list" />
    </section>
    <RuleDecisionCard />
    <section class="form-section">
      <h3 id="impulse-title">02 · 我现在为什么想做这笔单？</h3>
      <div class="form-grid">
        <label class="field"><span>最主要的下单动机 *</span><select name="decisionBasis"><option value="">请选择真实原因</option><option value="rules">规则信号：满足了预设条件</option><option value="feeling">纯靠感觉：觉得会涨 / 会跌</option><option value="impulse">临时冲动：突然就想下单</option><option value="fomo">害怕错过：怕行情跑了</option><option value="revenge">想追回亏损：想扳回一笔</option><option value="other">其他原因</option><option value="unknown">记不清了</option></select></label>
        <label class="field"><span>当时最明显的情绪 *</span><select name="emotion"><option value="">请选择</option><option>平静</option><option>兴奋 / 急迫</option><option>焦虑 / 害怕错过</option><option>害怕亏损</option><option>懊恼 / 想追回</option><option>过度自信</option><option>疲惫 / 分心</option><option>记不清了</option></select></label>
        <label id="urge-field" class="field"><span>有多想立刻下单？（事前必填）</span><select name="urgeScore"><option value="">0–10 分；补记时回忆不清可留空</option><option value="0">0 · 没有冲动</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10 · 非常强</option></select><small id="urge-warning" class="hidden">冲动较强。记下触发点，留待以后比较。</small></label>
        <label class="field"><span>是什么触发了我？（选填）</span><input name="trigger" placeholder="例如：刚止损、突然拉升、看到别人赚钱"></label>
        <label class="field full"><span>留一句当时的原话（选填）</span><textarea name="stateNote" placeholder="例如：没什么信号，但我觉得这次一定会涨，忍不住想买。" /></label>
      </div>
      <details class="optional-section"><summary>还有其他心理信号？（可多选）</summary><div class="psychology">
        <label class="check"><input name="urgency" type="checkbox"><span>害怕错过</span></label>
        <label class="check"><input name="impulse" type="checkbox"><span>先行动后思考</span></label>
        <label class="check"><input name="relief" type="checkbox"><span>想缓解情绪 / 证明自己</span></label>
        <label class="check"><input name="ruleBreak" type="checkbox"><span>已经偏离规则</span></label>
      </div></details>
    </section>
    <section class="form-section">
      <h3>03 · 此刻的规则情况</h3>
      <div class="form-grid">
        <label class="field"><span>这次入场是否符合自己的规则？ *</span><select name="entryDiscipline"><option value="">请选择</option><option value="followed">完全符合</option><option value="partial">有部分偏离</option><option value="broken">明知不符合，仍然想做 / 已经做了</option><option value="no-rules">我没有明确规则</option><option value="unknown">暂时无法判断</option></select><small>这里只记录入场判断；整笔交易是否守规则，在结束时单独核对。</small></label>
        <label class="field"><span>对照哪条规则？（选填）</span><input name="ruleReference" placeholder="例如：等回踩确认；单笔风险不超过 1%"></label>
        <label class="field full"><span>我跳过 / 改变了什么？（选填）</span><textarea name="skipped" placeholder="例如：没等确认就追了；临时加大仓位；没有偏离则留空。" /></label>
      </div>
    </section>
    <details class="optional-section form-section">
      <summary>补充交易假设与开仓检查（选填）</summary>
      <div class="form-grid">
        <label class="field"><span>观察周期</span><input id="timeframe" name="timeframe" placeholder="例如 1h"></label>
        <label class="field full"><span>交易理由 / 假设</span><textarea id="thesis" name="thesis" placeholder="如果需要，再补充策略依据。" /></label>
      </div>
      <section id="gate-section" class="form-section"><h3>开仓检查（可选）</h3><p id="urge-intro" class="psych-intro">用于保留额外的计划信息，不代替实际执行复盘。</p><div class="psychology gate-checks">
        <label class="check"><input name="gateSetup" type="checkbox"><span>策略条件成立</span></label>
        <label class="check"><input name="gateInvalidation" type="checkbox"><span>失效 / 止损条件明确</span></label>
        <label class="check"><input name="gateRisk" type="checkbox"><span>仓位与风险已核算</span></label>
        <label class="check"><input name="gateAccept" type="checkbox"><span>能接受计划止损</span></label>
      </div></section>
    </details>
    <div class="form-actions"><el-button id="save-trade" class="primary" type="primary" native-type="submit">保存当时状态</el-button><el-button class="secondary" native-type="reset">清空表单</el-button></div>
    <div id="form-errors" class="el-alert el-alert--error is-light validation-errors hidden" role="alert"><div class="el-alert__content"><span class="el-alert__title">请先补全以下内容</span><ul id="form-error-list" class="validation-error-list" /></div></div>
    <p id="form-status" class="status" aria-live="polite" />
  </form>
</template>

<script>
import { journalDates } from "../composables/journalDates";
import RuleDecisionCard from "./RuleDecisionCard.vue";
export default { components: { RuleDecisionCard }, setup: () => ({ journalDates }) };
</script>
