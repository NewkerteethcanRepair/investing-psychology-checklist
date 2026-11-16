export const ORDER_HISTORY_KEY = 'okx-order-history-v1';
export const ORDER_HISTORY_EVENT = 'okx-order-history-imported';
export function validateOrderHistory(data) {
  if (data?.schema !== ORDER_HISTORY_KEY || !Array.isArray(data.orders) || !Array.isArray(data.unmatchedFills)) throw new Error('请选择整理后的 OKX 委托成交 JSON');
  const ids = new Set();
  for (const order of data.orders) {
    if (!order || typeof order['Order ID'] !== 'string' || ids.has(order['Order ID']) || !order.Symbol || typeof order['Order Time'] !== 'string' || !Array.isArray(order.fills)) throw new Error('委托格式错误或订单号重复');
    ids.add(order['Order ID']);
  }
  return data;
}
export function importOrderHistory(data) {
  validateOrderHistory(data);
  localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(ORDER_HISTORY_EVENT, { detail: data }));
}
