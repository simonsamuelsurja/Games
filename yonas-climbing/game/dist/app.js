import { createJourney, advance, chooseAction, chooseRecording, condition, summary, restoreGame, exportJourney, ACTION_NAMES } from './engine.mjs';

const $ = id => document.getElementById(id);
const SAVE_KEY = 'yonas.chapter1.save.v1', SOUND_KEY = 'yonas.sound.v1';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const scenes = {
  gym: { location: 'VENUE CLIMBING', alt: 'Yonas dan Raka di depan jalur bouldering dengan pegangan oranye' },
  climb: { location: 'JALUR ORANYE', alt: 'Seorang pemanjat meraih pegangan oranye, ditemani seorang teman di bawahnya' },
  office: { location: 'KANTOR / SETELAH RAPAT', alt: 'Seorang manajer di meja kerjanya, dengan foto climbing di samping laptop' },
  home: { location: 'RUMAH / WAKTU UNTUK JEDA', alt: 'Seorang pemanjat bersantai di sofa dengan sepatu dan chalk bag di sampingnya' }
};
const readStorage = key => { try { return localStorage.getItem(key); } catch { return null; } };
const writeStorage = (key, value) => { try { localStorage.setItem(key, value); return true; } catch { return false; } };
let saved = restoreGame(readStorage(SAVE_KEY)), state = null, currentScene = 'gym';
let typingTimer, typing = false, fullText = '', lastLine = '', artTimer;
let sound = readStorage(SOUND_KEY) === 'on', audio;
const dialogs = ['menu-dialog', 'history-dialog', 'restart-dialog'];
const panels = ['cover-content', 'cover-stamp', 'name-panel', 'dialogue-next', 'choice-panel', 'record-panel', 'ending-panel'];

function playSound(kind = 'tap') {
  if (!sound) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume().catch(() => {});
    const t = audio.currentTime, gain = audio.createGain(), oscillator = audio.createOscillator();
    oscillator.type = kind === 'success' ? 'sine' : 'triangle';
    oscillator.frequency.setValueAtTime(kind === 'success' ? 440 : kind === 'choice' ? 210 : 630, t);
    oscillator.frequency.exponentialRampToValueAtTime(kind === 'success' ? 880 : 140, t + .12);
    gain.gain.setValueAtTime(.0001, t); gain.gain.exponentialRampToValueAtTime(.045, t + .008); gain.gain.exponentialRampToValueAtTime(.0001, t + .17);
    oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(t); oscillator.stop(t + .19);
  } catch { /* Sound is optional; the story remains playable. */ }
}

function updateSound() {
  $('sound-toggle').setAttribute('aria-pressed', String(sound));
  $('sound-toggle').setAttribute('aria-label', sound ? 'Matikan suara' : 'Aktifkan suara');
  $('sound-toggle').innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z${sound ? 'm5 3a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14' : 'm5 4 5 6m0-6-5 6'}"/></svg>`;
}

function save() {
  if (!state) return;
  saved = state;
  if (!writeStorage(SAVE_KEY, JSON.stringify(state))) $('live-status').textContent = 'Progres tidak bisa disimpan di browser ini. Cerita tetap bisa dimainkan sampai selesai.';
}

function showScene(scene) {
  if (!scenes[scene]) scene = 'gym';
  $('scene-location').textContent = scenes[scene].location;
  if (scene === currentScene) return;
  currentScene = scene;
  clearTimeout(artTimer);
  const art = $('scene-art'), src = `assets/${scene}.webp`;
  art.classList.add('fading');
  const next = new Image(); next.src = src;
  artTimer = setTimeout(async () => {
    try { await next.decode(); } catch { /* Let the browser retry loading the asset normally. */ }
    if (currentScene !== scene) return;
    art.src = src; art.alt = scenes[scene].alt; art.dataset.scene = scene;
    requestAnimationFrame(() => art.classList.remove('fading'));
  }, reducedMotion ? 0 : 160);
}

function stopTyping() { clearInterval(typingTimer); typing = false; }
function writeDialogue(text, key) {
  if (key === lastLine) return;
  lastLine = key; stopTyping(); fullText = text;
  $('dialogue-next').setAttribute('aria-label', `${$('speaker').textContent}: ${text}. Lanjutkan dialog.`);
  if (reducedMotion) { $('dialogue-text').textContent = text; return; }
  const chars = Array.from(text); let index = 0;
  $('dialogue-text').textContent = ''; typing = true;
  typingTimer = setInterval(() => {
    index = Math.min(chars.length, index + 3);
    $('dialogue-text').textContent = chars.slice(0, index).join('');
    if (index >= chars.length) stopTyping();
  }, 22);
}

function updateFooter() {
  const completed = state?.actions.length || 0;
  document.querySelectorAll('[data-week]').forEach(el => {
    const week = Number(el.dataset.week);
    el.classList.toggle('done', completed >= week);
    el.classList.toggle('active', !!state && completed < week && week === state.week);
  });
  $('week-counter').textContent = state ? state.screen === 'end' ? '4 / 4 MINGGU' : `MINGGU ${String(state.week).padStart(2, '0')} / 04` : 'BULAN 01';
  $('footer-caption').textContent = state ? 'BULAN 01 / JALUR PERTAMA' : 'CERITA INTERAKTIF';
  $('footer-title').textContent = state ? `${state.name.toUpperCase()} · SATU PEGANGAN LAGI.` : 'JALUR PERTAMA YANG INGIN DITAKLUKKAN.';
}

function focusPanel(id) {
  requestAnimationFrame(() => $(id)?.focus({ preventScroll: true }));
}

function render() {
  panels.forEach(id => $(id).hidden = true);
  const mode = state?.screen || 'cover';
  $('stage').className = `stage ${mode === 'choice' ? 'choosing' : mode === 'end' ? 'ending' : mode === 'record' ? 'recording' : mode}`;
  if (mode !== 'story') { stopTyping(); lastLine = ''; }
  if (mode === 'cover') {
    $('cover-content').hidden = false; $('cover-stamp').hidden = false;
    $('resume-button').hidden = !saved;
    $('start-button').textContent = saved ? 'CERITA BARU ↗' : 'MULAI CERITA ↗';
    showScene('gym');
  } else if (mode === 'name') {
    $('name-panel').hidden = false; showScene('gym');
  } else if (mode === 'story') {
    $('dialogue-next').hidden = false;
    const l = state.queue[state.lineIndex];
    showScene(l.scene); $('speaker').textContent = l.speaker;
    $('dialogue-next').classList.toggle('hero-line', l.speaker === state.name && ['gym', 'climb'].includes(l.scene));
    $('dialogue-next').classList.toggle('narrator-line', l.speaker === 'CERITA');
    $('bubble').classList.toggle('narration', l.speaker === 'CERITA');
    writeDialogue(l.text, `${state.week}/${state.actions.length}/${state.after}/${state.lineIndex}/${state.recordAllowed}`);
  } else if (mode === 'choice') {
    $('choice-panel').hidden = false; showScene('gym');
    $('week-tag').textContent = `MINGGU ${String(state.week).padStart(2, '0')} / 04`;
    $('condition-text').textContent = condition(state);
  } else if (mode === 'record') {
    $('record-panel').hidden = false; showScene('gym');
  } else if (mode === 'end') {
    $('ending-panel').hidden = false; showScene(state.routeDone ? 'climb' : 'gym');
    const result = summary(state);
    $('ending-heading').textContent = result.title;
    $('ending-copy').textContent = result.copy;
    $('ending-note').textContent = result.note;
    $('journey-strip').replaceChildren(...state.actions.map(a => {
      const item = document.createElement('div'), label = document.createElement('span'), value = document.createElement('strong');
      item.className = 'journey-chip';
      label.textContent = `MINGGU ${a.week}`; value.textContent = ACTION_NAMES[a.action];
      item.append(label, value); return item;
    }));
  }
  updateFooter();
}

function move(next) {
  if (next === state) return;
  const before = state?.screen;
  state = next; save(); render();
  if (state.screen !== before) {
    if (state.screen === 'choice') focusPanel(document.querySelector('[data-action]')?.id || 'choice-heading');
    if (state.screen === 'record') focusPanel('allow-record');
    if (state.screen === 'end') { focusPanel('replay-button'); playSound('success'); }
    $('live-status').textContent = state.screen === 'choice' ? `Minggu ${state.week}. Pilih Kerja, Latihan, atau Istirahat.` : state.screen === 'record' ? 'Raka meminta izin merekam dan mengunggah ke sosmed.' : state.screen === 'end' ? 'Bulan pertama selesai.' : '';
  }
}

function nextDialogue() {
  if (!state || state.screen !== 'story' || dialogs.some(id => $(id).open)) return;
  if (typing) { stopTyping(); $('dialogue-text').textContent = fullText; return; }
  playSound(); move(advance(state));
}

function nameScreen() {
  stopTyping(); lastLine = ''; state = { screen: 'name', week: 1, actions: [], name: 'Yonas' };
  $('player-name').value = saved?.name || 'Yonas'; render();
  requestAnimationFrame(() => { $('player-name').focus({ preventScroll: true }); $('player-name').select(); });
}

function requestNew() {
  if (saved) $('restart-dialog').showModal(); else nameScreen();
}

function renderHistory() {
  const s = state?.history ? state : saved, holder = $('history-content'); holder.replaceChildren();
  if (!s) { const p = document.createElement('p'); p.textContent = 'Perjalananmu belum dimulai. Pegangan pertama sedang menunggu.'; holder.append(p); return; }
  let week = 0;
  for (const l of s.history) {
    if (l.week !== week) { week = l.week; const h = document.createElement('h3'); h.textContent = `MINGGU ${week}`; holder.append(h); }
    const p = document.createElement('p'), strong = document.createElement('strong'); strong.textContent = `${l.speaker} — `;
    p.append(strong, document.createTextNode(l.text)); holder.append(p);
  }
}

$('start-button').addEventListener('click', () => { playSound('choice'); requestNew(); });
$('name-form').addEventListener('submit', e => {
  e.preventDefault();
  if (!$('player-name').value.trim()) { $('player-name').focus(); return; }
  playSound('choice'); lastLine = ''; move(createJourney($('player-name').value)); focusPanel('dialogue-next');
});
$('resume-button').addEventListener('click', () => { if (saved) { state = structuredClone(saved); lastLine = ''; playSound(); render(); } });
$('dialogue-next').addEventListener('click', nextDialogue);
document.querySelectorAll('[data-action]').forEach(button => {
  button.addEventListener('click', () => {
    if (state?.screen !== 'choice') return;
    playSound('choice'); move(chooseAction(state, button.dataset.action)); focusPanel('dialogue-next');
  });
});
$('allow-record').addEventListener('click', () => { playSound('choice'); move(chooseRecording(state, true)); focusPanel('dialogue-next'); });
$('deny-record').addEventListener('click', () => { playSound('choice'); move(chooseRecording(state, false)); focusPanel('dialogue-next'); });
$('sound-toggle').addEventListener('click', () => { sound = !sound; writeStorage(SOUND_KEY, sound ? 'on' : 'off'); updateSound(); playSound(); });
$('menu-toggle').addEventListener('click', () => { playSound(); $('menu-dialog').showModal(); $('menu-toggle').setAttribute('aria-expanded', 'true'); });
$('menu-dialog').addEventListener('close', () => $('menu-toggle').setAttribute('aria-expanded', 'false'));
$('close-menu').addEventListener('click', () => $('menu-dialog').close());
$('continue-menu').addEventListener('click', () => $('menu-dialog').close());
$('history-menu').addEventListener('click', () => { $('menu-dialog').close(); renderHistory(); $('history-dialog').showModal(); });
$('close-history').addEventListener('click', () => $('history-dialog').close());
$('restart-menu').addEventListener('click', () => { $('menu-dialog').close(); if (state || saved) $('restart-dialog').showModal(); else nameScreen(); });
$('replay-button').addEventListener('click', () => $('restart-dialog').showModal());
$('confirm-restart').addEventListener('click', () => { $('restart-dialog').close(); nameScreen(); });
$('cancel-restart').addEventListener('click', () => $('restart-dialog').close());
document.querySelector('.brand').addEventListener('click', e => { e.preventDefault(); stopTyping(); state = null; lastLine = ''; render(); });
$('export-button').addEventListener('click', () => {
  if (state?.screen !== 'end') return;
  const blob = new Blob([JSON.stringify(exportJourney(state), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = 'perjalanan-bulan-1.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('live-status').textContent = 'Perjalananmu sudah disimpan.'; playSound();
});
document.addEventListener('keydown', e => {
  if (e.repeat || dialogs.some(id => $(id).open)) return;
  if (state?.screen === 'story' && (e.code === 'Space' || e.key === 'Enter') && !['sound-toggle', 'menu-toggle'].includes(document.activeElement?.id)) { e.preventDefault(); nextDialogue(); }
});
$('choice-heading').tabIndex = -1;
updateSound(); render();
// Warm just the next illustration once the first scene is ready.
window.addEventListener('load', () => { const next = new Image(); next.src = 'assets/office.webp'; }, { once: true });
