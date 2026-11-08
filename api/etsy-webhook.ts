import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';

// ─── Env Variables (Vercel'de tanımlanacak) ───────────────────────────────────
const ETSY_API_KEY        = process.env.ETSY_API_KEY!;
const ETSY_WEBHOOK_SECRET = process.env.ETSY_WEBHOOK_SECRET!;
const SUPABASE_URL        = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY   = process.env.VITE_SUPABASE_ANON_KEY!;

// ─── Etsy SKU → Editör tipi eşleştirmesi ──────────────────────────────────────
function resolveSkuFromTitle(sku: string | null, title: string | null): string {
  const text = ((sku || '') + ' ' + (title || '')).toUpperCase();
  if (text.includes('RECEIPT'))                       return 'receipt';
  if (text.includes('TYPOGRAPHY'))                    return 'typography';
  if (text.includes('COORD') || text.includes('MAP')) return 'coordinates';
  if (text.includes('STAR'))                          return 'starmap';
  if (text.includes('CASSETTE'))                      return 'cassette';
  if (text.includes('TYPEWRITER'))                    return 'typewriter';
  if (text.includes('POLAROID'))                      return 'polaroid';
  if (text.includes('PATENT') || text.includes('BLUEPRINT')) return 'patent';
  if (text.includes('PANTONE') || text.includes('COLOR'))    return 'pantone';
  if (text.includes('NEWS'))                          return 'newspaper';
  if (text.includes('HEART'))                         return 'heart';
  if (text.includes('AIRBNB') || text.includes('WELCOME'))   return 'airbnb';
  if (text.includes('TODDLER') || text.includes('BABY'))     return 'toddler';
  return 'soundwave'; // default
}

// ─── Etsy webhook imza doğrulama ───────────────────────────────────────────────
function verifyEtsySignature(
  rawBody: string,
  headers: Record<string, string | string[] | undefined>
): boolean {
  const webhookId        = headers['webhook-id'] as string;
  const webhookTimestamp = headers['webhook-timestamp'] as string;
  const webhookSignature = headers['webhook-signature'] as string;

  if (!webhookId || !webhookTimestamp || !webhookSignature) return false;

  // 5 dakikadan eski istekleri reddet
  const timestampMs = parseInt(webhookTimestamp) * 1000;
  if (Date.now() - timestampMs > 5 * 60 * 1000) return false;

  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;
  const secret = ETSY_WEBHOOK_SECRET.replace('whsec_', '');
  const secretBytes = Buffer.from(secret, 'base64');
  const computedSig = crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64');

  const expectedSigs = webhookSignature.split(' ');
  return expectedSigs.some(sig => sig.startsWith('v1,') && sig.slice(3) === computedSig);
}

// ─── Etsy API'den sipariş detaylarını çek ─────────────────────────────────────
async function fetchOrderDetails(resourceUrl: string) {
  const res = await fetch(resourceUrl, {
    headers: { 'x-api-key': ETSY_API_KEY }
  });
  if (!res.ok) throw new Error(`Etsy API error: ${res.status}`);
  return res.json();
}

// ─── Supabase'e kayıt yaz ─────────────────────────────────────────────────────
async function insertOrder(orderData: {
  order_id: string;
  sku: string;
  buyer_email?: string;
  buyer_name?: string;
}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/etsy_orders`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      order_id: orderData.order_id,
      sku: orderData.sku,
      status: 'pending',
      buyer_email: orderData.buyer_email || null,
      buyer_name: orderData.buyer_name || null,
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase insert error: ${err}`);
  }
  return res.json();
}

// ─── Ana handler ──────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {

  // Sadece POST kabul et
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Raw body al (imza doğrulama için)
  const rawBody = JSON.stringify(req.body);

  // İmzayı doğrula (production'da aktif et, test için bypass edilebilir)
  const skipVerification = process.env.SKIP_WEBHOOK_VERIFICATION === 'true';
  if (!skipVerification) {
    const isValid = verifyEtsySignature(rawBody, req.headers as Record<string, string>);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  const { event_type, resource_url, shop_id } = req.body;
  console.log(`Webhook received: ${event_type} | Shop: ${shop_id}`);

  // Sadece ödeme tamamlanan siparişleri işle
  if (event_type !== 'order.paid') {
    return res.status(200).json({ message: `Event ${event_type} ignored` });
  }

  try {
    // Etsy API'den sipariş detaylarını çek
    const orderDetails = await fetchOrderDetails(resource_url);

    // receipt_id = Etsy Order ID (müşterinin girecegi numara)
    const etsyOrderId = String(orderDetails.receipt_id);

    // Siparişdeki ürünlerin SKU ve başlıklarına bak
    const transactions: any[] = orderDetails.transactions || [];

    if (transactions.length === 0) {
      console.warn(`No transactions found for order ${etsyOrderId}`);
      return res.status(200).json({ message: 'No transactions' });
    }

    // Her ürün için ayrı kayıt oluştur (müşteri birden fazla ürün almış olabilir)
    const results = [];
    for (const transaction of transactions) {
      const sku = transaction.sku || null;
      const title = transaction.title || null;
      const resolvedSku = resolveSkuFromTitle(sku, title);

      const inserted = await insertOrder({
        order_id: etsyOrderId,
        sku: resolvedSku,
        buyer_name: orderDetails.name || null,
        buyer_email: null, // Etsy buyer email vermez
      });

      console.log(`Order inserted: ${etsyOrderId} → ${resolvedSku}`);
      results.push(inserted);
    }

    return res.status(200).json({ success: true, inserted: results.length });

  } catch (err: any) {
    console.error('Webhook processing error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
