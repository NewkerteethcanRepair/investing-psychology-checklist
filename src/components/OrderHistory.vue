<template>
  <section
    id="orders-view"
    class="view"
  >
    <h2>OKX 委托与成交</h2>
    <p class="privacy">
      导入解压整理后的委托成交 JSON。数据仅保存在当前浏览器；委托完成不代表仓位已平仓，不计入心理复盘统计。时间沿用源文件，源文件未标明时区。
    </p>
    <label class="secondary">导入委托成交 JSON <input
      type="file"
      accept=".json,application/json"
      @change="importFile"
    ></label>
    <p role="status">
      {{ message }}
    </p>
    <div class="filters">
      <input
        v-model="query"
        placeholder="搜索品种、订单号或方向"
        aria-label="搜索委托"
      >
      <select
        v-model="status"
        aria-label="委托状态"
      >
        <option value="">
          全部状态
        </option><option
          v-for="s in statuses"
          :key="s"
          :value="s"
        >
          {{ statusName(s) }}
        </option>
      </select>
    </div>
    <p>{{ period }} · 共 {{ orders.length }} 条委托 / {{ fillCount }} 条成交 · 当前显示 {{ filtered.length }} 条委托</p>
    <p
      v-if="unmatched.length"
      class="privacy"
    >
      有 {{ unmatched.length }} 条成交在委托文件中没有对应订单，已保留在下方，未丢弃。
    </p>
    <p v-if="!orders.length">
      尚未导入。请选择整理后的 OKX 委托成交 JSON 文件。
    </p>
    <div
      v-for="o in filtered"
      :key="o['Order ID']"
      class="order-item"
    >
      <details>
        <summary>{{ o['Order Time'] }} · {{ o.Symbol }} · {{ sideName(o.Side) }} · {{ statusName(o.Status) }} · 成交 {{ o['Filled Amount'] }} {{ o['Amount Unit'] }}</summary>
        <p>订单号 {{ o['Order ID'] }} · {{ o['Order Type'] }} · 杠杆 {{ o.Lvg }} · 委托数量 {{ o['Order Amount'] }} · 委托价 {{ amount(o['Order Price']) }} · 成交均价 {{ amount(o['Avg. Filled Price']) }} {{ o['Price Unit'] }}</p>
        <p>订单已实现盈亏 {{ amount(o.PNL) }} {{ o['Price Unit'] }} · 手续费 {{ amount(o.Fee) }} {{ o['Fee Unit'] }}（原始值；不代表整笔持仓净收益，未含资金费）</p>
        <div class="order-table">
          <table>
            <thead><tr><th>成交时间</th><th>成交编号</th><th>数量</th><th>价格</th><th>成交额</th><th>手续费</th><th>流动性</th></tr></thead><tbody>
              <tr
                v-for="f in o.fills"
                :key="f['Trade ID']"
              >
                <td>{{ f['Trade Time'] }}</td><td>{{ f['Trade ID'] }}</td><td>{{ f['Filled Amount'] }} {{ f['Filled Amount Unit'] }}</td><td>{{ amount(f['Filled Price']) }} {{ f['Fill Price Unit'] }}</td><td>{{ amount(f['Trading Volume']) }} {{ f['Trading Volume Unit'] }}</td><td>{{ amount(f.Fee) }} {{ f['Fee Unit'] }}</td><td>{{ f['taker/maker'] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="!o.fills.length">
          成交明细文件中没有对应记录。
        </p>
      </details>
    </div>
    <details v-if="unmatched.length">
      <summary>未匹配的成交明细（{{ unmatched.length }}）</summary><pre class="order-raw">{{ JSON.stringify(unmatched, null, 2) }}</pre>
    </details>
  </section>
</template>
<script>
import { ORDER_HISTORY_KEY as KEY, ORDER_HISTORY_EVENT, validateOrderHistory as validate, importOrderHistory } from '../composables/orderHistory.mjs';
export default {
  data() {
    let data = { orders: [], unmatchedFills: [], period: '' }, message = '';
    try { const saved = localStorage.getItem(KEY); if (saved) data = validate(JSON.parse(saved)); }
    catch { message = '本机数据读取失败，请重新导入文件。'; }
    return { orders: data.orders, unmatched: data.unmatchedFills, period: data.period, message, query: '', status: '' };
  },
  computed: {
    statuses() { return [...new Set(this.orders.map(o => o.Status))]; },
    fillCount() { return this.orders.reduce((sum, o) => sum + o.fills.length, this.unmatched.length); },
    filtered() { const q = this.query.trim().toLowerCase(); return this.orders.filter(o => (!this.status || o.Status === this.status) && (!q || [o.Symbol, o['Order ID'], o.Side, this.sideName(o.Side)].join(' ').toLowerCase().includes(q))).slice().sort((a,b) => b['Order Time'].localeCompare(a['Order Time'])); },
  },
  mounted() { window.addEventListener(ORDER_HISTORY_EVENT, this.receiveImport); },
  beforeUnmount() { window.removeEventListener(ORDER_HISTORY_EVENT, this.receiveImport); },
  methods: {
    amount(value) {
      if (value == null || String(value).trim() === '' || !Number.isFinite(Number(value))) return '—';
      return Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    receiveImport(event) {
      const data = event.detail;
      this.orders = data.orders; this.unmatched = data.unmatchedFills; this.period = data.period || ''; this.query = ''; this.status = '';
      this.message = `已导入 ${this.orders.length} 条委托和 ${this.fillCount} 条成交，已自动整理到「交易与复盘」，无需填写即可查看。`;
    },
    statusName(s) { return ({ COMPLETE: '已完全成交', CANCELED: '已撤销', CANCELLED: '已撤销', PARTIALLY_FILLED: '部分成交' })[s] || s; },
    sideName(s) { return ({ 'Open long': '开多', 'Close long': '平多', 'Open short': '开空', 'Close short': '平空', Buy: '买入', Sell: '卖出' })[s] || s; },
    async importFile(event) {
      const file = event.target.files?.[0]; if (!file) return;
      try {
        const data = validate(JSON.parse(await file.text()));
        importOrderHistory(data);
      } catch (error) { this.message = `导入失败：${error.message}。原有数据保留。`; }
      finally { event.target.value = ''; }
    },
  },
};
</script>
<style scoped>
.order-item { padding: 16px 0; border-bottom: 1px solid #ddd; }
summary { cursor: pointer; line-height: 1.8; }
.order-table { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; white-space: nowrap; font-size: 13px; }
th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
.order-raw { overflow-x: auto; }
</style>
