export const SAVE_VERSION = 1;
export const ACTION_NAMES = { work: 'Kerja', train: 'Latihan', rest: 'Istirahat' };
const clamp = (n, max = Infinity) => Math.max(0, Math.min(max, n));
const copy = s => structuredClone(s);
const line = (scene, speaker, text) => ({ scene, speaker, text });
const stamp = () => new Date().toISOString();

export function cleanName(value) {
  return String(value || '').replace(/[\u0000-\u001f\u007f-\u009f]/g, '').trim().slice(0, 24) || 'Yonas';
}

function story(s, queue, after) {
  s.screen = 'story'; s.queue = queue; s.lineIndex = 0; s.after = after;
  s.history.push({ ...queue[0], week: s.week });
  return s;
}

export function createJourney(name = 'Yonas') {
  const s = { version: SAVE_VERSION, name: cleanName(name), screen: 'story', week: 1,
    stats: { money: 75, stamina: 75, ability: 0, reputation: 0 },
    trainingCount: 0, routeDone: false, recordAsked: false, recordAllowed: null,
    exhaustedStreak: 0, actions: [], history: [], events: [], startedAt: stamp() };
  return story(s, [
    line('gym', 'RAKA', 'Katanya cuma ikut tren. Kok dari tadi lo nggak mau pulang?'),
    line('gym', s.name, 'Tanggung. Itu pegangan terakhir rasanya deket banget.'),
    line('gym', 'RAKA', 'Lo udah bilang “terakhir” empat kali.'),
    line('gym', 'CERITA', `Sore itu, ${s.name} langsung mengambil langganan bulanan. Awalnya cuma mencoba. Sekarang, ada satu jalur yang terus kepikiran.`),
    line('office', 'CERITA', `Besok paginya, ${s.name} kembali jadi manajer penuh waktu. Rapat, laporan, dan urusan tim tetap menunggu.`),
    line('office', s.name, 'Kerjaan jalan. Latihan juga pengin jalan. Kayaknya gue harus mulai nyari ritmenya.')
  ], 'choices');
}

export function condition(s) {
  const body = s.stats.stamina < 10 ? 'Badan rasanya habis. Sekadar berdiri dari kursi saja berat.'
    : s.stats.stamina <= 35 ? 'Bahu mulai berat. Tidur yang cukup terdengar makin menggoda.'
    : s.stats.stamina >= 90 ? 'Badan terasa ringan. Tidur kemarin benar-benar membantu.'
    : 'Badan masih sanggup bergerak, meski pekerjaan tetap menunggu.';
  const money = s.stats.money < 10 ? ' Uang untuk ke venue sudah tidak cukup.'
    : s.stats.money <= 25 ? ' Isi dompet mulai menipis.' : '';
  return body + money;
}

function nextWeek(s) {
  if (s.week === 4) {
    const q = s.routeDone ? [
      line('climb', 'CERITA', `Sebulan lalu, ${s.name} bahkan belum tahu cara berpijak. Kini jalur pertamanya sudah selesai. Masih jauh dari atlet, tetapi ini terasa seperti awal yang sungguh-sungguh.`),
      line('gym', s.name, 'Ternyata gue bukan cuma suka nonton orang manjat. Gue pengin bisa. Bulan depan, coba jalur yang lain.')
    ] : [
      line('gym', 'CERITA', `Bulan pertama selesai. Jalur itu masih menyisakan pegangan yang belum terjangkau. Di luar venue, kehidupan ${s.name} juga terus berjalan.`),
      line('home', s.name, 'Belum dapet bulan ini. Nggak apa-apa. Setidaknya sekarang gue tahu, gue masih pengin balik lagi.')
    ];
    return story(s, q, 'end');
  }
  s.week++;
  const previous = s.actions.at(-1).action;
  const openings = {
    2: line('office', s.name, previous === 'train' ? 'Lengan masih pegal, tapi gerakan kemarin muter terus di kepala. Sementara itu, rapat pagi sudah mau mulai.' : previous === 'rest' ? 'Bangun kali ini lebih enak. Sekarang tinggal menentukan: balik ke venue atau fokus kerja dulu.' : 'Urusan tim mulai beres. Tapi kalau begini terus, kapan gue balik ke dinding itu?'),
    3: line(s.trainingCount ? 'gym' : 'office', 'CERITA', `Minggu ketiga. ${s.trainingCount ? 'Jalur oranye masih terpasang di sudut venue. Gerakannya mulai terasa akrab.' : `Di sela pekerjaan, ${s.name} masih teringat jalur oranye yang belum sempat dicoba lagi.`}`),
    4: line('gym', 'CERITA', 'Minggu terakhir bulan ini. Bulan depan jalur-jalur di venue akan diganti. Ada kesempatan terakhir untuk kembali ke jalur yang sama.')
  };
  return story(s, [openings[s.week]], 'choices');
}

export function advance(state) {
  if (state.screen !== 'story') return state;
  const s = copy(state);
  if (s.lineIndex + 1 < s.queue.length) {
    s.lineIndex++; s.history.push({ ...s.queue[s.lineIndex], week: s.week }); return s;
  }
  if (s.after === 'choices') { s.screen = 'choice'; return s; }
  if (s.after === 'record') { s.screen = 'record'; s.recordAsked = true; return s; }
  if (s.after === 'end') { s.screen = 'end'; s.finishedAt = stamp(); return s; }
  return nextWeek(s);
}

export function chooseAction(state, action) {
  if (state.screen !== 'choice' || !ACTION_NAMES[action]) return state;
  const s = copy(state), before = { ...s.stats };
  let q;
  if (action === 'work') {
    s.exhaustedStreak = 0;
    s.stats.stamina = clamp(before.stamina - 10, 100);
    if (before.stamina >= 10) {
      s.stats.money += 20;
      q = [line('office', 'CERITA', `${s.name} menuntaskan urusan tim dan pekerjaannya minggu ini. Uang bertambah, tetapi hari-hari di depan layar tetap menguras tenaga.`), line('office', s.name, 'Setidaknya ada uang buat latihan berikutnya. Sekarang tinggal nyari waktunya.')];
    } else {
      q = [line('office', 'CERITA', `${s.name} memaksakan diri bekerja, tetapi tubuhnya keburu tumbang. Minggu ini tidak ada uang yang berhasil ditambah.`), line('home', s.name, 'Oke. Badan gue ternyata sudah nggak bisa diajak kompromi.')];
    }
  } else if (action === 'rest') {
    s.exhaustedStreak = 0; s.stats.stamina = clamp(before.stamina + 40, 100);
    q = [line('home', 'CERITA', `${s.name} menaruh sepatu panjat di sudut ruangan. Kali ini tidak ada target pegangan. Hanya makan teratur, tidur lebih awal, dan membiarkan tubuh pulih.`), line('home', s.name, 'Nggak semua hari harus dipaksa. Dindingnya juga nggak ke mana-mana.')];
  } else {
    s.trainingCount++;
    const shortMoney = before.money < 10, shortStamina = before.stamina < 10;
    s.stats.money = clamp(before.money - 10);
    s.stats.stamina = clamp(before.stamina - 10, 100);
    s.stats.ability += shortMoney || shortStamina ? 1 : 5;
    s.exhaustedStreak = shortStamina ? s.exhaustedStreak + 1 : 0;
    if (shortMoney) {
      q = [line('home', 'CERITA', `Uang ${s.name} tidak cukup untuk latihan di venue. Ia tetap berlatih di rumah, tetapi hasilnya jauh lebih kecil daripada sesi biasanya.`), line('home', s.name, shortStamina ? 'Badan udah habis, uang juga mepet. Nggak banyak yang bisa gue kerjain begini.' : 'Bisa gerak sedikit di rumah. Tapi gue tetap butuh balik ke venue.')];
    } else if (shortStamina) {
      q = [line('climb', 'CERITA', `${s.name} tetap datang meski tenaganya habis. Gerakan jadi berantakan. Latihan ini hanya memberi sedikit kemajuan.`), line('climb', s.name, 'Pegangannya sama. Tapi badan gue nggak nurut hari ini.')];
    } else if (s.trainingCount === 1) {
      q = [line('climb', 'CERITA', `${s.name} kembali ke jalur oranye. Ia mencoba menarik tubuh sekuat mungkin, lalu jatuh lagi ke matras.`), line('gym', 'RAKA', 'Coba pakai kaki. Bukan tangan lo doang yang kerja.'), line('climb', s.name, 'Oh... beda banget rasanya. Oke, sekali lagi.')];
    } else if (s.trainingCount === 2) {
      q = [line('climb', 'CERITA', 'Gerakan yang dulu terasa mustahil mulai lebih terbaca. Pijakan yang kecil ternyata cukup, asal tubuhnya berada di tempat yang tepat.'), line('gym', 'RAKA', 'Nah! Tadi bagus. Gue kepikiran sesuatu, nih.')];
    } else if (s.trainingCount === 3) {
      s.routeDone = true;
      q = [line('climb', 'CERITA', 'Kaki menekan pijakan. Pinggul mendekat ke dinding. Untuk pertama kalinya, pegangan terakhir itu benar-benar terjangkau.'), line('climb', s.name, 'Dapet! Akhirnya dapet!'), line('gym', 'RAKA', 'Tuh, kan. Bukan kebetulan. Lo emang mulai bisa.')];
    } else {
      q = [line('climb', 'CERITA', 'Jalur yang sama terasa berbeda ketika dicoba tanpa terburu-buru. Kali ini gerakannya lebih tenang, pijakannya lebih pasti.'), line('gym', s.name, 'Kemarin cuma pengin sampai atas. Sekarang gue pengin gerakannya bener.')];
    }
    // The month-one achievement is based on choosing training three times.
    if (s.trainingCount >= 3) s.routeDone = true;
  }
  s.actions.push({ week: s.week, action, at: stamp() });
  s.events.push({ type: 'routine', week: s.week, choice: action, at: stamp() });
  const after = action === 'train' && s.trainingCount >= 2 && !s.recordAsked ? 'record' : 'next-week';
  return story(s, q, after);
}

export function chooseRecording(state, allow) {
  if (state.screen !== 'record' || typeof allow !== 'boolean') return state;
  const s = copy(state);
  s.recordAllowed = allow;
  if (allow) s.stats.reputation++;
  s.events.push({ type: 'record-and-post', week: s.week, choice: allow ? 'allow' : 'decline', at: stamp() });
  return story(s, allow ? [
    line('gym', s.name, 'Boleh. Posting aja, tag gue juga. Biar kelihatan bagian mana yang masih berantakan.'),
    line('gym', 'RAKA', 'Siap. Yang jatuh-jatuh juga masuk, ya. Biar jujur.'),
    line('climb', 'CERITA', 'Raka mengangkat ponselnya. Tidak ada penonton besar atau janji apa pun. Cuma satu rekaman kecil yang sebentar lagi muncul di sosmed.')
  ] : [
    line('gym', s.name, 'Nggak dulu, ya. Gue pengin fokus belajar aja. Belum pengin diposting.'),
    line('gym', 'RAKA', 'Santai. Simpan ponsel dulu. Sini, gue bantu lihat pijakan lo.')
  ], 'next-week');
}

export function summary(s) {
  return { title: s.routeDone ? 'PEGANGAN PERTAMA.\nBUKAN YANG TERAKHIR.' : 'BELUM SAMPAI.\nMASIH INGIN KEMBALI.',
    copy: s.routeDone ? `${s.name} berhasil menuntaskan jalur pertamanya bulan ini. Di antara pekerjaan dan hidup yang terus berjalan, ada sesuatu yang mulai tumbuh: keinginan untuk menjadi lebih baik.` : `${s.name} belum menuntaskan jalur pertamanya. Namun satu bulan ini meninggalkan sesuatu yang tidak hilang saat keluar dari venue: rasa ingin mencoba lagi.`,
    note: s.recordAllowed === true ? 'Sebuah rekaman sudah dibagikan. Perjalanan ini mulai punya saksi.' : s.recordAllowed === false ? 'Kali ini, perjalanannya disimpan untuk diri sendiri.' : 'Bulan ini berjalan tanpa rekaman. Masih banyak hal yang menunggu untuk dicoba.' };
}

export function exportJourney(s) {
  return { game: 'Yonas — Satu Pegangan Lagi', chapter: 1, name: s.name,
    startedAt: s.startedAt, finishedAt: s.finishedAt || null,
    choices: s.events, firstRouteCompleted: s.routeDone,
    recordingAndPostingAllowed: s.recordAllowed };
}

export function restoreGame(raw) {
  try {
    const s = JSON.parse(raw);
    if (!s || s.version !== SAVE_VERSION || !['story', 'choice', 'record', 'end'].includes(s.screen)) return null;
    if (!Number.isInteger(s.week) || s.week < 1 || s.week > 4 || !Array.isArray(s.actions) || s.actions.length > 4) return null;
    if (!Array.isArray(s.queue) || !s.queue.length || !Number.isInteger(s.lineIndex) || s.lineIndex < 0 || s.lineIndex >= s.queue.length) return null;
    if (!s.stats || !['money', 'stamina', 'ability', 'reputation'].every(k => Number.isFinite(s.stats[k]) && s.stats[k] >= 0)) return null;
    if (!Array.isArray(s.events) || !Array.isArray(s.history)) return null;
    s.name = cleanName(s.name); return s;
  } catch { return null; }
}
