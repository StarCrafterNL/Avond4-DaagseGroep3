/* Avond4daagse Penningmeester - lokale schooldemo, geen server of echte betalingen */
(() => {
  'use strict';
  const STORAGE_KEY = 'avond4daagse_financien_demo_v1';
  const DB_NAME = 'avond4daagse_facturen_demo';
  const CATEGORIES = {
    inkomst: ['Inschrijvingen', 'Sponsoring', 'Donaties', 'Overig'],
    uitgave: ['Vergunningen', 'Materiaal', 'Promotie', 'Overig']
  };
  const $ = id => document.getElementById(id);
  const euro = n => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n);
  const escapeText = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const demo = [
    ['2027-06-10','Inschrijfgeld deelnemers','Inschrijvingen','inkomst',6000],
    ['2027-06-09','Bijdrage sponsoren','Sponsoring','inkomst',4000],
    ['2027-06-08','Donaties','Donaties','inkomst',2450],
    ['2027-06-08','Vergunningen','Vergunningen','uitgave',1700],
    ['2027-06-07','Start- en finishmateriaal','Materiaal','uitgave',1250],
    ['2027-06-06','Promotie en flyers','Promotie','uitgave',850],
    ['2027-06-05','Overige kosten','Overig','uitgave',500],
    ['2026-06-10','Inschrijfgeld','Inschrijvingen','inkomst',6800],
    ['2026-06-09','Sponsoren','Sponsoring','inkomst',3000],
    ['2026-06-08','Vergunningen','Vergunningen','uitgave',1800],
    ['2026-06-07','Materiaal','Materiaal','uitgave',1400],
    ['2026-06-06','Promotie','Promotie','uitgave',900],
    ['2026-06-05','Overige kosten','Overig','uitgave',500],
    ['2025-06-10','Inschrijvingen','Inschrijvingen','inkomst',6200],
    ['2025-06-09','Sponsoring','Sponsoring','inkomst',2000],
    ['2025-06-08','Vergunningen','Vergunningen','uitgave',1500],
    ['2025-06-07','Materiaal','Materiaal','uitgave',1200],
    ['2025-06-06','Promotie','Promotie','uitgave',600],
    ['2025-06-05','Overig','Overig','uitgave',300],
    ['2024-06-10','Inschrijvingen','Inschrijvingen','inkomst',5950],
    ['2024-06-09','Sponsoring','Sponsoring','inkomst',2000],
    ['2024-06-08','Vergunningen','Vergunningen','uitgave',1600],
    ['2024-06-07','Materiaal','Materiaal','uitgave',1400],
    ['2024-06-06','Promotie','Promotie','uitgave',600],
    ['2024-06-05','Overig','Overig','uitgave',300]
  ].map((t, i) => ({ id: `demo-${i}`, date: t[0], description: t[1], category: t[2], type: t[3], amount: t[4] }));

  let transactions;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    transactions = Array.isArray(stored) ? stored : demo;
  } catch { transactions = demo; }
  let selectedYear = '2027';
  let toastTimer;
  const save = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)); }
    catch { toast('Opslaan is niet mogelijk in deze browser.'); }
  };
  const toast = message => {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('visible'), 3200);
  };
  const byYear = () => transactions.filter(t => t.date.startsWith(selectedYear));
  const total = (items, type) => items.filter(t => t.type === type).reduce((s,t) => s + Number(t.amount), 0);
  const dateNL = date => new Date(`${date}T12:00:00`).toLocaleDateString('nl-NL');

  function updateYearOptions() {
    const years = [...new Set([...transactions.map(t => t.date.slice(0,4)), '2027', '2026', '2025', '2024'])].sort((a,b) => b.localeCompare(a));
    $('yearSelect').innerHTML = years.map(y => `<option value="${y}">Avond4daagse ${y}</option>`).join('');
    $('yearSelect').value = selectedYear;
  }

  function render() {
    const list = byYear();
    const income = total(list, 'inkomst');
    const expense = total(list, 'uitgave');
    $('balanceAmount').textContent = euro(income - expense);
    $('incomeTotal').textContent = euro(income);
    $('expenseTotal').textContent = euro(expense);
    document.querySelectorAll('.selected-year').forEach(el => el.textContent = selectedYear);

    const incomes = Object.entries(list.filter(t => t.type === 'inkomst').reduce((a,t) => {
      a[t.category] = (a[t.category] || 0) + Number(t.amount); return a;
    }, {})).sort((a,b) => b[1]-a[1]);
    $('incomeList').innerHTML = incomes.length ? incomes.map(([name, amount]) =>
      `<div class="summary-row"><span>${escapeText(name)}</span><strong>${euro(amount)}</strong></div>`).join('') : '<p class="empty-state">Nog geen inkomsten voor dit jaar.</p>';

    const expenses = Object.entries(list.filter(t => t.type === 'uitgave').reduce((a,t) => {
      a[t.category] = (a[t.category] || 0) + Number(t.amount); return a;
    }, {})).sort((a,b) => b[1]-a[1]);
    const max = Math.max(...expenses.map(([,v]) => v), 1);
    $('expenseList').innerHTML = expenses.length ? expenses.map(([name, amount]) =>
      `<div class="expense-row"><span>${escapeText(name)}</span><div class="expense-track" role="img" aria-label="${escapeText(name)}: ${euro(amount)}"><div class="expense-fill" style="width:${(amount/max*100).toFixed(2)}%"></div></div><strong>${euro(amount)}</strong></div>`).join('') : '<p class="empty-state">Nog geen uitgaven voor dit jaar.</p>';
    renderTransactions();
    renderInvoices();
  }

  function renderTransactions() {
    const q = $('searchInput').value.trim().toLocaleLowerCase('nl-NL');
    const filter = $('typeFilter').value;
    const list = byYear().filter(t => (filter === 'all' || t.type === filter) &&
      [t.description, t.category, t.date].some(v => String(v).toLocaleLowerCase('nl-NL').includes(q)))
      .sort((a,b) => b.date.localeCompare(a.date));
    $('transactionsBody').innerHTML = list.map(t => `
      <tr><td>${dateNL(t.date)}</td><td>${escapeText(t.description)}</td><td>${escapeText(t.category)}</td>
      <td><span class="tag ${t.type === 'uitgave' ? 'out' : ''}">${t.type === 'inkomst' ? 'Inkomst' : 'Uitgave'}</span></td>
      <td class="right ${t.type === 'inkomst' ? 'amount-in' : 'amount-out'}">${t.type === 'inkomst' ? '+' : '−'} ${euro(t.amount)}</td>
      <td><button type="button" class="text-btn" data-action="edit" data-id="${escapeText(t.id)}">Wijzig</button>
      <button type="button" class="text-btn danger" data-action="delete" data-id="${escapeText(t.id)}">Verwijder</button></td></tr>`).join('');
    $('noTransactions').hidden = list.length > 0;
  }

  function updateCategoryOptions(wanted) {
    const type = $('transactionType').value;
    $('transactionCategory').innerHTML = CATEGORIES[type].map(c => `<option value="${c}">${c}</option>`).join('');
    if (wanted && CATEGORIES[type].includes(wanted)) $('transactionCategory').value = wanted;
  }

  function openDialog(t = null) {
    $('transactionForm').reset();
    $('transactionId').value = t ? t.id : '';
    $('dialogTitle').textContent = t ? 'Transactie wijzigen' : 'Transactie toevoegen';
    $('transactionType').value = t ? t.type : 'inkomst';
    updateCategoryOptions(t?.category);
    $('transactionDate').value = t ? t.date : `${selectedYear}-06-10`;
    $('transactionDescription').value = t ? t.description : '';
    $('transactionAmount').value = t ? t.amount : '';
    $('formError').hidden = true;
    $('transactionDialog').showModal();
  }
  const closeDialog = () => $('transactionDialog').close();

  $('addTransactionBtn').addEventListener('click', () => openDialog());
  $('closeDialogBtn').addEventListener('click', closeDialog);
  $('cancelDialogBtn').addEventListener('click', closeDialog);
  $('transactionType').addEventListener('change', () => updateCategoryOptions());
  $('transactionForm').addEventListener('submit', e => {
    e.preventDefault();
    const id = $('transactionId').value;
    const type = $('transactionType').value;
    const date = $('transactionDate').value;
    const description = $('transactionDescription').value.trim();
    const category = $('transactionCategory').value;
    const amount = Number($('transactionAmount').value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !description || !CATEGORIES[type]?.includes(category) || !Number.isFinite(amount) || amount <= 0) {
      $('formError').textContent = 'Controleer de datum, omschrijving, categorie en het bedrag.';
      $('formError').hidden = false;
      return;
    }
    const entry = { id: id || `tx-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, type, date, description, category, amount: Math.round(amount*100)/100 };
    if (id) transactions = transactions.map(t => t.id === id ? entry : t);
    else transactions.push(entry);
    selectedYear = date.slice(0,4);
    save(); updateYearOptions(); render(); closeDialog();
    toast(id ? 'Transactie gewijzigd.' : 'Transactie toegevoegd.');
  });
  $('transactionsBody').addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const t = transactions.find(t => t.id === btn.dataset.id);
    if (!t) return;
    if (btn.dataset.action === 'edit') openDialog(t);
    if (btn.dataset.action === 'delete' && confirm(`Transactie "${t.description}" verwijderen?`)) {
      transactions = transactions.filter(x => x.id !== t.id);
      save(); render(); toast('Transactie verwijderd.');
    }
  });
  $('yearSelect').addEventListener('change', e => { selectedYear = e.target.value; render(); });
  $('searchInput').addEventListener('input', renderTransactions);
  $('typeFilter').addEventListener('change', renderTransactions);

  $('exportCsvBtn').addEventListener('click', () => {
    const rows = [['Datum','Omschrijving','Categorie','Soort','Bedrag EUR'], ...byYear().map(t => [t.date,t.description,t.category,t.type,t.amount.toFixed(2)])];
    const csv = '\uFEFF' + rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = `avond4daagse-transacties-${selectedYear}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  // Facturen: bestanden lokaal opslaan in IndexedDB, dus niet uploaden naar een server.
  function openDb() {
    return new Promise((resolve,reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore('invoices', { keyPath:'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function dbAction(mode, fn) {
    const db = await openDb();
    return new Promise((resolve,reject) => {
      const tx = db.transaction('invoices', mode);
      const store = tx.objectStore('invoices');
      const request = fn(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
      tx.onerror = () => reject(tx.error);
    });
  }
  const chooseFile = () => $('invoiceFileInput').click();
  $('uploadInvoiceBtn').addEventListener('click', chooseFile);
  $('uploadInvoiceBtnBottom').addEventListener('click', chooseFile);
  $('invoiceFileInput').addEventListener('change', async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['application/pdf','image/png','image/jpeg','image/webp'].includes(file.type)) { toast('Kies een PDF, JPG, PNG of WEBP.'); e.target.value = ''; return; }
    if (file.size > 5*1024*1024) { toast('Bestand is te groot (maximaal 5 MB).'); e.target.value = ''; return; }
    try {
      await dbAction('readwrite', store => store.put({id:`inv-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, name:file.name, file, year:selectedYear, created:Date.now()}));
      await renderInvoices(); toast('Factuur lokaal opgeslagen.');
    } catch { toast('Factuur opslaan lukt niet in deze browser.'); }
    e.target.value = '';
  });
  async function renderInvoices() {
    try {
      const invoices = (await dbAction('readonly', store => store.getAll())).filter(i => i.year === selectedYear).sort((a,b) => b.created-a.created);
      $('invoiceList').innerHTML = invoices.map(i => `<li class="invoice-item"><span>📄 ${escapeText(i.name)} <small class="small-muted">(${dateNL(new Date(i.created).toISOString().slice(0,10))})</small></span><div class="invoice-actions"><button class="text-btn" data-invoice-action="download" data-id="${escapeText(i.id)}">Download</button><button class="text-btn danger" data-invoice-action="delete" data-id="${escapeText(i.id)}">Verwijder</button></div></li>`).join('');
      $('noInvoices').hidden = invoices.length > 0;
    } catch { $('noInvoices').textContent = 'Facturen zijn niet beschikbaar in deze browser.'; $('noInvoices').hidden = false; }
  }
  $('invoiceList').addEventListener('click', async e => {
    const btn = e.target.closest('button[data-invoice-action]');
    if (!btn) return;
    try {
      const inv = await dbAction('readonly', store => store.get(btn.dataset.id));
      if (!inv) return;
      if (btn.dataset.invoiceAction === 'delete') {
        if (!confirm(`Factuur "${inv.name}" verwijderen?`)) return;
        await dbAction('readwrite', store => store.delete(inv.id));
        await renderInvoices(); toast('Factuur verwijderd.');
      } else {
        const url = URL.createObjectURL(inv.file);
        const a = document.createElement('a'); a.href = url; a.download = inv.name; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch { toast('De factuur kon niet worden geopend.'); }
  });

  updateYearOptions();
  render();
})();
