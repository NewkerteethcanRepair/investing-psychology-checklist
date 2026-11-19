export function mountQuickRecord(host, { getTrades, id, today, stamp, save }) {
  const checks = [
    '事先定义的入场信号已经触发',
    '止损价已定，也算过这笔止损预计亏多少钱',
    '即使可能错过反弹，我仍会按原计划行动',
    '这是独立的新信号，同一信号下没有重复抄底',
    '加上这笔，全部持仓风险仍在账户预算内',
  ];
  const reasons = {
    rules: ['预设信号已触发', 'rules'],
    fomo: ['怕错过反弹', 'fomo'],
    retry: ['刚止损，又想买回', 'impulse'],
    other: ['其他动机', 'other'],
  };
  host.innerHTML = `
    <h2>快速记录</h2>
    <label class="field"><span>标的</span><input name="quickAsset" placeholder="例如 BTC、黄金、SNDK" maxlength="80"></label>
    <div class="quick-options" data-recent aria-label="最近记录的标的"></div>
    <div class="quick-options" data-start>
      <button type="button" class="secondary" data-skip="fomo">怕错过反弹，先跳过</button>
      <button type="button" class="secondary" data-skip="retry">刚止损想买回，先跳过</button>
      <button type="button" class="secondary" data-mode="plan">有预设信号，核对入场</button>
      <button type="button" class="quiet" data-mode="after">已经进场，补记动机</button>
    </div>
    <div data-plan hidden>
      <h3>开仓前五项检查 <span data-count aria-live="polite">0/5</span></h3>
      <div class="quick-entry-list">${checks.map(text => `<label class="check"><input type="checkbox"><span>${text}</span></label>`).join('')}</div>
      <div class="quick-options"><button type="button" class="primary" data-confirm disabled>保存为待进场</button><button type="button" class="secondary" data-skip="rules">这次先跳过</button></div>
    </div>
    <div data-after hidden><h3>下单时主要是因为什么？</h3><div class="quick-options">${Object.entries(reasons).map(([key, [label]]) => `<button type="button" class="secondary" data-entered="${key}">${label}</button>`).join('')}</div></div>
    <button type="button" class="quiet" data-back hidden>返回</button>
    <p role="status" aria-live="polite"></p>
    <button type="button" class="secondary" data-next hidden>再记一笔新机会</button>`;
  const find = selector => host.querySelector(selector);
  const asset = find('[name=quickAsset]');
  const boxes = [...host.querySelectorAll('input[type=checkbox]')];
  const feedback = find('[role=status]');
  let mode = 'start';

  function recentAssets() {
    const recent = [...new Set(getTrades().filter(t => t.psychology?.recordType !== 'execution').map(t => t.asset).filter(Boolean))].slice(0, 3);
    find('[data-recent]').replaceChildren(...recent.map(symbol => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'quiet';
      button.dataset.symbol = symbol;
      button.textContent = symbol;
      return button;
    }));
  }
  function updateCount() {
    const n = boxes.filter(box => box.checked).length;
    find('[data-count]').textContent = n + '/5';
    find('[data-confirm]').disabled = n !== checks.length;
  }
  function show(next) {
    mode = next;
    for (const section of ['start', 'plan', 'after']) find('[data-' + section + ']').hidden = next !== section;
    find('[data-back]').hidden = !['plan', 'after'].includes(next);
    find('[data-next]').hidden = next !== 'saved';
    boxes.forEach(box => { box.checked = false; });
    updateCount();
    feedback.textContent = '';
  }
  function chooseAsset() {
    if (asset.value.trim()) return true;
    feedback.textContent = '先填一个标的，或点选最近记录过的标的。';
    asset.focus();
    return false;
  }
  function record(status, reason) {
    if (mode === 'saved' || !chooseAsset()) return;
    if (status === 'planned' && (mode !== 'plan' || !boxes.every(box => box.checked))) return;
    const at = stamp();
    const [label, basis] = reasons[reason];
    const decision = { skipped: '跳过', planned: '待进场', open: '已进场（补记）' }[status];
    const checked = mode === 'plan' ? boxes.map(box => box.checked) : null;
    const note = label + ' · ' + decision + (checked ? ' · 开仓检查 ' + checked.filter(Boolean).length + '/5' : '');
    const trade = {
      id: id(), date: today(), asset: asset.value.trim(), createdAt: at, updatedAt: at, status, maxRisk: null,
      psychology: {
        stage: status === 'open' ? 'after' : 'before', recordedAt: at, decisionBasis: basis,
        stateNote: note, opportunitySkipped: status === 'skipped',
        quickRecord: { reason, decision: status, checks: checked },
      },
      actions: status === 'open' ? [{ id: id(), at, type: 'entry', note, pnl: null }] : [],
    };
    if (!save(trade)) { feedback.textContent = '保存失败，选择已保留，可重试。'; return; }
    show('saved');
    recentAssets();
    feedback.textContent = trade.asset + ' · ' + note + '，已记录。' + (status === 'skipped' ? '等新的预设信号出现再评估。' : '');
  }
  asset.addEventListener('input', () => show('start'));
  host.addEventListener('change', updateCount);
  host.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    const data = button.dataset;
    if ('symbol' in data) { asset.value = data.symbol; show('start'); }
    else if ('next' in data || 'back' in data) show('start');
    else if (data.mode && chooseAsset()) show(data.mode);
    else if (data.skip) record('skipped', data.skip);
    else if (data.entered) record('open', data.entered);
    else if ('confirm' in data) record('planned', 'rules');
  });
  recentAssets();
  return recentAssets;
}
