<template>
  <form
    id="trade-form"
    class="panel form-panel"
  >
    <div class="section-head">
      <div>
        <h2 id="form-title">
          新建一笔交易
        </h2>
        <p>一次录入多个品种；保存后每个品种仍是一条独立记录。</p>
      </div>
      <button
        id="cancel-edit"
        class="quiet hidden"
        type="button"
      >
        取消编辑
      </button>
    </div>
    <section class="form-section">
      <h3>本批共用信息</h3>
      <div class="form-grid">
        <div class="field">
          <label for="trade-date">计划日期</label>
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
        <button
          id="add-position"
          class="secondary"
          type="button"
        >
          ＋ 添加品种
        </button>
      </div>
      <div
        id="position-list"
        class="position-list"
      />
    </section>
    <section class="form-section">
      <h3>本批下单前心理检查</h3>
      <div class="psychology">
        <label class="check"><input
          name="anchor"
          type="checkbox"
        ><span><strong>价格锚定</strong>我是否把成本价、目标价或技术位当成必然有效？</span></label>
        <label class="check"><input
          name="regret"
          type="checkbox"
        ><span><strong>错失收益 / 追单冲动</strong>我是否因为之前没买而急着追？</span></label>
        <label class="check"><input
          name="evidence"
          type="checkbox"
        ><span><strong>反面证据</strong>我是否写了什么情况会推翻判断？</span></label>
        <label class="check"><input
          name="flatCheck"
          type="checkbox"
        ><span><strong>空仓检验</strong>如果现在没有仓位，我仍会做这笔吗？</span></label>
      </div>
    </section>
    <div class="form-actions">
      <button
        id="save-trade"
        class="primary"
        type="submit"
      >
        保存交易计划
      </button>
      <button
        class="secondary"
        type="reset"
      >
        清空表单
      </button>
    </div>
    <p
      id="form-status"
      class="status"
      aria-live="polite"
    />
  </form>
</template>
