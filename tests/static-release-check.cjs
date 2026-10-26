const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
const js = fs.readFileSync(path.join(root,'app.js'),'utf8');
const sw = fs.readFileSync(path.join(root,'sw.js'),'utf8');
const config = fs.readFileSync(path.join(root,'config.js'),'utf8');

test('production calendar is loaded before application code and included in service-worker shell', () => {
  assert.ok(html.indexOf('production-calendar.js') >= 0);
  assert.ok(html.indexOf('production-calendar.js') < html.indexOf('app.js'));
  assert.ok(sw.includes("'./production-calendar.js'"));
  assert.ok(sw.includes('work-time-shell-v9'));
});

test('manual holiday/workweek controls are removed from settings', () => {
  assert.ok(!html.includes('id="holidayDate"'));
  assert.ok(!html.includes('id="holidayAdd"'));
  assert.ok(!html.includes('id="workdaysPicker"'));
  assert.ok(html.includes('Производственный календарь'));
});

test('Google session token is restored after reload from tab sessionStorage, not persistent localStorage', () => {
  assert.ok(js.includes("sessionStorage.getItem(OAUTH_SESSION_KEY)"));
  assert.ok(js.includes("sessionStorage.setItem(OAUTH_SESSION_KEY"));
  assert.ok(js.includes('tokenExpiresAt'));
  assert.ok(js.includes('const shouldResume = !!state.token'));
  assert.ok(!/localStorage\.setItem\([^,]*token/i.test(js));
  assert.ok(!js.includes("requestAccessToken({prompt:'none'})"));
  assert.ok(js.includes('state.tokenClient = window.google.accounts.oauth2.initTokenClient({'));
  assert.ok(js.includes('callback: (response) =>'));
  assert.ok(!js.includes('state.tokenClient.callback ='));
  assert.ok(js.includes('error_callback: (error) =>'));
});

test('owner Client ID remains configured in app config, no client secret exists', () => {
  assert.match(config, /\.apps\.googleusercontent\.com/);
  assert.doesNotMatch(config, /clientSecret|client_secret/i);
});

test('spreadsheet writes use a single atomic batchUpdate instead of clearing before a second request', () => {
  assert.ok(js.includes('async writeSheet(id, name, headers, rows)'));
  assert.ok(js.includes(`repeatCell:{range:{sheetId:sheet.sheetId,startColumnIndex:0,endColumnIndex:26},cell:{},fields:'userEnteredValue'}`));
  assert.ok(js.includes('updateCells:{start:{sheetId:sheet.sheetId,rowIndex:0,columnIndex:0}'));
  assert.ok(!js.includes('async clearRange(id, range)'));
});

test('backup listing is refreshed only while Settings is visible', () => {
  assert.ok(js.includes("if(state.view==='settings') renderBackups()"));
});

test('refresh does not rewrite Settings and re-upload appData config on every successful load', () => {
  const loadMethod = js.slice(js.indexOf('    async load() {', js.indexOf('class DataStore')), js.indexOf('    async writeRecords()', js.indexOf('class DataStore')));
  assert.ok(loadMethod.includes('if(needsSettingsMigration) writes.push(this.writeSettings())'));
  assert.ok(!loadMethod.includes('await googleClient.saveAppDataConfig'));
  assert.ok(js.includes('const mapping=await googleClient.readAppDataConfig()'));
});

test('an intentionally empty template sheet stays empty after reload', () => {
  assert.ok(js.includes('if (!state.templates.length && !hasTemplateHeader)'));
});

test('failed Sheets data loading cannot be reported as a successful connection', () => {
  assert.ok(js.includes('const loaded=await loadData(false)'));
  assert.ok(js.includes("if(!loaded){setLoader('Синхронизация не завершена'"));
});

test('a valid tab OAuth session resumes even if localStorage preference flags are missing', () => {
  assert.ok(js.includes('const shouldResume = !!state.token && state.tokenExpiresAt > Date.now()+60000;'));
  assert.ok(!js.includes("const shouldResume = !!state.token && state.tokenExpiresAt > Date.now()+60000 && (localStorage.getItem('workTime.preferGoogle')"));
  assert.ok(js.includes('this.initPromise=null;'));
  assert.ok(js.includes('if (this.initPromise) return this.initPromise;'));
});

test('empty TaskTemplates does not get rewritten on each reload', () => {
  assert.ok(js.includes('if(needsTemplateMigration || (!hasTemplateHeader && state.templates.length)) writes.push(this.writeTemplates());'));
  assert.ok(!js.includes('if(needsTemplateMigration || !state.templates.length)'));
});

test('a stale browser-local spreadsheet ID is checked for current-user ownership before adoption', () => {
  assert.ok(js.includes('async driveFileMetadata(id)'));
  assert.ok(js.includes('const ownedByCurrentUser=(file.owners||[]).some(owner=>owner.me===true)'));
  assert.ok(js.includes('appData mapping is scoped to this Google account and remains authoritative'));
});
