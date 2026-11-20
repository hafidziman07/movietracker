import { requireAuth, upsertWatchlist, removeFromWatchlist, subscribe, logout } from '../app.js';

const sb = await requireAuth();
if (!sb) throw new Error('unauthenticated');

const $ = s => document.querySelector(s);
document.getElementById('btn-logout').addEventListener('click', logout);

let filter = 'all';
let uid = null;

document.querySelectorAll('.tab').forEach(t =>
  t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    filter = t.dataset.status;
    render();
  }));

async function load() {
  uid = (await sb.auth.getUser()).data.user.id;
  render();
}

async function render() {
  let q = sb.from('watchlist')
    .select('id_watchlist, status, movies(*)')
    .eq('id_user', uid)
    .order('id_movie');
  if (filter !== 'all') q = q.eq('status', filter);
  const { data } = await q;

  const ids = (data || []).map(w => w.id_movie);
  let rates = {};
  if (ids.length) {
    const { data: rev } = await sb.from('review').select('id_movie, rating').in('id_movie', ids);
    rates = (rev || []).reduce((a, r) => {
      (a[r.id_movie] = a[r.id_movie] || []).push(r.rating); return a;
    }, {});
  }

  $('#grid').innerHTML = (data || []).map(w => {
    const m = w.movies;
    const rs = rates[w.id_movie] || [];
    const avg = rs.length ? (rs.reduce((a, b) => a + b, 0) / rs.length).toFixed(1) : null;
    return `<div class="card">
      <a href="movie.html?id=${m.id_movie}"><img src="${m.poster_url || ''}" alt=""
        onerror="this.style.visibility='hidden'"></a>
      <div class="body"><h3>${m.judul}</h3>
        <span class="meta">${m.tahun_rilis || ''}</span><br>
        <span class="badge">${avg ? '★ ' + avg : 'Belum ada rating'}</span></div>
      <div class="actions">
        <select data-id="${m.id_movie}" class="wl-sel">
          <option value="plan" ${w.status === 'plan' ? 'selected' : ''}>Rencana</option>
          <option value="watching" ${w.status === 'watching' ? 'selected' : ''}>Menonton</option>
          <option value="completed" ${w.status === 'completed' ? 'selected' : ''}>Selesai</option>
        </select>
        <button class="btn ghost mini wl-rm" data-id="${m.id_movie}">Hapus</button>
      </div></div>`;
  }).join('') || '<p class="muted">Watchlist masih kosong.</p>';

  $('#info').textContent = `${data?.length || 0} item`;
}

$('#grid').addEventListener('change', async e => {
  if (!e.target.classList.contains('wl-sel')) return;
  await upsertWatchlist(+e.target.dataset.id, e.target.value);
  load();
});

$('#grid').addEventListener('click', async e => {
  if (!e.target.classList.contains('wl-rm')) return;
  await removeFromWatchlist(+e.target.dataset.id);
  load();
});

load();
// Realtime: sinkron antar-tab/perangkat
subscribe('watchlist', load);
