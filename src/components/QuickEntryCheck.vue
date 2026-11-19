<template>
  <section class="panel quick-entry" aria-labelledby="quick-entry-title">
    <div class="section-head">
      <h2 id="quick-entry-title">开仓前五项检查</h2>
      <strong aria-live="polite">{{ selected.length }}/5</strong>
    </div>
    <div class="quick-entry-list">
      <label v-for="item in items" :key="item" class="check">
        <input v-model="selected" type="checkbox" :value="item" :disabled="paused">
        <span>{{ item }}</span>
      </label>
    </div>
    <p role="status">{{ message }}</p>
    <button v-if="paused" type="button" class="secondary" @click="restart">已出现新的预设信号，重新核对</button>
    <template v-else>
      <button type="button" class="secondary" @click="pause">怕错过反弹 / 想重复抄底，暂停这次入场</button>
      <button v-if="selected.length" type="button" class="quiet" @click="restart">检查下一笔</button>
    </template>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";

const items = [
  "事先定义的入场信号已经触发",
  "止损价已定，已按本次仓位算出止损时预计亏多少钱",
  "即使可能错过反弹，我也会按原计划入场",
  "这是独立的入场机会，同一信号下没有重复抄底",
  "计入本次交易后，全部持仓的合计风险仍在账户预算内",
];
const selected = ref([]);
const paused = ref(false);
const message = computed(() => {
  if (paused.value) return "本次入场已暂停。等新的预设信号触发，再重新核对五项。";
  if (selected.value.length === items.length) return "检查完成，可按原计划执行。";
  return "只勾选此刻能确认的项目。有一项拿不准，就先保留计划。";
});
function pause() {
  selected.value = [];
  paused.value = true;
}
function restart() {
  selected.value = [];
  paused.value = false;
}
</script>

<style scoped>
.quick-entry { padding: 20px; margin-bottom: 16px; }
.quick-entry-list { display: grid; gap: 5px; }
.quick-entry-list .check { min-height: 40px; align-items: center; }
.quick-entry p { margin: 12px 0; }
</style>
