<template>
  <section
    id="history-view"
    class="view"
  >
    <div class="history-head">
      <h2>历史记录</h2>
      <div class="filters">
        <input
          id="search"
          class="search"
          placeholder="搜索标的或内容"
        ><select id="status-filter">
          <option value="all">
            全部状态
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
      累计亏损 = 你在操作流水中录入的负数盈亏绝对值之和。已实现净盈亏 =
      所有操作流水中录入的盈亏合计。数值不会自动从券商同步。
    </p>
  </section>
</template>
