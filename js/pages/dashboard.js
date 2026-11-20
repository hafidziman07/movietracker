import { requireAuth, getMovies, subscribe, logout } from '../app.js';

const sb = await requireAuth();
if (!sb) throw new Error('unauthenticated');

const $ = s => document.querySelector(s);
const statusLabel = { plan: 'Rencana', watching: 'Menonton', completed: 'Selesai' };

document.getElementById('btn-logout').addEventListener('click', logout);

async function load() {
  const user = (await sb.auth.getUser()).data.user;
  $('#hello').textContent = `Halo, ${user.user_metadata?.nama || user.email}!`;
  const uid = user.id;
  const movies = await getMovies();

  const wl = movies.flatMap(m => m.watchlist.map(w => ({ ...w, movie: m })))
    .filter(w => w.id_user === uid);
  const watching = wl.filter(w => w.status === 'watching').slice(0, 6);

  $('#stats').innerHTML = `
    <div class="stat"><b>${movies.length}</b>Film di katalog</div>
    <div class="stat"><b>${watching.length}</b>Sedang menonton</div>
    <div class="stat"><b>${wl.filter(w => w.status === 'completed').length}</b>Selesai</div>
    <div class="stat"><b>${movies.reduce((s, m) => s + (m.review?.length || 0), 0)}</b>Total review</div>`;

  $('#watching').innerHTML = watching.length
    ? watching.map(cardHtml).join('')
    : '<p class="muted">Belum ada film yang sedang ditonton. <a href="catalog.html">Lihat katalog →</a></p>';
}

function cardHtml(w) {
  return `<a class="card" href="movie.html?id=${w.movie.id_movie}">
    <img src="${w.movie.poster_url || ''}" alt="" onerror="this.style.visibility='hidden'">
    <div class="body"><h3>${w.movie.judul}</h3>
      <span class="meta">${w.movie.tahun_rilis || ''} · ${statusLabel[w.status]}</span></div></a>`;
}

async function loadRecent() {
  const { data } = await sb.from('review')
    .select('rating, komentar, tanggal_review, users(nama), movies(judul, id_movie)')
    .order('tanggal_review', { ascending: false }).limit(5);
  $('#recent-reviews').innerHTML = (data || []).map(r => `
    <li>⭐ ${r.rating}/5 — <b>${r.users?.nama || '?'}</b> untuk
      <a href="movie.html?id=${r.movies?.id_movie}">${r.movies?.judul || '?'}</a>
      ${r.komentar ? `<div class="muted">${r.komentar}</div>` : ''}</li>`).join('')
    || '<li class="muted">Belum ada review.</li>';
}

load();
loadRecent();
subscribe('review', loadRecent);
subscribe('watchlist', load);
subscribe('progress', load);
