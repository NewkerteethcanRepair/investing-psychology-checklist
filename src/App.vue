<template>
  <main class="shell">
    <div class="eyebrow">投资心理学 · 个人交易日志</div>
    <header>
      <div class="hero">
        <h1>记录每次决定，<br />看见长期模式。</h1>
        <p>
          每笔交易单独建档，后续进场、减仓、调整止损、退出和复盘都追加到同一条记录。汇总只依据你录入的已实现盈亏。
        </p>
      </div>
      <div class="top-actions backup-row">
        <button id="export-btn" class="secondary" type="button">
          导出备份
        </button>
        <button id="import-btn" class="secondary" type="button">
          导入备份
        </button>
        <input
          id="import-file"
          class="file-input"
          type="file"
          accept="application/json,.json"
        />
      </div>
    </header>

    <CloudSyncPanel />
    <TradeSummary />

    <nav class="tabs" aria-label="交易日志导航">
      <button class="tab active" data-tab="new-view" type="button">
        新建交易计划
      </button>
      <button class="tab" data-tab="history-view" type="button">
        历史与操作流水 <span id="history-count">0</span>
      </button>
    </nav>

    <section id="new-view" class="view active">
      <div id="trade-form-home"><TradeEntryForm /></div>
      <div class="notice">
        未登录时记录保存在当前浏览器；登录后会同步到 CloudBase
        PostgreSQL，同一账号可在不同设备查看。注册账号需要邮箱验证码。页面代码公开，但交易记录保存在数据库，不会写入
        GitHub。
      </div>
    </section>

    <TradeHistory />
    <div id="edit-modal" class="edit-modal hidden" aria-hidden="true">
      <section class="edit-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
        <header class="edit-modal-head">
          <h2 id="edit-modal-title">编辑交易计划</h2>
          <button id="close-edit-modal" class="quiet" type="button" aria-label="放弃修改并关闭编辑弹框">关闭弹框</button>
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

export default {
  name: "App",
  components: { TradeEntryForm, CloudSyncPanel, TradeSummary, TradeHistory },
  setup() {
    useJournal();
  },
};
</script>
