import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';

const ETSY_WEBHOOK_SECRET = process.env.ETSY_WEBHOOK_SECRET!;
const SUPABASE_URL        = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY   = process.env.VITE_SUPABASE_ANON_KEY!;

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
  const expectedSigs = webhookSignature.split(' ');
  return expectedSigs.some((sig: string) => sig === `v1,${computedSig}`);
}

function extractReceiptId(resourceUrl: string): string | null {
  // "https://api.etsy.com/v3/application/shops/12345/receipts/987654321"
  const match = resourceUrl.match(/\/receipts\/(\d+)/);
  return match ? match[1] : null;
}

async function insertOrder(orderId: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/etsy_orders`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      order_id: orderId,
      sku: 'pending_selection', // Müşteri /claim'de seçecek
      status: 'pending',
    })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawBody = JSON.stringify(req.body);
  const skipVerification = process.env.SKIP_WEBHOOK_VERIFICATION === 'true';

  if (!skipVerification) {
    if (!verifyEtsySignature(rawBody, req.headers)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  const { event_type, resource_url } = req.body;
  console.log('Webhook:', event_type, resource_url);

  if (event_type !== 'order.paid') {
    return res.status(200).json({ message: `Ignored: ${event_type}` });
  }

  const receiptId = extractReceiptId(resource_url || '');
  if (!receiptId) {
    return res.status(400).json({ error: 'Could not extract receipt_id from resource_url' });
  }

  try {
    const result = await insertOrder(receiptId);
    console.log('Order inserted:', receiptId);
    return res.status(200).json({ success: true, order_id: receiptId });
  } catch (err: any) {
    console.error('Insert error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
