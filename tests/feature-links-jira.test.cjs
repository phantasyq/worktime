const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const js = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

function helpers() {
  const start = js.indexOf('  function escapeHtml');
  const end = js.indexOf('  function formatHours', start);
  const sandbox = { URL };
  vm.runInNewContext(js.slice(start, end) + '\nthis.api={normalizeHttpUrl,safeStoredUrl,linkifyText,renderTaskLabel};', sandbox);
  return sandbox.api;
}

test('URLs in task names and comments become safe, clickable HTTPS links', () => {
  const h = helpers();
  assert.equal(h.normalizeHttpUrl('jira.example.com/browse/APP-12'), 'https://jira.example.com/browse/APP-12');
  const html = h.linkifyText('Check https://jira.example.com/browse/APP-12 and www.example.com.');
  assert.match(html, /href="https:\/\/jira\.example\.com\/browse\/APP-12"/);
  assert.match(html, /href="https:\/\/www\.example\.com\/"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.match(h.renderTaskLabel({task:'Open task',taskUrl:'https://jira.example.com/browse/APP-12'}), /href="https:\/\/jira\.example\.com\/browse\/APP-12"/);
});

test('linkify safely escapes HTML and does not turn javascript URLs into anchors', () => {
  const h = helpers();
  const result = h.linkifyText('<img src=x onerror=alert(1)> javascript:alert(1)');
  assert.ok(result.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.doesNotMatch(result, /href="javascript:/i);
});

test('task URLs and template URLs are persisted and migrated as appended columns', () => {
  assert.match(js, /records: \['id','date','task','category','minutes','jira','note','createdAt','updatedAt','taskUrl'\]/);
  assert.match(js, /templates: \['id','name','url'\]/);
  assert.ok(js.includes("`${SHEET_NAMES.records}!A1:J`"));
  assert.ok(js.includes("`${SHEET_NAMES.templates}!A1:C`"));
  assert.ok(js.includes('needsRecordMigration'));
  assert.ok(js.includes('needsTemplateMigration'));
  assert.ok(js.includes('state.templates.map(r=>[r.id,r.name,r.url||\'\'])'));
  assert.ok(js.includes('templates:state.templates.map(t=>({id:t.id,name:t.name,url:t.url||\'\'}))'));
});

test('template UI accepts a URL and selected template passes link into a record', () => {
  assert.ok(js.includes('id="templateUrl"'));
  assert.ok(js.includes("url:normalizeHttpUrl($('#templateUrl').value)"));
  assert.ok(js.includes('taskUrl:template?.url||\'\''));
  assert.ok(js.includes("$('#recordTaskUrl').value=t.url||''"));
  assert.ok(js.includes('id="recordTaskUrl"'));
});

test('Jira can be toggled inline in calendar and incomplete days receive a warning state', () => {
  assert.ok(js.includes('data-cal-jira='));
  assert.ok(js.includes("await store.saveRecord({...row,jira:!isJiraValue(row.jira)})"));
  assert.ok(js.includes('function hasIncompleteJira(date)'));
  assert.ok(js.includes("${jiraIncomplete?'jira-incomplete':''}"));
  assert.ok(js.includes('jira-day-notice'));
  assert.ok(css.includes('.calendar-cell.jira-incomplete'));
  assert.ok(css.includes('.jira-toggle'));
  assert.ok(html.includes('Не все записи в Jira'));
});
