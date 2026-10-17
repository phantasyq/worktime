/* Russian five-day production calendar. Online data is refreshed from isdayoff.ru
 * and cached locally; a built-in official-date fallback keeps the app usable offline. */
(() => {
  'use strict';
  const API = 'https://isdayoff.ru/api/getdata';
  const CACHE_PREFIX = 'workTime.productionCalendar.ru.';
  const CACHE_TTL = 12 * 60 * 60 * 1000;
  const MONTH_NAMES = {
    '01-01':'Новогодние каникулы','01-02':'Новогодние каникулы','01-03':'Новогодние каникулы',
    '01-04':'Новогодние каникулы','01-05':'Новогодние каникулы','01-06':'Новогодние каникулы',
    '01-07':'Рождество Христово','01-08':'Новогодние каникулы','02-23':'День защитника Отечества',
    '03-08':'Международный женский день','05-01':'Праздник Весны и Труда',
    '05-09':'День Победы','06-12':'День России','11-04':'День народного единства'
  };
  // Official transfer dates for years published in government resolutions.
  const OFFICIAL = {
    2024: {
      off: ['01-01','01-02','01-03','01-04','01-05','01-08','02-23','03-08','04-29','04-30','05-01','05-09','05-10','06-12','11-04','12-30','12-31'],
      work: ['04-27','11-02','12-28']
    },
    2025: {
      off: ['01-01','01-02','01-03','01-06','01-07','01-08','05-01','05-02','05-08','05-09','06-12','06-13','11-03','11-04','12-31'],
      work: ['11-01']
    },
    2026: {
      off: ['01-01','01-02','01-05','01-06','01-07','01-08','01-09','02-23','03-09','05-01','05-11','06-12','11-04','12-31'],
      work: []
    },
    2027: {
      off: ['01-01','01-04','01-05','01-06','01-07','01-08','02-22','02-23','03-08','05-03','05-10','06-14','11-04','11-05','12-31'],
      work: ['02-20']
    }
  };
  const memory = new Map();
  const inflight = new Map();
  function isLeap(year) { return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0); }
  function dayOfYear(iso) {
    const [year, month, day] = iso.split('-').map(Number);
    const before = [0,31,isLeap(year)?60:59, isLeap(year)?91:90, isLeap(year)?121:120, isLeap(year)?152:151, isLeap(year)?182:181, isLeap(year)?213:212, isLeap(year)?244:243, isLeap(year)?274:273, isLeap(year)?305:304, isLeap(year)?335:334];
    return before[month - 1] + day;
  }
  function isoWeekday(iso) {
    const [y,m,d] = iso.split('-').map(Number);
    const day = new Date(y,m-1,d).getDay();
    return day === 0 ? 7 : day;
  }
  function isoFromParts(year, month, day) { return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`; }
  function cached(year) {
    if (memory.has(year)) return memory.get(year);
    try {
      const value = JSON.parse(localStorage.getItem(`${CACHE_PREFIX}${year}`) || 'null');
      if (value && typeof value.codes === 'string' && value.codes.length === (isLeap(year) ? 366 : 365) && /^[01248]+$/.test(value.codes)) {
        const entry = {...value, source:value.source==='online'?'online':'cache'};
        memory.set(year, entry);
        return entry;
      }
    } catch {}
    return null;
  }
  function genericFallback(iso) {
    const year = Number(iso.slice(0,4));
    const md = iso.slice(5);
    const weekday = isoWeekday(iso);
    const known = OFFICIAL[year];
    if (known) {
      if (known.work.includes(md)) return {working:true, code:'0', source:'built-in', reason:'Рабочий день по переносу'};
      if (known.off.includes(md)) return {working:false, code:'1', source:'built-in', reason:MONTH_NAMES[md] || 'Перенос выходного дня'};
      if ([6,7].includes(weekday)) return {working:false, code:'1', source:'built-in', reason:'Выходной по производственному календарю'};
      return {working:true, code:'0', source:'built-in', reason:''};
    }
    // Fallback for years whose official transfer resolution is not embedded yet:
    // use statutory dates and normal weekends. Live data is fetched automatically when available.
    const fixed = new Set(Object.keys(MONTH_NAMES));
    if ([6,7].includes(weekday)) return {working:false, code:'1', source:'fallback', reason:'Выходной по производственному календарю'};
    if (fixed.has(md)) return {working:false, code:'1', source:'fallback', reason:MONTH_NAMES[md]};
    // For non-January statutory holidays falling on weekends, the next weekday is normally made a day off.
    for (const holiday of ['02-23','03-08','05-01','05-09','06-12','11-04']) {
      const [hm,hd] = holiday.split('-').map(Number);
      const hIso = isoFromParts(year,hm,hd);
      if (![6,7].includes(isoWeekday(hIso))) continue;
      let candidate = new Date(year,hm-1,hd);
      candidate.setDate(candidate.getDate()+1);
      for (let guard=0;guard<10;guard++,candidate.setDate(candidate.getDate()+1)) {
        const key=isoFromParts(candidate.getFullYear(),candidate.getMonth()+1,candidate.getDate());
        if ([6,7].includes(isoWeekday(key)) || fixed.has(key.slice(5))) continue;
        if (key===iso) return {working:false,code:'1',source:'fallback',reason:'Перенос выходного дня'};
        break;
      }
    }
    return {working:true, code:'0', source:'fallback', reason:''};
  }
  function status(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return {working:false,code:'1',source:'invalid',reason:'Некорректная дата'};
    const year=Number(iso.slice(0,4));
    const entry=cached(year);
    if (entry) {
      const code=entry.codes.charAt(dayOfYear(iso)-1);
      const working=['0','2','4'].includes(code); // 2 = shortened; this app's contractual norm stays 8h.
      const md=iso.slice(5);
      return {working,code,source:entry.source||'cache',reason:working?'':MONTH_NAMES[md]||genericFallback(iso).reason||'Нерабочий день по производственному календарю'};
    }
    return genericFallback(iso);
  }
  async function refreshYear(year, options={}) {
    year=Number(year);
    if (!Number.isInteger(year)||year<1900||year>2200) return false;
    const current=cached(year);
    if (current && !options.force && Date.now()-(current.updatedAt||0)<CACHE_TTL) return false;
    if (inflight.has(year)) return inflight.get(year);
    const task=(async()=>{
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),4500);
      try {
        const url=`${API}?year=${year}&cc=ru&pre=1`;
        const response=await fetch(url,{signal:controller.signal,cache:'no-store',mode:'cors'});
        if (!response.ok) throw new Error(`Production calendar HTTP ${response.status}`);
        const codes=(await response.text()).trim();
        const expected=isLeap(year)?366:365;
        if (codes.length!==expected || !/^[01248]+$/.test(codes)) throw new Error('Invalid production calendar response');
        const previous=current?.codes||'';
        const entry={year,codes,updatedAt:Date.now(),source:'online'};
        memory.set(year,entry);
        try { localStorage.setItem(`${CACHE_PREFIX}${year}`,JSON.stringify(entry)); } catch {}
        return previous!==codes || current?.source!=='online';
      } catch { return false; }
      finally { clearTimeout(timeout); }
    })().finally(()=>inflight.delete(year));
    inflight.set(year,task);
    return task;
  }
  function statusText(year) {
    const entry=cached(Number(year));
    if (entry?.source==='online') return `Календарь ${year} загружен автоматически${entry.updatedAt?` · обновлён ${new Intl.DateTimeFormat('ru-RU',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(entry.updatedAt))}`:''}.`;
    if (entry) return `Используется сохранённый календарь ${year}; при подключении к сети он сверяется автоматически.`;
    return OFFICIAL[Number(year)] ? `Встроенный календарь РФ на ${year}; при наличии сети будет автоматически сверяться с актуальными данными.` : `Пока используется базовый календарь РФ для ${year}; при наличии сети загрузятся официальные переносы.`;
  }
  window.ProductionCalendar={status,refreshYear,statusText,isLeap};
})();
