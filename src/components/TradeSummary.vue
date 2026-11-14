<template>
  <section
    class="summary"
    aria-label="交易汇总"
  >
    <div class="metric">
      <div class="metric-label">
        计划 / 持仓
      </div>
      <div
        id="active-count"
        class="metric-value"
      >
        0
      </div>
      <div class="metric-sub">
        未结束记录
      </div>
    </div>
    <div class="metric">
      <div class="metric-label">
        已实现净盈亏
      </div>
      <div
        id="net-pnl"
        class="metric-value"
      >
        $0.00
      </div>
      <div class="metric-sub">
        按操作流水累计
      </div>
    </div>
    <div class="metric">
      <div class="metric-label">
        累计亏损
      </div>
      <div
        id="loss-total"
        class="metric-value negative"
      >
        $0.00
      </div>
      <div class="metric-sub">
        亏损操作的绝对值合计
      </div>
    </div>
    <div class="metric">
      <div class="metric-label">
        持仓计划风险
      </div>
      <div
        id="open-risk"
        class="metric-value"
      >
        $0.00
      </div>
      <div class="metric-sub">
        持仓中记录填写的最大风险合计
      </div>
    </div>
  </section>
</template>
