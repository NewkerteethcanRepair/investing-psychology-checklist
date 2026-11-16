// Order PNL is counted once. Matched fills are drill-down data, not extra PNL/fees.
export function summarizeOrderHistory(data) {
  const currencies = new Map();
  let missing = 0;
  const bucket = currency => {
    const key = String(currency || '').trim().toUpperCase();
    if (!key) return null;
    if (!currencies.has(key)) currencies.set(key, { currency: key, pnl: 0, fees: 0, profit: 0, loss: 0 });
    return currencies.get(key);
  };
  const number = raw => raw != null && String(raw).trim() !== '' && Number.isFinite(Number(raw)) ? Number(raw) : null;
  const addFee = row => {
    const fee = number(row.Fee), group = bucket(row['Fee Unit']);
    if (fee === null || !group) { missing++; return; }
    group.fees += fee; // OKX expenses are negative; rebates are positive.
  };
  for (const order of data?.orders || []) {
    const pnl = number(order.PNL), group = bucket(order['PNL Unit'] || order['Price Unit']);
    if (pnl === null || !group) missing++;
    else {
      group.pnl += pnl;
      group.profit += Math.max(0, pnl);
      group.loss += Math.min(0, pnl);
    }
    addFee(order);
  }
  const unmatched = data?.unmatchedFills || [];
  const seen = new Set();
  for (const fill of unmatched) {
    const key = `${fill.Symbol}:${fill['Order ID']}:${fill['Trade ID']}`;
    if (seen.has(key)) continue;
    seen.add(key);
    addFee(fill);
  }
  return { currencies: [...currencies.values()].map(group => ({ ...group, net: group.pnl + group.fees })), missing, unmatched: unmatched.length };
}
