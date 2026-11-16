<template>
  <section aria-label="委托成交盈亏汇总">
    <h2>交易盈亏 · 导入即看</h2>
    <p class="privacy">
      {{ history?.period || '尚未导入委托成交数据' }} · 已自动关联到「交易与复盘」，下方可直接查看每笔过程；不含资金费和浮动盈亏。
    </p>
    <div class="summary">
      <div class="metric">
        <div class="metric-label">
          已实现盈亏（未扣手续费）
        </div>
        <div
          v-for="row in summary.currencies"
          :key="row.currency"
          class="metric-value compact-value"
          :class="tone(row.pnl)"
        >
          {{ amount(row.pnl) }} {{ row.currency }}
        </div>
        <div
          v-if="!summary.currencies.length"
          class="metric-value"
        >
          —
        </div>
        <div class="metric-sub">
          委托 PNL 合计，成交明细不重复计入
        </div>
      </div>
      <div class="metric">
        <div class="metric-label">
          手续费 / 返佣
        </div>
        <div
          v-for="row in summary.currencies"
          :key="row.currency"
          class="metric-value compact-value"
          :class="tone(row.fees)"
        >
          {{ amount(row.fees) }} {{ row.currency }}
        </div>
        <div
          v-if="!summary.currencies.length"
          class="metric-value"
        >
          —
        </div>
        <div class="metric-sub">
          负数为支出，正数为返佣；含未匹配成交手续费
        </div>
      </div>
      <div class="metric">
        <div class="metric-label">
          已知数据扣费后盈亏
        </div>
        <div
          v-for="row in summary.currencies"
          :key="row.currency"
          class="metric-value compact-value"
          :class="tone(row.net)"
        >
          {{ amount(row.net) }} {{ row.currency }}
        </div>
        <div
          v-if="!summary.currencies.length"
          class="metric-value"
        >
          —
        </div>
        <div class="metric-sub">
          已实现盈亏 + 手续费原始值，币种分别计算
        </div>
      </div>
      <div class="metric">
        <div class="metric-label">
          导入委托
        </div>
        <div class="metric-value">
          {{ history?.orders.length || 0 }}
        </div>
        <div class="metric-sub">
          按委托计数，不代表完整持仓笔数
        </div>
      </div>
    </div>
    <p
      v-if="summary.unmatched || summary.missing"
      class="privacy"
      role="status"
    >
      <template v-if="summary.unmatched">
        {{ summary.unmatched }} 条成交缺少对应委托：已计入手续费，对应盈亏待补。
      </template>
      <template v-if="summary.missing">
        {{ summary.missing }} 项金额或币种缺失。
      </template>
      以上为已知金额汇总。
    </p>
    <p
      v-if="error"
      class="privacy"
      role="status"
    >
      {{ error }}
    </p>
  </section>
</template>
<script>
import { ORDER_HISTORY_KEY, ORDER_HISTORY_EVENT, validateOrderHistory } from '../composables/orderHistory.mjs';
import { summarizeOrderHistory } from '../composables/orderHistoryAnalysis.mjs';
export default {
  data() { return { history: null, error: '' }; },
  computed: { summary() { return summarizeOrderHistory(this.history); } },
  mounted() {
    window.addEventListener(ORDER_HISTORY_EVENT, this.receiveImport);
    window.addEventListener('storage', this.storageChanged);
    window.addEventListener('journal-updated', this.load);
    this.load();
  },
  beforeUnmount() {
    window.removeEventListener(ORDER_HISTORY_EVENT, this.receiveImport);
    window.removeEventListener('storage', this.storageChanged);
    window.removeEventListener('journal-updated', this.load);
  },
  methods: {
    load() {
      try {
        const raw = localStorage.getItem(ORDER_HISTORY_KEY);
        if (raw) this.history = validateOrderHistory(JSON.parse(raw));
        else {
          const trades = JSON.parse(localStorage.getItem('investing-psychology-journal-v2') || '[]');
          const groups = trades.map(t => t.psychology?.orderExecution).filter(Boolean);
          const orders = [...new Map(groups.flatMap(x => x.orders).map(o => [o['Order ID'],o])).values()];
          const unmatchedFills = [...new Map(groups.flatMap(x => x.unmatchedFills || []).map(f => [`${f.Symbol}:${f['Order ID']}:${f['Trade ID']}`,f])).values()];
          this.history = groups.length ? { orders, unmatchedFills, period: groups[0].period || '' } : null;
        }
        this.error = '';
      }
      catch { this.history = null; this.error = '委托汇总读取失败，请重新导入文件。'; }
    },
    receiveImport(event) { this.history = event.detail; this.error = ''; },
    storageChanged(event) { if (event.key === ORDER_HISTORY_KEY || event.key === null) this.load(); },
    amount(value) { return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: 'exceptZero' }); },
    tone(value) { return value > 0 ? 'order-profit' : value < 0 ? 'order-loss' : ''; },
  },
};
</script>
<style scoped>
.order-profit { color: #23764a; }
.order-loss { color: #ba4242; }
</style>
