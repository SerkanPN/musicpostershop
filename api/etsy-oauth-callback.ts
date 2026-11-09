import type { VercelRequest, VercelResponse } from '@vercel/node';

const ETSY_API_KEY = process.env.ETSY_API_KEY!;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).send('Missing code or state');
  }

  // State + code_verifier'ı Supabase'den al
  const svRes = await fetch(
    `${SUPABASE_URL}/rest/v1/etsy_tokens?state=eq.${state}&select=*&order=created_at.desc&limit=1`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  );
  const svData = await svRes.json();

  if (!svData?.length || !svData[0].code_verifier) {
    return res.status(400).send('Invalid state - not found in DB');
  }

  const codeVerifier = svData[0].code_verifier;
  const rowId = svData[0].id;

  // Etsy'den access token al
  const tokenRes = await fetch('https://api.etsy.com/v3/public/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: ETSY_API_KEY,
      redirect_uri: 'https://www.musicposter.shop/api/etsy-oauth-callback',
      code: code as string,
      code_verifier: codeVerifier,
    })
  });

  const tokens = await tokenRes.json();
  if (!tokens.access_token) {
    return res.status(400).json({ error: 'Token exchange failed', details: tokens });
  }

  // Aynı satırı güncelle
  await fetch(`${SUPABASE_URL}/rest/v1/etsy_tokens?id=eq.${rowId}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    })
  });

  return res.status(200).send(`
    <html><body style="font-family:sans-serif;padding:40px;text-align:center;background:#0a0a0a;color:white">
      <h2>✅ Etsy bağlantısı başarılı!</h2>
      <p>Token kaydedildi. Bu sekmeyi kapatabilirsin.</p>
    </body></html>
  `);
}
