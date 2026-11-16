// IDs remain stable across reimports and are compatible with cloud UUID columns.
export function executionId(text) {
  const parts = [1, 2, 3, 4].map(seed => {
    let hash = 2166136261 ^ seed;
    for (const char of text) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
    return (hash >>> 0).toString(16).padStart(8, '0');
  }).join('');
  return `${parts.slice(0,8)}-${parts.slice(8,12)}-4${parts.slice(13,16)}-8${parts.slice(17,20)}-${parts.slice(20)}`;
}
const numeric = value => value != null && String(value).trim() !== '' && Number.isFinite(Number(value)) ? Number(value) : null;
export function buildOrderExecutions(data) {
  const sessions = [], active = new Map();
  const rows = [...(data?.orders || [])].sort((a,b) => a['Order Time'].localeCompare(b['Order Time']) || a['Order ID'].localeCompare(b['Order ID']));
  for (const order of rows) {
    const quantity = numeric(order['Filled Amount']);
    if (!(quantity > 0)) continue;
    const match = /^(Open|Close) (long|short)$/i.exec(order.Side || '');
    // Unknown sides and spot orders need separate accounting; retain as incomplete.
    const opening = match?.[1].toLowerCase() === 'open';
    const direction = match?.[2].toLowerCase() || 'unknown';
    const key = `${order.Symbol}:${direction}:${order['Amount Unit']}`;
    let session = active.get(key);
    if (!session || (opening && session.startMissing)) {
      session = { orders: [], balance: 0, startMissing: !opening, endKnown: false, direction, symbol: order.Symbol, unit: order['Amount Unit'], issue: !match };
      sessions.push(session); active.set(key,session);
    }
    session.orders.push(order);
    if (!session.startMissing) {
      session.balance += opening ? quantity : -quantity;
      if (session.balance < -1e-8) { session.issue = true; session.balance = 0; }
      if (Math.abs(session.balance) < 1e-8) { session.balance = 0; session.endKnown = true; active.delete(key); }
    }
  }
  return sessions.map((session, sessionIndex) => {
    const first = session.orders[0], last = session.orders.at(-1);
    const currency = first['PNL Unit'] || first['Price Unit'];
    let gross = 0, fees = 0, moneyKnown = true;
    for (const order of session.orders) {
      const pnl = numeric(order.PNL), fee = numeric(order.Fee);
      if (pnl === null || fee === null || (order['PNL Unit'] || order['Price Unit']) !== currency || order['Fee Unit'] !== currency) moneyKnown = false;
      gross += pnl ?? 0; fees += fee ?? 0;
    }
    const complete = !session.startMissing && session.endKnown && !session.issue && moneyKnown;
    const actions = session.orders.map((order,index) => ({
      id: executionId(`order:${order['Order ID']}`), at: order['Order Time'],
      type: /^Open/i.test(order.Side) ? (index ? 'add' : 'entry') : (complete && index === session.orders.length-1 ? 'exit' : 'reduce'),
      note: `OKX ${order.Side} · 订单 ${order['Order ID']}`,
      size: `${order['Filled Amount']} ${order['Amount Unit']}`, price: order['Avg. Filled Price'],
      pnl: null,
    }));
    return {
      id: executionId(`session:${first['Order ID']}`), asset: session.symbol, direction: session.direction === 'long' ? '做多' : session.direction === 'short' ? '做空' : '待核对方向',
      date: first['Order Time'].slice(0,10), createdAt: first['Order Time'], updatedAt: last['Order Time'],
      status: complete ? 'closed' : 'open', size: `${session.balance} ${session.unit}`, actions, review: '',
      psychology: { recordType: 'execution', stage: 'after',
        orderExecution: { period: data.period || "", unmatchedFills: sessionIndex === 0 ? (data.unmatchedFills || []) : [], orders: session.orders, actions, gross, fees, currency, moneyKnown, complete, startMissing: session.startMissing, issue: session.issue, balance: session.balance, lastAt: last['Order Time'] },
        ...(complete ? { result: { netPnl: gross + fees, currency, discipline: 'unknown', source: 'okx-orders' } } : {}),
      },
    };
  });
}
export function mergeOrderExecutions(existing, incoming) {
  const previous = new Map(existing.map(t => [t.id,t]));
  const replacements = new Map(incoming.map(t => {
    const old = previous.get(t.id);
    if (!old) return [t.id,t];
    return [t.id, { ...t, review: old.review || '', psychology: { ...t.psychology,
      decisionBasis: old.psychology?.decisionBasis,
      ...(t.psychology.result ? { result: { ...t.psychology.result, discipline: old.psychology?.quickDiscipline || old.psychology?.result?.discipline || 'unknown' } } : {}),
      quickDiscipline: old.psychology?.quickDiscipline,
    } }];
  }));
  return [...existing.filter(t => !replacements.has(t.id)), ...replacements.values()];
}
