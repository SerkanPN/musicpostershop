import React, { useRef } from 'react';
import * as fabric from 'fabric';
import PosterEngine from '../components/PosterEngine';
import { POSTER_PRESETS } from '../lib/presets';

/* ============================================================================
   TYPES
============================================================================ */

interface ReceiptItemState {
  id: string;
  name: string;
  price: string;
}

interface Override {
  fontSize?: number;
  color?: string;
}

interface ReceiptDesignState {
  canvasSize: string;
  orientation: 'portrait' | 'landscape';
  presetId: string;

  bgColor: string;
  paperColor: string;
  inkColor: string;
  accentColor: string;
  headerFont: string;
  bodyFont: string;

  storeName: string;
  storeSubtitle: string;
  receiptLabel: string;
  dateLabel: string;
  orderNo: string;
  cashierLine: string;

  items: ReceiptItemState[];

  taxLabel: string;
  taxValue: string;
  footerNote: string;
  footerSub: string;

  showBarcode: boolean;
  showPerforation: boolean;
  currency: string;

  overrides: Record<string, Override>;
}

/* ============================================================================
   CATEGORY MOODS - her kategori kendi "duygu butunlugu"nu tasir
   (kagit rengi, murekkep rengi, vurgu rengi, baslik/govde fontu, mat rengi)
============================================================================ */

interface Mood {
  paper: string;
  ink: string;
  accent: string;
  mat: string;
  headerFont: string;
  bodyFont: string;
  dark?: boolean;
}

const MOODS: Record<string, Mood> = {
  Love:        { paper: '#fff7f5', ink: '#3a1418', accent: '#c0392b', mat: '#e9d9d5', headerFont: 'Dancing Script', bodyFont: 'Courier Prime' },
  Sports:      { paper: '#f7f7f3', ink: '#141414', accent: '#d32f2f', mat: '#dcdcd6', headerFont: 'Bebas Neue',     bodyFont: 'Space Mono' },
  Health:      { paper: '#f2faf5', ink: '#123321', accent: '#2e7d32', mat: '#dbece1', headerFont: 'Oswald',         bodyFont: 'Courier Prime' },
  Hobbies:     { paper: '#0e120f', ink: '#3dff96', accent: '#3dff96', mat: '#05100a', headerFont: 'VT323',          bodyFont: 'Share Tech Mono', dark: true },
  Business:    { paper: '#faf7ef', ink: '#1a1a1a', accent: '#b8860b', mat: '#e7e0cd', headerFont: 'Playfair Display', bodyFont: 'Courier Prime' },
  Travel:      { paper: '#fdf6ec', ink: '#2b2118', accent: '#d98324', mat: '#eadfc9', headerFont: 'Josefin Sans',   bodyFont: 'Courier Prime' },
  Milestones:  { paper: '#fffdf5', ink: '#1a1a1a', accent: '#b8962e', mat: '#e9e2c8', headerFont: 'Cinzel',         bodyFont: 'Courier Prime' },
  Home:        { paper: '#f5f2ea', ink: '#2f2a20', accent: '#7c9473', mat: '#e2ded1', headerFont: 'Nunito',         bodyFont: 'Courier Prime' },
  Family:      { paper: '#fff8f1', ink: '#3a2a1a', accent: '#e08e79', mat: '#ecdfd2', headerFont: 'Caveat',         bodyFont: 'Courier Prime' },
  Culture:     { paper: '#f2ede1', ink: '#1c1c1c', accent: '#8a5a44', mat: '#ded5c3', headerFont: 'Abril Fatface',  bodyFont: 'Courier Prime' },
  Education:   { paper: '#f7f7f4', ink: '#16233a', accent: '#1f4e8c', mat: '#dcdfe6', headerFont: 'Merriweather',   bodyFont: 'Courier Prime' },
  Faith:       { paper: '#fbf8f0', ink: '#2a231a', accent: '#a9843b', mat: '#e9e2cf', headerFont: 'Cinzel',         bodyFont: 'Courier Prime' },
  Holiday:     { paper: '#fff5f5', ink: '#1a2e1a', accent: '#b02e2e', mat: '#e6d9d0', headerFont: 'Bungee',         bodyFont: 'Courier Prime' },
  Career:      { paper: '#f5f5f7', ink: '#1a1a1a', accent: '#1d3557', mat: '#dde0e6', headerFont: 'Montserrat',    bodyFont: 'Courier Prime' },
  Pets:        { paper: '#fbf6ee', ink: '#33261a', accent: '#e08a3c', mat: '#ecdcc4', headerFont: 'Chewy',          bodyFont: 'Courier Prime' },
};

/* ============================================================================
   PRESET CONTENT - her preset id icin kendine ait metin/oge seti
   (fiyatlar cogunlukla sembolik: "-", "priceless", sayi vb.)
============================================================================ */

interface PresetContent {
  category: keyof typeof MOODS;
  storeName: string;
  storeSubtitle: string;
  receiptLabel: string;
  items: { name: string; price: string }[];
  footerNote: string;
  footerSub: string;
  currency?: string;
}

const PRESET_CONTENT: Record<string, PresetContent> = {
  'love-invoice': { category: 'Love', storeName: 'LOVE INVOICE', storeSubtitle: 'Issued for a lifetime', receiptLabel: 'STATEMENT OF THE HEART', items: [
    { name: 'First Glance', price: '0.00' }, { name: 'Butterflies (Unlimited)', price: '0.00' },
    { name: 'Late Night Calls', price: '0.00' }, { name: 'Every Little Thing About You', price: 'INF' },
    { name: 'A Lifetime Together', price: 'INF' } ], footerNote: 'PAID IN FULL, WITH MY HEART', footerSub: 'No refunds. No returns. Ever.' },

  'anniversary-bill': { category: 'Love', storeName: 'ANNIVERSARY BILL', storeSubtitle: 'Years, and counting', receiptLabel: 'ACCOUNT STATEMENT', items: [
    { name: 'Year One - Learning You', price: '-' }, { name: 'Year Two - Choosing You', price: '-' },
    { name: 'Every Year After', price: '-' }, { name: 'Inside Jokes', price: 'PRICELESS' } ],
    footerNote: 'BALANCE: STILL FALLING FOR YOU', footerSub: 'Auto-renews every year.' },

  'marathon-finisher': { category: 'Sports', storeName: 'FINISH LINE RECEIPT', storeSubtitle: '26.2 MILES', receiptLabel: 'RACE RESULT', items: [
    { name: 'Miles Run', price: '26.2' }, { name: 'Training Weeks', price: '16' },
    { name: 'Blisters Earned', price: '7' }, { name: 'Doubts Silenced', price: 'ALL' } ],
    footerNote: 'RACE COMPLETE', footerSub: 'Finisher medal included.' },

  'weight-loss-journey': { category: 'Health', storeName: 'TRANSFORMATION RECEIPT', storeSubtitle: 'Progress, not perfection', receiptLabel: 'PROGRESS REPORT', items: [
    { name: 'Pounds Lost', price: '-' }, { name: 'Workouts Logged', price: '-' },
    { name: 'Old Excuses', price: '0' }, { name: 'New Habits', price: 'PRICELESS' } ],
    footerNote: 'BALANCE: STRONGER THAN BEFORE', footerSub: 'Non-refundable results.' },

  'bodybuilding-stats': { category: 'Health', storeName: 'LIFTING LEDGER', storeSubtitle: 'Iron & discipline', receiptLabel: 'PERSONAL RECORDS', items: [
    { name: 'Bench Press PR', price: '-' }, { name: 'Squat PR', price: '-' },
    { name: 'Deadlift PR', price: '-' }, { name: 'Protein Shakes', price: 'INF' } ],
    footerNote: 'GAINS RECORDED', footerSub: 'No spotters were harmed.' },

  'championship-win': { category: 'Sports', storeName: 'CHAMPIONSHIP RECEIPT', storeSubtitle: 'Champions, est. this year', receiptLabel: 'FINAL SCORE', items: [
    { name: 'Season Record', price: '-' }, { name: 'Trophies Won', price: '1' },
    { name: 'Doubters', price: '0' }, { name: 'Team Spirit', price: 'MAX' } ],
    footerNote: 'TITLE SECURED', footerSub: 'Ring size pending.' },

  'gamer-match-stats': { category: 'Hobbies', storeName: 'MATCH_RECEIPT.LOG', storeSubtitle: 'GG WP', receiptLabel: 'POST-MATCH SUMMARY', items: [
    { name: 'KILLS', price: '-' }, { name: 'ASSISTS', price: '-' },
    { name: 'MVP AWARDS', price: '-' }, { name: 'RAGE QUITS', price: '0' } ],
    footerNote: 'VICTORY_ROYALE.EXE', footerSub: 'Session synced to cloud.' },

  'cafe-bistro': { category: 'Business', storeName: 'THE CORNER BISTRO', storeSubtitle: 'Fresh daily', receiptLabel: 'GUEST CHECK', items: [
    { name: 'House Blend Coffee', price: '4.50' }, { name: 'Avocado Toast', price: '8.00' },
    { name: 'Croissant', price: '3.25' }, { name: 'Good Conversation', price: '0.00' } ],
    footerNote: 'THANK YOU, COME AGAIN', footerSub: 'Tips appreciated, not required.', currency: '$' },

  'creator-milestones': { category: 'Business', storeName: 'CREATOR RECEIPT', storeSubtitle: 'Content that connects', receiptLabel: 'MILESTONE REPORT', items: [
    { name: 'Subscribers Gained', price: '-' }, { name: 'Videos Published', price: '-' },
    { name: 'All-Nighters', price: '-' }, { name: 'Comment Replies', price: 'INF' } ],
    footerNote: 'MILESTONE UNLOCKED', footerSub: 'Next goal: loading...' },

  'first-business': { category: 'Business', storeName: 'STARTUP COSTS', storeSubtitle: 'Founded on faith', receiptLabel: 'FOUNDING LEDGER', items: [
    { name: 'Business License', price: '-' }, { name: 'First Sale', price: '-' },
    { name: 'Sleepless Nights', price: 'INF' }, { name: 'Belief In The Idea', price: 'PRICELESS' } ],
    footerNote: 'OPEN FOR BUSINESS', footerSub: 'Established this year.' },

  'bucket-list-traveler': { category: 'Travel', storeName: 'BUCKET LIST RECEIPT', storeSubtitle: 'Passport stamps & stories', receiptLabel: 'ITINERARY SUMMARY', items: [
    { name: 'Countries Visited', price: '-' }, { name: 'Flights Taken', price: '-' },
    { name: 'Lost Luggage', price: '1' }, { name: 'Memories Made', price: 'INF' } ],
    footerNote: 'JOURNEY CONTINUES', footerSub: 'Next stop: TBD.' },

  'birthday-invoice-18': { category: 'Milestones', storeName: '18TH BIRTHDAY INVOICE', storeSubtitle: 'Officially an adult', receiptLabel: 'INVOICE', items: [
    { name: 'Years of Chaos', price: '18' }, { name: 'Advice Ignored', price: '-' },
    { name: 'Adulthood', price: 'ACTIVATED' }, { name: 'Cake Slices', price: '-' } ],
    footerNote: 'WELCOME TO ADULTHOOD', footerSub: 'Terms & conditions apply.' },

  'birthday-invoice-30': { category: 'Milestones', storeName: '30TH BIRTHDAY INVOICE', storeSubtitle: 'Dirty thirty', receiptLabel: 'INVOICE', items: [
    { name: 'Years Lived', price: '30' }, { name: 'Wisdom Gained', price: 'SOME' },
    { name: 'Knees That Still Work', price: '2' }, { name: 'Good Times', price: 'INF' } ],
    footerNote: 'STILL GOT IT', footerSub: 'Warranty extended.' },

  'roommate-rules-receipt': { category: 'Home', storeName: 'ROOMMATE RECEIPT', storeSubtitle: 'House rules, itemized', receiptLabel: 'HOUSE AGREEMENT', items: [
    { name: 'Clean Your Dishes', price: '-' }, { name: "Don't Touch My Food", price: '-' },
    { name: 'Quiet After 11PM', price: '-' }, { name: 'Good Vibes Only', price: 'REQUIRED' } ],
    footerNote: 'SIGNED BY ALL ROOMMATES', footerSub: 'Violators do the dishes.' },

  'graduation-costs': { category: 'Milestones', storeName: 'GRADUATION RECEIPT', storeSubtitle: 'Cap, gown, done', receiptLabel: 'FINAL TRANSCRIPT', items: [
    { name: 'Years of Studying', price: '-' }, { name: 'Cups of Coffee', price: '-' },
    { name: 'All-Nighters', price: '-' }, { name: 'Diploma', price: 'EARNED' } ],
    footerNote: 'CLASS DISMISSED', footerSub: 'Student loans not included.' },

  'wedding-day-invoice': { category: 'Love', storeName: 'WEDDING DAY INVOICE', storeSubtitle: 'One day, forever after', receiptLabel: 'INVOICE', items: [
    { name: 'The Dress', price: '-' }, { name: 'First Dance', price: '-' },
    { name: 'Happy Tears', price: 'INF' }, { name: '"I Do"', price: 'PRICELESS' } ],
    footerNote: 'MARRIED, WITH LOVE', footerSub: 'No returns accepted.' },

  'pet-adoption-receipt': { category: 'Pets', storeName: 'ADOPTION RECEIPT', storeSubtitle: 'Gotcha day', receiptLabel: 'ADOPTION CERTIFICATE', items: [
    { name: 'One Good Boy/Girl', price: 'PRICELESS' }, { name: 'Chewed Shoes', price: '-' },
    { name: 'Belly Rubs', price: 'INF' }, { name: 'Unconditional Love', price: 'INCLUDED' } ],
    footerNote: 'ADOPTED, NOT SHOPPED', footerSub: 'Best decision ever made.' },

  'new-baby-invoice': { category: 'Family', storeName: 'NEW BABY INVOICE', storeSubtitle: 'Welcome to the world', receiptLabel: 'BIRTH RECEIPT', items: [
    { name: 'Tiny Fingers', price: '10' }, { name: 'Tiny Toes', price: '10' },
    { name: 'Sleepless Nights', price: 'INF' }, { name: 'Love At First Sight', price: 'INSTANT' } ],
    footerNote: 'DELIVERED WITH LOVE', footerSub: 'Handle with care, forever.' },

  'coffee-addiction-receipt': { category: 'Culture', storeName: 'COFFEE ADDICTION RECEIPT', storeSubtitle: 'Fueled by caffeine', receiptLabel: 'DAILY TAB', items: [
    { name: 'Espresso Shots', price: '-' }, { name: 'Cups This Week', price: '-' },
    { name: 'Decaf Considered', price: 'NEVER' }, { name: 'Personality', price: 'CAFFEINE' } ],
    footerNote: 'REFILL REQUIRED', footerSub: 'No decaf, no discussion.' },

  'gamer-subscription-receipt': { category: 'Hobbies', storeName: 'SUBSCRIPTION_RECEIPT.LOG', storeSubtitle: 'Level: MAX', receiptLabel: 'ACCOUNT SUMMARY', items: [
    { name: 'HOURS PLAYED', price: '-' }, { name: 'ACHIEVEMENTS', price: '-' },
    { name: 'RAGE QUITS', price: '-' }, { name: 'LOOT DROPPED', price: 'LEGENDARY' } ],
    footerNote: 'GAME_SAVED.DAT', footerSub: 'Auto-renews next season.' },

  'first-car-invoice': { category: 'Milestones', storeName: 'FIRST CAR INVOICE', storeSubtitle: 'Freedom, four wheels', receiptLabel: 'BILL OF SALE', items: [
    { name: 'Down Payment', price: '-' }, { name: 'First Road Trip', price: '-' },
    { name: 'Parking Tickets', price: '-' }, { name: 'Freedom', price: 'UNLOCKED' } ],
    footerNote: 'KEYS IN HAND', footerSub: 'Drive safe out there.' },

  'degree-cost-invoice': { category: 'Education', storeName: 'DEGREE INVOICE', storeSubtitle: 'Knowledge, itemized', receiptLabel: 'TUITION STATEMENT', items: [
    { name: 'Tuition', price: '-' }, { name: 'Textbooks', price: '-' },
    { name: 'Late Nights Studying', price: '-' }, { name: 'Degree Earned', price: 'CONFERRED' } ],
    footerNote: 'DILIGENCE REWARDED', footerSub: 'Loans not tax-deductible.' },

  'home-renovation-invoice': { category: 'Home', storeName: 'RENOVATION INVOICE', storeSubtitle: 'Before & after', receiptLabel: 'PROJECT INVOICE', items: [
    { name: 'Paint & Supplies', price: '-' }, { name: 'Weekends Lost', price: '-' },
    { name: 'Arguments About Tile', price: '-' }, { name: 'A Home We Love', price: 'WORTH IT' } ],
    footerNote: 'PROJECT COMPLETE', footerSub: 'Contractor not included.' },

  'retirement-invoice': { category: 'Milestones', storeName: 'RETIREMENT INVOICE', storeSubtitle: 'Clocked out for good', receiptLabel: 'FINAL PAYCHECK', items: [
    { name: 'Years of Service', price: '-' }, { name: 'Early Alarms', price: 'DONE' },
    { name: 'Vacation Days Owed', price: '-' }, { name: 'Free Time', price: 'UNLIMITED' } ],
    footerNote: 'MISSION ACCOMPLISHED', footerSub: 'Pension not included on this poster.' },

  'bar-mitzvah-invoice': { category: 'Faith', storeName: 'BAR MITZVAH INVOICE', storeSubtitle: 'Today I am a man', receiptLabel: 'CEREMONY RECORD', items: [
    { name: 'Torah Portion', price: 'MASTERED' }, { name: 'Hora Dance Circles', price: '-' },
    { name: "Mazel Tovs Received", price: 'INF' }, { name: 'Gift Envelopes', price: '-' } ],
    footerNote: 'MAZEL TOV', footerSub: 'Blessings, not billed.' },

  'quinceanera-invoice': { category: 'Faith', storeName: 'QUINCEANERA INVOICE', storeSubtitle: 'Fifteen and shining', receiptLabel: 'CEREMONY RECORD', items: [
    { name: 'The Dress', price: '-' }, { name: 'Court of Honor', price: '-' },
    { name: 'Last Doll', price: 'RECEIVED' }, { name: 'Waltz Danced', price: '-' } ],
    footerNote: 'FELIZ QUINCE', footerSub: 'A celebration, not a bill.' },

  'christmas-wishlist-receipt': { category: 'Holiday', storeName: 'CHRISTMAS WISHLIST', storeSubtitle: 'Dear Santa,', receiptLabel: 'NORTH POLE ORDER', items: [
    { name: 'Item One', price: '-' }, { name: 'Item Two', price: '-' },
    { name: 'Item Three', price: '-' }, { name: 'Good Behavior', price: 'MOSTLY' } ],
    footerNote: 'NAUGHTY OR NICE: NICE', footerSub: 'Please rush delivery.' },

  'new-job-invoice': { category: 'Career', storeName: 'NEW JOB INVOICE', storeSubtitle: 'First day, fresh start', receiptLabel: 'ONBOARDING RECEIPT', items: [
    { name: 'Nervous Energy', price: '-' }, { name: 'New Badge', price: 'ISSUED' },
    { name: 'Coffee Breaks', price: '-' }, { name: 'Growth Ahead', price: 'PENDING' } ],
    footerNote: 'ONBOARDING COMPLETE', footerSub: 'Probation period may apply.' },

  'first-apartment-invoice': { category: 'Career', storeName: 'FIRST APARTMENT INVOICE', storeSubtitle: 'My own front door', receiptLabel: 'LEASE RECEIPT', items: [
    { name: 'Security Deposit', price: '-' }, { name: 'Flat-Pack Furniture', price: '-' },
    { name: 'Independence', price: 'PRICELESS' }, { name: 'Ramen Dinners', price: '-' } ],
    footerNote: 'KEYS RECEIVED', footerSub: 'Landlord not included.' },

  'ivf-journey-invoice': { category: 'Family', storeName: 'IVF JOURNEY INVOICE', storeSubtitle: 'Every step counted', receiptLabel: 'JOURNEY SUMMARY', items: [
    { name: 'Appointments', price: '-' }, { name: 'Hope', price: 'NEVER SOLD OUT' },
    { name: 'Hard Days', price: '-' }, { name: 'This Miracle', price: 'WORTH IT ALL' } ],
    footerNote: 'FINALLY HOME', footerSub: 'Paid in patience and love.' },

  'cancer-recovery-invoice': { category: 'Health', storeName: 'RECOVERY INVOICE', storeSubtitle: 'Cancer-free, forever grateful', receiptLabel: 'FINAL STATEMENT', items: [
    { name: 'Treatments Completed', price: '-' }, { name: 'Bad Days', price: 'SURVIVED' },
    { name: 'Support System', price: 'INF' }, { name: 'Second Chance', price: 'RECEIVED' } ],
    footerNote: 'BALANCE: ZERO. CANCER-FREE.', footerSub: 'Gratitude, non-refundable.' },
};

/* ============================================================================
   HELPERS
============================================================================ */

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function buildOrderNo(id: string): string {
  const h = hashString(id);
  return `#${(h % 900000 + 100000)}`;
}

function buildDateLabel(): string {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}.${d.getFullYear()}`;
}

function makeItemId(prefix: string, i: number) {
  return `${prefix}-${i}`;
}

/** Belirli bir preset id'sinden tam bir ReceiptDesignState uretir */
export function buildPresetState(presetId: string, base?: Partial<ReceiptDesignState>): ReceiptDesignState {
  const content = PRESET_CONTENT[presetId] || PRESET_CONTENT['love-invoice'];
  const mood = MOODS[content.category];

  return {
    canvasSize: base?.canvasSize || '8x10',
    orientation: base?.orientation || 'portrait',
    presetId,

    bgColor: mood.mat,
    paperColor: mood.paper,
    inkColor: mood.ink,
    accentColor: mood.accent,
    headerFont: mood.headerFont,
    bodyFont: mood.bodyFont,

    storeName: content.storeName,
    storeSubtitle: content.storeSubtitle,
    receiptLabel: content.receiptLabel,
    dateLabel: buildDateLabel(),
    orderNo: buildOrderNo(presetId),
    cashierLine: 'SERVED WITH LOVE',

    items: content.items.map((it, i) => ({ id: makeItemId(presetId, i), name: it.name, price: it.price })),

    taxLabel: 'TAX (LOVE)',
    taxValue: '0.00',
    footerNote: content.footerNote,
    footerSub: content.footerSub,

    showBarcode: true,
    showPerforation: true,
    currency: content.currency || '',

    overrides: {},
  };
}

export const RECEIPT_DEFAULT_STATE: ReceiptDesignState = buildPresetState('love-invoice');

/** presets.ts'teki duz (kategori alanli) listeyi PosterEngine'in bekledigi
 *  { label, items: [{id,label}] } grup formatina cevirir */
function groupPresets(list: { id: string; label: string; category: string }[]) {
  const map = new Map<string, { id: string; label: string }[]>();
  list.forEach((p) => {
    if (!map.has(p.category)) map.set(p.category, []);
    map.get(p.category)!.push({ id: p.id, label: p.label });
  });
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

const RECEIPT_PRESETS_GROUPED = groupPresets(POSTER_PRESETS.RECEIPT);

/* ============================================================================
   FABRIC CIZIM MOTORU
   setupCanvas / updateCanvas / onLayoutChange hepsi bu tek fonksiyonu kullanir.
   Boylece "duygu butunlugu" (renk/font/icerik) her zaman state'ten turer,
   yerlesim ise orientation + gercek piksel boyutuna (dims) gore yeniden hesaplanir.
============================================================================ */

function drawReceipt(
  canvas: fabric.Canvas,
  dims: { width: number; height: number },
  state: ReceiptDesignState,
  built: React.MutableRefObject<fabric.Object[]>
) {
  built.current.forEach((o) => { try { canvas.remove(o); } catch { /* noop */ } });
  built.current = [];

  const locked = canvas.selection === false;
  const isLandscape = state.orientation === 'landscape';
  const scale = dims.width / 600; // 600 = PosterEngine'deki BASE_MAX_W referansi
  const ov = (key: string): Override => state.overrides?.[key] || {};

  const addObj = (o: fabric.Object) => { canvas.add(o); built.current.push(o); };

  /* ---------- geometriyi hesapla (once icerik yuksekligini olc) ---------- */
  const columns = isLandscape && state.items.length > 4 ? 2 : 1;
  const rowH = 30;
  const headerH = 165;
  const totalsH = 74;
  const barcodeH = state.showBarcode ? 92 : 24;
  const footerH = 96;
  const rowsCount = Math.ceil(state.items.length / columns);
  const itemsH = rowsCount * rowH + 24;
  const paddingV = 46;

  let contentH = headerH + itemsH + totalsH + barcodeH + footerH + paddingV;

  const outerMarginX = isLandscape ? dims.width * 0.05 : dims.width * 0.09;
  const paperW = isLandscape
    ? Math.min(dims.height * 0.66, dims.width - outerMarginX * 2)
    : dims.width - outerMarginX * 2;

  let fit = (paperW / 340); // 340 = tasarim referans genisligi (px, scale=1 icin)
  let paperH = contentH * fit;

  const maxPaperH = dims.height * 0.94;
  if (paperH > maxPaperH) {
    const shrink = maxPaperH / paperH;
    fit *= shrink;
    paperH = maxPaperH;
  }

  const fs = (px: number) => Math.max(6, px * fit);
  const paperX = (dims.width - paperW) / 2;
  const paperY = (dims.height - paperH) / 2;

  /* ---------- golge + kagit ---------- */
  addObj(new fabric.Rect({
    left: paperX + fs(8), top: paperY + fs(12), width: paperW, height: paperH,
    fill: 'rgba(0,0,0,0.28)', selectable: false, evented: false, rx: 2, ry: 2,
  }));

  addObj(new fabric.Rect({
    left: paperX, top: paperY, width: paperW, height: paperH,
    fill: state.paperColor, selectable: false, evented: false, rx: 2, ry: 2,
    data: { edType: 'paper' },
  }));

  if (state.showPerforation) {
    [paperY, paperY + paperH].forEach((edgeY) => {
      const toothW = fs(16);
      const teeth = Math.max(4, Math.round(paperW / toothW));
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i <= teeth; i++) {
        pts.push({ x: paperX + (paperW / teeth) * i, y: edgeY + (i % 2 === 0 ? -fs(6) : fs(6)) });
      }
      addObj(new fabric.Polyline(pts, {
        stroke: state.bgColor, strokeWidth: fs(14), fill: '', selectable: false, evented: false,
      }));
    });
  }

  const padX = fs(20);
  const innerW = paperW - padX * 2;
  let cy = paperY + fs(26);
  const cx = paperX + paperW / 2;

  const mkText = (
    text: string, size: number, opts: Partial<fabric.TextboxOptions> & { stateKey?: string; edType?: string } = {}
  ) => {
    const { stateKey, edType, ...rest } = opts as any;
    const t = new fabric.Textbox(text, {
      left: paperX + padX, top: cy, width: innerW,
      fontSize: fs(size), fill: state.inkColor, fontFamily: state.bodyFont,
      textAlign: 'center', selectable: !locked, editable: !locked, evented: !locked,
      data: { edType: edType || 'text', stateKey },
      ...rest,
    });
    return t;
  };

  /* ---------- baslik blogu ---------- */
  const nameObj = mkText(state.storeName, ov('storeName').fontSize || 26, {
    fontFamily: state.headerFont, fontWeight: '700', fill: ov('storeName').color || state.inkColor,
    stateKey: 'storeName', edType: 'header',
  });
  addObj(nameObj);
  cy += (nameObj.height || fs(30)) + fs(4);

  const subObj = mkText(state.storeSubtitle, ov('storeSubtitle').fontSize || 13, {
    fontStyle: 'italic', fill: ov('storeSubtitle').color || state.inkColor, opacity: 0.75,
    stateKey: 'storeSubtitle', edType: 'header',
  });
  addObj(subObj);
  cy += (subObj.height || fs(18)) + fs(10);

  addObj(new fabric.Line([paperX + padX, cy, paperX + paperW - padX, cy], {
    stroke: state.inkColor, strokeWidth: 1, strokeDashArray: [fs(3), fs(3)], selectable: false, evented: false,
  }));
  cy += fs(14);

  const labelObj = mkText(state.receiptLabel, 11, {
    fontWeight: '700', charSpacing: 60, stateKey: 'receiptLabel', edType: 'meta',
  });
  addObj(labelObj);
  cy += (labelObj.height || fs(16)) + fs(8);

  const metaLine = mkText(`${state.dateLabel}   |   ORDER ${state.orderNo}`, 10, {
    opacity: 0.8, stateKey: 'orderNo', edType: 'meta',
  });
  addObj(metaLine);
  cy += (metaLine.height || fs(14)) + fs(4);

  const cashierObj = mkText(state.cashierLine, 10, { opacity: 0.6, stateKey: 'cashierLine', edType: 'meta' });
  addObj(cashierObj);
  cy += (cashierObj.height || fs(14)) + fs(10);

  addObj(new fabric.Line([paperX + padX, cy, paperX + paperW - padX, cy], {
    stroke: state.inkColor, strokeWidth: 1, strokeDashArray: [fs(3), fs(3)], selectable: false, evented: false,
  }));
  cy += fs(14);

  /* ---------- kalemler (item satirlari) ---------- */
  const itemsTop = cy;
  const colW = innerW / columns;
  state.items.forEach((item, idx) => {
    const col = Math.floor(idx / rowsCount);
    const row = idx % rowsCount;
    const rowY = itemsTop + row * fs(rowH);
    const colX = paperX + padX + col * colW;

    const nameT = new fabric.Textbox(item.name, {
      left: colX, top: rowY, width: colW * 0.62,
      fontSize: fs(12), fill: ov(`item-${item.id}-name`).color || state.inkColor,
      fontFamily: state.bodyFont, textAlign: 'left', selectable: !locked, editable: !locked, evented: !locked,
      data: { edType: 'item', stateKey: `item:${item.id}:name` },
    });
    addObj(nameT);

    const priceT = new fabric.Textbox(item.price, {
      left: colX + colW * 0.60, top: rowY, width: colW * 0.40,
      fontSize: fs(12), fill: ov(`item-${item.id}-price`).color || state.inkColor,
      fontFamily: state.bodyFont, textAlign: 'right', fontWeight: '600',
      selectable: !locked, editable: !locked, evented: !locked,
      data: { edType: 'item', stateKey: `item:${item.id}:price` },
    });
    addObj(priceT);
  });
  cy = itemsTop + rowsCount * fs(rowH) + fs(6);

  addObj(new fabric.Line([paperX + padX, cy, paperX + paperW - padX, cy], {
    stroke: state.inkColor, strokeWidth: 1, strokeDashArray: [fs(3), fs(3)], selectable: false, evented: false,
  }));
  cy += fs(16);

  /* ---------- toplam kutusu (accent renk) ---------- */
  const totalBoxH = fs(34);
  addObj(new fabric.Rect({
    left: paperX + padX, top: cy, width: innerW, height: totalBoxH,
    fill: state.accentColor, rx: 3, ry: 3, selectable: false, evented: false,
  }));
  addObj(new fabric.Textbox('TOTAL', {
    left: paperX + padX + fs(10), top: cy + totalBoxH / 2 - fs(9), width: innerW * 0.5,
    fontSize: fs(14), fill: '#ffffff', fontFamily: state.headerFont, fontWeight: '700',
    selectable: false, evented: false,
  }));
  addObj(new fabric.Textbox('ALL OF IT', {
    left: paperX + paperW - padX - innerW * 0.5 - fs(10), top: cy + totalBoxH / 2 - fs(9), width: innerW * 0.5,
    fontSize: fs(14), fill: '#ffffff', fontFamily: state.bodyFont, fontWeight: '700', textAlign: 'right',
    selectable: false, evented: false,
  }));
  cy += totalBoxH + fs(18);

  /* ---------- barkod ---------- */
  if (state.showBarcode) {
    const seed = hashString(state.orderNo + state.presetId);
    const barCount = Math.floor(innerW / fs(3.2));
    let bx = paperX + padX;
    for (let i = 0; i < barCount; i++) {
      const rnd = ((seed * (i + 7)) % 97) / 97;
      const w = rnd > 0.6 ? fs(2.4) : fs(1.2);
      const h = fs(34);
      addObj(new fabric.Rect({
        left: bx, top: cy, width: w, height: h, fill: state.inkColor, selectable: false, evented: false,
      }));
      bx += w + fs(1.4);
      if (bx > paperX + paperW - padX) break;
    }
    cy += fs(34) + fs(6);
    addObj(new fabric.Textbox(state.orderNo.replace('#', ''), {
      left: paperX + padX, top: cy, width: innerW, fontSize: fs(10), fill: state.inkColor,
      fontFamily: state.bodyFont, textAlign: 'center', charSpacing: 100, selectable: false, evented: false,
    }));
    cy += fs(18);
  }

  /* ---------- footer ---------- */
  cy += fs(8);
  const footerObj = mkText(state.footerNote, ov('footerNote').fontSize || 13, {
    fontWeight: '700', fontFamily: state.headerFont, fill: ov('footerNote').color || state.accentColor,
    stateKey: 'footerNote', edType: 'footer',
  });
  footerObj.set({ top: cy });
  addObj(footerObj);
  cy += (footerObj.height || fs(18)) + fs(4);

  const footerSubObj = mkText(state.footerSub, 10, { opacity: 0.6, stateKey: 'footerSub', edType: 'footer' });
  footerSubObj.set({ top: cy });
  addObj(footerSubObj);

  canvas.requestRenderAll();
}

/* ============================================================================
   LEFT PANEL - Icerik ve Stil kontrolleri
============================================================================ */

function updateItem(state: ReceiptDesignState, id: string, key: 'name' | 'price', val: string): ReceiptItemState[] {
  return state.items.map((it) => (it.id === id ? { ...it, [key]: val } : it));
}

function renderLeftPanels(
  state: ReceiptDesignState,
  updateState: (key: string, val: any) => void,
  openSections: Record<string, boolean>,
  toggleSection: (k: string) => void
): React.ReactNode {
  const Accordion = (props: { id: string; title: string; children: React.ReactNode }) => (
    <>
      <button
        className={`accordion-btn${openSections[props.id] ? ' open' : ''}`}
        onClick={() => toggleSection(props.id)}
      >
        {props.title}<span className="arrow">&#9660;</span>
      </button>
      <div className={`accordion-content${openSections[props.id] ? ' open' : ''}`}>{props.children}</div>
    </>
  );

  return (
    <>
      <Accordion id="receiptContent" title="&#128221; Fis Icerigi">
        <div className="form-row">
          <label>Magaza / Basik Adi</label>
          <input type="text" value={state.storeName} onChange={(e) => updateState('storeName', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Alt Baslik</label>
          <input type="text" value={state.storeSubtitle} onChange={(e) => updateState('storeSubtitle', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Fis Etiketi</label>
          <input type="text" value={state.receiptLabel} onChange={(e) => updateState('receiptLabel', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Tarih</label>
          <input type="text" value={state.dateLabel} onChange={(e) => updateState('dateLabel', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Siparis No</label>
          <input type="text" value={state.orderNo} onChange={(e) => updateState('orderNo', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Alt Satir (cashier)</label>
          <input type="text" value={state.cashierLine} onChange={(e) => updateState('cashierLine', e.target.value)} />
        </div>
      </Accordion>

      <Accordion id="receiptItems" title="&#128203; Kalemler">
        {state.items.map((item) => (
          <div key={item.id} className="form-row" style={{ display: 'flex', gap: 6, paddingBottom: 8 }}>
            <input
              type="text" value={item.name} placeholder="Kalem adi"
              style={{ flex: 2 }}
              onChange={(e) => updateState('items', updateItem(state, item.id, 'name', e.target.value))}
            />
            <input
              type="text" value={item.price} placeholder="Deger"
              style={{ flex: 1 }}
              onChange={(e) => updateState('items', updateItem(state, item.id, 'price', e.target.value))}
            />
            <button
              className="btn btn-secondary" style={{ flex: '0 0 auto', padding: '6px 8px' }}
              onClick={() => updateState('items', state.items.filter((i) => i.id !== item.id))}
            >&#10005;</button>
          </div>
        ))}
        <div className="form-row">
          <button
            className="btn btn-secondary" style={{ width: '100%' }}
            onClick={() => updateState('items', [...state.items, { id: `custom-${Date.now()}`, name: 'Yeni Kalem', price: '-' }])}
          >+ Kalem Ekle</button>
        </div>
      </Accordion>

      <Accordion id="receiptFooter" title="&#128172; Alt Mesaj">
        <div className="form-row">
          <label>Ana Mesaj</label>
          <input type="text" value={state.footerNote} onChange={(e) => updateState('footerNote', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Alt Not</label>
          <input type="text" value={state.footerSub} onChange={(e) => updateState('footerSub', e.target.value)} />
        </div>
      </Accordion>

      <Accordion id="receiptStyle" title="&#127912; Stil">
        <div className="color-row">
          <input type="color" value={state.paperColor} onChange={(e) => updateState('paperColor', e.target.value)} />
          <input type="text" value={state.paperColor} onChange={(e) => updateState('paperColor', e.target.value)} />
        </div>
        <div className="color-row">
          <input type="color" value={state.inkColor} onChange={(e) => updateState('inkColor', e.target.value)} />
          <input type="text" value={state.inkColor} onChange={(e) => updateState('inkColor', e.target.value)} />
        </div>
        <div className="color-row">
          <input type="color" value={state.accentColor} onChange={(e) => updateState('accentColor', e.target.value)} />
          <input type="text" value={state.accentColor} onChange={(e) => updateState('accentColor', e.target.value)} />
        </div>
        <div className="color-row">
          <input type="color" value={state.bgColor} onChange={(e) => updateState('bgColor', e.target.value)} />
          <input type="text" value={state.bgColor} onChange={(e) => updateState('bgColor', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Baslik Fontu</label>
          <select value={state.headerFont} onChange={(e) => updateState('headerFont', e.target.value)}>
            {['Dancing Script','Bebas Neue','Oswald','VT323','Playfair Display','Josefin Sans','Cinzel','Nunito','Caveat','Abril Fatface','Merriweather','Bungee','Montserrat','Chewy'].map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="form-row">
          <label>Govde Fontu</label>
          <select value={state.bodyFont} onChange={(e) => updateState('bodyFont', e.target.value)}>
            {['Courier Prime','Space Mono','Share Tech Mono','VT323'].map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="form-row" style={{ display: 'flex', gap: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 0 }}>
            <input type="checkbox" checked={state.showBarcode} onChange={(e) => updateState('showBarcode', e.target.checked)} /> Barkod
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 0 }}>
            <input type="checkbox" checked={state.showPerforation} onChange={(e) => updateState('showPerforation', e.target.checked)} /> Perfore Kenar
          </label>
        </div>
      </Accordion>
    </>
  );
}

/* ============================================================================
   RIGHT PANEL - secili ogeye ozel hizli ayarlar (font boyutu / renk)
============================================================================ */

function renderRightPanels(
  selectedType: string | null,
  state: ReceiptDesignState,
  updateState: (key: string, val: any) => void
): React.ReactNode {
  if (!selectedType) return null;

  const labelFor: Record<string, string> = {
    header: 'Baslik Ogesi', meta: 'Meta Bilgi', item: 'Kalem', footer: 'Alt Mesaj', paper: 'Kagit', text: 'Metin',
  };

  return (
    <div className="pf-section">
      <div className="pf-section-title">{labelFor[selectedType] || 'Oge'}</div>
      <div className="pf-row">
        <label>Not</label>
        <div style={{ fontSize: 11, color: 'var(--spotify-subtext)', lineHeight: 1.5 }}>
          Metni degistirmek icin tuval uzerinde ogeye cift tiklayip dogrudan yazabilirsin. Genel renk ve font
          ayarlari icin soldaki "Stil" bolumunu kullan.
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   ANA BILESEN
============================================================================ */

export default function ReceiptPosterPage({ navigate }: { navigate: (path: string) => void }) {
  const builtObjectsRef = useRef<fabric.Object[]>([]);
  const lastSignatureRef = useRef<string>('');

  const signatureOf = (state: ReceiptDesignState) =>
    JSON.stringify({
      items: state.items.length,
      headerFont: state.headerFont,
      bodyFont: state.bodyFont,
      showBarcode: state.showBarcode,
      showPerforation: state.showPerforation,
      orientation: state.orientation,
      canvasSize: state.canvasSize,
    });

  const setupCanvas = (canvas: fabric.Canvas, dims: { width: number; height: number }, state: any) => {
    drawReceipt(canvas, dims, state, builtObjectsRef);
    lastSignatureRef.current = signatureOf(state);
  };

  const updateCanvas = (canvas: fabric.Canvas, state: any) => {
    const sig = signatureOf(state);
    if (sig !== lastSignatureRef.current || builtObjectsRef.current.length === 0) {
      drawReceipt(canvas, { width: canvas.getWidth() / canvas.getZoom(), height: canvas.getHeight() / canvas.getZoom() }, state, builtObjectsRef);
      lastSignatureRef.current = sig;
      return;
    }

    // sadece metin/renk icerigini yerinde guncelle (duzen aynen kalir, cursor bozulmaz)
    const findByKey = (key: string) => builtObjectsRef.current.find((o: any) => o.data && o.data.stateKey === key);

    const patchText = (key: string, val: string, color?: string) => {
      const obj: any = findByKey(key);
      if (!obj) return;
      if (obj.isEditing) return; // aktif yaziliyorsa dokunma
      if (obj.text !== val) obj.set({ text: val });
      if (color && obj.fill !== color) obj.set({ fill: color });
    };

    patchText('storeName', state.storeName, state.overrides?.storeName?.color || state.inkColor);
    patchText('storeSubtitle', state.storeSubtitle);
    patchText('receiptLabel', state.receiptLabel);
    patchText('orderNo', `${state.dateLabel}   |   ORDER ${state.orderNo}`);
    patchText('cashierLine', state.cashierLine);
    patchText('footerNote', state.footerNote, state.overrides?.footerNote?.color || state.accentColor);
    patchText('footerSub', state.footerSub);

    state.items.forEach((it: ReceiptItemState) => {
      patchText(`item:${it.id}:name`, it.name);
      patchText(`item:${it.id}:price`, it.price);
    });

    canvas.requestRenderAll();
  };

  const onLayoutChange = (canvas: fabric.Canvas, dims: { width: number; height: number }, state: any) => {
    drawReceipt(canvas, dims, state, builtObjectsRef);
    lastSignatureRef.current = signatureOf(state);
  };

  const onApplyPreset = (presetId: string, currentState: ReceiptDesignState): ReceiptDesignState => {
    return buildPresetState(presetId, { canvasSize: currentState.canvasSize, orientation: currentState.orientation });
  };

  return (
    <PosterEngine
      title="Receipt Poster"
      defaultState={RECEIPT_DEFAULT_STATE}
      presets={RECEIPT_PRESETS_GROUPED}
      onApplyPreset={onApplyPreset}
      setupCanvas={setupCanvas}
      updateCanvas={updateCanvas}
      onLayoutChange={onLayoutChange}
      renderLeftPanels={renderLeftPanels}
      renderRightPanels={renderRightPanels}
      navigate={navigate}
    />
  );
}
