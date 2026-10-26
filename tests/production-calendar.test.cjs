const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'production-calendar.js'), 'utf8');
function makeCalendar({fetchImpl} = {}) {
  const data = new Map();
  const localStorage = {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
    removeItem(key) { data.delete(key); }
  };
  const sandbox = {
    window: {}, localStorage, Date, Intl, URL, AbortController,
    setTimeout, clearTimeout,
    fetch: fetchImpl || (async () => { throw new Error('offline'); })
  };
  vm.runInNewContext(source, sandbox, {filename:'production-calendar.js'});
  return {api:sandbox.window.ProductionCalendar, storage:data};
}

test('Russian official fallback covers 2026 public and transferred non-working days', () => {
  const {api} = makeCalendar();
  assert.equal(api.status('2026-03-09').working, false, 'Monday after 8 March is transferred day off');
  assert.equal(api.status('2026-03-10').working, true);
  assert.equal(api.status('2026-05-11').working, false, 'day off transferred from 9 May');
  assert.equal(api.status('2026-12-31').working, false, 'New Year transfer');
  assert.equal(api.status('2026-10-19').working, true);
});

test('official transfer can make a Saturday a working day and Monday a day off in 2027', () => {
  const {api} = makeCalendar();
  assert.equal(api.status('2027-02-20').working, true, 'Saturday moved to working day');
  assert.equal(api.status('2027-02-22').working, false, 'transferred day off');
  assert.equal(api.status('2027-11-05').working, false);
  assert.equal(api.status('2027-12-31').working, false);
});

test('historical transfer dates for 2024 and 2025 are handled', () => {
  const {api} = makeCalendar();
  assert.equal(api.status('2024-04-27').working, true);
  assert.equal(api.status('2024-04-29').working, false);
  assert.equal(api.status('2025-05-01').working, false, 'May Day must be a non-working holiday');
  assert.equal(api.status('2025-05-08').working, false);
  assert.equal(api.status('2025-11-01').working, true);
  assert.equal(api.status('2025-11-03').working, false);
});

test('online year data refreshes and keeps shortened days as working under the fixed 8h norm', async () => {
  let codes = '0'.repeat(365).split('');
  codes[16] = '1'; // 2026-01-17 (index 16) non-working
  codes[17] = '2'; // 2026-01-18 shortened marker, still work for this app's 8h rule
  const {api, storage} = makeCalendar({fetchImpl:async () => ({ok:true,status:200,text:async()=>codes.join('')})});
  assert.equal(await api.refreshYear(2026, {force:true}), true);
  assert.equal(api.status('2026-01-17').working, false);
  assert.equal(api.status('2026-01-18').working, true);
  assert.ok([...storage.keys()].some(k => k.includes('2026')));
});

test('malformed online calendar is ignored and fallback remains available', async () => {
  const {api} = makeCalendar({fetchImpl:async () => ({ok:true,status:200,text:async()=>'error'})});
  assert.equal(await api.refreshYear(2026, {force:true}), false);
  assert.equal(api.status('2026-03-09').working, false);
});
