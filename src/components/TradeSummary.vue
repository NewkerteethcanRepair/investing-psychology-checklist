<template>
  <section aria-label="心理交易日志汇总">
    <h2>交易与复盘统计</h2>
    <p
      id="journal-summary-empty"
      class="privacy"
    >
      导入一次即可自动整理交易、计算盈亏，不需要先填写复盘表单。
    </p>
    <div
      id="journal-summary-metrics"
      class="summary hidden"
    >
      <div class="metric">
        <div class="metric-label">
          已整理交易组
        </div><div
          id="sample-count"
          class="metric-value"
        >
          0
        </div><div class="metric-sub">
          含已平仓与范围未闭合的交易组
        </div>
      </div>
      <div class="metric">
        <div class="metric-label">
          范围待核对
        </div><div
          id="review-count"
          class="metric-value"
        >
          0
        </div><div class="metric-sub">
          缺少开仓、未平完或金额不完整
        </div>
      </div>
      <div class="metric">
        <div class="metric-label">
          完整交易扣费后盈亏
        </div><div
          id="settled-pnl"
          class="metric-value compact-value"
        >
          —
        </div><div class="metric-sub">
          仅范围完整的已平仓交易，不含资金费
        </div>
      </div>
      <div class="metric">
        <div class="metric-label">
          已平仓胜率
        </div><div
          id="discipline-rate"
          class="metric-value"
        >
          —
        </div><div
          id="discipline-scope"
          class="metric-sub"
        >
          自动计算，不需要填写心理或复盘
        </div>
      </div>
    </div>
  </section>
</template>
