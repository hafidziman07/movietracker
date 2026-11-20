import { requireAuth, subscribe, logout, upsertWatchlist, upsertProgress } from '../app.js';

const sb = await requireAuth();
if (!sb) throw new Error('unauthenticated');

const $ = s => document.querySelector(s);
document.getElementById('btn-logout').addEventListener('click', logout);

const id = +new URLSearchParams(location.search).get('id');
if (!id) { location.href = 'catalog.html'; throw new Error('no id'); }

let rating = 0;
let user = null;

document.querySelectorAll('#stars button').forEach(b =>
  b.addEventListener('click', () => {
    rating = +b.dataset.v;
    document.querySelectorAll('#stars button').forEach(x =>
      x.classList.toggle('on', +x.dataset.v <= rating));
  }));

async function load() {
  user = (await sb.auth.getUser()).data.user;

  const { data: m } = await sb.from('movies')
    .select('*, review(rating, komentar, tanggal_review, id_user, users(nama))')
    .eq('id_movie', id).single();
  if (!m) { $('#movie-detail').innerHTML = '<p class="muted">Film tidak ditemukan.</p>'; return; }

  const rs = (m.review || []).map(r => r.rating);
  const avg = rs.length ? (rs.reduce((a, b) => a + b, 0) / rs.length).toFixed(1) : null;

  const { data: myW } = await sb.from('watchlist')
    .select('status').eq('id_user', user.id).eq('id_movie', id).maybeSingle();
  const { data: myP } = await sb.from('progress')
    .select('progress_terakhir').eq('id_user', user.id).eq('id_movie', id).maybeSingle();

  $('#movie-detail').innerHTML = `
    <img src="${m.poster_url || ''}" alt="" onerror="this.style.visibility='hidden'">
    <div class="info">
      <h1>${m.judul}</h1>
      <p class="muted">${m.tahun_rilis || ''} ${m.genre ? '· ' + m.genre : ''} ${m.durasi ? '· ' + m.durasi + ' menit' : ''} ${m.rating_umur ? '· ' + m.rating_umur : ''}</p>
      <p>${m.deskripsi || ''}</p>
      <p><span class="badge">${avg ? '★ ' + avg + ' / 5 (' + rs.length + ' review)' : 'Belum ada rating'}</span></p>
      <div class="actions" style="display:flex;gap:8px;align-items:center">
        <select id="my-wl" class="wl-sel">
          <option value="" ${!myW ? 'selected' : ''}>+ Watchlist</option>
          <option value="plan" ${myW?.status === 'plan' ? 'selected' : ''}>Rencana</option>
          <option value="watching" ${myW?.status === 'watching' ? 'selected' : ''}>Menonton</option>
          <option value="completed" ${myW?.status === 'completed' ? 'selected' : ''}>Selesai</option>
        </select>
        <label>Progress: <input id="my-prog" type="number" min="0" max="${m.durasi || 999}" value="${myP?.progress_terakhir ?? 0}" style="width:80px;background:var(--panel2);border:1px solid #353a48;color:var(--text);border-radius:6px;padding:6px"> menit</label>
      </div>
    </div>`;

  $('#my-wl').addEventListener('change', async e => e.target.value && upsertWatchlist(id, e.target.value));
  $('#my-prog').addEventListener('change', async e => upsertProgress(id, +e.target.value || 0));

  // hanya tampilkan form review jika user belum review film ini
  const mine = (m.review || []).find(r => r.id_user === user.id);
  $('#review-box').style.display = mine ? 'none' : 'block';
  document.querySelectorAll('#stars button').forEach(x =>
    x.classList.toggle('on', mine && +x.dataset.v <= mine.rating));
  if (mine) rating = mine.rating;
  $('#komentar').value = mine?.komentar || '';
  $('#login-hint').hidden = true;

  $('#reviews').innerHTML = (m.review || []).length
    ? m.review.map(r => `
      <li>
        <b>${r.users?.nama || 'Anonim'}</b>
        <span class="badge">⭐ ${r.rating}/5</span>
        ${r.komentar ? `<div>${r.komentar}</div>` : ''}
        ${r.id_user === user.id ? '<button class="btn ghost mini" data-del="' + r.id_review + '">Hapus review</button>' : ''}
      </li>`).join('')
    : '<li class="muted">Belum ada review. Jadilah yang pertama!</li>';
}

$('#reviews').addEventListener('click', async e => {
  const delId = e.target.dataset?.del;
  if (!delId) return;
  await sb.from('review').delete().eq('id_review', delId);
  load();
});

$('#btn-review').addEventListener('click', async () => {
  const komentar = $('#komentar').value.trim();
  if (!rating) { $('#review-msg').textContent = 'Pilih bintang dulu (1-5).'; return; }
  const { error } = await sb.from('review').upsert(
    { id_user: user.id, id_movie: id, rating, komentar, tanggal_review: new Date().toISOString().slice(0, 10) });
  $('#review-msg').textContent = error ? ('Gagal: ' + error.message) : 'Review tersimpan!';
  if (!error) load();
});

load();
// Realtime: review baru/hapus dari siapa pun langsung tampil
subscribe('review', load);
