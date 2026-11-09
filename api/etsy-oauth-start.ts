import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';

const ETSY_API_KEY = process.env.ETSY_API_KEY!;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

function base64url(buf: Buffer) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // PKCE
  const codeVerifier = base64url(crypto.randomBytes(32));
  const codeChallenge = base64url(crypto.createHash('sha256').update(codeVerifier).digest());
  const state = base64url(crypto.randomBytes(16));

  // Code verifier'ı Supabase'e kaydet
  await fetch(`${SUPABASE_URL}/rest/v1/etsy_tokens`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ code_verifier: codeVerifier, state })
  });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: ETSY_API_KEY,
    redirect_uri: 'https://www.musicposter.shop/api/etsy-oauth-callback',
    scope: 'transactions_r',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return res.redirect(`https://www.etsy.com/oauth/connect?${params.toString()}`);
}
