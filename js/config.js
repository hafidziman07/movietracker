// Konfigurasi runtime untuk frontend statis.
// Nilai diambil dari /api/config (Vercel Serverless Function)
// sehingga SUPABASE_URL & SUPABASE_ANON_KEY bisa diatur lewat Vercel Environment Variables.
window.trackerConfig = window.trackerConfig || {};
fetch('/api/config')
  .then(r => r.json())
  .then(cfg => {
    window.trackerConfig.url = cfg.url;
    window.trackerConfig.anonKey = cfg.anonKey;
    if (window.onTrackerConfig) window.onTrackerConfig(cfg);
  });
