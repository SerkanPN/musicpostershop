import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';

const ETSY_API_KEY        = process.env.ETSY_API_KEY!;
const ETSY_SHARED_SECRET  = process.env.ETSY_SHARED_SECRET!;
const ETSY_WEBHOOK_SECRET = process.env.ETSY_WEBHOOK_SECRET!;
const SUPABASE_URL        = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY        = process.env.VITE_SUPABASE_ANON_KEY!;

function verifyEtsySignature(rawBody: string, headers: any): boolean {
  const webhookId        = headers['webhook-id'];
  const webhookTimestamp = headers['webhook-timestamp'];
  const webhookSignature = headers['webhook-signature'];
  if (!webhookId || !webhookTimestamp || !webhookSignature) return false;
  const timestampMs = parseInt(webhookTimestamp) * 1000;
  if (Date.now() - timestampMs > 5 * 60 * 1000) return false;
  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;
  const secret = ETSY_WEBHOOK_SECRET.replace('whsec_', '');
  const secretBytes = Buffer.from(secret, 'base64');
  const computedSig = crypto.createHmac('sha256', secretBytes).update(signedContent).digest('base64');
  return webhookSignature.split(' ').some((s: string) => s === `v1,${computedSig}`);
}

function extractReceiptId(resourceUrl: string): string | null {
  const match = resourceUrl.match(/\/receipts\/(\d+)/);
  return match ? match[1] : null;
}

// Supabase'den geçerli access token al, gerekirse refresh et
async function getAccessToken(): Promise<string | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/etsy_tokens?select=*&order=created_at.desc&limit=1`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  );
  const rows = await res.json();
  if (!rows?.length || !rows[0].refresh_token) return null;

  const token = rows[0];
  const expiresAt = new Date(token.expires_at).getTime();

  // Token geçerli mi?
  if (Date.now() < expiresAt - 60000) return token.access_token;

  // Refresh et
  const refreshRes = await fetch('https://api.etsy.com/v3/public/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: ETSY_API_KEY,
      refresh_token: token.refresh_token,
    })
  });
  const newTokens = await refreshRes.json();
  if (!newTokens.access_token) return null;

  // Güncelle
  await fetch(`${SUPABASE_URL}/rest/v1/etsy_tokens?id=eq.${token.id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      access_token: newTokens.access_token,
      refresh_token: newTokens.refresh_token || token.refresh_token,
      expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
    })
  });

  return newTokens.access_token;
}

// Receipt'ten SKU bul
async function getSkuFromReceipt(resourceUrl: string, accessToken: string): Promise<string> {
  const res = await fetch(resourceUrl, {
    headers: {
      'x-api-key': ETSY_API_KEY,
      'Authorization': `Bearer ${accessToken}`,
    }
  });
  if (!res.ok) return 'soundwave'; // fallback

  const data = await res.json();
  const transactions: any[] = data.transactions || [];
  if (!transactions.length) return 'soundwave';

  const sku = (transactions[0].product_data?.sku || transactions[0].sku || '').toUpperCase();
  const title = (transactions[0].title || '').toUpperCase();
  const text = sku + ' ' + title;

  if (text.includes('RECEIPT'))                              return 'receipt';
  if (text.includes('TYPOGRAPHY'))                           return 'typography';
  if (text.includes('COORD') || text.includes('MAP'))        return 'coordinates';
  if (text.includes('STAR'))                                 return 'starmap';
  if (text.includes('CASSETTE'))                             return 'cassette';
  if (text.includes('TYPEWRITER'))                           return 'typewriter';
  if (text.includes('POLAROID'))                             return 'polaroid';
  if (text.includes('PATENT') || text.includes('BLUEPRINT')) return 'patent';
  if (text.includes('PANTONE') || text.includes('COLOR'))    return 'pantone';
  if (text.includes('NEWS'))                                 return 'newspaper';
  if (text.includes('HEART'))                                return 'heart';
  if (text.includes('AIRBNB') || text.includes('WELCOME'))   return 'airbnb';
  if (text.includes('TODDLER') || text.includes('BABY'))     return 'toddler';
  return 'soundwave';
}

async function insertOrder(orderId: string, sku: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/etsy_orders`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=ignore-duplicates,return=representation'
    },
    body: JSON.stringify({ order_id: orderId, sku, status: 'pending' })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const rawBody = JSON.stringify(req.body);
  const skip = process.env.SKIP_WEBHOOK_VERIFICATION === 'true';
  if (!skip && !verifyEtsySignature(rawBody, req.headers)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { event_type, resource_url } = req.body;
  if (event_type !== 'order.paid') return res.status(200).json({ message: `Ignored: ${event_type}` });

  const receiptId = extractReceiptId(resource_url || '');
  if (!receiptId) return res.status(400).json({ error: 'No receipt_id' });

  // SKU'yu bul
  let sku = 'soundwave';
  const accessToken = await getAccessToken();
  if (accessToken) {
    sku = await getSkuFromReceipt(resource_url, accessToken);
  }

  try {
    await insertOrder(receiptId, sku);
    console.log(`Order inserted: ${receiptId} → ${sku}`);
  } catch (err: any) {
    if (err.message?.includes('duplicate key') || err.message?.includes('23505')) {
      console.log(`Order already exists: ${receiptId}, skipping`);
      return res.status(200).json({ success: true, order_id: receiptId, skipped: true });
    }
    throw err;
  }
  return res.status(200).json({ success: true, order_id: receiptId, sku });
}
