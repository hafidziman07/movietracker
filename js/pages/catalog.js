import { requireAuth, getMovies, upsertWatchlist, removeFromWatchlist, subscribe, logout } from '../app.js';

const sb = await requireAuth();
if (!sb) throw new Error('unauthenticated');

const $ = s => document.querySelector(s);
document.getElementById('btn-logout').addEventListener('click', logout);

let movies = [];
let uid = null;

async function load() {
  uid = (await sb.auth.getUser()).data.user.id;
  movies = await getMovies();

  const genres = [...new Set(movies.map(m => m.genre).filter(Boolean))].sort();
  if (!$('#genre').options.length) {
    $('#genre').innerHTML = '<option value="">Semua genre</option>' + genres.map(g => `<option>${g}</option>`).join('');
  }
  render();
}

function render() {
  const q = $('#q').value.toLowerCase();
  const genre = $('#genre').value;
  const sort = $('#sort').value;

  let list = movies.filter(m =>
    (!q || m.judul.toLowerCase().includes(q)) && (!genre || m.genre === genre));

  const avg = m => m.review?.length ? m.review.reduce((s, r) => s + r.rating, 0) / m.review.length : 0;
  if (sort === 'tahun') list.sort((a, b) => (b.tahun_rilis || 0) - (a.tahun_rilis || 0));
  else if (sort === 'rating') list.sort((a, b) => avg(b) - avg(a));

  $('#grid').innerHTML = list.map(m => {
    const mine = (m.watchlist || []).find(w => w.id_user === uid);
    const r = avg(m).toFixed(1);
    return `<div class="card">
      <a href="movie.html?id=${m.id_movie}"><img src="${m.poster_url || ''}" alt=""
        onerror="this.style.visibility='hidden'"></a>
      <div class="body">
        <h3>${m.judul}</h3>
        <span class="meta">${m.tahun_rilis || ''} ${m.genre ? '· ' + m.genre : ''}</span><br>
        <span class="badge">${m.review?.length ? `★ ${r} (${m.review.length})` : 'Belum ada rating'}</span>
      </div>
      <div class="actions">
        <select data-id="${m.id_movie}" class="wl-sel">
          <option value="" ${!mine ? 'selected' : ''}>+ Watchlist</option>
          <option value="plan" ${mine?.status === 'plan' ? 'selected' : ''}>Rencana</option>
          <option value="watching" ${mine?.status === 'watching' ? 'selected' : ''}>Menonton</option>
          <option value="completed" ${mine?.status === 'completed' ? 'selected' : ''}>Selesai</option>
        </select>
      </div></div>`;
  }).join('') || '<p class="muted">Tidak ada film yang cocok.</p>';

  $('#info').textContent = `${list.length} film`;
}

$('#grid').addEventListener('change', async e => {
  if (!e.target.classList.contains('wl-sel')) return;
  const id = +e.target.dataset.id, v = e.target.value;
  if (!v) await removeFromWatchlist(id);
  else await upsertWatchlist(id, v);
});

$('#q').addEventListener('input', render);
$('#genre').addEventListener('change', render);
$('#sort').addEventListener('change', render);

load();
// Realtime: katalog otomatis ikut ter-update (rating & film baru)
subscribe('review', load);
subscribe('movies', load);
