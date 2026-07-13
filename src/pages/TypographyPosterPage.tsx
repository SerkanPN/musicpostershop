import React, { useRef } from 'react';
import * as fabric from 'fabric';
import PosterEngine from '../components/PosterEngine';
import { POSTER_PRESETS } from '../lib/presets';

interface ReceiptItemState {
  id: string;
  label: string;
  value: string;
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

  footerNote: string;
  footerSub: string;

  showBarcode: boolean;
  showPerforation: boolean;

  overrides: Record<string, Override>;
}

interface Mood {
  paper: string;
  ink: string;
  accent: string;
  headerFont: string;
  bodyFont: string;
}

const MOODS: Record<string, Mood> = {
  Love:       { paper: '#fff7f5', ink: '#3a1418', accent: '#c0392b', headerFont: 'Dancing Script',    bodyFont: 'Courier Prime' },
  Sports:     { paper: '#f7f7f3', ink: '#141414', accent: '#d32f2f', headerFont: 'Bebas Neue',         bodyFont: 'Space Mono' },
  Health:     { paper: '#f2faf5', ink: '#123321', accent: '#2e7d32', headerFont: 'Oswald',             bodyFont: 'Courier Prime' },
  Hobbies:    { paper: '#0e120f', ink: '#3dff96', accent: '#3dff96', headerFont: 'VT323',              bodyFont: 'Share Tech Mono' },
  Business:   { paper: '#faf7ef', ink: '#1a1a1a', accent: '#b8860b', headerFont: 'Playfair Display',   bodyFont: 'Courier Prime' },
  Travel:     { paper: '#fdf6ec', ink: '#2b2118', accent: '#d98324', headerFont: 'Josefin Sans',       bodyFont: 'Courier Prime' },
  Milestones: { paper: '#fffdf5', ink: '#1a1a1a', accent: '#b8962e', headerFont: 'Cinzel',             bodyFont: 'Courier Prime' },
  Home:       { paper: '#f5f2ea', ink: '#2f2a20', accent: '#7c9473', headerFont: 'Nunito',             bodyFont: 'Courier Prime' },
  Family:     { paper: '#fff8f1', ink: '#3a2a1a', accent: '#e08e79', headerFont: 'Caveat',             bodyFont: 'Courier Prime' },
  Culture:    { paper: '#f2ede1', ink: '#1c1c1c', accent: '#8a5a44', headerFont: 'Abril Fatface',      bodyFont: 'Courier Prime' },
  Education:  { paper: '#f7f7f4', ink: '#16233a', accent: '#1f4e8c', headerFont: 'Merriweather',       bodyFont: 'Courier Prime' },
  Faith:      { paper: '#fbf8f0', ink: '#2a231a', accent: '#a9843b', headerFont: 'Cinzel',             bodyFont: 'Courier Prime' },
  Holiday:    { paper: '#fff5f5', ink: '#1a2e1a', accent: '#b02e2e', headerFont: 'Bungee',             bodyFont: 'Courier Prime' },
  Career:     { paper: '#f5f5f7', ink: '#1a1a1a', accent: '#1d3557', headerFont: 'Montserrat',         bodyFont: 'Courier Prime' },
  Pets:       { paper: '#fbf6ee', ink: '#33261a', accent: '#e08a3c', headerFont: 'Chewy',              bodyFont: 'Courier Prime' },
};

interface PresetContent {
  category: keyof typeof MOODS;
  storeName: string;
  storeSubtitle: string;
  receiptLabel: string;
  items: { label: string; value: string }[];
  footerNote: string;
  footerSub: string;
}

const PRESET_CONTENT: Record<string, PresetContent> = {
  'love-invoice': { category: 'Love', storeName: 'LOVE INVOICE', storeSubtitle: 'Issued for a lifetime', receiptLabel: 'STATEMENT OF THE HEART', items: [
    { label: 'First Glance', value: 'The moment the room went quiet' },
    { label: 'Butterflies', value: 'Still have not gone away' },
    { label: 'Late Night Calls', value: 'Just to hear you breathe' },
    { label: 'Every Little Thing About You', value: 'Somehow my favorite thing' },
    { label: 'A Lifetime Together', value: 'And I would sign again' } ],
    footerNote: 'PAID IN FULL, WITH MY HEART', footerSub: 'No refunds. No returns. Ever.' },

  'anniversary-bill': { category: 'Love', storeName: 'ANNIVERSARY BILL', storeSubtitle: 'Years, and counting', receiptLabel: 'ACCOUNT STATEMENT', items: [
    { label: 'Year One', value: 'Learning your favorite silence' },
    { label: 'Year Two', value: 'Choosing you on the hard days' },
    { label: 'Every Year After', value: 'Getting easier to love you' },
    { label: 'Inside Jokes', value: 'Nobody else will ever get' } ],
    footerNote: 'BALANCE: STILL FALLING FOR YOU', footerSub: 'Auto-renews every year.' },

  'marathon-finisher': { category: 'Sports', storeName: 'FINISH LINE RECEIPT', storeSubtitle: '26.2 MILES', receiptLabel: 'RACE RESULT', items: [
    { label: 'Miles Run', value: 'Twenty six point two of them' },
    { label: 'Training Weeks', value: 'Before sunrise, every time' },
    { label: 'Blisters Earned', value: 'Worn like medals' },
    { label: 'Doubts Silenced', value: 'One stride at a time' } ],
    footerNote: 'RACE COMPLETE', footerSub: 'Finisher medal included.' },

  'weight-loss-journey': { category: 'Health', storeName: 'TRANSFORMATION RECEIPT', storeSubtitle: 'Progress, not perfection', receiptLabel: 'PROGRESS REPORT', items: [
    { label: 'Pounds Lost', value: 'And a version of me found' },
    { label: 'Workouts Logged', value: 'Even on the days it hurt' },
    { label: 'Old Excuses', value: 'Left at the starting line' },
    { label: 'New Habits', value: 'Built one rep at a time' } ],
    footerNote: 'BALANCE: STRONGER THAN BEFORE', footerSub: 'Non-refundable results.' },

  'bodybuilding-stats': { category: 'Health', storeName: 'LIFTING LEDGER', storeSubtitle: 'Iron and discipline', receiptLabel: 'PERSONAL RECORDS', items: [
    { label: 'Bench Press PR', value: 'Heavier than my doubts' },
    { label: 'Squat PR', value: 'Legs that do not quit' },
    { label: 'Deadlift PR', value: 'Earned off the floor' },
    { label: 'Protein Shakes', value: 'Too many to count, worth it' } ],
    footerNote: 'GAINS RECORDED', footerSub: 'No spotters harmed.' },

  'championship-win': { category: 'Sports', storeName: 'CHAMPIONSHIP RECEIPT', storeSubtitle: 'Champions, est. this year', receiptLabel: 'FINAL SCORE', items: [
    { label: 'Season Record', value: 'Written in the history books' },
    { label: 'Trophies Won', value: 'One, and it is ours' },
    { label: 'Doubters', value: 'Silenced at the final whistle' },
    { label: 'Team Spirit', value: 'Unbreakable, start to finish' } ],
    footerNote: 'TITLE SECURED', footerSub: 'Ring size pending.' },

  'gamer-match-stats': { category: 'Hobbies', storeName: 'MATCH_RECEIPT.LOG', storeSubtitle: 'GG WP', receiptLabel: 'POST-MATCH SUMMARY', items: [
    { label: 'Kills', value: 'Clean and unforgettable' },
    { label: 'Assists', value: 'Carried the whole squad' },
    { label: 'MVP Awards', value: 'Earned, not given' },
    { label: 'Rage Quits', value: 'None, stayed till the end' } ],
    footerNote: 'VICTORY_ROYALE.EXE', footerSub: 'Session synced to cloud.' },

  'cafe-bistro': { category: 'Business', storeName: 'THE CORNER BISTRO', storeSubtitle: 'Fresh daily', receiptLabel: 'GUEST CHECK', items: [
    { label: 'House Blend Coffee', value: 'The smell that starts my mornings' },
    { label: 'Avocado Toast', value: 'Our go-to order' },
    { label: 'Croissant', value: 'Flaky, buttery, worth the crumbs' },
    { label: 'Good Conversation', value: 'The real reason we keep coming back' } ],
    footerNote: 'THANK YOU, COME AGAIN', footerSub: 'Tips appreciated, not required.' },

  'creator-milestones': { category: 'Business', storeName: 'CREATOR RECEIPT', storeSubtitle: 'Content that connects', receiptLabel: 'MILESTONE REPORT', items: [
    { label: 'Subscribers Gained', value: 'One story at a time' },
    { label: 'Videos Published', value: 'Even when no one was watching yet' },
    { label: 'All-Nighters', value: 'Chasing the perfect cut' },
    { label: 'Comment Replies', value: 'Every single one read' } ],
    footerNote: 'MILESTONE UNLOCKED', footerSub: 'Next goal: loading.' },

  'first-business': { category: 'Business', storeName: 'STARTUP COSTS', storeSubtitle: 'Founded on faith', receiptLabel: 'FOUNDING LEDGER', items: [
    { label: 'Business License', value: 'Framed on the wall' },
    { label: 'First Sale', value: 'Still remember the notification' },
    { label: 'Sleepless Nights', value: 'Worth every one' },
    { label: 'Belief In The Idea', value: 'When no one else had it' } ],
    footerNote: 'OPEN FOR BUSINESS', footerSub: 'Established this year.' },

  'bucket-list-traveler': { category: 'Travel', storeName: 'BUCKET LIST RECEIPT', storeSubtitle: 'Passport stamps and stories', receiptLabel: 'ITINERARY SUMMARY', items: [
    { label: 'Countries Visited', value: 'And counting' },
    { label: 'Flights Taken', value: 'Always the window seat' },
    { label: 'Lost Luggage', value: 'Once, worth the story' },
    { label: 'Memories Made', value: 'Carried home in every photo' } ],
    footerNote: 'JOURNEY CONTINUES', footerSub: 'Next stop: TBD.' },

  'birthday-invoice-18': { category: 'Milestones', storeName: '18TH BIRTHDAY INVOICE', storeSubtitle: 'Officially an adult', receiptLabel: 'INVOICE', items: [
    { label: 'Years of Chaos', value: 'Eighteen and counting' },
    { label: 'Advice Ignored', value: 'Mostly on purpose' },
    { label: 'Adulthood', value: 'Arriving right on schedule' },
    { label: 'Cake Slices', value: 'The biggest one, obviously' } ],
    footerNote: 'WELCOME TO ADULTHOOD', footerSub: 'Terms and conditions apply.' },

  'birthday-invoice-30': { category: 'Milestones', storeName: '30TH BIRTHDAY INVOICE', storeSubtitle: 'Dirty thirty', receiptLabel: 'INVOICE', items: [
    { label: 'Years Lived', value: 'And better than ever' },
    { label: 'Wisdom Gained', value: 'Finally figuring it out' },
    { label: 'Knees That Still Work', value: 'Mostly' },
    { label: 'Good Times', value: 'Just getting started' } ],
    footerNote: 'STILL GOT IT', footerSub: 'Warranty extended.' },

  'roommate-rules-receipt': { category: 'Home', storeName: 'ROOMMATE RECEIPT', storeSubtitle: 'House rules, itemized', receiptLabel: 'HOUSE AGREEMENT', items: [
    { label: 'Clean Your Dishes', value: 'We all see the sink' },
    { label: 'Do Not Touch My Food', value: 'Seriously, it is labeled' },
    { label: 'Quiet After Eleven', value: 'Some of us have jobs' },
    { label: 'Good Vibes Only', value: 'Non-negotiable house rule' } ],
    footerNote: 'SIGNED BY ALL ROOMMATES', footerSub: 'Violators do the dishes.' },

  'graduation-costs': { category: 'Milestones', storeName: 'GRADUATION RECEIPT', storeSubtitle: 'Cap, gown, done', receiptLabel: 'FINAL TRANSCRIPT', items: [
    { label: 'Years of Studying', value: 'Finally paid off' },
    { label: 'Cups of Coffee', value: 'Too many to count' },
    { label: 'All-Nighters', value: 'Worth every one' },
    { label: 'Diploma', value: 'Earned, not given' } ],
    footerNote: 'CLASS DISMISSED', footerSub: 'Onward to whatever comes next.' },

  'wedding-day-invoice': { category: 'Love', storeName: 'WEDDING DAY INVOICE', storeSubtitle: 'One day, forever after', receiptLabel: 'INVOICE', items: [
    { label: 'The Dress', value: 'Worth every second of waiting' },
    { label: 'First Dance', value: 'Just the two of us, and everyone watching' },
    { label: 'Happy Tears', value: 'Impossible to hold back' },
    { label: 'I Do', value: 'The easiest two words I have said' } ],
    footerNote: 'MARRIED, WITH LOVE', footerSub: 'No returns accepted.' },

  'pet-adoption-receipt': { category: 'Pets', storeName: 'ADOPTION RECEIPT', storeSubtitle: 'Gotcha day', receiptLabel: 'ADOPTION CERTIFICATE', items: [
    { label: 'One Good Dog', value: 'Best decision I ever made' },
    { label: 'Chewed Shoes', value: 'Worth it, every pair' },
    { label: 'Belly Rubs', value: 'Requested hourly' },
    { label: 'Unconditional Love', value: 'Delivered every single day' } ],
    footerNote: 'ADOPTED, NOT SHOPPED', footerSub: 'Best decision ever made.' },

  'new-baby-invoice': { category: 'Family', storeName: 'NEW BABY INVOICE', storeSubtitle: 'Welcome to the world', receiptLabel: 'BIRTH RECEIPT', items: [
    { label: 'Tiny Fingers', value: 'Wrapped around mine instantly' },
    { label: 'Tiny Toes', value: 'Counted twice, just in case' },
    { label: 'Sleepless Nights', value: 'Worth every single one' },
    { label: 'Love At First Sight', value: 'No exceptions, no hesitation' } ],
    footerNote: 'DELIVERED WITH LOVE', footerSub: 'Handle with care, forever.' },

  'coffee-addiction-receipt': { category: 'Culture', storeName: 'COFFEE ADDICTION RECEIPT', storeSubtitle: 'Fueled by caffeine', receiptLabel: 'DAILY TAB', items: [
    { label: 'Espresso Shots', value: 'The only way to start the day' },
    { label: 'Cups This Week', value: 'Do not ask, do not judge' },
    { label: 'Decaf Considered', value: 'And immediately rejected' },
    { label: 'Personality', value: 'Brewed fresh every morning' } ],
    footerNote: 'REFILL REQUIRED', footerSub: 'No decaf, no discussion.' },

  'gamer-subscription-receipt': { category: 'Hobbies', storeName: 'SUBSCRIPTION_RECEIPT.LOG', storeSubtitle: 'Level: MAX', receiptLabel: 'ACCOUNT SUMMARY', items: [
    { label: 'Hours Played', value: 'Worth every loading screen' },
    { label: 'Achievements', value: 'Unlocked the hard way' },
    { label: 'Rage Quits', value: 'A few, no regrets' },
    { label: 'Loot Dropped', value: 'Legendary, finally' } ],
    footerNote: 'GAME_SAVED.DAT', footerSub: 'Auto-renews next season.' },

  'first-car-invoice': { category: 'Milestones', storeName: 'FIRST CAR INVOICE', storeSubtitle: 'Freedom, four wheels', receiptLabel: 'BILL OF SALE', items: [
    { label: 'Down Payment', value: 'Worth every saved paycheck' },
    { label: 'First Road Trip', value: 'Windows down, no destination' },
    { label: 'Parking Tickets', value: 'A rite of passage' },
    { label: 'Freedom', value: 'Four wheels of it' } ],
    footerNote: 'KEYS IN HAND', footerSub: 'Drive safe out there.' },

  'degree-cost-invoice': { category: 'Education', storeName: 'DEGREE INVOICE', storeSubtitle: 'Knowledge, itemized', receiptLabel: 'TUITION STATEMENT', items: [
    { label: 'Tuition', value: 'Worth every sleepless semester' },
    { label: 'Textbooks', value: 'Barely opened, somehow' },
    { label: 'Late Nights Studying', value: 'Fueled by stubbornness' },
    { label: 'Degree Earned', value: 'Finally, officially' } ],
    footerNote: 'DILIGENCE REWARDED', footerSub: 'Onward to what is next.' },

  'home-renovation-invoice': { category: 'Home', storeName: 'RENOVATION INVOICE', storeSubtitle: 'Before and after', receiptLabel: 'PROJECT INVOICE', items: [
    { label: 'Paint and Supplies', value: 'Worth every drop spilled' },
    { label: 'Weekends Lost', value: 'Gained a home instead' },
    { label: 'Arguments About Tile', value: 'Won, mostly' },
    { label: 'A Home We Love', value: 'Finally, ours' } ],
    footerNote: 'PROJECT COMPLETE', footerSub: 'Contractor not included.' },

  'retirement-invoice': { category: 'Milestones', storeName: 'RETIREMENT INVOICE', storeSubtitle: 'Clocked out for good', receiptLabel: 'FINAL PAYCHECK', items: [
    { label: 'Years of Service', value: 'Well spent, every one' },
    { label: 'Early Alarms', value: 'Officially retired too' },
    { label: 'Vacation Days Owed', value: 'Cashed in for good' },
    { label: 'Free Time', value: 'Unlimited, starting now' } ],
    footerNote: 'MISSION ACCOMPLISHED', footerSub: 'Enjoy every minute of it.' },

  'bar-mitzvah-invoice': { category: 'Faith', storeName: 'BAR MITZVAH INVOICE', storeSubtitle: 'Today I am a man', receiptLabel: 'CEREMONY RECORD', items: [
    { label: 'Torah Portion', value: 'Read with a steady voice' },
    { label: 'Hora Dance Circles', value: 'Lifted higher every time' },
    { label: 'Mazel Tovs Received', value: 'Too many to count' },
    { label: 'Gift Envelopes', value: 'Opened with excitement' } ],
    footerNote: 'MAZEL TOV', footerSub: 'Blessings, not billed.' },

  'quinceanera-invoice': { category: 'Faith', storeName: 'QUINCEANERA INVOICE', storeSubtitle: 'Fifteen and shining', receiptLabel: 'CEREMONY RECORD', items: [
    { label: 'The Dress', value: 'Twirled in all night' },
    { label: 'Court of Honor', value: 'Standing proud beside her' },
    { label: 'Last Doll', value: 'Received with a tearful smile' },
    { label: 'Waltz Danced', value: 'Practiced for weeks, perfect on the night' } ],
    footerNote: 'FELIZ QUINCE', footerSub: 'A celebration, not a bill.' },

  'christmas-wishlist-receipt': { category: 'Holiday', storeName: 'CHRISTMAS WISHLIST', storeSubtitle: 'Dear Santa,', receiptLabel: 'NORTH POLE ORDER', items: [
    { label: 'Item One', value: 'Circled twice on the list' },
    { label: 'Item Two', value: 'The one I really want' },
    { label: 'Item Three', value: 'Just in case' },
    { label: 'Good Behavior', value: 'Mostly, I promise' } ],
    footerNote: 'NAUGHTY OR NICE: NICE', footerSub: 'Please deliver by the 25th.' },

  'new-job-invoice': { category: 'Career', storeName: 'NEW JOB INVOICE', storeSubtitle: 'First day, fresh start', receiptLabel: 'ONBOARDING RECEIPT', items: [
    { label: 'Nervous Energy', value: 'Gone by lunchtime' },
    { label: 'New Badge', value: 'Still smells like plastic' },
    { label: 'Coffee Breaks', value: 'Already made a friend' },
    { label: 'Growth Ahead', value: 'Just getting started' } ],
    footerNote: 'ONBOARDING COMPLETE', footerSub: 'Probation period may apply.' },

  'first-apartment-invoice': { category: 'Career', storeName: 'FIRST APARTMENT INVOICE', storeSubtitle: 'My own front door', receiptLabel: 'LEASE RECEIPT', items: [
    { label: 'Security Deposit', value: 'Worth every saved cent' },
    { label: 'Flat-Pack Furniture', value: 'Assembled, mostly correctly' },
    { label: 'Independence', value: 'Delivered with the keys' },
    { label: 'Ramen Dinners', value: 'A small price to pay' } ],
    footerNote: 'KEYS RECEIVED', footerSub: 'Landlord not included.' },

  'ivf-journey-invoice': { category: 'Family', storeName: 'IVF JOURNEY INVOICE', storeSubtitle: 'Every step counted', receiptLabel: 'JOURNEY SUMMARY', items: [
    { label: 'Appointments', value: 'Every single one worth it' },
    { label: 'Hope', value: 'Never once ran out' },
    { label: 'Hard Days', value: 'Outnumbered by the good ones' },
    { label: 'This Miracle', value: 'Worth every step of the way' } ],
    footerNote: 'FINALLY HOME', footerSub: 'Paid in patience and love.' },

  'cancer-recovery-invoice': { category: 'Health', storeName: 'RECOVERY INVOICE', storeSubtitle: 'Cancer-free, forever grateful', receiptLabel: 'FINAL STATEMENT', items: [
    { label: 'Treatments Completed', value: 'Every single one, done' },
    { label: 'Bad Days', value: 'Survived, all of them' },
    { label: 'Support System', value: 'Showed up every time' },
    { label: 'Second Chance', value: 'Received, and not wasted' } ],
    footerNote: 'BALANCE: ZERO. CANCER-FREE.', footerSub: 'Gratitude, non-refundable.' },
};

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
  return `#${(h % 900000) + 100000}`;
}

function buildDateLabel(): string {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}.${d.getFullYear()}`;
}

export function buildPresetState(presetId: string, base?: Partial<ReceiptDesignState>): ReceiptDesignState {
  const content = PRESET_CONTENT[presetId] || PRESET_CONTENT['love-invoice'];
  const mood = MOODS[content.category];

  return {
    canvasSize: base?.canvasSize || '8x10',
    orientation: base?.orientation || 'portrait',
    presetId,

    bgColor: mood.paper,
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

    items: content.items.map((it, i) => ({ id: `${presetId}-${i}`, label: it.label, value: it.value })),

    footerNote: content.footerNote,
    footerSub: content.footerSub,

    showBarcode: true,
    showPerforation: true,

    overrides: {},
  };
}

export const RECEIPT_DEFAULT_STATE: ReceiptDesignState = buildPresetState('love-invoice');

function groupPresets(list: { id: string; label: string; category: string }[]) {
  const map = new Map<string, { id: string; label: string }[]>();
  list.forEach((p) => {
    if (!map.has(p.category)) map.set(p.category, []);
    map.get(p.category)!.push({ id: p.id, label: p.label });
  });
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

const RECEIPT_PRESETS_GROUPED = groupPresets(POSTER_PRESETS.RECEIPT);

interface BuildResult {
  objects: fabric.Object[];
  totalHeight: number;
}

function buildContent(dims: { width: number; height: number }, state: ReceiptDesignState, locked: boolean, scaleMul: number): BuildResult {
  const objects: fabric.Object[] = [];
  const isLandscape = state.orientation === 'landscape';
  const baseScale = dims.width / 600;
  const fit = baseScale * scaleMul;
  const fs = (px: number) => Math.max(6, px * fit);
  const ov = (key: string): Override => state.overrides?.[key] || {};

  const contentW = isLandscape
    ? Math.min(dims.width * 0.46, dims.height * 1.15)
    : dims.width * 0.8;
  const contentX = (dims.width - contentW) / 2;
  let cy = dims.height * 0.055;

  const add = (o: fabric.Object) => objects.push(o);

  const block = (
    text: string,
    size: number,
    opts: Record<string, any>,
    gapAfter: number
  ) => {
    const t = new fabric.Textbox(text, {
      left: contentX,
      top: cy,
      width: contentW,
      fontSize: fs(size),
      fill: state.inkColor,
      fontFamily: state.bodyFont,
      textAlign: 'center',
      selectable: !locked,
      editable: !locked,
      evented: !locked,
      ...opts,
    });
    add(t);
    cy += (t.height || fs(size * 1.4)) + fs(gapAfter);
    return t;
  };

  const divider = () => {
    add(new fabric.Line([contentX, cy, contentX + contentW, cy], {
      stroke: state.inkColor,
      strokeWidth: 1,
      strokeDashArray: [fs(3), fs(3)],
      selectable: false,
      evented: false,
    }));
    cy += fs(14);
  };

  block(state.storeName, ov('storeName').fontSize || 30, {
    fontFamily: state.headerFont,
    fontWeight: '700',
    fill: ov('storeName').color || state.inkColor,
    data: { edType: 'header', stateKey: 'storeName' },
  }, 6);

  block(state.storeSubtitle, ov('storeSubtitle').fontSize || 14, {
    fontStyle: 'italic',
    opacity: 0.75,
    data: { edType: 'header', stateKey: 'storeSubtitle' },
  }, 14);

  divider();

  block(state.receiptLabel, 11, {
    fontWeight: '700',
    charSpacing: 60,
    data: { edType: 'meta', stateKey: 'receiptLabel' },
  }, 8);

  block(`${state.dateLabel}   |   ORDER ${state.orderNo}`, 10, {
    opacity: 0.8,
    data: { edType: 'meta', stateKey: 'orderNo' },
  }, 4);

  block(state.cashierLine, 10, {
    opacity: 0.6,
    data: { edType: 'meta', stateKey: 'cashierLine' },
  }, 10);

  divider();

  state.items.forEach((item) => {
    const labelObj = new fabric.Textbox(item.label.toUpperCase(), {
      left: contentX,
      top: cy,
      width: contentW,
      fontSize: fs(12),
      fontWeight: '700',
      fill: state.inkColor,
      fontFamily: state.bodyFont,
      textAlign: 'left',
      charSpacing: 20,
      selectable: !locked,
      editable: !locked,
      evented: !locked,
      data: { edType: 'item', stateKey: `item:${item.id}:label` },
    });
    add(labelObj);
    cy += (labelObj.height || fs(16)) + fs(2);

    const valueObj = new fabric.Textbox(item.value, {
      left: contentX + fs(6),
      top: cy,
      width: contentW - fs(6),
      fontSize: fs(13),
      fontStyle: 'italic',
      fill: state.inkColor,
      fontFamily: state.bodyFont,
      opacity: 0.85,
      textAlign: 'left',
      selectable: !locked,
      editable: !locked,
      evented: !locked,
      data: { edType: 'item', stateKey: `item:${item.id}:value` },
    });
    add(valueObj);
    cy += (valueObj.height || fs(18)) + fs(14);
  });

  divider();

  const totalH = fs(34);
  add(new fabric.Rect({
    left: contentX, top: cy, width: contentW, height: totalH,
    fill: state.accentColor, rx: 3, ry: 3, selectable: false, evented: false,
  }));
  add(new fabric.Textbox('TOTAL', {
    left: contentX + fs(10), top: cy + totalH / 2 - fs(9), width: contentW * 0.5,
    fontSize: fs(14), fill: '#ffffff', fontFamily: state.headerFont, fontWeight: '700',
    selectable: false, evented: false,
  }));
  add(new fabric.Textbox('ALL OF IT', {
    left: contentX + contentW * 0.5 - fs(10), top: cy + totalH / 2 - fs(9), width: contentW * 0.5,
    fontSize: fs(14), fill: '#ffffff', fontFamily: state.bodyFont, fontWeight: '700', textAlign: 'right',
    selectable: false, evented: false,
  }));
  cy += totalH + fs(20);

  if (state.showBarcode) {
    const seed = hashString(state.orderNo + state.presetId);
    const barH = fs(34);
    const barCount = Math.floor(contentW / fs(3.2));
    let bx = contentX;
    for (let i = 0; i < barCount; i++) {
      const rnd = ((seed * (i + 7)) % 97) / 97;
      const w = rnd > 0.6 ? fs(2.4) : fs(1.2);
      add(new fabric.Rect({ left: bx, top: cy, width: w, height: barH, fill: state.inkColor, selectable: false, evented: false }));
      bx += w + fs(1.4);
      if (bx > contentX + contentW) break;
    }
    cy += barH + fs(6);
    add(new fabric.Textbox(state.orderNo.replace('#', ''), {
      left: contentX, top: cy, width: contentW, fontSize: fs(10), fill: state.inkColor,
      fontFamily: state.bodyFont, textAlign: 'center', charSpacing: 100, selectable: false, evented: false,
    }));
    cy += fs(20);
  }

  cy += fs(8);

  block(state.footerNote, ov('footerNote').fontSize || 13, {
    fontWeight: '700',
    fontFamily: state.headerFont,
    fill: ov('footerNote').color || state.accentColor,
    data: { edType: 'footer', stateKey: 'footerNote' },
  }, 4);

  block(state.footerSub, 10, {
    opacity: 0.6,
    data: { edType: 'footer', stateKey: 'footerSub' },
  }, 0);

  cy += dims.height * 0.05;

  return { objects, totalHeight: cy };
}

function addPerforation(canvas: fabric.Canvas, dims: { width: number; height: number }, state: ReceiptDesignState, built: React.MutableRefObject<fabric.Object[]>) {
  if (!state.showPerforation) return;
  const baseScale = dims.width / 600;
  const dotR = Math.max(1, 2 * baseScale);
  const gap = Math.max(6, 12 * baseScale);
  const count = Math.floor(dims.width / gap);
  [dims.height * 0.02, dims.height * 0.98].forEach((y) => {
    for (let i = 0; i < count; i++) {
      const dot = new fabric.Circle({
        left: i * gap + gap / 2 - dotR,
        top: y - dotR,
        radius: dotR,
        fill: state.inkColor,
        opacity: 0.12,
        selectable: false,
        evented: false,
      });
      canvas.add(dot);
      built.current.push(dot);
    }
  });
}

function drawReceipt(canvas: fabric.Canvas, dims: { width: number; height: number }, state: ReceiptDesignState, built: React.MutableRefObject<fabric.Object[]>) {
  built.current.forEach((o) => { try { canvas.remove(o); } catch { } });
  built.current = [];

  const locked = canvas.selection === false;

  let pass = buildContent(dims, state, locked, 1);
  if (pass.totalHeight > dims.height) {
    const shrink = Math.max(0.4, dims.height / pass.totalHeight);
    pass = buildContent(dims, state, locked, shrink);
  }

  pass.objects.forEach((o) => { canvas.add(o); built.current.push(o); });
  addPerforation(canvas, dims, state, built);

  canvas.requestRenderAll();
}

function updateItem(state: ReceiptDesignState, id: string, key: 'label' | 'value', val: string): ReceiptItemState[] {
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

  const setPaperColor = (val: string) => {
    updateState('paperColor', val);
    updateState('bgColor', val);
  };

  return (
    <>
      <Accordion id="receiptContent" title="Content">
        <div className="form-row">
          <label>Store / Header Name</label>
          <input type="text" value={state.storeName} onChange={(e) => updateState('storeName', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Subtitle</label>
          <input type="text" value={state.storeSubtitle} onChange={(e) => updateState('storeSubtitle', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Receipt Label</label>
          <input type="text" value={state.receiptLabel} onChange={(e) => updateState('receiptLabel', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Date</label>
          <input type="text" value={state.dateLabel} onChange={(e) => updateState('dateLabel', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Order Number</label>
          <input type="text" value={state.orderNo} onChange={(e) => updateState('orderNo', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Cashier Line</label>
          <input type="text" value={state.cashierLine} onChange={(e) => updateState('cashierLine', e.target.value)} />
        </div>
      </Accordion>

      <Accordion id="receiptItems" title="Items">
        {state.items.map((item) => (
          <div key={item.id} className="form-row" style={{ paddingBottom: 10 }}>
            <input
              type="text" value={item.label} placeholder="Label"
              style={{ marginBottom: 6 }}
              onChange={(e) => updateState('items', updateItem(state, item.id, 'label', e.target.value))}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="text" value={item.value} placeholder="Emotional line"
                style={{ flex: 1 }}
                onChange={(e) => updateState('items', updateItem(state, item.id, 'value', e.target.value))}
              />
              <button
                className="btn btn-secondary" style={{ flex: '0 0 auto', padding: '6px 8px' }}
                onClick={() => updateState('items', state.items.filter((i) => i.id !== item.id))}
              >&#10005;</button>
            </div>
          </div>
        ))}
        <div className="form-row">
          <button
            className="btn btn-secondary" style={{ width: '100%' }}
            onClick={() => updateState('items', [...state.items, { id: `custom-${Date.now()}`, label: 'New Line', value: 'Write something meaningful' }])}
          >+ Add Item</button>
        </div>
      </Accordion>

      <Accordion id="receiptFooter" title="Footer Message">
        <div className="form-row">
          <label>Main Message</label>
          <input type="text" value={state.footerNote} onChange={(e) => updateState('footerNote', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Sub Note</label>
          <input type="text" value={state.footerSub} onChange={(e) => updateState('footerSub', e.target.value)} />
        </div>
      </Accordion>

      <Accordion id="receiptStyle" title="Style">
        <div className="color-row">
          <input type="color" value={state.paperColor} onChange={(e) => setPaperColor(e.target.value)} />
          <input type="text" value={state.paperColor} onChange={(e) => setPaperColor(e.target.value)} />
        </div>
        <div className="color-row">
          <input type="color" value={state.inkColor} onChange={(e) => updateState('inkColor', e.target.value)} />
          <input type="text" value={state.inkColor} onChange={(e) => updateState('inkColor', e.target.value)} />
        </div>
        <div className="color-row">
          <input type="color" value={state.accentColor} onChange={(e) => updateState('accentColor', e.target.value)} />
          <input type="text" value={state.accentColor} onChange={(e) => updateState('accentColor', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Header Font</label>
          <select value={state.headerFont} onChange={(e) => updateState('headerFont', e.target.value)}>
            {['Dancing Script', 'Bebas Neue', 'Oswald', 'VT323', 'Playfair Display', 'Josefin Sans', 'Cinzel', 'Nunito', 'Caveat', 'Abril Fatface', 'Merriweather', 'Bungee', 'Montserrat', 'Chewy'].map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="form-row">
          <label>Body Font</label>
          <select value={state.bodyFont} onChange={(e) => updateState('bodyFont', e.target.value)}>
            {['Courier Prime', 'Space Mono', 'Share Tech Mono', 'VT323'].map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="form-row" style={{ display: 'flex', gap: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 0 }}>
            <input type="checkbox" checked={state.showBarcode} onChange={(e) => updateState('showBarcode', e.target.checked)} /> Barcode
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 0 }}>
            <input type="checkbox" checked={state.showPerforation} onChange={(e) => updateState('showPerforation', e.target.checked)} /> Perforated Edge
          </label>
        </div>
      </Accordion>
    </>
  );
}

function renderRightPanels(
  selectedType: string | null,
  state: ReceiptDesignState,
  updateState: (key: string, val: any) => void
): React.ReactNode {
  if (!selectedType) return null;

  const labelFor: Record<string, string> = {
    header: 'Header Element', meta: 'Meta Info', item: 'Item Line', footer: 'Footer', text: 'Text',
  };

  return (
    <div className="pf-section">
      <div className="pf-section-title">{labelFor[selectedType] || 'Element'}</div>
      <div className="pf-row">
        <div style={{ fontSize: 11, color: 'var(--spotify-subtext)', lineHeight: 1.5 }}>
          Double-click any element on the canvas to edit its text directly. Use the Style section on the left for colors and fonts.
        </div>
      </div>
    </div>
  );
}

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
      inkColor: state.inkColor,
      accentColor: state.accentColor,
      paperColor: state.paperColor,
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

    const findByKey = (key: string) => builtObjectsRef.current.find((o: any) => o.data && o.data.stateKey === key);

    const patchText = (key: string, val: string) => {
      const obj: any = findByKey(key);
      if (!obj) return;
      if (obj.isEditing) return;
      if (obj.text !== val) obj.set({ text: val });
    };

    patchText('storeName', state.storeName);
    patchText('storeSubtitle', state.storeSubtitle);
    patchText('receiptLabel', state.receiptLabel);
    patchText('orderNo', `${state.dateLabel}   |   ORDER ${state.orderNo}`);
    patchText('cashierLine', state.cashierLine);
    patchText('footerNote', state.footerNote);
    patchText('footerSub', state.footerSub);

    state.items.forEach((it: ReceiptItemState) => {
      patchText(`item:${it.id}:label`, it.label.toUpperCase());
      patchText(`item:${it.id}:value`, it.value);
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
