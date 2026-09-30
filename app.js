(() => {
  'use strict';

  const BASE = {
    sheets: 'https://sheets.googleapis.com/v4',
    drive: 'https://www.googleapis.com/drive/v3',
    upload: 'https://www.googleapis.com/upload/drive/v3'
  };

  const SHEET_NAMES = {
    records: 'Records',
    days: 'Days',
    settings: 'Settings',
    templates: 'TaskTemplates'
  };
  const HEADERS = {
    records: ['id','date','task','category','minutes','jiraMinutes','note','createdAt','updatedAt'],
    days: ['date','status','comment','updatedAt'],
    settings: ['key','value'],
    templates: ['id','name','category','minutes','note']
  };
  const DEFAULT_SETTINGS = {
    dailyNormMinutes: 480,
    workdays: [1,2,3,4,5],
    appName: 'Work Time',
    currency: 'hours'
  };
  const DEFAULT_TEMPLATES = [
    ['Разработка','Разработка',60,''],
    ['Встреча','Встречи',60,''],
    ['Поддержка','Поддержка',30,''],
    ['Аналитика','Аналитика',60,''],
    ['Документация','Документация',45,'']
  ];
  const STATUS_META = {
    work: { label:'Рабочий', tone:'soft', icon:'briefcase' },
    vacation: { label:'Отпуск', tone:'purple', icon:'sun' },
    sick: { label:'Больничный', tone:'red', icon:'heart-pulse' },
    dayoff: { label:'Day off', tone:'amber', icon:'coffee' }
  };
  const ICONS = {
    grid: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z',
    clock: 'M12 7v5l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    calendar: 'M7 3v3 M17 3v3 M4 8h16 M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
    zap: 'm13 2-9 11h7l-1 9 9-12h-7z',
    sliders: 'M4 6h16 M4 12h16 M4 18h16 M8 4v4 M15 10v4 M11 16v4',
    cloud: 'M7 18a5 5 0 0 1-.5-9.97A6 6 0 0 1 18.9 9.2A4.5 4.5 0 0 1 18 18Z',
    'chevron-right': 'm9 18 6-6-6-6',
    'chevron-left': 'm15 18-6-6 6-6',
    'arrow-up-right': 'M7 17 17 7 M7 7h10v10',
    plus: 'M12 5v14 M5 12h14',
    refresh: 'M20 11a8 8 0 0 0-14.9-3L4 10 M4 5v5h5 M4 13a8 8 0 0 0 14.9 3L20 14 M20 19v-5h-5',
    play: 'm9 6 9 6-9 6z',
    'rotate-ccw': 'M3 12a9 9 0 0 1 15.2-6.5L20 7 M20 3v4h-4',
    search: 'm21 21-4.35-4.35 M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z',
    check: 'm5 12 4 4L19 6',
    'log-in': 'M10 17l5-5-5-5 M15 12H3 M14 5V3h6v18h-6v-2',
    'log-out': 'M14 17l5-5-5-5 M19 12H7 M10 5V3H4v18h6v-2',
    download: 'M12 3v11m0 0 4-4m-4 4-4-4 M5 21h14',
    upload: 'M12 14V3m0 0-4 4m4-4 4 4 M5 21h14',
    edit: 'M4 17.5V21h3.5L19 13.5 15.5 10 4 17.5Z M13.5 7.5l3.5 3.5 M17 4a2 2 0 0 1 3 3l-9.5 9.5',
    trash: 'M4 7h16 M10 11v6 M14 11v6 M6 7l1 14h10l1-14 M9 7V4h6v3',
    'more-horizontal': 'M5 12h.01 M12 12h.01 M19 12h.01',
    square: 'M5 5h14v14H5z',
    briefcase: 'M8 6V4h8v2 M4 8h16v10H4z M4 12h16',
    sun: 'M12 3v2 M12 19v2 M3 12h2 M19 12h2 M5.6 5.6 7 7 M17 17l1.4 1.4 M18.4 5.6 17 7 M7 17l-1.4 1.4 M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
    'heart-pulse': 'M3 12h4l2-4 4 9 2-5h6',
    coffee: 'M5 8h12v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z M17 10h1.5a2.5 2.5 0 1 1 0 5H17 M8 21h9',
    'file-spreadsheet': 'M6 3h9l4 4v14H6z M15 3v5h5 M9 12h6 M9 16h6',
    'x-circle': 'M15 9l-6 6 M9 9l6 6 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    'database-backup': 'M4 6c0-2 3.6-3 8-3s8 1 8 3-3.6 3-8 3-8-1-8-3Zm0 0v6c0 2 3.6 3 8 3s8-1 8-3V6m-16 6v6c0 2 3.6 3 8 3s8-1 8-3v-6',
    wrench: 'M14.7 6.3a5 5 0 0 0-6.6 6.6L3 18l3 3 5.1-5.1a5 5 0 0 0 6.6-6.6l-3.2 3.2-2-2 3.2-3.2Z'
  };

  const pendingSettings = JSON.parse(localStorage.getItem('workTime.pendingSettings') || 'null');
  const state = {
    view: 'dashboard',
    mode: 'auth',
    month: localMonth(),
    selectedDate: localDate(),
    spreadsheetId: localStorage.getItem('workTime.spreadsheetId') || '',
    token: null,
    tokenClient: null,
    profile: null,
    records: [],
    days: [],
    templates: [],
    settings: pendingSettings ? {...DEFAULT_SETTINGS,...pendingSettings} : {...DEFAULT_SETTINGS},
    connected: false,
    busy: false,
    timer: { running:false, startedAt:0, elapsed:0 }
  };

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function config() {
    const saved = JSON.parse(localStorage.getItem('workTime.config') || '{}');
    return {...window.APP_CONFIG, ...saved};
  }

  function setConfig(patch) {
    const next = {...config(), ...patch};
    localStorage.setItem('workTime.config', JSON.stringify(next));
    window.APP_CONFIG = next;
    return next;
  }

  function uid() {
    return crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function localDate(d=new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }

  function localMonth(d=new Date()) { return localDate(d).slice(0,7); }

  function dateFromIso(iso) {
    const [y,m,d] = iso.split('-').map(Number); return new Date(y, m-1, d);
  }

  function escapeHtml(v='') { return String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
  function escapeAttr(v='') { return escapeHtml(v).replace(/`/g,'&#96;'); }
  function formatHours(minutes) {
    const m = Math.max(0, Math.round(Number(minutes)||0));
    const h = Math.floor(m/60); const mm = m%60;
    return `${h}:${String(mm).padStart(2,'0')}`;
  }
  function formatSigned(minutes) {
    const n = Math.round(Number(minutes)||0);
    if (!n) return '0:00';
    return `${n>0?'+':'−'}${formatHours(Math.abs(n))}`;
  }
  function parseDuration(value) {
    const s = String(value ?? '').trim().replace(',', '.');
    if (!s) return 0;
    if (s.includes(':')) {
      const [h,m] = s.split(':').map(Number);
      if (!Number.isFinite(h) || !Number.isFinite(m) || m < 0 || m >= 60) throw new Error('Введите время в формате 1:30.');
      return Math.round(h*60 + m);
    }
    const n = Number(s);
    if (!Number.isFinite(n) || n < 0) throw new Error('Некорректная длительность.');
    return Math.round(n*60);
  }
  function durationInput(minutes) { return formatHours(minutes); }
  function formatDate(dateString, opts={day:'2-digit',month:'short'}) { return new Intl.DateTimeFormat('ru-RU', opts).format(dateFromIso(dateString)); }
  function monthLong(month) { const [y,m] = month.split('-').map(Number); return new Intl.DateTimeFormat('ru-RU',{month:'long',year:'numeric'}).format(new Date(y,m-1,1)); }
  function isPast(date) { return date < localDate(); }
  function isoWeekday(date) { const d = dateFromIso(date).getDay(); return d === 0 ? 7 : d; }
  function isWorkday(date) { return state.settings.workdays.includes(isoWeekday(date)); }
  function minutesForDay(date) {
    const status = state.days.find(x => x.date === date)?.status || 'work';
    if (status !== 'work') return 0;
    return isWorkday(date) ? Number(state.settings.dailyNormMinutes || 0) : 0;
  }
  function statusForDay(date) {
    const explicit = state.days.find(x => x.date === date);
    if (explicit && explicit.status !== 'work') return {key:explicit.status, ...STATUS_META[explicit.status]};
    return null;
  }
  function recordsForDay(date) { return state.records.filter(r => r.date === date); }
  function totalsForDay(date) {
    return recordsForDay(date).reduce((acc,r) => { acc.minutes += Number(r.minutes)||0; acc.jira += Number(r.jiraMinutes)||0; return acc; }, {minutes:0,jira:0});
  }
  function daysInMonth(month) { const [y,m] = month.split('-').map(Number); return new Date(y,m,0).getDate(); }
  function monthDays(month) { return Array.from({length:daysInMonth(month)},(_,i)=>`${month}-${String(i+1).padStart(2,'0')}`); }
  function monthlyTotals() {
    const days = monthDays(state.month);
    const prefix = `${state.month}-`;
    const monthRecords = state.records.filter(r => String(r.date || '').startsWith(prefix));
    const logged = monthRecords.reduce((a,r)=>a+(Number(r.minutes)||0),0);
    const jira = monthRecords.reduce((a,r)=>a+(Number(r.jiraMinutes)||0),0);
    const norm = days.reduce((a,d)=>a+minutesForDay(d),0);
    return {logged,jira,norm,balance:logged-norm};
  }

  function setIcons(root=document) {
    $$('[data-icon]', root).forEach(el => {
      const key = el.dataset.icon;
      const d = ICONS[key];
      if (!d || el.querySelector('svg')) return;
      el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
    });
  }

  function toast(message, error=false) {
    const root = $('#toastRoot');
    const el = document.createElement('div'); el.className = `toast${error?' error':''}`; el.textContent = message; root.appendChild(el);
    setTimeout(() => el.remove(), 3300);
  }

  function setLoader(title, text, done=false) {
    $('#loaderTitle').textContent = title;
    $('#loaderText').textContent = text;
    $('#blockingLoader').classList.toggle('done', done);
  }

  function openModal(content, title='', wide=false) {
    $('#modalRoot').innerHTML = `<div class="modal-backdrop" data-modal-backdrop><div class="modal ${wide?'wide-modal':''}"><div class="modal-head"><h3>${escapeHtml(title)}</h3><button class="modal-close" data-close-modal aria-label="Закрыть">×</button></div>${content}</div></div>`;
    $('[data-close-modal]')?.addEventListener('click', closeModal);
    $('[data-modal-backdrop]')?.addEventListener('click', e => { if(e.target.matches('[data-modal-backdrop]')) closeModal(); });
    document.body.classList.add('modal-open');
    setIcons($('#modalRoot'));
  }
  function closeModal() { $('#modalRoot').innerHTML=''; document.body.classList.remove('modal-open'); }

  function switchView(view) {
    state.view = view;
    $$('.nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.view===view));
    $$('.mobile-nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.view===view));
    $$('.view').forEach(el => el.classList.toggle('active', el.id===`view-${view}`));
    const labels = {dashboard:'ОБЗОР',entries:'ЖУРНАЛ',calendar:'КАЛЕНДАРЬ',templates:'SHORTCUTS',settings:'ПАРАМЕТРЫ'};
    $('#pageEyebrow').textContent = labels[view] || 'WORK TIME';
    $('#pageDate').textContent = new Intl.DateTimeFormat('ru-RU',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
    if (view==='calendar') renderCalendar();
    if (view==='entries') renderEntries();
    if (view==='templates') renderTemplates();
    if (view==='settings') renderSettings();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function bindNavigation() {
    $$('.nav-item,.mobile-nav-item').forEach(btn => btn.addEventListener('click',()=>switchView(btn.dataset.view)));
    $$('[data-view-link]').forEach(btn => btn.addEventListener('click',()=>switchView(btn.dataset.viewLink)));
    $('#heroAddButton').addEventListener('click',()=>openRecordModal(null,state.selectedDate));
    $('#entryAdd').addEventListener('click',()=>openRecordModal(null,state.selectedDate));
    $('#templateAdd').addEventListener('click',()=>openTemplateModal());
    $('#refreshButton').addEventListener('click',()=>loadData(true));
    $('#mobileSync').addEventListener('click',()=>state.mode==='google'?switchView('settings'):connectGoogle(true));
    $('#syncCard').addEventListener('click',()=>switchView('settings'));
    $('#accountButton').addEventListener('click',()=>switchView('settings'));
    $('#monthPicker').addEventListener('change',()=>setMonth($('#monthPicker').value));
    $('#calendarPrev').addEventListener('click',()=>moveMonth(-1));
    $('#calendarNext').addEventListener('click',()=>moveMonth(1));
    $('#entrySearch').addEventListener('input',renderEntries);
    $('#settingsSave').addEventListener('click',saveSettingsUi);
    $('#googleConnect').addEventListener('click',()=>connectGoogle(true));
    $('#authConnect').addEventListener('click',()=>connectGoogle(true));
    $('#googleDisconnect').addEventListener('click',disconnectGoogle);
    $('#modeGoogleButton').addEventListener('click',()=>state.mode==='google'?switchView('settings'):connectGoogle(true));
    $('#backupCreate').addEventListener('click',createBackup);
    $('#backupRestore').addEventListener('click',()=>$('#restoreInput').click());
    $('#restoreInput').addEventListener('change',restoreLocalBackup);
  }

  function setMonth(month) {
    if (!/^\d{4}-\d{2}$/.test(month)) return;
    state.month = month;
    $('#monthPicker').value = month;
    state.selectedDate = month===localMonth() ? localDate() : `${month}-01`;
    loadData();
  }
  function moveMonth(delta) {
    const [y,m] = state.month.split('-').map(Number); const d = new Date(y,m-1+delta,1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);
  }

  class GoogleClient {
    constructor(){
      this.appDataConfigName='.work-time-config.json';
    }
    async waitForGis() {
      const deadline = Date.now()+15000;
      while (!window.google?.accounts?.oauth2) {
        if (Date.now()>deadline) throw new Error('Не удалось загрузить Google Sign-In. Проверьте интернет и отключение блокировщика scripts.googleapis.com/accounts.google.com.');
        await new Promise(r=>setTimeout(r,100));
      }
    }
    async init() {
      const clientId = config().googleClientId?.trim();
      if (!clientId) throw new Error('Приложение ещё не настроено владельцем: OAuth Client ID не указан в config.js.');
      await this.waitForGis();
      state.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        // Only non-sensitive, per-file scopes. This avoids broad Drive/Sheets access.
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata',
        callback: () => {}
      });
    }
    async ensureToken(interactive=false) {
      if (!state.tokenClient) await this.init();
      if (state.token) return state.token;
      return new Promise((resolve,reject)=>{
        state.tokenClient.callback = (response) => {
          if (response?.error) return reject(new Error(response.error_description || response.error));
          state.token = response.access_token;
          resolve(state.token);
        };
        state.tokenClient.requestAccessToken({prompt: interactive ? 'consent' : ''});
      });
    }
    async authorize(interactive=true) { return this.ensureToken(interactive); }
    async request(url, opts={}, retry=true) {
      const token = await this.ensureToken(false);
      const headers = new Headers(opts.headers || {}); headers.set('Authorization', `Bearer ${token}`);
      let response = await fetch(url,{...opts,headers});
      if (response.status===401 && retry) { state.token = null; await this.ensureToken(true); return this.request(url,opts,false); }
      if (!response.ok) {
        let message = `Google API: HTTP ${response.status}`;
        try { const j = await response.json(); message = j.error?.message || j.error?.status || message; } catch {}
        throw new Error(message);
      }
      return response;
    }
    async json(url, options={}) { const r = await this.request(url, options); return r.status===204?null:r.json(); }
    async appDataFile() {
      const params = new URLSearchParams({
        q: `name = '${this.appDataConfigName.replace(/'/g,"\\'")}' and trashed = false`,
        spaces:'appDataFolder',
        pageSize:'10',
        orderBy:'modifiedTime desc',
        fields:'files(id,name,modifiedTime)'
      });
      const result=await this.json(`${BASE.drive}/files?${params}`);
      return result.files?.[0]||null;
    }
    async readAppDataConfig() {
      const file=await this.appDataFile();
      if(!file)return null;
      const text=await this.readDriveFile(file.id);
      try{return JSON.parse(text);}catch{return null;}
    }
    async saveAppDataConfig(payload) {
      const text=JSON.stringify(payload);
      const existing=await this.appDataFile();
      const metadata={name:this.appDataConfigName,mimeType:'application/json',...(existing?{}:{parents:['appDataFolder']})};
      return this.uploadJson(this.appDataConfigName,text,{existingId:existing?.id,metadata});
    }
    async createSpreadsheet(title) {
      // Create the Sheet through Drive API, which works with the recommended drive.file scope.
      const body={name:title,mimeType:'application/vnd.google-apps.spreadsheet'};
      const sheetFile=await this.json(`${BASE.drive}/files`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(!sheetFile?.id) throw new Error('Google не вернул ID новой таблицы.');
      const meta=await this.json(`${BASE.sheets}/spreadsheets/${encodeURIComponent(sheetFile.id)}?fields=sheets.properties`);
      const first=meta?.sheets?.[0]?.properties;
      const requests=[];
      if(first?.sheetId!=null) requests.push({updateSheetProperties:{properties:{sheetId:first.sheetId,title:SHEET_NAMES.records},fields:'title'}});
      for(const name of Object.values(SHEET_NAMES).slice(1)) requests.push({addSheet:{properties:{title:name}}});
      if(requests.length) await this.json(`${BASE.sheets}/spreadsheets/${encodeURIComponent(sheetFile.id)}:batchUpdate`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requests})});
      return {spreadsheetId:sheetFile.id};
    }
    async readRange(id, range) {
      const encoded = encodeURIComponent(range);
      return this.json(`${BASE.sheets}/spreadsheets/${encodeURIComponent(id)}/values/${encoded}?majorDimension=ROWS`);
    }
    async writeRange(id, range, values) {
      const encoded = encodeURIComponent(range);
      return this.json(`${BASE.sheets}/spreadsheets/${encodeURIComponent(id)}/values/${encoded}?valueInputOption=RAW`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({range,majorDimension:'ROWS',values})});
    }
    async clearRange(id, range) {
      const encoded = encodeURIComponent(range);
      return this.json(`${BASE.sheets}/spreadsheets/${encodeURIComponent(id)}/values/${encoded}:clear`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
    }
    async writeSheet(id, name, headers, rows) {
      await this.clearRange(id, `${name}!A:Z`);
      if (rows.length) await this.writeRange(id, `${name}!A1:${columnName(headers.length)}${rows.length+1}`, [headers,...rows]);
      else await this.writeRange(id, `${name}!A1:${columnName(headers.length)}1`, [headers]);
    }
    async exportXlsx(id) {
      const params = new URLSearchParams({mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      const r = await this.request(`${BASE.drive}/files/${encodeURIComponent(id)}/export?${params}`);
      return r.blob();
    }
    async listBackups() {
      const q = ["trashed = false", "mimeType = 'application/json'", "name contains 'work-time-backup_'"].join(' and ');
      const params = new URLSearchParams({q,spaces:'drive',pageSize:'50',orderBy:'modifiedTime desc',fields:'files(id,name,size,createdTime,modifiedTime,webViewLink)'});
      return (await this.json(`${BASE.drive}/files?${params}`)).files || [];
    }
    async readDriveFile(id) {
      const r = await this.request(`${BASE.drive}/files/${encodeURIComponent(id)}?alt=media`);
      return r.text();
    }
    async uploadJson(name,text,opts={}) {
      const meta={name,mimeType:'application/json',...(opts.metadata||{})};
      const metadata = new Blob([JSON.stringify(meta)],{type:'application/json'});
      const content = new Blob([text],{type:'application/json'});
      const form = new FormData(); form.append('metadata',metadata); form.append('file',content,name);
      const path=opts.existingId?`${BASE.upload}/files/${encodeURIComponent(opts.existingId)}?uploadType=multipart&fields=id,name,webViewLink,createdTime`: `${BASE.upload}/files?uploadType=multipart&fields=id,name,webViewLink,createdTime`;
      return this.json(path,{method:opts.existingId?'PATCH':'POST',body:form});
    }
  }
  const googleClient = new GoogleClient();

  class DataStore {
    async ensureSpreadsheet() {
      let id = state.spreadsheetId || '';
      if (!id) {
        const cfg=await googleClient.readAppDataConfig();
        id=cfg?.spreadsheetId||'';
      }
      if (id) {
        try { await googleClient.readRange(id, `${SHEET_NAMES.records}!A1:I1`); }
        catch { id=''; }
      }
      if (!id) {
        const file = await googleClient.createSpreadsheet(config().spreadsheetTitle || 'Work Time Tracker — Data');
        id=file.spreadsheetId;
        await this.seedSpreadsheet(id);
        await googleClient.saveAppDataConfig({version:1,spreadsheetId:id,updatedAt:new Date().toISOString()});
      } else if (id !== state.spreadsheetId) {
        state.spreadsheetId=id;
      }
      state.spreadsheetId=id;
      localStorage.setItem('workTime.spreadsheetId',id);
      return id;
    }
    async seedSpreadsheet(id) {
      const records=[], days=[], settings=Object.entries({...DEFAULT_SETTINGS,workdays:DEFAULT_SETTINGS.workdays.join(',')}).map(([key,value])=>[key,String(value)]);
      const templates=DEFAULT_TEMPLATES.map(([name,category,minutes,note])=>[uid(),name,category,String(minutes),note]);
      await Promise.all([
        googleClient.writeSheet(id,SHEET_NAMES.records,HEADERS.records,records),
        googleClient.writeSheet(id,SHEET_NAMES.days,HEADERS.days,days),
        googleClient.writeSheet(id,SHEET_NAMES.settings,HEADERS.settings,settings),
        googleClient.writeSheet(id,SHEET_NAMES.templates,HEADERS.templates,templates)
      ]);
    }
    async load() {
      const id = await this.ensureSpreadsheet();
      const ranges = [
        `${SHEET_NAMES.records}!A1:I`,
        `${SHEET_NAMES.days}!A1:D`,
        `${SHEET_NAMES.settings}!A1:B`,
        `${SHEET_NAMES.templates}!A1:E`
      ].map(encodeURIComponent).join('&ranges=');
      const data = await googleClient.json(`${BASE.sheets}/spreadsheets/${encodeURIComponent(id)}/values:batchGet?majorDimension=ROWS&ranges=${ranges}`);
      const valueRanges = data.valueRanges || [];
      const [recordsRows,daysRows,settingsRows,templateRows] = valueRanges.map(x=>x.values||[]);
      state.records = rowsToObjects(HEADERS.records,recordsRows);
      state.days = rowsToObjects(HEADERS.days,daysRows);
      state.settings = parseSettings(settingsRows);
      if (!state.settings.dailyNormMinutes) state.settings.dailyNormMinutes=DEFAULT_SETTINGS.dailyNormMinutes;
      if (!Array.isArray(state.settings.workdays)) state.settings.workdays=[...DEFAULT_SETTINGS.workdays];
      state.templates = rowsToObjects(HEADERS.templates,templateRows).map(x=>({...x,minutes:Number(x.minutes)||60}));
      if (!state.templates.length) { state.templates = DEFAULT_TEMPLATES.map(([name,category,minutes,note])=>({id:uid(),name,category,minutes,note})); await this.writeTemplates(); }
      state.connected=true;
      await googleClient.saveAppDataConfig({version:1,spreadsheetId:id,updatedAt:new Date().toISOString()});
      return state;
    }
    async writeRecords() { await googleClient.writeSheet(state.spreadsheetId,SHEET_NAMES.records,HEADERS.records,state.records.map(r=>HEADERS.records.map(k=>r[k]??''))); }
    async writeDays() { await googleClient.writeSheet(state.spreadsheetId,SHEET_NAMES.days,HEADERS.days,state.days.map(r=>HEADERS.days.map(k=>r[k]??''))); }
    async writeSettings() { const rows=Object.entries({dailyNormMinutes:state.settings.dailyNormMinutes,workdays:state.settings.workdays.join(','),appName:state.settings.appName,currency:'hours'}).map(([k,v])=>[k,String(v)]); await googleClient.writeSheet(state.spreadsheetId,SHEET_NAMES.settings,HEADERS.settings,rows); }
    async writeTemplates() { await googleClient.writeSheet(state.spreadsheetId,SHEET_NAMES.templates,HEADERS.templates,state.templates.map(r=>HEADERS.templates.map(k=>r[k]??''))); }
    async saveRecord(record) {
      const now = new Date().toISOString();
      const next = {...record,id:record.id||uid(),minutes:Number(record.minutes),jiraMinutes:Number(record.jiraMinutes||0),createdAt:record.createdAt||now,updatedAt:now};
      if (!next.task.trim()) throw new Error('Укажите задачу.');
      if (!(next.minutes>0) || next.minutes>1440) throw new Error('Время должно быть от 1 минуты до 24 часов.');
      if (next.jiraMinutes<0 || next.jiraMinutes>next.minutes) throw new Error('Jira не может быть больше общей длительности.');
      const idx=state.records.findIndex(x=>x.id===next.id); if(idx>=0) state.records[idx]=next; else state.records.unshift(next);
      await this.writeRecords(); return next;
    }
    async deleteRecord(id) { state.records=state.records.filter(r=>r.id!==id); await this.writeRecords(); }
    async saveDay(date,status,comment='') {
      const row={date,status,comment,updatedAt:new Date().toISOString()};
      const idx=state.days.findIndex(x=>x.date===date); if(idx>=0) state.days[idx]=row; else state.days.push(row);
      if (status==='work' && !comment) state.days=state.days.filter(x=>x.date!==date);
      await this.writeDays();
    }
    async deleteDay(date) { state.days=state.days.filter(x=>x.date!==date); await this.writeDays(); }
    async saveTemplate(t) {
      const row={...t,id:t.id||uid(),minutes:Number(t.minutes)||60,note:t.note||''}; if(!row.name.trim()) throw new Error('Укажите название задачи.');
      const idx=state.templates.findIndex(x=>x.id===row.id); if(idx>=0)state.templates[idx]=row;else state.templates.push(row);await this.writeTemplates();return row;
    }
    async deleteTemplate(id) { state.templates=state.templates.filter(x=>x.id!==id); await this.writeTemplates(); }
    async saveSettings(settings) { state.settings={...state.settings,...settings}; await this.writeSettings(); }
    backupPayload() { return JSON.stringify({version:1,app:'Work Time',exportedAt:new Date().toISOString(),records:state.records,days:state.days,settings:[{key:'dailyNormMinutes',value:state.settings.dailyNormMinutes},{key:'workdays',value:state.settings.workdays.join(',')},{key:'appName',value:state.settings.appName},{key:'currency',value:'hours'}],templates:state.templates},null,2); }
    async restore(payload) {
      if(payload?.version!==1) throw new Error('Неподдерживаемый формат резервной копии.');
      state.records=Array.isArray(payload.records)?payload.records:[]; state.days=Array.isArray(payload.days)?payload.days:[]; state.templates=Array.isArray(payload.templates)?payload.templates:[]; state.settings=parseSettings((payload.settings||[]).map(x=>[x.key,x.value]));
      if(!state.settings.dailyNormMinutes) state.settings.dailyNormMinutes=480;
      if(!Array.isArray(state.settings.workdays)) state.settings.workdays=[1,2,3,4,5];
      if(!state.templates.length)state.templates=DEFAULT_TEMPLATES.map(([name,category,minutes,note])=>({id:uid(),name,category,minutes,note}));
      await Promise.all([this.writeRecords(),this.writeDays(),this.writeSettings(),this.writeTemplates()]);
    }
  }
  const googleStore = new DataStore();
  let store = googleStore;

  function rowsToObjects(headers, rows) {
    if(!rows || rows.length<2) return [];
    return rows.slice(1).filter(row=>row.some(v=>v!==''&&v!==null&&v!==undefined)).map(row=>Object.fromEntries(headers.map((h,i)=>[h,row[i]??''])));
  }
  function parseSettings(rows) {
    const map={}; (rows||[]).slice(1).forEach(r=>{if(r?.[0])map[String(r[0])]=r[1]??'';});
    return {dailyNormMinutes:Number(map.dailyNormMinutes)||DEFAULT_SETTINGS.dailyNormMinutes,workdays:String(map.workdays||'1,2,3,4,5').split(',').map(Number).filter(Boolean),appName:String(map.appName||DEFAULT_SETTINGS.appName),currency:'hours'};
  }
  function columnName(n) { let s=''; while(n>0){let r=(n-1)%26;s=String.fromCharCode(65+r)+s;n=Math.floor((n-1)/26);}return s; }

  function showAuthGate(show=true, message='') {
    $('#authGate').classList.toggle('hidden',!show);
    const err=$('#authError');
    if (err) { err.textContent=message||''; err.classList.toggle('show',!!message); }
    if(show) setTimeout(()=>setIcons($('#authGate')),0);
  }

  async function connectGoogle(interactive=true) {
    const btn=$('#authConnect');
    try {
      if (!config().googleClientId) throw new Error('Приложение ещё не настроено владельцем. Нужен OAuth Client ID в config.js.');
      if(btn){btn.disabled=true;btn.innerHTML='<span data-icon="cloud"></span> Подключаем…';setIcons(btn);}
      setLoader('Подключаем Google','Открываем безопасный доступ к вашей рабочей таблице…');
      await googleClient.authorize(interactive);
      state.mode='google';
      store=googleStore;
      state.connected=true;
      await loadData(false);
      localStorage.setItem('workTime.preferGoogle','1');
      showAuthGate(false);
      renderConnection();
      setLoader('Work Time готов','Данные синхронизированы',true);
      toast('Google подключён и данные синхронизированы');
    } catch (e) {
      state.mode='auth'; store=googleStore; state.connected=false;
      showAuthGate(true,e.message || 'Не удалось подключить Google.');
      renderConnection();
      setLoader('Нужен вход Google','Нажмите «Войти через Google», чтобы продолжить.',true);
      toast(`Google: ${e.message}`,true);
    } finally {
      if(btn){btn.disabled=false;btn.innerHTML='<span data-icon="log-in"></span> Войти через Google';setIcons(btn);}
    }
  }
  async function disconnectGoogle() {
    try { if(state.token && window.google?.accounts?.oauth2?.revoke){ await new Promise(resolve=>window.google.accounts.oauth2.revoke(state.token,resolve)); } } catch {}
    state.token=null; state.tokenClient=null; state.connected=false; state.mode='auth'; store=googleStore;
    localStorage.removeItem('workTime.spreadsheetId'); localStorage.removeItem('workTime.preferGoogle');
    state.spreadsheetId=''; showAuthGate(true,'Google отключён на этом устройстве. Чтобы продолжить работу, войдите снова.'); renderConnection();
  }

  async function loadData(showToast=false) {
    if (state.busy) return; state.busy=true;
    try {
      if (state.mode!=='google') return;
      if (!state.token) await googleClient.authorize(false);
      await store.load();
      syncSettingsToUi(); renderAll(); renderConnection();
      showAuthGate(false);
      if (showToast) toast('Данные обновлены');
    } catch(e) {
      state.connected=false; state.mode='auth';
      showAuthGate(true,e.message||'Не удалось загрузить данные.');
      renderConnection();
      toast(e.message,true);
    } finally { state.busy=false; }
  }

  function renderAll() {
    $('#brandTitle').textContent=state.settings.appName || config().appTitle || 'Work Time';
    $('#mobileTitle').textContent=state.settings.appName || config().appTitle || 'Work Time';
    $('#monthLabel').textContent=monthLong(state.month);
    $('#calendarTitle').textContent=monthLong(state.month).replace(/ \d+$/,'');
    $('#pageDate').textContent=new Intl.DateTimeFormat('ru-RU',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
    renderDashboard(); renderEntries(); renderCalendar(); renderTemplates(); renderSettings(); updateTimerUi(); setIcons();
  }
  function renderConnection() {
    const connected=state.mode==='google' && state.connected && !!state.spreadsheetId;
    $('#syncTitle').textContent=connected?'Google Sheets подключён':'Войти через Google';
    $('#syncSubtitle').textContent=connected?'Онлайн-синхронизация включена':'Синхронизация обязательна для работы';
    $('#sheetsBadge').textContent=connected?'Подключено':'Не подключено';
    $('#sheetsBadge').classList.toggle('on',connected);
    $('#sheetsBadge').classList.toggle('demo',!connected);
    const sheetLink=connected?`<a href="https://docs.google.com/spreadsheets/d/${encodeURIComponent(state.spreadsheetId)}/edit" target="_blank" rel="noopener">Открыть таблицу</a>`:'Подключение к Google ещё не выполнено.';
    $('#sheetsStatus').innerHTML=sheetLink;
    $('#avatarLetter').textContent=connected?'G':'•';
    const banner=$('#modeBanner');
    banner.classList.toggle('google-mode',connected);
    $('#modeBannerTitle').textContent=connected?'Google синхронизация включена':'Подключите Google, чтобы начать';
    $('#modeBannerText').textContent=connected?'Данные сохраняются онлайн и доступны на всех устройствах с вашим Google-аккаунтом.':'Один вход через Google — и приложение автоматически создаст и запомнит вашу рабочую таблицу.';
    $('#modeGoogleButton').textContent=connected?'Настройки Google':'Войти через Google';
    $('#modeGoogleButton').innerHTML=`<span data-icon="${connected?'cloud':'log-in'}"></span> ${connected?'Настройки Google':'Войти через Google'}`;
    setIcons(banner);
    $('#googleConnect').textContent=connected?'Синхронизация активна':'Войти через Google';
    $('#googleConnect').innerHTML=`<span data-icon="${connected?'cloud':'log-in'}"></span> ${connected?'Синхронизация активна':'Войти через Google'}`;
    $('#googleConnect').disabled=connected;
  }

  function renderDashboard() {
    const today=state.month===localMonth()?localDate():`${state.month}-01`;
    state.selectedDate=today;
    const t=todayTotals();
    $('#heroTitle').textContent = isDayOff(today)?(STATUS_META[statusForDay(today)?.key]?.label || 'Сегодня'):'Рабочий день';
    $('#heroDateLabel').textContent = new Intl.DateTimeFormat('ru-RU',{weekday:'long',day:'numeric',month:'long'}).format(dateFromIso(today));
    $('#todayLogged').textContent=formatHours(t.minutes); $('#todayNorm').textContent=formatHours(t.norm); $('#todayJira').textContent=formatHours(t.jira); $('#todayBalance').textContent=formatSigned(t.minutes-t.norm);
    const pct=t.norm?Math.min(100,(t.minutes/t.norm)*100):100; $('#progressRing').style.background=`conic-gradient(#7b6cff ${pct*3.6}deg,rgba(255,255,255,.10) ${pct*3.6}deg)`;
    renderWeekStrip(); renderStats(); renderDailyList(); renderRecent();
  }
  function todayTotals() {
    const today = state.month===localMonth()?localDate():`${state.month}-01`; const d=totalsForDay(today); return {...d,norm:minutesForDay(today)};
  }
  function renderWeekStrip() {
    const today=dateFromIso(state.month===localMonth()?localDate():`${state.month}-01`); const start=new Date(today); const day=start.getDay()||7; start.setDate(start.getDate()-day+1);
    $('#weekStrip').innerHTML=Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);const iso=localDate(d);const totals=totalsForDay(iso);const current=iso===localDate();return `<div class="week-day ${current?'current':''}"><div class="w">${new Intl.DateTimeFormat('ru-RU',{weekday:'short'}).format(d).replace('.','')}</div><div class="n">${d.getDate()} · ${totals.minutes?formatHours(totals.minutes):'—'}</div></div>`}).join('');
  }
  function renderStats() {
    const t=monthlyTotals(); const cards=[
      {label:'За месяц',value:formatHours(t.logged),sub:`Норма ${formatHours(t.norm)}`,icon:'clock',tone:'purple'},
      {label:'Баланс',value:formatSigned(t.balance),sub:t.balance>=0?'Время сверх нормы':'Нужно добрать',icon:'check',tone:t.balance>=0?'green':'amber'},
      {label:'Списано в Jira',value:formatHours(t.jira),sub:t.logged?`${Math.round(t.jira/t.logged*100)}% от учтённого времени`:'Пока нет списаний',icon:'zap',tone:'dark'},
      {label:'Рабочих дней',value:String(monthDays(state.month).filter(d=>minutesForDay(d)>0).length),sub:`${state.settings.workdays.length} дня в неделе`,icon:'calendar',tone:'green'}
    ];
    $('#statsGrid').innerHTML=cards.map(c=>`<div class="stat-card"><div class="stat-top"><span class="stat-label">${c.label}</span><span class="stat-icon ${c.tone}"><span data-icon="${c.icon}"></span></span></div><div class="stat-value">${c.value}</div><div class="stat-sub">${c.sub}</div></div>`).join(''); setIcons($('#statsGrid'));
  }
  function dailyTone(date) {
    const t=totalsForDay(date), norm=minutesForDay(date), off=isDayOff(date), future=!isPast(date)&&date!==localDate();
    if(off) return 'off'; if(!norm) return 'off'; if(t.minutes>=norm) return 'good'; if(t.minutes>0) return 'warn'; if(future) return 'warn'; return 'bad';
  }
  function isDayOff(date) { return !!statusForDay(date) || !isWorkday(date); }
  function renderDailyList() {
    const days=monthDays(state.month).filter(d=>isWorkday(d)||totalsForDay(d).minutes>0||statusForDay(d));
    if(!days.length){$('#dailyList').innerHTML=`<div class="empty-state">В этом месяце нет рабочих дней.</div>`;return;}
    $('#dailyList').innerHTML=days.slice().reverse().map(date=>{
      const t=totalsForDay(date),norm=minutesForDay(date), tone=dailyTone(date), explicit=statusForDay(date), progress=norm?Math.min(100,t.minutes/norm*100):0;
      const statusLabel=explicit?explicit.label:(norm?formatHours(norm):'Выходной');
      return `<button class="daily-row" data-date="${date}" type="button"><div class="date-box"><strong>${formatDate(date,{day:'2-digit',month:'short'})}</strong><span>${new Intl.DateTimeFormat('ru-RU',{weekday:'short'}).format(dateFromIso(date))}</span></div><div class="day-bar"><div class="day-bar-meta"><span>${statusLabel}</span><span>${formatHours(t.minutes)}${norm?` / ${formatHours(norm)}`:''}</span></div><div class="bar"><span class="${tone}" style="width:${progress}%"></span></div></div><div class="jira-value">${t.jira?`<span class="pill jira">Jira ${formatHours(t.jira)}</span>`:'<span class="pill soft">—</span>'}</div><span class="row-status ${tone}"></span></button>`;
    }).join('');
    $$('#dailyList .daily-row').forEach(btn=>btn.addEventListener('click',()=>{state.selectedDate=btn.dataset.date;switchView('calendar');renderCalendar();}));
  }
  function renderRecent() {
    const rows=state.records.slice().sort((a,b)=>String(b.updatedAt||b.date).localeCompare(String(a.updatedAt||a.date))).slice(0,7);
    $('#recentEntries').innerHTML=rows.length?rows.map(r=>`<div class="recent-row"><div class="task-dot">${escapeHtml((r.task||'•').trim()[0]?.toUpperCase()||'•')}</div><div class="recent-copy"><strong>${escapeHtml(r.task)}</strong><span>${formatDate(r.date,{day:'2-digit',month:'short'})}${r.category?` · ${escapeHtml(r.category)}`:''}</span></div><div class="recent-time">${formatHours(r.minutes)}</div></div>`).join(''):`<div class="empty-state">Записей пока нет.</div>`;
  }

  function renderEntries() {
    const q=($('#entrySearch')?.value||'').trim().toLowerCase();
    const rows=state.records.filter(r=>[r.task,r.category,r.note,r.date].join(' ').toLowerCase().includes(q)).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')));
    $('#entryCount').textContent=`${rows.length} ${plural(rows.length,'запись','записи','записей')}`;
    $('#entriesEmpty').classList.toggle('hidden',rows.length!==0);
    $('#entriesEmpty').textContent=q?'По вашему запросу записей не найдено.':'Добавьте первую запись через кнопку «Новая запись».';
    $('#entriesBody').innerHTML=rows.map(r=>`<tr><td><strong>${formatDate(r.date,{day:'2-digit',month:'short',year:'numeric'})}</strong></td><td><div class="table-task">${escapeHtml(r.task)}</div></td><td>${r.category?`<span class="pill soft">${escapeHtml(r.category)}</span>`:'—'}</td><td><strong>${formatHours(r.minutes)}</strong></td><td>${Number(r.jiraMinutes)?`<span class="pill jira">${formatHours(r.jiraMinutes)}</span>`:'—'}</td><td><div class="table-note">${escapeHtml(r.note||'—')}</div></td><td><div class="row-actions"><button class="row-action" data-edit-record="${r.id}" aria-label="Редактировать"><span data-icon="edit"></span></button><button class="row-action" data-delete-record="${r.id}" aria-label="Удалить"><span data-icon="trash"></span></button></div></td></tr>`).join('');
    setIcons($('#entriesBody'));
    $$('[data-edit-record]').forEach(btn=>btn.addEventListener('click',()=>openRecordModal(state.records.find(x=>x.id===btn.dataset.editRecord))));
    $$('[data-delete-record]').forEach(btn=>btn.addEventListener('click',()=>deleteRecordUi(btn.dataset.deleteRecord)));
  }

  function renderCalendar() {
    $('#calendarTitle').textContent=monthLong(state.month);
    const [y,m]=state.month.split('-').map(Number); const first=new Date(y,m-1,1); const offset=(first.getDay()||7)-1; const total=daysInMonth(state.month); const cells=[];
    for(let i=0;i<offset;i++){const d=new Date(y,m-1,1-offset+i);cells.push(`<div class="calendar-cell muted"><div class="calendar-date"><span>${d.getDate()}</span></div></div>`);}
    for(let day=1;day<=total;day++){
      const iso=`${state.month}-${String(day).padStart(2,'0')}`;const t=totalsForDay(iso),tone=dailyTone(iso),selected=iso===state.selectedDate;const explicit=statusForDay(iso);const note=explicit?explicit.label:(minutesForDay(iso)?`${Math.round(Math.min(100,t.minutes/Math.max(1,minutesForDay(iso))*100))}% нормы`:'Выходной');
      cells.push(`<button class="calendar-cell ${tone} ${selected?'selected':''}" data-cal-date="${iso}" type="button"><div class="calendar-date"><span>${day}</span>${explicit?`<span class="pill ${explicit.tone}">${escapeHtml(explicit.label)}</span>`:''}</div><div class="hours">${t.minutes?formatHours(t.minutes):'—'}</div><div class="sub">${t.jira?`Jira ${formatHours(t.jira)} · `:''}${note}</div></button>`);
    }
    $('#calendarGrid').innerHTML=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(x=>`<div class="calendar-weekday">${x}</div>`).join('')+cells.join('');
    setIcons($('#calendarGrid'));
    $$('[data-cal-date]').forEach(btn=>btn.addEventListener('click',()=>{state.selectedDate=btn.dataset.calDate;renderCalendar();renderSelectedDay();}));
    renderSelectedDay();
  }
  function renderSelectedDay() {
    const date=state.selectedDate; const explicit=statusForDay(date); const t=totalsForDay(date), norm=minutesForDay(date); const meta=explicit||{label:isWorkday(date)?'Рабочий день':'Выходной',tone:'soft'};
    $('#selectedDayTitle').textContent=formatDate(date,{day:'numeric',month:'long',year:'numeric'});
    $('#selectedDayContent').innerHTML=`<div class="day-detail"><div class="day-detail-head"><div class="day-detail-icon"><span data-icon="${explicit?.icon||'calendar'}"></span></div><div><h4>${escapeHtml(meta.label)}</h4><small>${new Intl.DateTimeFormat('ru-RU',{weekday:'long'}).format(dateFromIso(date))}</small></div></div><div class="detail-stat"><div class="detail-chip"><span>Учтено</span><strong>${formatHours(t.minutes)}</strong></div><div class="detail-chip"><span>Норма</span><strong>${formatHours(norm)}</strong></div><div class="detail-chip"><span>Jira</span><strong>${formatHours(t.jira)}</strong></div><div class="detail-chip"><span>Баланс</span><strong>${formatSigned(t.minutes-norm)}</strong></div></div><div class="field-label" style="margin-top:18px">Статус<select id="dayStatusField" class="field day-status-select"><option value="work">Рабочий</option><option value="vacation">Отпуск</option><option value="sick">Больничный</option><option value="dayoff">Day off</option></select></div><label class="field-label">Комментарий<textarea id="dayCommentField" class="field" rows="3" placeholder="Например: отпуск в Японии">${escapeHtml(state.days.find(x=>x.date===date)?.comment||'')}</textarea></label><div class="button-row"><button class="primary-button" id="saveDayBtn"><span data-icon="check"></span> Сохранить день</button>${explicit?'<button class="secondary-button" id="resetDayBtn">Сбросить статус</button>':''}</div></div>`;
    $('#dayStatusField').value=explicit?.key||'work'; setIcons($('#selectedDayContent'));
    $('#saveDayBtn').addEventListener('click',async()=>{try{setBusyButton('#saveDayBtn',true);await store.saveDay(date,$('#dayStatusField').value,$('#dayCommentField').value.trim());toast('Статус дня сохранён');renderAll();}catch(e){toast(e.message,true);}finally{setBusyButton('#saveDayBtn',false);}});
    $('#resetDayBtn')?.addEventListener('click',async()=>{try{await store.deleteDay(date);toast('Статус дня сброшен');renderAll();}catch(e){toast(e.message,true);}});
  }

  function renderTemplates() {
    if(!state.templates.length){$('#templatesGrid').innerHTML='<div class="empty-state">Шаблонов нет. Создайте первый.</div>';return;}
    const icons=['zap','briefcase','coffee','wrench','file-spreadsheet'];
    $('#templatesGrid').innerHTML=state.templates.map((t,i)=>`<article class="template-card"><div class="template-top"><span class="template-icon"><span data-icon="${icons[i%icons.length]}"></span></span><span class="pill soft">${formatHours(t.minutes)}</span></div><h3>${escapeHtml(t.name)}</h3><p>${escapeHtml(t.note||t.category||'Быстрая запись времени')}</p><div class="template-meta">${t.category?`<span>${escapeHtml(t.category)}</span>`:'<span>Без категории</span>'}</div><div class="template-actions"><button class="primary-button template-main" data-use-template="${t.id}">Добавить</button><button class="row-action" data-edit-template="${t.id}" aria-label="Редактировать"><span data-icon="edit"></span></button><button class="row-action" data-delete-template="${t.id}" aria-label="Удалить"><span data-icon="trash"></span></button></div></article>`).join('');
    setIcons($('#templatesGrid'));
    $$('[data-use-template]').forEach(btn=>btn.addEventListener('click',()=>{const t=state.templates.find(x=>x.id===btn.dataset.useTemplate);openRecordModal(null,state.selectedDate,t);}));
    $$('[data-edit-template]').forEach(btn=>btn.addEventListener('click',()=>openTemplateModal(state.templates.find(x=>x.id===btn.dataset.editTemplate))));
    $$('[data-delete-template]').forEach(btn=>btn.addEventListener('click',()=>deleteTemplateUi(btn.dataset.deleteTemplate)));
  }

  function renderSettings() {
    $('#settingsNorm').value=(Number(state.settings.dailyNormMinutes)||480)/60;
    $('#settingsAppName').value=state.settings.appName||'Work Time';
    $('#workdaysPicker').innerHTML=[['Пн',1],['Вт',2],['Ср',3],['Чт',4],['Пт',5],['Сб',6],['Вс',7]].map(([label,n])=>`<button type="button" class="workday-chip ${state.settings.workdays.includes(n)?'active':''}" data-workday="${n}">${label}</button>`).join('');
    $$('#workdaysPicker .workday-chip').forEach(btn=>btn.addEventListener('click',()=>{btn.classList.toggle('active');}));
    renderBackups();
  }
  function syncSettingsToUi() { if($('#settingsNorm')) renderSettings(); }
  async function saveSettingsUi() {
    try {
      if(state.mode!=='google') throw new Error('Сначала войдите через Google.');
      const norm=Math.round(parseFloat($('#settingsNorm').value.replace(',','.'))*60);
      if(!Number.isFinite(norm)||norm<0||norm>1440) throw new Error('Дневная норма должна быть от 0 до 24 часов.');
      const workdays=$$('#workdaysPicker .workday-chip.active').map(x=>Number(x.dataset.workday));
      const appName=$('#settingsAppName').value.trim()||'Work Time';
      state.settings={...state.settings,dailyNormMinutes:norm,workdays,appName};
      await store.saveSettings({dailyNormMinutes:norm,workdays,appName});
      renderAll(); renderConnection(); toast('Настройки сохранены в Google Sheets.');
    } catch(e) { toast(e.message,true); }
  }

  async function createBackup() {
    try {
      const text=store.backupPayload(); const stamp=new Date().toISOString().replace(/[:.]/g,'-'); const name=`work-time-backup_${stamp}.json`;
      downloadBlob(new Blob([text],{type:'application/json'}),name);
      localStorage.setItem('workTime.lastBackupAt',new Date().toISOString());
      if(state.mode==='google' && state.connected){
        await googleClient.uploadJson(name,text); await renderBackups(); toast('Backup сохранён на устройство и в Google Drive');
      } else {
        toast('Backup скачан на устройство.');
      }
    } catch(e) { toast(e.message,true); }
  }
  async function renderBackups() {
    if(state.mode!=='google' || !state.connected){
      $('#backupList').innerHTML='<div class="empty-state">Войдите через Google, чтобы использовать резервные копии.</div>';
      return;
    }
    try { const files=await googleClient.listBackups(); $('#backupList').innerHTML=files.length?files.map(f=>`<div class="backup-item"><div class="backup-copy"><strong>${escapeHtml(f.name)}</strong><span>${formatDate(f.createdTime?.slice(0,10)||localDate(),{day:'2-digit',month:'short',year:'numeric'})}</span></div><button class="row-action" data-drive-restore="${f.id}" aria-label="Восстановить"><span data-icon="upload"></span></button></div>`).join(''):'<div class="empty-state">В Drive пока нет backup-файлов.</div>'; setIcons($('#backupList')); $$('#backupList [data-drive-restore]').forEach(btn=>btn.addEventListener('click',()=>restoreDriveBackup(btn.dataset.driveRestore))); }
    catch(e){ $('#backupList').innerHTML=`<div class="empty-state">Не удалось загрузить список backup: ${escapeHtml(e.message)}</div>`; }
  }
  async function restoreDriveBackup(id) {
    if(!confirm('Восстановить эту резервную копию? Текущие данные будут заменены.')) return;
    try { const text=await googleClient.readDriveFile(id); await createSafetyBackup(); await store.restore(JSON.parse(text)); toast('Данные восстановлены из Google Drive'); renderAll(); } catch(e){toast(e.message,true);} }
  async function createSafetyBackup() {
    try {
      const text=store.backupPayload();
      if(state.mode==='google' && state.connected){ const name=`work-time-safety_${new Date().toISOString().replace(/[:.]/g,'-')}.json`; await googleClient.uploadJson(name,text); }
      else localStorage.setItem('workTime.safetyBackup',text);
    } catch {}
  }
  async function restoreLocalBackup(e) {
    const file=e.target.files?.[0]; e.target.value=''; if(!file)return;
    if(!confirm('Восстановить эту копию? Перед восстановлением будет создана страховочная копия текущих данных.'))return;
    try { const text=await file.text(); await createSafetyBackup(); await store.restore(JSON.parse(text)); toast('Данные восстановлены'); renderAll(); } catch(err){toast(err.message,true);} }

  async function exportExcel() {
    try {
      if(state.mode==='google' && state.connected){
        const blob=await googleClient.exportXlsx(state.spreadsheetId); downloadBlob(blob,`work-time_${state.month}.xlsx`); toast('Excel-файл скачан'); return;
      }
      if(state.mode!=='google' || !state.connected) throw new Error('Сначала войдите через Google.');
      if(!window.XLSX) throw new Error('Модуль Excel ещё не загрузился. Обновите страницу и повторите.');
      const wb=XLSX.utils.book_new();
      const recordRows=[HEADERS.records,...state.records.map(r=>HEADERS.records.map(k=>r[k]??''))];
      const dayRows=[HEADERS.days,...state.days.map(r=>HEADERS.days.map(k=>r[k]??''))];
      const settingRows=[HEADERS.settings,['dailyNormMinutes',state.settings.dailyNormMinutes],['workdays',state.settings.workdays.join(',')],['appName',state.settings.appName],['currency','hours']];
      const templateRows=[HEADERS.templates,...state.templates.map(r=>HEADERS.templates.map(k=>r[k]??''))];
      XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(recordRows),'Records');
      XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(dayRows),'Days');
      XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(settingRows),'Settings');
      XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(templateRows),'TaskTemplates');
      XLSX.writeFile(wb,`work-time_${state.month}.xlsx`); toast('Excel-файл скачан');
    } catch(e){toast(e.message,true);} }

  function openRecordModal(record=null,date=state.selectedDate,template=null) {
    const r=record||{date,task:template?.name||'',category:template?.category||'',minutes:template?.minutes||60,jiraMinutes:0,note:template?.note||''};
    const templateOptions=`<option value="">Шаблон…</option>${state.templates.map(t=>`<option value="${t.id}">${escapeHtml(t.name)} · ${formatHours(t.minutes)}</option>`).join('')}`;
    openModal(`<div class="form-grid"><label class="field-label">Дата<input id="recordDate" class="field" type="date" value="${escapeAttr(r.date||date)}"></label><label class="field-label">Шаблон<select id="recordTemplate" class="field">${templateOptions}</select></label></div><label class="field-label">Задача<input id="recordTask" class="field" value="${escapeAttr(r.task||'')}" placeholder="Например: подготовка отчёта" autofocus></label><div class="form-grid"><label class="field-label">Категория<input id="recordCategory" class="field" list="categoryList" value="${escapeAttr(r.category||'')}" placeholder="Разработка"><datalist id="categoryList"><option>Разработка</option><option>Встречи</option><option>Поддержка</option><option>Аналитика</option><option>Документация</option></datalist></label><label class="field-label">Время<input id="recordMinutes" class="field" value="${durationInput(r.minutes||60)}" placeholder="1:30"></label></div><div class="form-grid"><label class="field-label">Списано в Jira<input id="recordJira" class="field" value="${durationInput(r.jiraMinutes||0)}" placeholder="0:30"></label><label class="field-label">Комментарий<input id="recordNote" class="field" value="${escapeAttr(r.note||'')}" placeholder="Необязательно"></label></div><p style="margin:8px 0 0;color:#9ca3b2;font-size:10px">Формат длительности: <strong>1:30</strong> или <strong>1.5</strong> часа.</p><div class="modal-actions"><button class="secondary-button" data-close-modal>Отмена</button><button class="primary-button" id="saveRecordBtn"><span data-icon="check"></span> Сохранить</button></div>`,record?'Редактировать запись':'Новая запись');
    $('#recordTemplate').addEventListener('change',e=>{const t=state.templates.find(x=>x.id===e.target.value);if(!t)return;$('#recordTask').value=t.name;$('#recordCategory').value=t.category||'';$('#recordMinutes').value=durationInput(t.minutes);$('#recordNote').value=t.note||'';});
    $('[data-close-modal]').addEventListener('click',closeModal);
    $('#saveRecordBtn').addEventListener('click',async()=>{
      try{setBusyButton('#saveRecordBtn',true);const payload={...r,id:r.id,date:$('#recordDate').value,task:$('#recordTask').value.trim(),category:$('#recordCategory').value.trim(),minutes:parseDuration($('#recordMinutes').value),jiraMinutes:parseDuration($('#recordJira').value),note:$('#recordNote').value.trim()};await store.saveRecord(payload);closeModal();state.selectedDate=payload.date;state.month=payload.date.slice(0,7);$('#monthPicker').value=state.month;toast(record?'Запись обновлена':'Время записано');renderAll();}catch(e){toast(e.message,true);}finally{setBusyButton('#saveRecordBtn',false);}
    });
  }
  async function deleteRecordUi(id) { if(!confirm('Удалить эту запись?'))return; try{await store.deleteRecord(id);toast('Запись удалена');renderAll();}catch(e){toast(e.message,true);} }

  function openTemplateModal(template=null) {
    const t=template||{name:'',category:'',minutes:60,note:''};
    openModal(`<label class="field-label">Название<input id="templateName" class="field" value="${escapeAttr(t.name)}" autofocus></label><div class="form-grid"><label class="field-label">Категория<input id="templateCategory" class="field" value="${escapeAttr(t.category||'')}"></label><label class="field-label">Время по умолчанию<input id="templateMinutes" class="field" value="${durationInput(t.minutes||60)}"></label></div><label class="field-label">Комментарий<input id="templateNote" class="field" value="${escapeAttr(t.note||'')}"></label><div class="modal-actions"><button class="secondary-button" data-close-modal>Отмена</button><button class="primary-button" id="saveTemplateBtn"><span data-icon="check"></span> Сохранить</button></div>`,template?'Редактирование шаблона':'Новый шаблон');
    $('[data-close-modal]').addEventListener('click',closeModal);
    $('#saveTemplateBtn').addEventListener('click',async()=>{try{setBusyButton('#saveTemplateBtn',true);await store.saveTemplate({id:t.id,name:$('#templateName').value.trim(),category:$('#templateCategory').value.trim(),minutes:parseDuration($('#templateMinutes').value),note:$('#templateNote').value.trim()});closeModal();renderAll();toast('Шаблон сохранён');}catch(e){toast(e.message,true);}finally{setBusyButton('#saveTemplateBtn',false);}});
  }
  async function deleteTemplateUi(id) { if(!confirm('Удалить шаблон?'))return; try{await store.deleteTemplate(id);renderAll();toast('Шаблон удалён');}catch(e){toast(e.message,true);} }

  function setBusyButton(selector,busy) { const b=$(selector); if(!b)return; b.disabled=busy; b.style.opacity=busy?.65:1; }

  function updateTimerUi() {
    const t=state.timer; const elapsed=t.elapsed+(t.running?Date.now()-t.startedAt:0); const h=Math.floor(elapsed/3600000),m=Math.floor((elapsed%3600000)/60000),s=Math.floor((elapsed%60000)/1000);
    $('#timerValue').textContent=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    $('#timerLive').textContent=t.running?'Идёт запись':'Готово'; $('#timerLive').classList.toggle('on',t.running);
    $('#timerButton').classList.toggle('stop',t.running); $('#timerButton').innerHTML=`<span data-icon="${t.running?'square':'play'}"></span><span>${t.running?'Стоп':'Старт'}</span>`; setIcons($('#timerButton'));
    if(t.running) requestAnimationFrame(updateTimerUi);
  }
  async function toggleTimer() {
    if(!state.timer.running){state.timer.running=true;state.timer.startedAt=Date.now();$('#timerTemplate').disabled=true;updateTimerUi();return;}
    state.timer.elapsed += Date.now()-state.timer.startedAt; state.timer.running=false; $('#timerTemplate').disabled=false; const minutes=Math.max(1,Math.round(state.timer.elapsed/60000)); const tid=$('#timerTemplate').value; const temp=state.templates.find(x=>x.id===tid); state.timer={running:false,startedAt:0,elapsed:0}; updateTimerUi(); openRecordModal(null,state.selectedDate,temp?{...temp,minutes}:null); setTimeout(()=>{$('#recordMinutes').value=durationInput(minutes);},30);
  }
  function resetTimer(){state.timer={running:false,startedAt:0,elapsed:0};localStorage.removeItem('workTime.timer');$('#timerTemplate').disabled=false;updateTimerUi();}
  function initTimer() { const saved=JSON.parse(localStorage.getItem('workTime.timer')||'null'); if(saved?.running&&saved.startedAt){state.timer=saved;} setInterval(()=>{if(state.timer.running)localStorage.setItem('workTime.timer',JSON.stringify(state.timer));},1000); $('#timerButton').addEventListener('click',toggleTimer); $('#timerReset').addEventListener('click',resetTimer); $('#timerTemplate').addEventListener('change',e=>localStorage.setItem('workTime.timerTemplate',e.target.value)); const t=localStorage.getItem('workTime.timerTemplate');if(t)$('#timerTemplate').value=t; }
  function syncTemplateSelect(){ $('#timerTemplate').innerHTML='<option value="">Выберите задачу</option>'+state.templates.map(t=>`<option value="${t.id}">${escapeHtml(t.name)}</option>`).join(''); const saved=localStorage.getItem('workTime.timerTemplate');if(saved)$('#timerTemplate').value=saved; }

  function plural(n,a,b,c){const n1=Math.abs(n)%10,n2=Math.abs(n)%100;return n1===1&&n2!==11?a:n1>=2&&n1<=4&&(n2<10||n2>=20)?b:c;}
  function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);}

  async function boot() {
    setIcons(); bindNavigation(); initTimer();
    $('#monthPicker').value=state.month;
    $('#pageDate').textContent=new Intl.DateTimeFormat('ru-RU',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
    $('#brandTitle').textContent=config().appTitle||'Work Time';$('#mobileTitle').textContent=config().appTitle||'Work Time';document.title=config().appTitle||'Work Time';
    state.mode='auth'; state.connected=false; store=googleStore;
    renderAll(); renderConnection();
    showAuthGate(true);
    if(!config().googleClientId){
      showAuthGate(true,'Владелец приложения ещё не указал OAuth Client ID в config.js.');
      setLoader('Требуется настройка владельца','Сначала добавьте Client ID в config.js.',true);
    } else {
      setLoader('Work Time готов','Нажмите «Войти через Google», чтобы начать.',true);
    }
    $('#app').classList.remove('is-booting');
  }

  // Public fallback: allow adding an export button to the Settings card without rebuilding HTML.
  document.addEventListener('DOMContentLoaded',()=>{
    const backupPanel=$('#backupList')?.closest('.settings-panel');
    if(backupPanel && !$('#exportExcelButton')){
      const row=backupPanel.querySelector('.button-row');
      const btn=document.createElement('button');btn.className='secondary-button';btn.id='exportExcelButton';btn.innerHTML='<span data-icon="file-spreadsheet"></span> Экспорт Excel';row?.appendChild(btn);btn.addEventListener('click',exportExcel);setIcons(btn);
    }
    boot();
  });
})();
