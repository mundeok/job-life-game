// 직업 인생게임 - 성장기 시제품 (8~19살, 한 학기 = 1턴, 24턴)
'use strict';

const SAVE_KEY = 'jlg_save_v2';
const BOOK_KEY = 'jlg_book_v1';
const TURNS = 24;
const HAND = 6;          // 학기마다 받는 활동 카드 수
const ACT_SCALE = 0.7;   // 기본 활동 효과 배율
const LUCK_AT = { 11: '초등학교 졸업', 17: '중학교 졸업', 23: '고등학교 졸업' }; // 이 턴이 끝나면 행운 카드

const $app = document.getElementById('app');
let S = null;          // 현재 게임 상태 (저장됨)
let B = loadBook();    // 여러 판에 걸쳐 남는 도감
let UI = {};           // 저장하지 않는 화면 상태

// ---------- 저장 ----------
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
function loadSave() { try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return null; } }
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }
function loadBook() {
  let b = null;
  try { b = JSON.parse(localStorage.getItem(BOOK_KEY)); } catch (e) {}
  return Object.assign({ jobs: {}, titles: {}, quiz: 0, plays: 0 }, b || {});
}
function saveBook() { try { localStorage.setItem(BOOK_KEY, JSON.stringify(B)); } catch (e) {} }

// ---------- 도우미 ----------
const rnd = n => Math.floor(Math.random() * n);
const pick = arr => arr[rnd(arr.length)];
const shuffle = arr => arr.slice().sort(() => Math.random() - 0.5);
const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const statName = id => (STATS.find(x => x.id === id) || LIFE.find(x => x.id === id) || {}).name || id;
const statIcon = id => (STATS.find(x => x.id === id) || LIFE.find(x => x.id === id) || {}).icon || '';
const job = id => JOBS.find(j => j.id === id) || HIDDEN_JOBS.find(j => j.id === id);
const actOf = id => ACTIVITIES.find(a => a.id === id);
const limOf = id => LIMITED.find(a => a.id === id);
const cardDef = c => c.type === 'lim' ? limOf(c.id) : actOf(c.id);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const hasCard = c => S.cards.includes(c);
const hasCombo = (a, b) => hasCard(a) && hasCard(b);
function toast(t) {
  const el = document.getElementById('toast');
  el.textContent = t; el.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2200);
}
function ageOf(turn) { return 8 + Math.floor(turn / 2); }
function semOf(turn) { return (turn % 2) + 1; }
function schoolLabel(age) {
  if (age <= 13) return `초등학교 ${age - 7}학년`;
  if (age <= 16) return `중학교 ${age - 13}학년`;
  return `고등학교 ${age - 16}학년`;
}
function semTag(age, sem) {
  if (age === 14) return '자유학기제';
  if (age === 19) return '고3 · 진로 결정';
  if (sem === 1 && (age === 13 || age === 16 || age === 18)) return '수학여행 학기';
  return sem === 1 ? '봄 학기' : '가을 학기';
}
function avatar(age) { return age <= 9 ? '🧒' : age <= 13 ? '👦' : age <= 16 ? '🧑' : '🧑‍🎓'; }
function fill(text, ctx) {
  ctx = ctx || {};
  const fi = ctx.friend != null ? ctx.friend : (S.cur && S.cur.friend != null ? S.cur.friend : 0);
  const f = S.friends[fi];
  return String(text)
    .replace(/\{name\}/g, S.name)
    .replace(/\{friend\}/g, f ? f.name : '친구')
    .replace(/\{friendDream\}/g, f ? job(f.dream).name : '')
    .replace(/\{dream\}/g, S.dream ? job(S.dream).name : '꿈')
    .replace(/\{pet\}/g, S.pet || '반려동물')
    .replace(/\{job\}/g, ctx.job ? job(ctx.job).name : '');
}
function discover(id) {
  if (!id) return false;
  const isNew = !B.jobs[id];
  B.jobs[id] = true; saveBook();
  if (isNew) note(`📘 직업 도감에 "${job(id).name}" 등록!`);
  return isNew;
}
function note(t) { if (S && S.rep) S.rep.notes.push(t); }
function newRep() { return { stories: [], msgs: [], notes: [], st: {}, life: {} }; }

// ---------- 능력치 변화 ----------
function mult(stat) {
  let m = 1;
  if (stat === 'detail' && hasCard('careful')) m += 0.15;
  if (stat === 'detail' && hasCard('neat')) m += 0.15;
  if (stat === 'lead' && hasCard('active')) m += 0.15;
  if (stat === 'inquiry' && hasCard('calm')) m += 0.15;
  if ((stat === 'inquiry' || stat === 'creative') && hasCard('curious')) m += 0.1;
  if (stat === 'care' && hasCard('warm')) m += 0.15;
  if (stat === 'creative' && hasCard('imaginative')) m += 0.15;
  if (stat === 'inquiry' && hasCombo('curious', 'neat')) m += 0.2;
  if (stat === S.talent) m *= (S.genius && !S.talentSleep) ? 1.6 : 1.25;
  if (S.life.happy < 30) m *= 0.8;
  return m;
}
// 높을수록 천천히 오른다: 0~39 그대로, 40~69는 70%, 70 이상은 40%
function slow(v) { return v < 40 ? 1 : v < 70 ? 0.7 : 0.4; }
function addStat(stat, v, extra = 1) {
  if (!v) return;
  const before = S.stats[stat];
  let gain = v;
  if (v > 0) {
    const x = v * mult(stat) * extra * slow(before);
    gain = Math.floor(x) + (Math.random() < x - Math.floor(x) ? 1 : 0);
  }
  S.stats[stat] = clamp(before + gain);
  const d = S.stats[stat] - before;
  if (S.rep && d) S.rep.st[stat] = (S.rep.st[stat] || 0) + d;
}
function addLife(k, v) {
  if (!v) return;
  if (k === 'happy' && v < 0 && hasCard('funny')) v = Math.ceil(v / 2);
  const before = S.life[k];
  S.life[k] = clamp(before + v, 0, k === 'money' ? 999 : 100);
  const d = S.life[k] - before;
  if (S.rep && d) S.rep.life[k] = (S.rep.life[k] || 0) + d;
  if (k === 'social' && v > 0 && S.rep) S.rep.socialUp = true;
}
function addFriend(i, v) {
  const f = S.friends[i]; if (!f || !v) return;
  if (v > 0 && hasCard('warm')) v = Math.round(v * 1.3);
  f.score = clamp(f.score + v);
}
function applyEff(e, ctx = {}) {
  if (!e) return;
  for (const k in e.st || {}) addStat(k, e.st[k]);
  for (const k in e.life || {}) addLife(k, e.life[k]);
  if (e.friend) addFriend(ctx.friend != null ? ctx.friend : 0, e.friend);
  if (e.dream && S.dream) { const j = job(S.dream); addStat(j.main, e.dream); addStat(j.sub, Math.ceil(e.dream / 2)); }
  else if (e.dream) addStat(topStat(), e.dream);
  if (e.talent) addStat(S.talent, e.talent);
  if (e.energy) S.energyBonus += e.energy;
  if (e.flag) S.flags[e.flag] = true;
  if (e.unflag) delete S.flags[e.unflag];
  if (e.discover) discover(e.discover);
}
function topStat() { return STATS.map(x => x.id).sort((a, b) => S.stats[b] - S.stats[a])[0]; }
function mainStatOf(def) {
  const ks = Object.keys(def.st || {}); if (!ks.length) return null;
  return ks.sort((x, y) => def.st[y] - def.st[x])[0];
}
function activeFriends() { return S.friends.map((f, i) => i).filter(i => !S.friends[i].moved); }

// ---------- 새 게임 ----------
function newGame(setup) {
  const talent = pick(STATS).id;
  const genius = Math.random() < 0.005; // 0.5%
  const region = pick(REGIONS);
  const rare = Math.random() < 0.25;
  const fam = pick(FAMILIES.filter(f => !!f.rare === rare));
  const stats = {}; STATS.forEach(x => stats[x.id] = 8 + rnd(4));
  const life = { health: 70, happy: 65, social: 50, money: 10 };
  for (const k in region.bonus) stats[k] += region.bonus[k];
  for (const k in fam.bonus) (k in stats ? stats : life)[k] += fam.bonus[k];
  if (genius) stats[talent] += 15;
  const names = shuffle(FRIEND_NAMES).filter(n => n !== setup.name).slice(0, 3);
  const friends = names.map(n => ({ name: n, dream: pick(JOBS).id, score: 40 + rnd(16) }));
  S = {
    v: 2, name: setup.name, gender: setup.gender, childDream: setup.childDream,
    cards: setup.cards.slice(), startCards: setup.cards.length, region: region.id, family: fam.id,
    talent, genius, talentFound: false, talentSleep: false, noTalentTurns: 0, talentActs: 0,
    stats, startStats: Object.assign({}, stats), life, friends, bf: null,
    turn: 0, energyBonus: 0, dream: null, dreamChanges: 0, dreamTurn: -1,
    counts: {}, consec: {}, streakNow: 0, maxStreak: 0, lastActs: [], recent: [],
    flags: {}, seen: {}, lastEvent: null, lastThought: -99, pet: null, capsule: null,
    luckTickets: 0, legend: false, fights: 0, fightsOk: 0,
    happySum: 0, healthSum: 0, log: [], feed: [], hand: null, kept: null, lastRep: null,
    rep: null, cur: null, phase: 'birth',
  };
  S.log.push({ age: 8, t: `${region.icon} ${region.name}에서 태어남 · ${fam.name}` });
  S.feed.push({ age: 8, sem: 0, label: '탄생', lines: [`${region.name}의 ${fam.name}에서 ${S.name}이(가) 태어났다.`, `${friends.map(f => f.name).join(', ')}와(과) 함께 자라게 됐다.`] });
  if (genius) S.log.push({ age: 8, t: '💎 빛나는 재능을 가지고 태어남' });
  B.plays++; saveBook();
  save();
}

// ---------- 화면 그리기 ----------
function render() {
  if (!S || UI.screen === 'title') return renderTitle();
  if (UI.screen === 'book') return renderBook();
  if (S.phase === 'end') return renderEnd();
  if (S.phase === 'birth') return renderBirth();
  renderGame();
}

function renderTitle() {
  const has = !!loadSave();
  $app.innerHTML = `
  <div class="screen"><div class="hero">
    <div class="logo">🌱</div>
    <h1>직업 인생게임</h1>
    <p>한국의 어느 마을에서 태어나 8살부터 19살까지 살아 보며<br>어떤 노력이 어떤 꿈으로 이어지는지 알아봐요.</p>
    <div class="btns">
      <button class="btn orange" data-a="start">🍼 새로 태어나기</button>
      ${has ? '<button class="btn" data-a="continue">▶ 이어 하기</button>' : ''}
      <button class="btn ghost" data-a="book">📖 도감 보기</button>
    </div>
    <p class="muted" style="font-size:15px;margin-top:28px">성장기 시제품 · 진로 준비, 직업 생활, 은퇴 후 단계는 다음 시제품에서 이어져요</p>
  </div></div>`;
}

// 설정: 이름·성별 → 어릴 적 꿈 → 질문 5개 → 탄생
function renderSetup() {
  const st = UI.setup;
  const dots = `<div class="step-dots">${[0, 1, 2, 3, 4, 5, 6].map(i => `<i class="${i <= st.step ? 'on' : ''}"></i>`).join('')}</div>`;
  let body = '';
  if (st.step === 0) {
    body = `<div class="card"><h2>나는 누구일까요?</h2>
      <div class="field"><label for="nm">이름</label><input id="nm" maxlength="8" placeholder="이름을 적어요" value="${esc(st.name || '')}"></div>
      <div class="field"><label>성별</label><div class="choice-grid">
        ${['여자', '남자'].map(g => `<button class="choice ${st.gender === g ? 'on' : ''}" data-a="gender" data-v="${g}">${g}</button>`).join('')}
      </div><small class="muted">성별은 군 복무 이벤트에만 쓰이고, 어떤 직업이든 똑같이 도전할 수 있어요.</small></div>
      <div class="row" style="justify-content:flex-end"><button class="btn" data-a="setupNext">다음</button></div></div>`;
  } else if (st.step === 1) {
    body = `<div class="card"><h2>어릴 적 꿈은 무엇인가요?</h2>
      <p class="muted">지금 떠오르는 꿈을 골라요. 엔딩에서 실제 인생과 비교해 볼 거예요.</p>
      <div class="choice-grid">
        ${JOBS.map(j => `<button class="choice ${st.childDream === j.id ? 'on' : ''}" data-a="childDream" data-v="${j.id}"><span class="ic">${j.icon}</span>${j.name}</button>`).join('')}
        <button class="choice ${st.childDream === 'none' ? 'on' : ''}" data-a="childDream" data-v="none"><span class="ic">❓</span>아직 몰라요</button>
      </div>
      <div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn" data-a="setupNext" ${st.childDream ? '' : 'disabled'}>다음</button></div></div>`;
  } else {
    const qi = st.step - 2, q = QUESTIONS[qi];
    body = `<div class="card"><p class="muted">"나는 이런 아이" 질문 ${qi + 1} / ${QUESTIONS.length}</p><h2>${q.q}</h2>
      <div class="answer-list">${q.a.map((a, i) => `<button class="choice" data-a="answer" data-v="${i}">${a.t}</button>`).join('')}</div></div>`;
  }
  $app.innerHTML = `<div class="screen">${dots}${body}</div>`;
  const nm = document.getElementById('nm'); if (nm) nm.addEventListener('input', e => st.name = e.target.value.trim());
}

function renderBirth() {
  const r = REGIONS.find(x => x.id === S.region), f = FAMILIES.find(x => x.id === S.family);
  $app.innerHTML = `<div class="screen center">
    <h1>👶 ${esc(S.name)}이(가) 태어났어요!</h1>
    <div class="reveal" style="text-align:left">
      <div class="card"><div class="big-ic">${r.icon}</div><h3>태어난 곳: ${r.name}</h3><p class="muted">${r.desc}</p></div>
      <div class="card"><div class="big-ic">🏠</div><h3>${f.name}</h3><p class="muted">가족과 함께 자라며 첫 경험을 쌓아요.</p></div>
      <div class="card"><div class="big-ic">🃏</div><h3>나의 성격 카드</h3>
        <div class="chips">${S.cards.map(c => `<span class="chip">${CARDS[c].icon} ${CARDS[c].name}</span>`).join('')}</div>
        <p class="muted" style="font-size:15px;margin-top:8px">${S.cards.map(c => CARDS[c].desc).join(' · ')}</p></div>
      <div class="card"><div class="big-ic">👫</div><h3>함께 자랄 친구들</h3>
        ${S.friends.map(fr => `<div>${fr.name} <span class="muted">· 꿈: ${job(fr.dream).name}</span></div>`).join('')}</div>
    </div>
    ${S.genius ? `<div class="card" style="border:3px solid var(--legend);background:#fff6dc;margin-bottom:16px"><h2>💎 빛나는 재능!</h2><p>아주 드물게(0.5%) 특별한 재능을 가지고 태어났어요. 어떤 재능인지는 살면서 알게 돼요. 하지만 재능도 쓰지 않으면 잠들어요!</p></div>` : ''}
    <p class="muted">숨은 재능이 하나 있어요. 어떤 재능인지는 살면서 발견하게 돼요.</p>
    <button class="btn orange" data-a="birthLuck">🎁 탄생 행운 카드 뽑기</button>
  </div>`;
}

function hexSvg(cur, start) {
  const cx = 150, cy = 140, R = 100;
  const pt = (i, v) => { const a = -Math.PI / 2 + i * Math.PI / 3; return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v]; };
  const poly = vals => STATS.map((x, i) => pt(i, clamp(vals[x.id]) / 100).join(',')).join(' ');
  const rings = [0.4, 0.7, 1].map(r => `<polygon points="${STATS.map((x, i) => pt(i, r).join(',')).join(' ')}" fill="none" stroke="#e2ddd1"/>`).join('');
  const axes = STATS.map((x, i) => { const [px, py] = pt(i, 1); return `<line x1="${cx}" y1="${cy}" x2="${px}" y2="${py}" stroke="#e2ddd1"/>`; }).join('');
  const d = (S.lastRep && S.lastRep.st) || {};
  const labels = STATS.map((x, i) => {
    const [px, py] = pt(i, 1.24);
    return `<text x="${px}" y="${py}" text-anchor="middle" font-size="13" fill="#23302b" font-weight="700">${x.icon}${x.short}</text>
            <text x="${px}" y="${py + 15}" text-anchor="middle" font-size="12" fill="#5d6b65">${cur[x.id]}${!start && d[x.id] > 0 ? ` <tspan fill="#3a8d5c" font-weight="700">+${d[x.id]}</tspan>` : ''}</text>`;
  }).join('');
  return `<svg viewBox="0 0 300 290" role="img" aria-label="능력치 육각형">${rings}${axes}
    ${start ? `<polygon points="${poly(start)}" fill="rgba(232,145,58,.15)" stroke="#e8913a" stroke-dasharray="4 3"/>` : ''}
    <polygon class="hex-shape" points="${poly(cur)}" fill="rgba(47,111,94,.28)" stroke="#2f6f5e" stroke-width="2"/>${labels}</svg>`;
}

function dreamProgress() {
  if (!S.dream) return 0;
  const j = job(S.dream);
  return Math.min(1, S.stats[j.main] / UNLOCK.main) * 0.6 + Math.min(1, S.stats[j.sub] / UNLOCK.sub) * 0.4;
}

function hud() {
  const age = ageOf(Math.max(0, S.turn)), sem = semOf(Math.max(0, S.turn));
  const r = REGIONS.find(x => x.id === S.region);
  const when = S.turn < 0 ? '탄생' : `${schoolLabel(age)} · ${sem}학기`;
  const dj = S.dream ? job(S.dream) : null, p = dreamProgress();
  return `<header class="hud">
    <div class="avatar">${S.turn < 0 ? '👶' : avatar(age)}</div>
    <div class="who"><small>${esc(S.name)} · ${r.icon} ${r.name}</small><b>${S.turn < 0 ? '0' : age}<span>살</span></b></div>
    <div class="when"><span>${when}</span>${S.turn >= 0 ? `<em>${semTag(age, sem)}</em>` : ''}<small>${Math.max(0, S.turn + 1)} / ${TURNS} 학기</small></div>
    <div class="grow"></div>
    ${dj ? `<div class="dream-mini"><small>🎯 꿈 · ${dj.icon} ${dj.name}</small><div class="progress"><b style="width:${Math.round(p * 100)}%"></b></div></div>` : '<div class="dream-mini"><small>🎯 꿈 카드는 11살에 받아요</small></div>'}
    <button class="btn small hud-btn" data-a="book" aria-label="도감">📖</button>
    <button class="btn small hud-btn" data-a="home" aria-label="처음으로">🏠</button>
  </header>`;
}

function feedPanel() {
  const items = S.feed.slice(-14);
  const last = items.length - 1;
  return `<section class="feed" id="feed" aria-label="인생 이야기">${items.map((it, i) => `
    <div class="entry ${i === last && UI.freshFeed ? 'new' : ''}"><div class="yr">${it.age}살${it.label ? ` · ${it.label}` : ''}</div>
      ${it.lines.map((l, k) => `<p style="animation-delay:${i === last && UI.freshFeed ? k * 0.35 : 0}s">${l}</p>`).join('')}</div>`).join('')}</section>`;
}

function sidePanel() {
  const combos = COMBOS.filter(c => hasCombo(c.a, c.b));
  const ld = (S.lastRep && S.lastRep.life) || {};
  let road = '';
  if (S.dream) {
    const j = job(S.dream), p = dreamProgress();
    road = `<div class="card dream-box"><h3>🎯 ${j.icon} ${j.name}</h3>
      <div class="muted" style="font-size:13px">필요: ${statIcon(j.main)}${statName(j.main)} ${UNLOCK.main} · ${statIcon(j.sub)}${statName(j.sub)} ${UNLOCK.sub}</div>
      <div class="road">${j.road.map((r, i) => {
        const later = i === 4, done = !later && p >= (i + 1) * 0.2;
        return `<div class="st ${done ? 'done' : ''} ${later ? 'later' : ''}"><i>${done ? '✓' : i + 1}</i>${r}</div>`;
      }).join('')}</div></div>`;
  }
  return `<aside class="side">
    <div class="card"><div class="hex-wrap">${hexSvg(S.stats)}</div></div>
    <div class="card"><div class="lifebars">${LIFE.map(l => {
      const v = S.life[l.id], w = l.id === 'money' ? Math.min(100, v) : v, dd = ld[l.id];
      return `<div class="lifebar ${l.id !== 'money' && v < 30 ? 'low' : ''}"><span>${l.icon} ${l.name}</span><span class="bar"><b style="width:${w}%"></b></span><span>${v}${dd ? `<em class="${dd > 0 ? 'up' : 'down'}">${dd > 0 ? '+' : ''}${dd}</em>` : ''}</span></div>`;
    }).join('')}</div></div>
    ${road}
    <div class="card"><h3>성격 카드</h3><div class="chips">
      ${S.cards.map(c => `<span class="chip" title="${CARDS[c].desc}">${CARDS[c].icon} ${CARDS[c].name}</span>`).join('')}
      ${combos.map(c => `<span class="chip combo" title="${c.desc}">${c.icon} ${c.name}</span>`).join('')}
    </div>${S.talentFound ? `<div style="margin-top:8px;font-size:15px">${S.genius ? '💎' : '🌟'} 재능: ${statName(S.talent)}${S.talentSleep ? ' (잠드는 중)' : ''}</div>` : ''}
    ${S.pet ? `<div style="margin-top:4px;font-size:15px">🐶 반려동물 ${esc(S.pet)}</div>` : ''}</div>
    <div class="card"><h3>친구 (우정)</h3>${S.friends.map((f, i) => `<div class="friend"><span>${f.name}${i === S.bf ? ' 🤞' : ''}${f.moved ? ' ✉️' : ''}</span><span class="hearts">${'♥'.repeat(Math.max(1, Math.ceil(f.score / 20)))} ${f.score}</span></div>`).join('')}</div>
  </aside>`;
}

function renderGame() {
  const fn = PHASES[S.phase];
  $app.innerHTML = `<div class="game2">${hud()}
    <div class="board"><div class="board-main">${feedPanel()}<section class="play" id="play">${fn ? fn() : ''}</section></div>${sidePanel()}</div>
    ${UI.flash ? `<div class="flash"><div><small>${UI.flash.sub}</small><b>${UI.flash.big}</b><span>${UI.flash.tag}</span></div></div>` : ''}</div>`;
  const feed = document.getElementById('feed'); if (feed) feed.scrollTop = feed.scrollHeight;
  UI.freshFeed = false;
}

// ---------- 단계별 화면 ----------
const PHASES = {
  capsule() {
    const c = UI.capsule || (UI.capsule = { job: null, text: '' });
    return `<div class="card event-card"><div class="ic">💌</div><h2>타임캡슐: 미래의 나에게 편지 쓰기</h2>
      <p>10살의 ${esc(S.name)}이(가) 미래의 나에게 편지를 써요. 이 편지는 엔딩에서 열어 볼 거예요.</p>
      <h3>미래의 나는 어떤 일을 하고 있을까?</h3>
      <div class="choice-grid" style="text-align:center">${JOBS.map(j => `<button class="choice ${c.job === j.id ? 'on' : ''}" data-a="capJob" data-v="${j.id}"><span class="ic">${j.icon}</span>${j.name}</button>`).join('')}</div>
      <div class="field" style="margin-top:16px;text-align:left"><label for="capText">하고 싶은 말 (한 줄, 쓰지 않아도 돼요)</label><input id="capText" maxlength="40" value="${esc(c.text)}" placeholder="꿈을 포기하지 마!"></div>
      <button class="btn orange" data-a="capDone" ${c.job ? '' : 'disabled'}>타임캡슐 묻기</button></div>`;
  },
  dream() {
    const sel = UI.dreamSel;
    const reason = S.cur && S.cur.reason ? `<p>${S.cur.reason}</p>` : `<p>11살이 된 ${esc(S.name)}에게 <b>꿈 카드</b>가 생겼어요! 되고 싶은 직업을 골라요. 꿈은 살면서 언제든 바뀔 수 있어요.</p>`;
    return `<div class="card"><h2>🎯 꿈 카드</h2>${reason}
      ${sel ? jobDetail(job(sel)) : '<p class="muted">직업을 누르면 하는 일과 필요한 능력이 여기에 보여요.</p>'}
      ${jobPicker(sel)}
      <div class="sheet-actions">
        ${S.dream && S.cur && S.cur.optional ? '<button class="btn ghost" data-a="dreamKeep">지금 꿈 유지</button>' : ''}
        <button class="btn orange" data-a="dreamSet" ${sel ? '' : 'disabled'}>이 꿈으로 정하기</button></div></div>`;
  },
  plan() {
    const en = energyNow(), chosen = UI.plan || [];
    const left = en - chosen.length;
    const j = S.dream ? job(S.dream) : null;
    const lr = S.lastRep;
    const notes = [S.planNote, ...((lr && lr.notes) || [])].filter(Boolean);
    return `${notes.length ? `<div class="notes">${notes.map(n => `<div class="msg note">${fill(n)}</div>`).join('')}</div>` : ''}
      <div class="hand-head"><h2>이번 학기 손패</h2>
        <div class="energy" aria-label="에너지 ${left}">에너지 ${[...Array(en)].map((_, i) => `<i class="${i < left ? '' : 'off'}"></i>`).join('')}</div></div>
      <p class="muted hint">카드를 눌러 내요. 고르지 않은 카드 1장은 📌로 다음 학기에 가져갈 수 있어요.</p>
      <div class="hand">${S.hand.map(c => cardView(c, j)).join('')}</div>
      <div class="row" style="justify-content:flex-end;margin-top:14px">
      <button class="btn orange" data-a="planGo" ${chosen.length ? '' : 'disabled'}>학기 시작 ▶</button></div>`;
  },
  event() {
    const ev = curEvent();
    const isThought = S.cur.kind === 'thought';
    return `<div class="card event-card ${isThought ? 'thought' : ''}"><div class="ic">${ev.icon}</div>
      ${isThought ? `<h2>💭 ${esc(S.name)}의 생각</h2><div class="bubble">${fill(ev.title)}</div>` : `<h2>${fill(ev.title)}</h2>`}
      <div class="answer-list">${ev.choices.map((c, i) => {
        const ok = !c.req || c.req(S);
        return `<button class="choice ${ok ? '' : 'locked'}" data-a="choose" data-v="${i}" ${ok ? '' : 'disabled'}>${fill(c.t)}${c.dice ? `<small>🎲 주사위 판정 · ${statIcon(c.dice.stat)}${statName(c.dice.stat)}</small>` : ''}${!ok ? `<small>🔒 ${c.reqText}</small>` : ''}</button>`;
      }).join('')}</div></div>`;
  },
  dice() {
    const d = S.cur.dice, r = UI.roll;
    const bonus = diceBonus(d);
    let res = '';
    if (r && r.done) {
      res = `<div class="dice-math">🎲 ${r.roll} + 보너스 ${bonus.total} = <b>${r.roll + bonus.total}</b> (목표 ${d.target} 이상)</div>
        ${r.reroll ? '<p>✨ 포기 모르는 도전자: 한 번 더 굴렸어요!</p>' : ''}
        <h2 style="color:${r.win ? 'var(--good)' : 'var(--bad)'}">${r.win ? '성공! 🎉' : '아쉽게 실패…'}</h2>
        <button class="btn orange" data-a="diceDone">계속</button>`;
    } else {
      res = `<p>보너스: ${bonus.parts.join(' + ') || '없음'} = <b>+${bonus.total}</b> · 목표 ${d.target} 이상</p>
        <button class="btn orange" data-a="roll" ${r ? 'disabled' : ''}>주사위 굴리기</button>`;
    }
    return `<div class="card event-card"><h2>${fill(S.cur.choiceText)}</h2>
      <div class="dice ${r && !r.done ? 'roll' : ''}" id="die">${r ? dieFace(r.show || r.roll) : '🎲'}</div>
      <p class="muted">능력치가 높을수록 주사위에 보너스가 붙어요. 노력할수록 운의 비중이 줄어요!</p>${res}</div>`;
  },
  jobexp() {
    const ids = S.cur.jobs;
    return `<div class="card event-card"><div class="ic">🎫</div><h2>어떤 직업을 체험해 볼까요?</h2>
      <div class="job-list" style="max-width:620px;margin:0 auto">${ids.map(id => { const j = job(id);
        return `<button class="job" data-a="expPick" data-v="${id}"><div class="ic">${j.icon}</div><div class="nm">${j.name}</div><div class="muted" style="font-size:13px">${j.type}</div></button>`; }).join('')}</div></div>`;
  },
  quiz() {
    const j = job(S.cur.job), q = j.quiz, a = UI.quizAns;
    let after = '';
    if (a != null) {
      const ok = a === q.a;
      after = `<h2 style="color:${ok ? 'var(--good)' : 'var(--bad)'}">${ok ? '정답! ⭕' : '아쉬워요 ❌'}</h2><p>${q.exp}</p>
        ${S.cur.offerDream ? `<p>${j.name} 체험이 정말 재미있었어요. 꿈을 바꿔 볼까요?</p>
          <div class="row" style="justify-content:center"><button class="btn ghost" data-a="quizNext" data-v="keep">${S.dream ? '지금 꿈 유지' : '나중에 정할래요'}</button>
          <button class="btn orange" data-a="quizNext" data-v="change">${j.name}을(를) 꿈으로!</button></div>`
          : '<button class="btn orange" data-a="quizNext" data-v="keep">계속</button>'}`;
    }
    return `<div class="card event-card"><div class="ic">${j.icon}</div><h2>${j.name} 체험 중!</h2>
      <p>${j.desc}</p><p class="muted">보람: ${j.good} · 고충: ${j.hard}</p>
      <h3>📝 직업 OX 퀴즈</h3><p style="font-size:21px"><b>${q.q}</b></p>
      ${a == null ? `<div class="quiz-ox"><button class="btn" data-a="quizAns" data-v="1">⭕</button><button class="btn orange" data-a="quizAns" data-v="0">❌</button></div>` : after}</div>`;
  },
  luck() {
    const L = S.cur, got = L.result;
    return `<div class="card luck-stage"><h2>🎁 행운 카드 · ${L.label}</h2>
      <div class="odds"><span class="g-common">일반 80%</span><span class="g-rare">희귀 18%</span><span class="g-legend">전설 2%</span></div>
      ${got ? `<div class="luck-card flip ${got.grade}"><div class="inner"><span class="grade g-${got.grade}">${{ common: '일반', rare: '희귀', legend: '전설' }[got.grade]}</span><span>${got.icon}</span><b>${got.name}</b><span style="font-size:15px">${got.effText}</span></div></div>`
        : `<button class="luck-card back" data-a="luckDraw" aria-label="카드 뽑기">?</button>`}
      ${got ? (S.luckTickets > 0 ? `<p>노력으로 얻은 추가 뽑기권이 ${S.luckTickets}장 있어요!</p><div class="row" style="justify-content:center"><button class="btn ghost" data-a="luckDone">아껴 둘래요</button><button class="btn orange" data-a="luckDraw" data-v="ticket">추가 뽑기권 사용</button></div>`
        : `<button class="btn orange" data-a="luckDone">계속</button>`)
        : `<p>카드를 눌러 뒤집어요</p>`}
      <p class="muted" style="font-size:14px">확률이 2%라면 50번 중 1번쯤 나올 수 있다는 뜻이에요. (5학년 수학 "가능성")</p></div>`;
  },
};

function cardView(c, j) {
  const d = cardDef(c), on = (UI.plan || []).includes(c.k), kept = UI.keep === c.k;
  const scale = c.type === 'lim' ? 1 : ACT_SCALE;
  const ef = [...Object.keys(d.st || {}).map(k => `${statIcon(k)}+${Math.max(1, Math.round(d.st[k] * scale))}`),
    ...Object.keys(d.life || {}).filter(k => d.life[k]).map(k => `${statIcon(k)}${d.life[k] > 0 ? '+' : ''}${d.life[k]}`)];
  if (d.special === 'jobTour') ef.unshift('📘 직업 체험');
  if (d.special === 'dreamBoost' || d.special === 'dreamBig') ef.unshift('🎯 꿈 능력치');
  if (d.special === 'topStat5') ef.unshift('⬆️ 가장 높은 능력치');
  const dreamy = j && d.st && (d.st[j.main] || d.st[j.sub]);
  const tag = c.kept ? '📌 남겨 둔 카드' : c.type === 'lim' ? d.tag : (c.dream ? '⭐ 꿈 카드' : '');
  const name = d.friend ? `${S.friends[c.friend].name}와(과) 놀기` : d.name;
  const bored = d.bore && S.lastActs.includes(c.id);
  return `<div class="hcard ${on ? 'on' : ''} ${d.rare ? 'rare' : ''} ${c.type === 'lim' && !d.rare ? 'lim' : ''} ${c.dream || dreamy ? 'dreamy' : ''}">
    <button class="hc-main" data-a="card" data-v="${c.k}">
      ${tag ? `<span class="hc-tag">${tag}</span>` : ''}
      <span class="hc-ic">${d.icon}</span><span class="hc-nm">${name}</span><span class="hc-ef">${ef.join(' ')}</span>
      ${bored ? '<span class="hc-warn">🥱 연달아 하면 질려요</span>' : ''}
    </button>
    ${!on ? `<button class="hc-pin ${kept ? 'on' : ''}" data-a="keep" data-v="${c.k}" aria-label="다음 학기로 남기기">📌</button>` : ''}
  </div>`;
}

function jobPicker(sel) {
  const types = ['현실형', '탐구형', '예술형', '사회형', '진취형', '관습형'];
  return `<div class="job-types">${types.map(t => `<div class="job-type"><h3>${t} · ${STATS.find(x => x.type === t).icon} ${STATS.find(x => x.type === t).name}</h3>
    <div class="job-list">${JOBS.filter(j => j.type === t).map(j => `<button class="job ${sel === j.id ? 'on' : ''}" data-a="dreamSel" data-v="${j.id}">
      ${B.jobs[j.id] ? '<span class="tag">도감</span>' : ''}${S && S.dream === j.id ? '<span class="tag">지금 꿈</span>' : ''}
      <div class="ic">${j.icon}</div><div class="nm">${j.name}</div></button>`).join('')}</div></div>`).join('')}</div>`;
}
function jobDetail(j) {
  return `<div class="card job-detail"><h3>${j.icon} ${j.name}</h3><p>${j.desc}</p>
    <div class="need"><span class="chip">주 능력치 ${statIcon(j.main)} ${statName(j.main)} ${UNLOCK.main}</span><span class="chip">보조 ${statIcon(j.sub)} ${statName(j.sub)} ${UNLOCK.sub}</span></div>
    <p class="muted">보람: ${j.good} · 고충: ${j.hard}</p>
    <div class="muted" style="font-size:15px">꿈 로드맵: ${j.road.map((r, i) => `${i + 1}. ${r}`).join(' → ')}</div></div>`;
}

// ---------- 손패 나눠 주기 ----------
function deal() {
  const age = ageOf(S.turn), sem = semOf(S.turn);
  const hand = []; let k = 0;
  const add = c => { c.k = `c${S.turn}_${k++}`; hand.push(c); };
  if (S.kept) add(Object.assign({}, S.kept, { kept: true }));
  // 한정 카드
  let extraLim = 0;
  for (const L of LIMITED) {
    if (hand.some(c => c.id === L.id)) continue;
    let ok = false; try { ok = L.when(S, age, sem); } catch (e) {}
    if (!ok) continue;
    if (L.p >= 1) { for (let n = 0; n < (L.n || 1); n++) add({ type: 'lim', id: L.id }); }
    else if (extraLim < 2 && Math.random() < L.p) { add({ type: 'lim', id: L.id }); extraLim++; }
  }
  const usable = ACTIVITIES.filter(a => (!a.minAge || age >= a.minAge) && (!a.needPet || S.pet));
  const actCard = a => { const c = { type: 'act', id: a.id }; if (a.friend) c.friend = pick(activeFriends()); return c; };
  // 꿈 카드 1장 보장
  if (S.dream && hand.length < HAND) {
    const j = job(S.dream);
    const cands = usable.filter(a => a.st[j.main] && !hand.some(c => c.id === a.id));
    if (cands.length) { const c = actCard(pick(cands)); c.dream = true; add(c); }
  }
  // 나머지는 무작위 기본 카드 (쉬는 카드 1장은 꼭 들어가게)
  const rest = usable.filter(a => a.rest && !hand.some(c => c.id === a.id));
  if (!hand.some(c => (cardDef(c) || {}).rest) && rest.length && hand.length < HAND) add(actCard(pick(rest)));
  for (const a of shuffle(usable)) {
    if (hand.length >= HAND) break;
    if (hand.some(c => c.id === a.id)) continue;
    add(actCard(a));
  }
  return hand;
}

// ---------- 턴 진행 ----------
function energyNow() {
  let e = 3 + S.energyBonus;
  if (hasCard('diligent') && S.turn % 2 === 1) e += 1;
  if (S.life.health < 30) e -= 1;
  return Math.max(1, Math.min(5, e));
}

function startTurn() {
  S.rep = newRep();
  UI.plan = []; UI.keep = null; UI.roll = null; UI.quizAns = null; UI.dreamSel = null;
  const age = ageOf(S.turn), sem = semOf(S.turn);
  S.planNote = S.life.health < 30 ? '❤️ 몸이 피곤해서 에너지가 1 줄었어요. 쉬는 카드를 내 보세요.' : (S.energyBonus > 0 ? `🔋 에너지가 ${S.energyBonus} 늘었어요!` : '');
  S.hand = deal(); S.kept = null;
  if (sem === 1) flash(schoolLabel(age), `${age}살`, semTag(age, sem));
  if (age === 10 && sem === 1 && !S.capsule) { S.phase = 'capsule'; UI.capsule = null; }
  else if (age === 11 && sem === 1 && !S.dream) { S.phase = 'dream'; S.cur = null; }
  else S.phase = 'plan';
  save(); render();
}
function flash(sub, big, tag) {
  UI.flash = { sub, big, tag };
  clearTimeout(flash.t); flash.t = setTimeout(() => { UI.flash = null; const el = document.querySelector('.flash'); if (el) el.remove(); }, 1700);
}

function runPlan() {
  const picked = S.hand.filter(c => UI.plan.includes(c.k));
  const actIds = [];
  picked.forEach(c => {
    const d = cardDef(c), isAct = c.type === 'act';
    const ctx = { friend: c.friend };
    let extra = isAct ? ACT_SCALE : 1;
    if (isAct && hasCard('gritty') && S.lastActs.includes(c.id)) extra *= 1.2;
    for (const k in d.st || {}) addStat(k, d.st[k], extra);
    const bored = d.bore && S.lastActs.includes(c.id);
    for (const k in d.life || {}) addLife(k, bored && d.life[k] > 0 ? Math.ceil(d.life[k] / 2) : d.life[k]);
    if (bored) note(`🥱 ${d.friend ? '친구와 놀기' : d.name}을(를) 연달아 해서 조금 질렸어요. 효과가 줄었어요.`);
    if (d.friend && c.friend != null) addFriend(c.friend, bored ? 2 : 4);
    if (d.special === 'jobTour') { const jj = pick(JOBS.filter(x => !B.jobs[x.id]).concat(JOBS)); ctx.job = jj.id; discover(jj.id); addStat(jj.main, 3); }
    if (d.special === 'dreamBoost') applyEff({ dream: 4 });
    if (d.special === 'dreamBig') applyEff({ dream: 7 });
    if (d.special === 'topStat5') addStat(topStat(), 5);
    S.counts[c.id] = (S.counts[c.id] || 0) + 1;
    const ms = mainStatOf(d); if (ms) S.recent.push(ms);
    if (isAct) actIds.push(c.id);
    S.rep.stories.push(`${d.icon} ${fill(pick(d.story || [d.name]), ctx)}`);
  });
  S.recent = S.recent.slice(-18);
  // 연속 활동(꾸준함)
  const consec = {};
  actIds.forEach(id => consec[id] = S.lastActs.includes(id) ? ((S.consec || {})[id] || 1) + 1 : 1);
  S.consec = consec;
  S.streakNow = Math.max(0, ...Object.values(consec));
  S.maxStreak = Math.max(S.maxStreak, S.streakNow);
  S.lastActs = actIds;
  // 남겨 둘 카드
  const keep = S.hand.find(c => c.k === UI.keep && !UI.plan.includes(c.k));
  S.kept = keep ? { type: keep.type, id: keep.id, friend: keep.friend, dream: keep.dream } : null;
  S.hand = null;
  S.energyBonus = 0;
  // 재능
  const talentActs = picked.filter(c => (cardDef(c).st || {})[S.talent]).length;
  if (talentActs) { S.noTalentTurns = 0; if (S.talentSleep) { S.talentSleep = false; note('💎 다시 재능을 쓰기 시작해서 재능이 깨어났어요!'); } }
  else if (S.genius && S.talentFound) { S.noTalentTurns++; if (S.noTalentTurns >= 4 && !S.talentSleep) { S.talentSleep = true; note('💤 재능을 오래 쓰지 않아 재능이 잠들고 있어요.'); } }
  S.talentActs += talentActs;
  // 쉬는 시간
  if (!picked.some(c => cardDef(c).rest)) { addLife('happy', -4); note('😮‍💨 쉬는 시간이 없어서 조금 지쳤어요.'); }
  pickEvent();
}

function pickEvent() {
  const age = ageOf(S.turn);
  S.cur = null;
  if (!S.talentFound && S.talentActs >= 3 && Math.random() < 0.5) return setEvent(talentEvent());
  const th = thoughtEvent();
  if (th) return setEvent(th);
  const pool = EVENTS.filter(e => {
    const n = S.seen[e.id] || 0;
    if (e.once && n) return false;
    if (e.max && n >= e.max) return false;
    if (e.id === S.lastEvent) return false;
    try { return e.cond(Object.assign({ age }, S)); } catch (err) { return false; }
  });
  let sum = pool.reduce((a, e) => a + e.w, 0), r = Math.random() * sum, ev = pool[0];
  for (const e of pool) { r -= e.w; if (r <= 0) { ev = e; break; } }
  let friend;
  if (ev.useMoved) friend = S.friends.findIndex(f => f.moved);
  else if (ev.useBf && S.bf != null && !S.friends[S.bf].moved) friend = S.bf;
  else friend = pick(activeFriends());
  if (friend == null || friend < 0) friend = 0;
  S.cur = { kind: 'event', id: ev.id, friend };
  S.seen[ev.id] = (S.seen[ev.id] || 0) + 1;
  S.lastEvent = ev.id;
  if (ev.id === 'fight') S.fights++;
  if (ev.id === 'transfer') S.friends[friend].moved = true;
  S.phase = 'event'; save(); render();
}
function setEvent(obj) { S.cur = obj; S.phase = 'event'; save(); render(); }
function curEvent() {
  if (S.cur.kind === 'event') return EVENTS.find(e => e.id === S.cur.id);
  return S.cur.ev;
}

function talentEvent() {
  S.talentFound = true;
  const st = STATS.find(x => x.id === S.talent);
  const scene = { body: '체육 시간', inquiry: '과학 시간', creative: '미술 시간', care: '봉사 시간', lead: '발표 시간', detail: '정리 시간' }[S.talent];
  S.log.push({ age: ageOf(S.turn), t: `${S.genius ? '💎' : '🌟'} ${st.name} 재능을 발견함` });
  return { kind: 'talent', ev: { icon: S.genius ? '💎' : '🌟',
    title: S.genius ? `${scene}에 모두가 깜짝 놀랐어요. ${st.name}에 타고난 재능이 있대요!` : `${scene}에 선생님이 깜짝 놀라셨어요. ${st.name}에 소질이 있대요!`,
    choices: [
      { t: '재능을 더 키워 본다', e: { talent: 4 }, msg: '좋아하는 일을 더 열심히 해 보기로 했다.' },
      { t: '고맙다고 말하고 즐겁게 한다', e: { life: { happy: 4 } }, msg: '칭찬을 들으니 기분이 좋았다.' },
    ] } };
}

function thoughtEvent() {
  if (!S.dream || ageOf(S.turn) < 12 || S.turn - S.lastThought < 6 || S.turn === S.dreamTurn) return null;
  const j = job(S.dream);
  const cnt = {}; S.recent.forEach(k => cnt[k] = (cnt[k] || 0) + 1);
  const dom = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0];
  if (!dom || dom === j.main || dom === j.sub || cnt[dom] < 6 || (cnt[j.main] || 0) >= cnt[dom] / 2) return null;
  const sug = JOBS.filter(x => x.main === dom).sort((a, b) => S.stats[b.sub] - S.stats[a.sub])[0];
  const bridge = BRIDGE_JOBS[`${S.dream}+${dom}`];
  S.lastThought = S.turn;
  const choices = [
    { t: `그래도 ${j.name}이(가) 내 꿈이야!`, e: { dream: 3 }, msg: '마음을 다잡고 꿈을 향한 계획을 다시 세웠다.' },
    { t: `${sug.name}에 대해 알아본다`, e: { discover: sug.id }, action: 'suggestDream', sug: sug.id, msg: `${sug.name}에 대해 알아봤다.` },
  ];
  if (bridge) choices.push({ t: '둘 다 할 수 있는 길은 없을까?', e: { discover: bridge }, msg: `${job(bridge).name}이라는 직업을 발견했다! 두 가지를 함께 살릴 수 있는 길이다.` });
  return { kind: 'thought', ev: { icon: '💭',
    title: `"나는 ${j.name}이(가) 되고 싶었는데… 요즘은 ${statName(dom)} 쪽 활동이 제일 재미있어. 선생님도 내가 ${sug.name}에 잘 어울린대."`,
    choices } };
}

function choose(i) {
  const ev = curEvent(), c = ev.choices[i];
  S.cur.choiceText = c.t;
  if (c.e && c.e.flag === 'fightOk') S.fightsOk++;
  if (c.dice) { S.cur.dice = c.dice; S.phase = 'dice'; UI.roll = null; save(); render(); return; }
  applyEff(c.e, S.cur);
  if (c.e && c.e.flag === 'fightOk') delete S.flags.fightWait;
  if (c.msg) S.rep.msgs.push(`${ev.icon} ${fill(c.msg)}`);
  const act = c.action || (c.e && c.e.action);
  if (act === 'jobExp') return startJobExp();
  if (act === 'setBf') S.bf = S.cur.friend;
  if (act === 'adoptPet') { S.pet = pick(['콩이', '보리', '두부', '초코', '하루']); note(`🐶 ${S.pet}이(가) 새 가족이 됐어요! 이제 산책 카드가 나와요.`); S.log.push({ age: ageOf(S.turn), t: `🐶 반려동물 ${S.pet} 입양` }); discover('vet'); }
  if (act === 'discoverFriendDream') discover(S.friends[S.cur.friend].dream);
  if (act === 'interestTest') interestTest();
  if (act === 'suggestDream') { S.cur = { reason: `${job(c.sug).name}에 대해 알아봤어요. 꿈을 바꿔 볼까요? 지금 꿈을 유지해도 괜찮아요.`, optional: true }; UI.dreamSel = c.sug; S.phase = 'dream'; S.afterDream = 'end'; save(); render(); return; }
  endTurn();
}

function interestTest() {
  const cnt = {}; STATS.forEach(x => cnt[x.id] = 0);
  for (const id in S.counts) { const d = actOf(id) || limOf(id); const ms = d && mainStatOf(d); if (ms) cnt[ms] += S.counts[id]; }
  const top = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]).slice(0, 2);
  const t = top.map(k => STATS.find(x => x.id === k).type);
  S.rep.msgs.push(`🧭 흥미 검사 결과: ${t[0]}과 ${t[1]}에 흥미가 많다고 나왔다.`);
  JOBS.filter(j => top.includes(j.main)).slice(0, 3).forEach(j => discover(j.id));
}

function diceBonus(d) {
  const parts = [], base = Math.floor(S.stats[d.stat] / 25);
  if (base) parts.push(`${statName(d.stat)} ${base}`);
  let total = base;
  if (d.kind === 'contest' && hasCard('challenge')) { total++; parts.push('도전적인 1'); }
  if (d.kind === 'speech' && hasCard('brave')) { total++; parts.push('용기 있는 1'); }
  if (d.kind === 'speech' && hasCombo('calm', 'brave')) { total += 2; parts.push('차분한 발표왕 2'); }
  return { total, parts };
}
const dieFace = n => ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][clamp(n, 1, 6) - 1];
function rollDice() {
  const d = S.cur.dice, b = diceBonus(d).total;
  let roll = rnd(6) + 1, reroll = false;
  if (roll + b < d.target && hasCombo('challenge', 'gritty')) { roll = rnd(6) + 1; reroll = true; }
  UI.roll = { roll, show: 1, done: false, reroll };
  let k = 0; render();
  const tm = setInterval(() => {
    k++; UI.roll.show = rnd(6) + 1;
    const el = document.getElementById('die'); if (el) el.textContent = dieFace(UI.roll.show);
    if (k > 8) { clearInterval(tm); UI.roll.done = true; UI.roll.win = roll + b >= d.target; render(); }
  }, 90);
}
function diceDone() {
  const d = S.cur.dice, win = UI.roll.win, st = d.stat, txt = fill(S.cur.choiceText);
  if (d.kind === 'contest') {
    if (win) { addStat(st, 5); addLife('happy', 5); S.rep.msgs.push(`🏅 ${d.log || txt}: 해냈다!`); if (S.luckTickets < 3) { S.luckTickets++; note('🎟️ 노력의 보상으로 행운 카드 추가 뽑기권을 얻었어요!'); } S.log.push({ age: ageOf(S.turn), t: `🏅 ${d.log || `${txt}에서 상을 받음`}` }); }
    else { addStat(st, 2); addLife('happy', -3); S.rep.msgs.push(`😢 ${txt}: 아쉽게 떨어졌지만 많이 배웠다.`); }
  } else if (d.kind === 'speech') {
    if (win) { addStat('lead', 5); addLife('social', 3); S.rep.msgs.push('🗳️ 반장에 당선됐다!'); S.flags.classLeader = true; S.log.push({ age: ageOf(S.turn), t: '🗳️ 반장 당선' }); }
    else { addStat('lead', 2); addLife('happy', -3); S.rep.msgs.push('🗳️ 아쉽게 낙선했다. 다음에 또 도전하기로 했다.'); }
  } else {
    if (win) { addStat('inquiry', 3); S.rep.msgs.push('📝 벼락치기가 통했다. 다음엔 계획을 세워 보기로 했다.'); }
    else { addStat('inquiry', 1); addLife('happy', -4); S.rep.msgs.push('📝 벼락치기로는 부족했다.'); }
  }
  if (win && S.flags.failedBefore) S.flags.comeback = true;
  if (!win) S.flags.failedBefore = true;
  if (win && d.winFlag) { S.flags[d.winFlag] = true; note('🎯 꿈 로드맵 단계를 달성했어요!'); }
  endTurn();
}

function startJobExp() {
  const pool = shuffle(JOBS);
  const ids = [...pool.filter(j => !B.jobs[j.id]), ...pool.filter(j => B.jobs[j.id])].slice(0, 3).map(j => j.id);
  S.cur = Object.assign(S.cur, { jobs: ids });
  S.phase = 'jobexp'; save(); render();
}
function expPick(id) {
  discover(id);
  S.cur.job = id;
  S.cur.offerDream = ageOf(S.turn) >= 11 && S.dream !== id;
  addStat(job(id).main, 3);
  S.rep.msgs.push(`🎫 ${job(id).name} 체험을 했다.`);
  UI.quizAns = null; S.phase = 'quiz'; save(); render();
}
function quizNext(v) {
  if (v === 'change') setDream(S.cur.job, '직업 체험을 하고');
  endTurn();
}
function setDream(id, why) {
  if (S.dream === id) return;
  if (S.dream) { S.dreamChanges++; note(`💭 꿈이 바뀌었어요: ${job(S.dream).name} → ${job(id).name}`); }
  S.dream = id; S.dreamTurn = S.turn; discover(id);
  S.lastProgress = dreamProgress();
  S.log.push({ age: ageOf(S.turn), t: `🎯 꿈: ${job(id).name}${why ? ` (${why})` : ''}` });
  if (S.rep) S.rep.msgs.push(`🎯 ${job(id).name}이(가) 되겠다는 꿈이 생겼다.`);
}

function endTurn() {
  const age = ageOf(S.turn);
  addLife('money', 2);
  addLife('health', -1);
  addLife('happy', -2);
  if (!S.rep.socialUp && !hasCombo('active', 'warm')) addLife('social', -2);
  if (S.pet) addLife('happy', 1);
  S.friends.forEach((f, i) => { if (!f.moved) addFriend(i, -1); });
  // 성격 카드 성장
  const grow = [
    ['brave', (S.counts.speech || 0) + (S.counts.council || 0) >= 4, '발표와 임원 활동을 여러 번 해서'],
    ['gritty', (S.streakNow || 0) >= 5, '같은 활동을 꾸준히 이어 와서'],
    ['diligent', (S.counts.diary || 0) + (S.counts.tidy || 0) >= 6, '일기와 정리정돈을 꾸준히 해서'],
    ['warm', (S.counts.volunteer || 0) + (S.counts.help || 0) >= 6, '다른 사람을 여러 번 도와서'],
  ];
  for (const [c, ok, why] of grow) {
    if (ok && !hasCard(c) && S.cards.length < 4) {
      S.cards.push(c); note(`🃏 ${why} 새 성격 카드 "${CARDS[c].icon} ${CARDS[c].name}"을(를) 얻었어요!`);
      S.log.push({ age, t: `🃏 성격 카드 "${CARDS[c].name}" 얻음` });
      const combo = COMBOS.find(x => (x.a === c || x.b === c) && hasCombo(x.a, x.b));
      if (combo) note(`✨ 특별 조합 "${combo.name}" 발동! ${combo.desc}`);
    }
  }
  if (S.dream) {
    const p = dreamProgress(), before = S.lastProgress || 0;
    [0.2, 0.4, 0.6, 0.8].forEach((th, i) => { if (before < th && p >= th) note(`🎯 꿈 로드맵 ${i + 1}단계 "${job(S.dream).road[i]}" 달성!`); });
    S.lastProgress = p;
  }
  S.happySum += S.life.happy; S.healthSum += S.life.health;
  // 인생 피드에 이번 학기 이야기 쌓기
  const big = S.rep.notes.filter(n => /달성|새 성격 카드|조합|꿈이 바뀌|새 가족/.test(n)).map(n => fill(n));
  S.feed.push({ age, sem: semOf(S.turn), label: `${semOf(S.turn)}학기`, lines: [...S.rep.stories, ...S.rep.msgs, ...big] });
  S.feed = S.feed.slice(-60);
  S.lastRep = { st: S.rep.st, life: S.rep.life, notes: S.rep.notes.filter(n => !big.includes(fill(n))) };
  UI.freshFeed = true;
  S.cur = null;
  if (LUCK_AT[S.turn]) { S.log.push({ age, t: `🎓 ${LUCK_AT[S.turn]}` }); startLuck(LUCK_AT[S.turn]); return; }
  advance();
}
function advance() {
  S.turn++;
  if (S.turn >= TURNS) { finish(); return; }
  startTurn();
}

// ---------- 행운 카드 ----------
function startLuck(label) {
  S.cur = { label, result: null, turn: S.turn };
  S.phase = 'luck'; save(); render();
}
function drawLuck(ticket) {
  if (S.cur.result && !ticket) return;
  if (ticket) S.luckTickets--;
  const r = Math.random();
  const grade = r < 0.02 ? 'legend' : r < 0.20 ? 'rare' : 'common';
  const card = pick(LUCK[grade]);
  const keep = S.rep; S.rep = newRep();
  let effText = '';
  if (card.special === 'energy') { S.energyBonus += 2; effText = '다음 학기 에너지 +2'; }
  else if (card.special === 'jobInvite') { const j = pick(JOBS.filter(x => !B.jobs[x.id]).concat(JOBS)); discover(j.id); addStat(j.main, 4); effText = `${j.name} 특별 체험!`; }
  else if (card.special === 'mentor') { applyEff({ dream: 10 }); effText = S.dream ? `${job(S.dream).name} 멘토가 도와줘요!` : '멘토가 생겼어요!'; }
  else if (card.special === 'awaken') { S.talentFound = true; addStat(S.talent, 12); effText = `${statName(S.talent)} 재능이 활짝!`; }
  else if (card.special === 'world') { addStat(topStat(), 10); addLife('happy', 10); effText = '최고의 경험을 했어요!'; }
  else applyEff(card);
  if (!effText) effText = [...Object.keys(card.st || {}).map(k => `${statName(k)} +${card.st[k]}`), ...Object.keys(card.life || {}).map(k => `${statName(k)} +${card.life[k]}`)].join(', ');
  if (grade === 'legend') { S.legend = true; S.log.push({ age: ageOf(Math.max(0, S.turn)), t: `🌟 전설 행운 카드 "${card.name}"` }); }
  S.rep = keep;
  S.cur.result = { grade, icon: card.icon, name: card.name, effText };
  const fe = S.feed[S.feed.length - 1]; if (fe) fe.lines.push(`🎁 ${S.cur.label} 행운 카드: ${card.name}`);
  save(); render();
}
function luckDone() {
  const isBirth = S.cur.turn === -1;
  S.cur = null;
  if (isBirth) { S.turn = 0; startTurn(); return; }
  advance();
}

// ---------- 엔딩 ----------
function canDo(j) { return S.stats[j.main] >= UNLOCK.main && S.stats[j.sub] >= UNLOCK.sub; }
function fit(j) { return S.stats[j.main] + S.stats[j.sub] * 0.6; }
function finish() {
  S.turn = TURNS - 1;
  const got = [];
  const give = id => { if (!got.includes(id)) got.push(id); };
  const vals = STATS.map(x => S.stats[x.id]);
  if (S.dreamChanges >= 3) give('dreamChange');
  if (vals.every(v => v >= 60)) give('hexagon');
  if (vals.some(v => v >= 100)) give('expert');
  if (S.maxStreak >= 10) give('steady');
  if (S.flags.comeback) give('comeback');
  if (S.cards.length - S.startCards >= 2) give('grow');
  if (S.genius) give('genius');
  if (S.genius && S.stats[S.talent] >= 95) give('hardGenius');
  const active = S.friends.filter(f => !f.moved);
  if (S.friends.some(f => f.score >= 90)) give('loyal');
  if (active.length && active.every(f => f.score >= 70)) give('insider');
  if (S.flags.reunion) give('reunion');
  if (S.fights > 0 && S.fightsOk >= S.fights) give('peace');
  if (S.happySum / TURNS >= 70) give('smile');
  if (S.healthSum / TURNS >= 70) give('strong');
  if (S.life.money >= 80) give('saver');
  if (S.pet) give('petLover');
  if (B.quiz >= 10) give('quizKing');
  if (S.legend) give('lucky');
  S.newTitles = got.filter(id => !B.titles[id]);
  S.titles = got;
  got.forEach(id => B.titles[id] = true); saveBook();
  S.phase = 'end'; save(); render();
}

function renderEnd() {
  const dj = S.dream ? job(S.dream) : null;
  const ready = dj && canDo(dj);
  const recs = JOBS.slice().sort((a, b) => (canDo(b) - canDo(a)) || (fit(b) - fit(a))).filter(j => j.id !== S.dream).slice(0, 3);
  const child = S.childDream && S.childDream !== 'none' ? job(S.childDream) : null;
  const friendLine = f => {
    const fj = job(f.dream);
    if (f.moved) return `${f.name}: 전학 간 뒤 ${fj.name}을(를) 꿈꾸며 지내고 있대요.`;
    return f.score >= 70 ? `${f.name}(우정 ${f.score}): ${fj.name}의 꿈을 향해 함께 졸업했어요. 앞으로도 단짝이에요!` : `${f.name}(우정 ${f.score}): ${fj.name}이(가) 되려고 준비 중이에요.`;
  };
  $app.innerHTML = `<div class="screen">
    <div class="center"><h1>🎓 ${esc(S.name)}의 성장기 앨범</h1><p class="muted">8살부터 19살까지, 고등학교를 졸업했어요!</p></div>
    <div class="end-grid">
      <div class="card"><h3>🔷 능력치 변화</h3><div class="hex-wrap">${hexSvg(S.stats, S.startStats)}</div>
        <p class="muted center" style="font-size:14px">주황 점선: 8살 · 초록: 19살</p></div>
      <div class="card"><h3>🎯 나의 꿈</h3>
        ${dj ? `<p><b>${dj.icon} ${dj.name}</b></p>${ready ? '<p style="color:var(--good);font-weight:700">꿈에 도전할 준비가 됐어요! 🎉</p>' :
          `<p>아직 조금 더 준비가 필요해요. ${statName(dj.main)} ${S.stats[dj.main]}/${UNLOCK.main}, ${statName(dj.sub)} ${S.stats[dj.sub]}/${UNLOCK.sub}</p><p class="muted">진로 준비 단계에서 더 노력하거나, 아래의 다른 길도 있어요.</p>`}` : '<p>아직 꿈을 정하지 않았어요.</p>'}
        <h3 style="margin-top:12px">💡 너에게 잘 어울리는 직업</h3>
        ${recs.map(j => `<div>${j.icon} ${j.name} ${canDo(j) ? '<span class="chip up">도전 가능</span>' : ''}</div>`).join('')}
        ${child ? `<p class="muted" style="margin-top:10px">어릴 적 꿈: ${child.icon} ${child.name}${dj && child.id === dj.id ? ' → 지금도 같은 꿈이에요!' : ''}</p>` : ''}</div>
      <div class="card"><h3>📜 나의 연표</h3><div class="timeline">${S.log.map(l => `<div><b>${l.age}살</b><span>${l.t}</span></div>`).join('')}</div></div>
      <div class="card"><h3>💌 10살의 타임캡슐</h3>${S.capsule ? `<div class="letter">미래의 나는 <b>${job(S.capsule.job).name}</b>이(가) 되어 있을 거야.<br>${S.capsule.text ? `"${esc(S.capsule.text)}"` : ''}</div>
        <p class="muted">${dj && S.capsule.job === dj.id ? '10살 때의 꿈을 지금도 이어 가고 있어요!' : '그때와 지금의 꿈을 비교해 보세요.'}</p>` : '<p class="muted">타임캡슐이 없어요.</p>'}
        <h3 style="margin-top:12px">👫 친구들은 어떻게 지낼까?</h3>${S.friends.map(f => `<div style="font-size:15px">${friendLine(f)}</div>`).join('')}</div>
      <div class="card"><h3>😊 삶의 지표</h3>${LIFE.map(l => `<div>${l.icon} ${l.name}: ${S.life[l.id]}</div>`).join('')}
        <h3 style="margin-top:12px">🃏 성격 카드</h3><div class="chips">${S.cards.map(c => `<span class="chip">${CARDS[c].icon} ${CARDS[c].name}</span>`).join('')}</div>
        ${S.talentFound ? `<p>${S.genius ? '💎' : '🌟'} 발견한 재능: ${statName(S.talent)}</p>` : `<p class="muted">숨은 재능(${statName(S.talent)})은 아직 발견하지 못했어요.</p>`}</div>
      <div class="card"><h3>🏅 이번 판 칭호</h3>${S.titles.length ? `<div class="title-list">${S.titles.map(id => { const t = TITLES.find(x => x.id === id); return `<div class="title-item got g-${t.g}"><b>${t.name}${S.newTitles.includes(id) ? ' 🆕' : ''}</b>${t.g} · ${t.hint}</div>`; }).join('')}</div>` : '<p class="muted">이번에는 칭호를 얻지 못했어요. 다른 방법으로 살아 보세요!</p>'}</div>
    </div>
    <div class="card"><h3>📖 나의 인생 이야기</h3><div class="story-all">${S.feed.map(it => `<div class="entry"><div class="yr">${it.age}살${it.label ? ` · ${it.label}` : ''}</div>${it.lines.map(l => `<p>${l}</p>`).join('')}</div>`).join('')}</div></div>
    <div class="card" style="margin-top:16px"><h3>🧐 돌아보기</h3><ol><li>내 성장기에서 가장 잘한 선택은 무엇인가요?</li><li>다시 태어난다면 무엇을 다르게 해 보고 싶나요?</li><li>내 꿈을 위해 앞으로 어떤 노력이 필요할까요?</li></ol>
      <p class="muted">진로 준비(20~25살), 직업 생활, 은퇴 후 단계는 다음 시제품에서 이어져요.</p></div>
    <div class="row" style="justify-content:center;margin-top:20px"><button class="btn ghost" data-a="book">📖 도감 보기</button><button class="btn orange" data-a="reborn">🔄 다시 태어나기</button></div>
  </div>`;
}

// ---------- 도감 ----------
function renderBook() {
  const tab = UI.bookTab || 'jobs';
  const got = Object.keys(B.titles).length;
  let body = '';
  if (tab === 'jobs') {
    const all = [...JOBS, ...HIDDEN_JOBS];
    body = `<p>발견한 직업 ${all.filter(j => B.jobs[j.id]).length} / ${all.length} · 직업 퀴즈 정답 ${B.quiz}개</p>
      <h3>직업 21개</h3><div class="job-list">${JOBS.map(j => B.jobs[j.id] ? `<div class="job" title="${esc(j.desc)}"><div class="ic">${j.icon}</div><div class="nm">${j.name}</div><div class="muted" style="font-size:12px">${j.type}</div></div>` : `<div class="job unknown"><div class="ic">❔</div><div class="nm">${j.name}</div><div style="font-size:12px">아직 체험 전</div></div>`).join('')}</div>
      <h3 style="margin-top:16px">숨은 직업</h3><div class="job-list">${HIDDEN_JOBS.map(j => B.jobs[j.id] ? `<div class="job"><div class="ic">${j.icon}</div><div class="nm">${j.name}</div><div class="muted" style="font-size:12px">${j.desc}</div></div>` : `<div class="job unknown"><div class="ic">❔</div><div class="nm">???</div></div>`).join('')}</div>`;
  } else {
    const cnt = g => `${TITLES.filter(t => t.g === g && B.titles[t.id]).length}/${TITLES.filter(t => t.g === g).length}`;
    body = `<p>모은 칭호 ${got} / ${TITLES.length} · 일반 ${cnt('일반')} · 희귀 ${cnt('희귀')} · 전설 ${cnt('전설')}</p>
      <p class="muted" style="font-size:15px">⭐ 표시는 성장기 시제품에서 얻을 수 있는 칭호예요.</p>
      <div class="title-list">${TITLES.map(t => B.titles[t.id] ? `<div class="title-item got g-${t.g}"><b>${t.name}</b>${t.g} · ${t.hint}</div>` : `<div class="title-item"><b>???${t.proto ? ' ⭐' : ''}</b>${t.g} · 힌트: ${t.hint}</div>`).join('')}</div>`;
  }
  $app.innerHTML = `<div class="screen"><div class="row" style="justify-content:space-between"><h1>📖 도감</h1><button class="btn ghost small" data-a="bookClose">닫기</button></div>
    <div class="tabs"><button class="btn small ${tab === 'jobs' ? 'on' : ''}" data-a="bookTab" data-v="jobs">직업 도감</button><button class="btn small ${tab === 'titles' ? 'on' : ''}" data-a="bookTab" data-v="titles">칭호 도감</button></div>${body}</div>`;
}

// ---------- 버튼 처리 ----------
function refreshPlay() {
  const p = document.getElementById('play');
  if (p && PHASES[S.phase]) p.innerHTML = PHASES[S.phase](); else render();
}
const ACTIONS = {
  start() { UI.screen = 'setup'; UI.setup = { step: 0, name: '', gender: null, childDream: null, tally: {} }; renderSetup(); },
  continue() { S = loadSave(); UI.screen = 'game'; if (!S) return ACTIONS.start(); render(); },
  home() { save(); UI.screen = 'title'; render(); },
  book() { UI.prev = UI.screen; UI.screen = 'book'; render(); },
  bookClose() { UI.screen = UI.prev && UI.prev !== 'book' ? UI.prev : 'title'; if (UI.screen === 'setup') return renderSetup(); render(); },
  bookTab(v) { UI.bookTab = v; render(); },
  gender(v) { UI.setup.gender = v; renderSetup(); },
  childDream(v) { UI.setup.childDream = v; renderSetup(); },
  setupNext() {
    const st = UI.setup;
    if (st.step === 0) { const v = (document.getElementById('nm') || {}).value; st.name = (v || '').trim(); if (!st.name) return toast('이름을 적어 주세요'); if (!st.gender) return toast('성별을 골라 주세요'); }
    st.step++; renderSetup();
  },
  answer(v) {
    const st = UI.setup, q = QUESTIONS[st.step - 2];
    q.a[+v].c.forEach(c => st.tally[c] = (st.tally[c] || 0) + 1);
    if (st.step - 2 < QUESTIONS.length - 1) { st.step++; return renderSetup(); }
    const ranked = Object.keys(st.tally).sort((a, b) => (st.tally[b] - st.tally[a]) || (Math.random() - 0.5));
    st.cards = ranked.slice(0, 2);
    newGame(st); UI.screen = 'game'; render();
  },
  birthLuck() { S.turn = -1; startLuck('탄생'); },
  luckDraw(v) { drawLuck(v === 'ticket'); },
  luckDone() { luckDone(); },
  capJob(v) { const c = UI.capsule; c.text = (document.getElementById('capText') || {}).value || c.text; c.job = v; refreshPlay(); },
  capDone() {
    const c = UI.capsule; c.text = ((document.getElementById('capText') || {}).value || '').trim();
    S.capsule = { job: c.job, text: c.text }; S.log.push({ age: 10, t: '💌 타임캡슐을 묻음' }); toast('타임캡슐을 묻었어요! 엔딩에서 열어 봐요');
    S.phase = (ageOf(S.turn) === 11 && !S.dream) ? 'dream' : 'plan'; save(); render();
  },
  dreamSel(v) { UI.dreamSel = v; refreshPlay(); },
  dreamSet() {
    setDream(UI.dreamSel, S.cur && S.cur.optional ? '새로운 꿈을 찾아서' : '');
    const back = S.afterDream; S.afterDream = null; S.cur = null; UI.dreamSel = null;
    if (back === 'end') return endTurn();
    toast('꿈이 생겼어요! ⭐ 꿈 카드가 손패에 들어와요');
    const kc = S.hand && S.hand.find(c => c.kept);
    if (kc) S.kept = kc;
    S.hand = deal(); S.kept = null; S.phase = 'plan'; save(); render();
  },
  dreamKeep() { S.cur = null; S.afterDream = null; UI.dreamSel = null; note('💪 지금 꿈을 계속 이어 가기로 했어요.'); endTurn(); },
  card(v) {
    const p = UI.plan || (UI.plan = []), i = p.indexOf(v);
    if (i >= 0) p.splice(i, 1);
    else if (p.length < energyNow()) { p.push(v); if (UI.keep === v) UI.keep = null; }
    else toast('에너지가 부족해요. 고른 카드를 하나 빼 보세요');
    refreshPlay();
  },
  keep(v) { UI.keep = UI.keep === v ? null : v; if (UI.keep) toast('📌 이 카드를 다음 학기로 가져가요'); refreshPlay(); },
  planGo() { runPlan(); },
  choose(v) { choose(+v); },
  roll() { rollDice(); },
  diceDone() { diceDone(); },
  expPick(v) { expPick(v); },
  quizAns(v) {
    UI.quizAns = v === '1';
    const ok = UI.quizAns === job(S.cur.job).quiz.a;
    if (ok) { B.quiz++; saveBook(); addStat(job(S.cur.job).main, 2); S.rep.msgs.push('⭕ 직업 퀴즈를 맞혔다!'); }
    refreshPlay();
  },
  quizNext(v) { quizNext(v); },
  reborn() { clearSave(); S = null; ACTIONS.start(); },
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (!el || el.disabled) return;
  const fn = ACTIONS[el.dataset.a];
  if (fn) fn(el.dataset.v);
});

UI.screen = 'title';
render();
