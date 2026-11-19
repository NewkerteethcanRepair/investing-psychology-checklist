<template>
  <main class="shell">
    <div class="eyebrow">
      投资心理学 · 个人交易日志
    </div>
    <header>
      <div class="hero">
        <h1>记录每次决定，<br>看见长期模式。</h1>
        <p>
          记录当时的动机与心理，核对有没有按规则执行，再用多次交易的结果看清自己的习惯。
        </p>
      </div>
      <div class="top-actions backup-row">
        <button
          id="export-btn"
          class="secondary"
          type="button"
        >
          导出备份
        </button>
        <button
          id="import-btn"
          class="secondary"
          type="button"
        >
          导入数据 / 备份
        </button>
        <input
          id="import-file"
          class="file-input"
          type="file"
          accept="application/json,.json"
        >
      </div>
    </header>

    <nav
      class="tabs"
      aria-label="交易日志导航"
    >
      <button
        class="tab active"
        data-tab="new-view"
        type="button"
      >
        记录当下
      </button>
      <button
        class="tab"
        data-tab="history-view"
        type="button"
      >
        交易与复盘 <span id="history-count">0</span>
      </button>
      <button
        class="tab"
        data-tab="analysis-view"
        type="button"
      >
        心理与结果分析
      </button>
      <button
        class="tab"
        data-tab="orders-view"
        type="button"
      >
        原始委托明细
      </button>
    </nav>

    <section
      id="new-view"
      class="view active"
    >
      <section
        id="quick-record"
        class="panel quick-entry"
        aria-label="快速记录"
      />
      <details class="quick-detail">
        <summary>详细记录 · 规则对照与仓位计划</summary>
        <div id="trade-form-home">
          <TradeEntryForm />
        </div>
      </details>
      <div class="notice">
        未登录时记录保存在当前浏览器；登录后会同步到 CloudBase
        PostgreSQL，同一账号可在不同设备查看。注册账号需要邮箱验证码。页面代码公开，但交易记录保存在数据库，不会写入
        GitHub。
      </div>
    </section>

    <TradeHistory />
    <PsychologyAnalysis />
    <OrderHistory />
    <CloudSyncPanel />
    <OrderSummary />
    <TradeSummary />
    <div
      id="edit-modal"
      class="edit-modal hidden"
      aria-hidden="true"
    >
      <section
        class="edit-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
      >
        <header class="edit-modal-head">
          <h2 id="edit-modal-title">
            编辑当时状态
          </h2>
          <button
            id="close-edit-modal"
            class="quiet"
            type="button"
            aria-label="放弃修改并关闭编辑弹框"
          >
            关闭弹框
          </button>
        </header>
        <div id="edit-modal-content" />
      </section>
    </div>
    <footer class="privacy">
      这是个人记录工具，不会判断市场方向，也不构成投资建议。定期导出 JSON
      备份，避免浏览器数据被清理后丢失。
    </footer>
  </main>
</template>

<script>
import TradeEntryForm from "./components/TradeEntryForm.vue";
import CloudSyncPanel from "./components/CloudSyncPanel.vue";
import TradeSummary from "./components/TradeSummary.vue";
import TradeHistory from "./components/TradeHistory.vue";
import useJournal from "./composables/useJournal.js";
import PsychologyAnalysis from "./components/PsychologyAnalysis.vue";
import OrderHistory from "./components/OrderHistory.vue";
import OrderSummary from "./components/OrderSummary.vue";

export default {
  name: "App",
  components: { TradeEntryForm, CloudSyncPanel, TradeSummary, TradeHistory, PsychologyAnalysis, OrderHistory, OrderSummary },
  setup() {
    useJournal();
  },
};
</script>
