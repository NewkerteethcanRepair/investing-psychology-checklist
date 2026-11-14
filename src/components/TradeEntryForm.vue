<template>
  <form
    id="trade-form"
    class="panel form-panel"
    novalidate
  >
    <div class="section-head">
      <div>
        <h2 id="form-title">
          新建一笔交易
        </h2>
        <p>一次录入多个品种；保存后每个品种仍是一条独立记录。</p>
      </div>
      <el-button
        id="cancel-edit"
        class="quiet hidden"
        native-type="button"
      >
        取消编辑并关闭弹框
      </el-button>
    </div>
    <div id="form-mode-notice" class="form-mode-notice" role="status">
      <strong id="form-mode-title">新建模式</strong>
      <span id="form-mode-description">提交后会创建一条新的交易记录。</span>
    </div>
    <section class="form-section timing-section">
      <h3>你现在处于哪个阶段？</h3>
      <div class="timing-options">
        <label class="timing-option"><input name="entryStage" type="radio" value="before" checked><span><strong>还没下单</strong><small>先做一次短暂停顿，再决定是否执行。</small></span></label>
        <label class="timing-option"><input name="entryStage" type="radio" value="after"><span><strong>已经下单，正在补记</strong><small>如实记录实际情况，不把事后理由写成事前计划。</small></span></label>
      </div>
    </section>
    <section class="form-section">
      <h3>本批共用信息</h3>
      <div class="form-grid">
        <div class="field">
          <label for="trade-date">交易日期 / 计划日期</label>
          <input
            id="trade-date"
            name="date"
            type="date"
            required
          >
        </div>
        <div class="field">
          <label for="timeframe">观察周期</label>
          <input
            id="timeframe"
            name="timeframe"
            placeholder="例如 1h 入场，日线假设"
          >
        </div>
        <div class="field full">
          <label for="thesis">交易理由 / 假设</label>
          <textarea
            id="thesis"
            name="thesis"
            placeholder="为什么考虑这批交易？什么证据会推翻判断？"
          />
        </div>
      </div>
    </section>
    <section class="form-section">
      <div class="section-head batch-heading">
        <div><h3>每个品种单独填写</h3><p>方向、仓位、进场价、TP、SL 和风险都可分别设置。</p></div>
        <el-button
          id="add-position"
          class="secondary"
          native-type="button"
        >
          ＋ 添加品种
        </el-button>
      </div>
      <div
        id="position-list"
        class="position-list"
      />
    </section>
    <section class="form-section">
      <h3>开仓前检查（4 项全通过才考虑执行）</h3>
      <p class="psych-intro">任一项未确认或答“否”，先调整计划或减小仓位。记录仍可保存为“待调整”，不会被当成检查通过；这里不能替券商拦截订单。</p>
      <div class="psychology gate-checks">
        <label class="check"><input name="gateSetup" type="checkbox"><span><strong>策略条件成立</strong>当前信号符合我预先定义的入场条件。</span></label>
        <label class="check"><input name="gateInvalidation" type="checkbox"><span><strong>知道何时认错</strong>失效条件 / 止损位已明确，不会临场往外挪。</span></label>
        <label class="check"><input name="gateRisk" type="checkbox"><span><strong>风险算得清</strong>仓位与最大亏损已算好，在我的风险上限内。</span></label>
        <label class="check"><input name="gateAccept" type="checkbox"><span><strong>能接受这笔止损</strong>如果按计划止损，我能平静接受；否则先减半仓位再确认。</span></label>
      </div>
    </section>
    <section class="form-section">
      <h3>下单当下的心理检查</h3>
      <p class="psych-intro">不用证明自己理性，只记录当时的状态。勾选代表“这件事确实发生/我确实做了”。</p>
      <div class="psychology">
        <label class="check"><input name="urgency" type="checkbox"><span><strong>害怕错过</strong>我因为怕行情跑掉而加快了决定吗？</span></label>
        <label class="check"><input name="impulse" type="checkbox"><span><strong>先行动后思考</strong>我是否已经下单，才开始想仓位、止损或理由？</span></label>
        <label class="check"><input name="relief" type="checkbox"><span><strong>情绪驱动</strong>这笔单是在缓解焦虑、追回亏损或证明自己吗？</span></label>
        <label class="check"><input name="ruleBreak" type="checkbox"><span><strong>偏离规则</strong>我是否跳过了自己原本设定的进场/风险规则？</span></label>
      </div>
      <div class="form-grid psych-followup">
        <label class="field"><span>下单时的主要情绪</span><select name="emotion"><option value="">选择（可空）</option><option>平静</option><option>兴奋 / 急迫</option><option>焦虑 / 害怕错过</option><option>害怕亏损</option><option>懊恼 / 想追回</option><option>过度自信</option><option>疲惫 / 分心</option></select></label>
        <label class="field"><span>这次最明显的触发点</span><input name="trigger" placeholder="例如：突然拉升、刚止损、看到别人晒单"></label>
        <label class="field full"><span>如果已经开单：我跳过了什么？</span><textarea name="skipped" placeholder="例如：没算最大亏损，没等确认，先买了再找理由；没有偏离可留空"></textarea></label>
      </div>
    </section>
    <div class="form-actions">
      <el-button
        id="save-trade"
        class="primary"
        type="primary"
        native-type="submit"
      >
        创建新交易记录
      </el-button>
      <el-button
        class="secondary"
        type="default"
        native-type="reset"
      >
        清空表单
      </el-button>
    </div>
    <div id="form-errors" class="el-alert el-alert--error is-light validation-errors hidden" role="alert">
      <div class="el-alert__content">
        <span class="el-alert__title">请先补全以下内容</span>
        <ul id="form-error-list" class="validation-error-list" />
      </div>
    </div>
    <p
      id="form-status"
      class="status"
      aria-live="polite"
    />
  </form>
</template>
