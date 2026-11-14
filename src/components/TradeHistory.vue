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
      状态定义：计划中 = 尚未执行；持仓中 = 仍有仓位；已结束 = 已全部退出或止损；已取消 = 不再执行计划。每条记录的“当前状态”都可以手动修改；追加进场、加仓、退出或取消流水时，也会按操作更新状态。
    </p>
    <p class="privacy">
      累计亏损和已实现净盈亏只统计已实现盈亏；持仓浮动盈亏请用“浮动盈亏更新”单独记录，最新值会显示在持仓卡片上。补仓可记录本次数量 / 金额和成交价。数值不会自动从券商同步。
    </p>
  </section>
</template>
