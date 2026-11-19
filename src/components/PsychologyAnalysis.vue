<template>
  <section
    id="analysis-view"
    class="view"
  >
    <div class="panel analysis-panel">
      <div class="section-head">
        <div><h2>我的心理，最后带来了什么？</h2><p>把每笔交易的当时状态，与最终结果放在一起看。</p></div>
      </div>
      <div class="analysis-filters">
        <label>交易日期从<el-date-picker
          id="analysis-from"
          v-model="journalDates.from"
          class="journal-date-picker"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          placeholder="开始日期"
          :editable="false"
        /></label>
        <label>到<el-date-picker
          id="analysis-to"
          v-model="journalDates.to"
          class="journal-date-picker"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          placeholder="结束日期"
          :editable="false"
        /></label>
        <label>记录时机<select id="analysis-stage"><option value="before">下单前记录</option><option value="all">全部时机（含补记）</option><option value="after">下单后补记</option><option value="unknown">时机未记录 / 导入</option></select></label>
        <label>盈亏币种<select id="analysis-currency"><option value="all">全部 · 分币种显示</option></select></label>
        <button
          id="analysis-reset"
          class="secondary"
          type="button"
        >
          重置筛选
        </button>
      </div>
      <p
        id="analysis-scope"
        class="psych-intro"
        role="status"
      />
      <h3>感觉介入以后，比固定规则多了什么？</h3>
      <p
        id="opportunity-scope"
        class="psych-intro"
        role="status"
      />
      <div
        id="opportunity-table"
        class="table-scroll"
      />
      <p class="notice">
        A 是按事前方法补算的模拟结果，C 是实际决定；跳过机会的 C 收益为 0。合计和每机会平均仅使用同一批完整配对样本，未完成的机会不计 0。ΔR = (C − A) ÷ 事前共用参考风险。模拟不等同实盘，也不能直接解释为个人能力或 alpha。请检查样本覆盖和最大单次差异，避免少数交易主导结论。B 因子过滤对照暂不启用，先积累 A / C。
      </p>
      <h3>已执行交易的心理与结果</h3>
      <div
        id="analysis-metrics"
        class="analysis-metrics"
      />
      <div class="analysis-heading">
        <h3>按什么比较？</h3><label class="field"><select
          id="analysis-dimension"
          aria-label="分析维度"
        ><option value="basis">主要下单动机</option><option value="emotion">当时的情绪</option><option value="urge">冲动强度</option><option value="discipline">最终规则执行</option><option value="basis-discipline">动机 × 规则执行</option></select></label>
      </div>
      <div
        id="analysis-table"
        class="table-scroll"
      />
      <h3 class="analysis-heading">
        守规则和盈亏，分开看
      </h3>
      <p class="psych-intro">
        按规则亏损和违规赚钱都如实计入。最终执行情况以结束时的复盘为准。
      </p>
      <div
        id="discipline-table"
        class="table-scroll"
      />
      <div class="notice">
        统计口径：一笔交易只计一次；仅“已结束且已填写盈亏”的交易参与结果分析，0 计为持平。未执行计划、已取消记录不计入样本。交易占比的分母为当前筛选内所有已执行交易；亏损占比按每笔最终净亏损的绝对值计算。不同币种分别统计。这里显示的是相关性，不能直接证明心理导致盈亏；小样本、仓位和行情差异都会影响结果。
      </div>
    </div>
  </section>
</template>

<script setup>
import { journalDates } from "../composables/journalDates";
</script>
