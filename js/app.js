import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export async function getClient() {
  if (window._sb) return window._sb;
  const cfg = await getConfig();
  window._sb = createClient(cfg.url, cfg.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true }
  });
  return window._sb;
}

export function getConfig() {
  return new Promise(resolve => {
    if (window.trackerConfig?.url) resolve(window.trackerConfig);
    else window.onTrackerConfig = resolve;
  });
}

// ===== Session helpers =====
export async function requireAuth() {
  const sb = await getClient();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { location.href = '/index.html'; return null; }
  return sb;
}

export async function logout() {
  const sb = await getClient();
  await sb.auth.signOut();
  location.href = '/index.html';
}

// ===== Realtime =====
export function subscribe(table, onChange) {
  getClient().then(sb => {
    sb.channel(`rt-${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, onChange)
      .subscribe();
  });
}

// ===== Data =====
export async function getMovies() {
  const sb = await getClient();
  const { data, error } = await sb.from('movies')
    .select('*, review(rating), watchlist(status, id_user)')
    .order('judul');
  if (error) console.error(error);
  return data || [];
}

export async function getMovie(id) {
  const sb = await getClient();
  const { data } = await sb.from('movies')
    .select('*, review(rating, komentar, tanggal_review, id_user, users(nama))')
    .eq('id_movie', id).single();
  return data;
}

export async function upsertWatchlist(movieId, status) {
  const sb = await getClient();
  const uid = (await sb.auth.getUser()).data.user.id;
  return sb.from('watchlist').upsert({ id_user: uid, id_movie: movieId, status });
}

export async function removeFromWatchlist(movieId) {
  const sb = await getClient();
  const uid = (await sb.auth.getUser()).data.user.id;
  return sb.from('watchlist').delete().eq('id_user', uid).eq('id_movie', movieId);
}

export async function upsertProgress(movieId, progress) {
  const sb = await getClient();
  const uid = (await sb.auth.getUser()).data.user.id;
  return sb.from('progress').upsert(
    { id_user: uid, id_movie: movieId, progress_terakhir: progress, terakhir_nonton: new Date().toISOString() });
}
