// Vercel Serverless Function: kirim konfigurasi Supabase ke frontend.
// SUPABASE_URL dan SUPABASE_ANON_KEY diset sebagai Environment Variables di Vercel.
export default function handler(_req, res) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return res.status(500).json({
      error: 'SUPABASE_URL / SUPABASE_ANON_KEY belum diset di Vercel Environment Variables.'
    });
  }
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ url, anonKey });
}
