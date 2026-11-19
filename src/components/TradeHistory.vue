<template>
  <section
    id="history-view"
    class="view"
  >
    <p class="privacy">
      按导出范围内开平数量自动整理交易过程与盈亏，直接展开查看。规则核对和一句话备注均为选填；缺少开仓或平仓的交易组单独标明。
    </p>
    <div class="history-head">
      <h2>交易与复盘</h2>
      <button
        id="clear-journal"
        class="danger"
        type="button"
      >
        清空浏览器和云端复盘记录
      </button>
      <div class="filters">
        <select
          id="record-type-filter"
          aria-label="记录类型"
        >
          <option value="all">
            全部记录
          </option>
          <option value="decision">
            心理记录
          </option>
          <option value="execution">
            导入执行记录
          </option>
        </select>
        <input
          id="search"
          class="search"
          placeholder="搜索标的或内容"
        ><select id="status-filter">
          <option value="all">
            全部状态
          </option>
          <option value="skipped">
            已跳过机会
          </option>
          <option value="planned">
            计划中
          </option>
          <option value="open">
            持仓中
          </option>
          <option value="closed">
            已结束
          </option>
          <option value="cancelled">
            已取消
          </option>
        </select><select
          id="review-filter"
          aria-label="复盘状态"
        >
          <option value="all">
            全部复盘状态
          </option><option value="pending">
            已结束 · 待补结果或复盘
          </option>
        </select><select id="sort-filter">
          <option value="newest">
            最新优先
          </option>
          <option value="oldest">
            最早优先
          </option>
        </select>
      </div>
    </div>
    <div
      id="trade-list"
      class="trade-list"
    />
    <p class="privacy">
      状态定义：计划中 = 尚未执行；持仓中 = 仍有仓位；已结束 = 已全部退出或止损；已取消 = 不再执行计划。每条记录的“当前状态”都可以手动修改；追加进场、加仓、退出或取消流水时，也会按操作更新状态。
    </p>
    <p class="privacy">
      每笔交易的“结束 / 复盘”可填写含费用的整笔净盈亏，以及实际执行情况。最终净额会替代流水合计，不会重复相加；当时的心理记录会保留。浮动盈亏不参与最终结果分析。
    </p>
  </section>
</template>
