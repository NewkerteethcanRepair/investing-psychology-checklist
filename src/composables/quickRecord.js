const entryChecks = [
  '事先定义的入场信号已触发，入场理由比“跌多了”更具体',
  '已明确止损价，并按本次仓位算出触发止损时预计亏多少钱',
  '我没有因为担心错过反弹而临时开仓',
  '本次入场没有在同一信号下重复抄底',
  '计入这笔后，所有持仓的合计风险仍在账户预算内',
];
const motives = {
  rules: ['预设信号', 'rules'], fomo: ['怕错过反弹', 'fomo'],
  retry: ['止损后想买回', 'impulse'], revenge: ['想追回亏损', 'revenge'], other: ['其他', 'other'],
};
const decisions = { planned: '准备下单', open: '已下单（补记）', skipped: '跳过' };

function savedReasons(record) {
  return record?.reasons ?? (record?.reason ? [record.reason] : []);
}
export function quickMotiveLabel(record) {
  return savedReasons(record).map(key => motives[key]?.[0]).filter(Boolean).join('、');
}

export function mountQuickRecord(host, { getTrades, id, today, stamp, save }) {
  const fields = `
    <label class="field"><span>标的</span><input name="asset" required maxlength="80" placeholder="例如 SNDK"></label>
    <div data-recent class="quick-options"></div>
    <fieldset class="quick-choice"><legend>当时的决定</legend><div class="quick-options">${Object.entries(decisions).map(([key, label]) => `<label><input type="radio" name="decision" value="${key}" required> ${label}</label>`).join('')}</div></fieldset>
    <fieldset class="quick-choice"><legend>动机（选填，可多选）</legend><div class="quick-options">${Object.entries(motives).map(([key, [label]]) => `<label><input type="checkbox" name="reason" value="${key}"> ${label}</label>`).join('')}</div></fieldset>
    <details data-checks><summary>开仓前五项检查 <span data-count></span></summary><p>先停一下，只勾选此刻能确认的项目。</p><div class="quick-entry-list">${entryChecks.map(text => `<label class="check"><input type="checkbox" name="check"><span>${text}</span></label>`).join('')}</div><p data-ready role="status"></p></details>
    <details data-terms><summary>入场价与仓位（选填）</summary>
      <label class="field"><span>入场价</span><input name="entry" maxlength="120"></label>
      <label class="field"><span>仓位（含单位）</span><input name="size" maxlength="120" placeholder="例如 800 USD 或 2 股"></label></details>`;
  host.innerHTML = `<h2>快速记录</h2><form data-new>${fields}<button type="submit" class="primary">保存记录</button></form>
    <p data-feedback role="status"></p><button type="button" class="primary" data-enter hidden></button> <button type="button" class="quiet" data-last hidden>修改刚才的记录</button>
    <dialog class="quick-dialog"><h2>修改下单记录</h2><form data-edit>${fields}<div class="quick-options"><button class="primary" type="submit">保存修改</button><button type="button" class="secondary" data-cancel>取消</button></div><p data-feedback role="status"></p></form></dialog>`;
  // The history tab hides the new-entry section. The dialog belongs to both views.
  const dialog = host.querySelector('dialog');
  document.body.append(dialog);
  const create = host.querySelector('form'), edit = dialog.querySelector('form');
  const feedback = host.querySelector('[data-feedback]'), lastButton = host.querySelector('[data-last]');
  const enterButton = host.querySelector('[data-enter]');
  const toast = document.createElement('div');
  toast.className = 'journal-save-toast';
  toast.setAttribute('role', 'status');
  document.body.append(toast);
  let toastTimer;
  function notifySaved(message) {
    clearTimeout(toastTimer);
    toast.textContent = '✓ ' + message;
    toastTimer = setTimeout(() => { toast.textContent = ''; }, 3200);
  }
  let lastId = null, editId = null;

  function refreshAssets() {
    const trades = getTrades();
    const last = trades.find(t => t.id === lastId);
    lastButton.hidden = !last;
    enterButton.hidden = last?.status !== 'planned';
    if (last) enterButton.textContent = last.asset + ' 已成交，登记进场';
    const assets = [...new Set(trades.filter(t => t.psychology?.recordType !== 'execution').map(t => t.asset).filter(Boolean))].slice(0, 3);
    create.querySelector('[data-recent]').replaceChildren(...assets.map(symbol => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'quiet';
      button.textContent = symbol;
      button.onclick = () => { if (create.elements.asset.value !== symbol) clearChecks(create); create.elements.asset.value = symbol; };
      return button;
    }));
  }
  function clearChecks(form) {
    form.querySelectorAll('[name=check]').forEach(box => { box.checked = false; });
    update(form);
  }
  function update(form) {
    const planned = form.elements.decision.value === 'planned';
    const boxes = [...form.querySelectorAll('[name=check]')];
    const group = form.querySelector('[data-checks]');
    group.hidden = form === create && form.elements.decision.value === 'skipped';
    const count = boxes.filter(b => b.checked).length;
    form.querySelector('[data-count]').textContent = count + '/5';
    form.querySelector('[data-ready]').textContent = planned && count === 5 ? '5/5 已完成。再看一眼入场信号，仍然成立就可以确认。' : '';
    if (form === create) {
      const button = form.querySelector('[type=submit]');
      button.textContent = planned ? '再次确认信号，保存待进场计划' : '保存记录';
      button.disabled = planned && count < 5;
    }
    boxes.forEach(b => { b.required = planned && form === create; });
  }
  function openEdit(t) {
    if (!t?.psychology?.quickRecord) return;
    editId = t.id;
    edit.reset();
    const q = t.psychology.quickRecord;
    edit.elements.asset.value = t.asset;
    edit.elements.entry.value = t.entry || '';
    edit.elements.size.value = t.size || '';
    edit.querySelector('[data-terms]').open = !!(t.entry || t.size);
    edit.elements.decision.value = q.decision;
    const selected = savedReasons(q);
    edit.querySelectorAll('[name=reason]').forEach(box => { box.checked = selected.includes(box.value); });
    edit.querySelectorAll('[name=check]').forEach((b, i) => { b.checked = !!q.checks?.[i]; });
    edit.querySelector('[data-checks]').open = false;
    edit.querySelector('[data-feedback]').textContent = '';
    update(edit);
    dialog.showModal();
  }
  for (const form of [create, edit]) {
    form.addEventListener('invalid', event => {
      if (event.target.name === 'check') form.querySelector('[data-checks]').open = true;
    }, true);
    form.addEventListener('change', e => {
      update(form);
      if (e.target.name === 'decision') form.querySelector('[data-checks]').open = form.elements.decision.value === 'planned';
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const editing = form === edit;
      const old = editing ? getTrades().find(t => t.id === editId) : null;
      const statusText = editing ? edit.querySelector('[data-feedback]') : feedback;
      if (editing && !old) { statusText.textContent = '这条记录已不存在。'; return; }
      const asset = form.elements.asset.value.trim();
      if (!asset) { form.elements.asset.focus(); statusText.textContent = '请填写标的。'; return; }
      const decision = form.elements.decision.value;
      const reasons = [...form.querySelectorAll('[name=reason]:checked')].map(box => box.value);
      const boxes = [...form.querySelectorAll('[name=check]')].map(b => b.checked);
      const oldQuick = old?.psychology.quickRecord;
      const checks = decision === 'planned' || (decision === 'open' && boxes.some(Boolean)) || (editing && oldQuick.checks) ? boxes : null;
      const note = [decisions[decision], quickMotiveLabel({reasons}), checks && '开仓检查 ' + checks.filter(Boolean).length + '/5'].filter(Boolean).join(' · ');
      const at = stamp();
      const trade = old ? structuredClone(old) : {id: id(), createdAt: at, date: today(), maxRisk: null, actions: []};
      const recordedAt = old?.psychology.recordedAt || trade.createdAt;
      const actions = trade.actions || [];
      // Only the untouched, generated entry belongs to this initial decision.
      const initial = oldQuick?.decision === 'open' && actions.find(a => a.type === 'entry' && a.pnl == null && !a.size && !a.price && a.unrealizedPnl == null && Date.parse(a.at) === Date.parse(recordedAt) && a.note === old.psychology.stateNote);
      const following = actions.filter(a => a !== initial);
      const followStatus = old && (old.status !== oldQuick.decision || following.length > 0 || !!old.psychology.result);
      const status = followStatus && !(decision === 'open' && ['planned', 'skipped'].includes(old.status)) ? old.status : decision;
      const delta = {};
      if (initial && decision !== 'open') { trade.actions = following; delta.removed = initial.id; }
      else if (initial && initial.note !== note) { initial.note = note; delta.changed = initial; }
      else if (decision === 'open' && oldQuick?.decision !== 'open' && !following.some(a => a.type === 'entry')) {
        delta.added = {id: id(), at: recordedAt, type: 'entry', note, pnl: null};
        trade.actions = [delta.added, ...following];
      }
      Object.assign(trade, {asset, entry: form.elements.entry.value.trim(), size: form.elements.size.value.trim(), status, updatedAt: at});
      trade.psychology = {...trade.psychology, recordedAt, stage: decision === 'open' ? 'after' : 'before',
        decisionBasis: reasons.length > 1 ? 'mixed' : motives[reasons[0]]?.[1] || 'unknown', opportunitySkipped: status === 'skipped', stateNote: note,
        quickRecord: {reasons, decision, checks}};
      if (!save(trade, old, delta)) { statusText.textContent = '保存失败，请重试。'; return; }
      if (editing) dialog.close();
      else { create.reset(); create.elements.asset.value = asset; create.querySelector('[data-terms]').open = false; create.querySelector('[data-checks]').open = true; update(create); }
      lastId = trade.id;
      refreshAssets();
      feedback.textContent = asset + ' · ' + note + (editing ? '，已修改。' : '，已保存。');
      notifySaved((editing ? '修改已保存' : '保存成功') + ' · ' + asset);
    });
  }
  create.elements.asset.addEventListener('input', () => clearChecks(create));
  lastButton.onclick = () => openEdit(getTrades().find(t => t.id === lastId));
  dialog.querySelector('[data-cancel]').onclick = () => dialog.close();
  function confirmEntry(t) {
    if (!t || !['planned', 'skipped'].includes(t.status)) return false;
    const action = { id: id(), at: stamp(), type: 'entry', note: '已确认实际进场；当时心理记录保留。', pnl: null };
    const next = structuredClone(t);
    if (next.psychology?.result) next.psychology.result.stale = true;
    next.actions = [...(next.actions || []), action];
    next.psychology = {...next.psychology, entryPreviousStatus: t.status, opportunitySkipped: false};
    next.status = 'open';
    next.updatedAt = action.at;
    if (!save(next, t, {added: action})) return false;
    notifySaved('进场已记录 · ' + t.asset);
    return true;
  }
  enterButton.onclick = () => {
    const last = getTrades().find(t => t.id === lastId);
    if (last?.status === 'planned' && confirmEntry(last)) feedback.textContent = last.asset + ' · 已登记进场。';
  };
  create.querySelector('[name=decision][value=planned]').defaultChecked = true;
  create.querySelector('[data-checks]').open = true;
  update(create);
  refreshAssets();
  return {refreshAssets, openEdit, confirmEntry, notifySaved};
}
