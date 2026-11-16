<template>
  <section class="summary" aria-label="心理交易日志汇总">
    <div class="metric"><div class="metric-label">已执行交易</div><div id="sample-count" class="metric-value">0</div><div class="metric-sub">持仓中 + 已结束，每笔计一次</div></div>
    <div class="metric"><div class="metric-label">待补结果 / 复盘</div><div id="review-count" class="metric-value">0</div><div class="metric-sub">已结束，缺盈亏或执行核对</div></div>
    <div class="metric"><div class="metric-label">已结束交易净盈亏</div><div id="settled-pnl" class="metric-value compact-value">—</div><div class="metric-sub">分币种显示，以最终净额为准</div></div>
    <div class="metric"><div class="metric-label">完全守规则占比</div><div id="discipline-rate" class="metric-value">—</div><div id="discipline-scope" class="metric-sub">以已结束且已核对规则的交易为分母</div></div>
  </section>
</template>
