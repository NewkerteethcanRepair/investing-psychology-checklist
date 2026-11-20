<template>
  <section class="form-section decision-card">
    <h3>固定规则 → 我的决定</h3>
    <p class="psych-intro">
      每个符合观察场景的机会都可记录，包括最后没做的机会。先留对照，再看结果。
    </p>
    <div class="form-grid">
      <label class="field full"><span>对照规则版本 *</span><select
        id="rule-template-select"
        name="ruleTemplate"
      ><option value="">尚无固定规则</option></select></label>
    </div>
    <div
      id="rule-template-preview"
      class="rule-preview"
    />
    <details
      id="rule-template-editor"
      class="optional-section"
    >
      <summary>创建固定规则 / 新版本</summary>
      <p class="psych-intro">
        保存会新增一个不可覆盖的版本；没有预设有效阈值，请填写自己的规则。未用于记录的模板仅保存在本机，使用后随该记录同步和备份。
      </p>
      <div class="form-grid">
        <label class="field"><span>规则名称</span><input
          name="templateName"
          placeholder="例如：日线趋势 + 4h 回调"
        ></label>
        <label class="field"><span>版本号</span><input
          name="templateVersion"
          placeholder="例如 v1"
        ></label>
        <label class="field full"><span>适用场景</span><textarea
          name="templateSetup"
          placeholder="明确品种范围、周期和市场环境"
        /></label>
        <label class="field full"><span>可核对的入场条件</span><textarea
          name="templateEntry"
          placeholder="写成可判断是 / 否的条件，避免‘位置舒服’"
        /></label>
        <label class="field full"><span>退出 / 失效条件</span><textarea
          name="templateExit"
          placeholder="何时止损、止盈、超时退出"
        /></label>
        <label class="field full"><span>仓位和风险边界</span><textarea
          name="templateRisk"
          placeholder="不能被其他信号抵消的风险限制"
        /></label>
        <label class="field full"><span>A 对照的测量方法</span><textarea
          name="templateProtocol"
          placeholder="事前固定：可成交价格、退出时点 / 规则、仓位、手续费、滑点和资金费口径。A 与 C 使用相同机会和风险基准。"
        /></label>
        <label class="field"><span>规则验证状态（自述）</span><select name="templateValidation"><option value="untested">尚未验证</option><option value="exploratory">仅探索 / 历史观察</option><option value="forward">已做前向检验（自行核对）</option></select></label>
      </div>
      <button
        id="save-rule-template"
        class="secondary"
        type="button"
      >
        保存为新规则版本
      </button>
      <p
        id="template-status"
        class="status"
        role="status"
      />
    </details>
    <fieldset
      id="decision-inputs"
      class="decision-inputs"
    >
      <legend>本次机会的事前决定</legend>
      <div class="form-grid">
        <label class="field"><span>A · 固定规则会怎么做？ *</span><select name="baselineDecision"><option value="">请选择</option><option value="enter">开仓</option><option value="skip">不开仓</option><option value="unknown">条件不明确 / 没有规则</option></select></label>
        <label class="field"><span>C · 我这次决定怎么做？ *</span><select name="actualDecision"><option value="">请选择</option><option value="enter">开仓（进场前保存为待执行）</option><option value="skip">跳过这次机会（未持仓）</option><option value="wait">继续等待</option></select></label>
        <label class="field"><span>我对原规则做了什么改变？ *</span><select name="intervention"><option value="">请选择</option><option value="none">按原规则</option><option value="early">提前入场</option><option value="skip">过滤 / 跳过</option><option value="size">改变仓位</option><option value="extra">规则外开仓</option><option value="other">其他干预</option></select></label>
        <label class="field"><span>这次统一对照的币种 *</span><input
          name="comparisonCurrency"
          value="USDT"
          maxlength="10"
          placeholder="如 USDT"
        ></label>
        <label class="field"><span>事前固定的参考风险金额（选填）</span><input
          name="referenceRisk"
          type="number"
          min="0"
          step="any"
          placeholder="A / C 共用的 1R 金额"
        ><small>用于净盈亏 ÷ 事前参考风险；缺失时不计算 R。</small></label>
        <label class="field full"><span>我额外相信什么？为什么改变？</span><textarea
          name="interventionReason"
          placeholder="例如：规则还没确认，但我认为不会再回踩；如果不加这个判断，我会继续等。"
        /><small>有干预时填写。</small></label>
      </div>
    </fieldset>
  </section>
</template>
