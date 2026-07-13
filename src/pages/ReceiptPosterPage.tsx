import React from 'react';
import * as fabric from 'fabric';
import { Accordion } from './PosterEngine';

/**
 * LOVE INVOICE — a RECEIPT-family poster template.
 *
 * This file is self-contained and implements exactly the five hooks
 * PosterEngine expects: defaultState, onApplyPreset, setupCanvas,
 * updateCanvas, onLayoutChange, renderLeftPanels, renderRightPanels.
 *
 * DESIGN: a thermal-receipt look-alike — torn paper edges, a dashed
 * "cut here" divider between sections, a dotted price leader on every
 * line item (like a real till receipt), and a rotated ink stamp reading
 * "PAID IN FULL WITH MY HEART". Every line on it is an editable reason
 * to love someone, "billed" at PRICELESS / FREE / INVALUABLE instead of
 * a real amount — the whole point is that it reads as pure sentiment.
 *
 * IMPORTANT — must mirror PosterEngine's private layout constants.
 * PosterEngine keeps BASE_MAX_W/BASE_MAX_H module-private, so we redeclare
 * the same numbers here. If you ever change them in PosterEngine.tsx,
 * change them here too or the layout math will drift.
 */
const BASE_MAX_W = 600;
const BASE_MAX_H = 800;

// ---------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------

export interface LoveInvoiceItem {
  id: string;
  label: string;
  price: string;
}

export interface ObjectOverride {
  left?: number;
  top?: number;
  angle?: number;
  scaleX?: number;
  scaleY?: number;
}

export interface StyleOverride {
  fontSize?: number;
  fill?: string;
  bold?: boolean;
}

export interface LoveInvoiceState {
  templateId: 'love-invoice';
  canvasSize: string;
  orientation: 'portrait' | 'landscape';

  // palette
  bgColor: string;
  paperColor: string;
  inkColor: string;
  accentColor: string;
  fontFamily: string;

  // header
  title: string;
  storeName: string;
  storeTagline: string;

  // meta block
  recipientName: string;
  senderName: string;
  invoiceDate: string;
  invoiceNumber: string;

  // line items
  items: LoveInvoiceItem[];

  // totals
  subtotalLabel: string;
  subtotalValue: string;
  discountLabel: string;
  discountValue: string;
  taxLabel: string;
  taxValue: string;
  totalLabel: string;
  totalValue: string;

  // stamp + footer
  showStamp: boolean;
  stampText: string;
  showBarcode: boolean;
  showTornEdges: boolean;
  footerLine1: string;
  footerLine2: string;

  // free-form per-role style tweaks set from the properties panel
  styleOverrides: Record<string, StyleOverride>;
  // free-form per-object position tweaks captured when the user drags
  // something on the canvas, keyed by the object's stable `data.key`
  objectOverrides: Record<string, ObjectOverride>;
}

// ---------------------------------------------------------------------
// Default state + the one preset this file contributes to the dropdown
// ---------------------------------------------------------------------

export const loveInvoiceDefaultState: LoveInvoiceState = {
  templateId: 'love-invoice',
  canvasSize: '8x10',
  orientation: 'portrait',

  bgColor: '#e9e3d4',
  paperColor: '#fffdf6',
  inkColor: '#2b2620',
  accentColor: '#c1121f',
  fontFamily: 'Courier Prime',

  title: 'LOVE INVOICE',
  storeName: 'Two Hearts Co.',
  storeTagline: 'ESTABLISHED THE DAY WE MET',

  recipientName: 'My Love',
  senderName: 'Your Forever Person',
  invoiceDate: new Date().toLocaleDateString(),
  invoiceNumber: '0001',

  items: [
    { id: 'i1', label: 'Your smile every morning', price: 'PRICELESS' },
    { id: 'i2', label: 'The way you laugh at my jokes', price: '$0.00' },
    { id: 'i3', label: 'Endless support & patience', price: 'FREE' },
    { id: 'i4', label: 'Every late night conversation', price: 'INVALUABLE' },
    { id: 'i5', label: 'A lifetime of adventures ahead', price: 'TBD' },
  ],

  subtotalLabel: 'SUBTOTAL',
  subtotalValue: 'A LIFETIME OF MEMORIES',
  discountLabel: 'DISCOUNT',
  discountValue: "BECAUSE YOU'RE WORTH IT",
  taxLabel: 'TAX (0%)',
  taxValue: 'LOVE IS TAX-FREE',
  totalLabel: 'TOTAL DUE',
  totalValue: 'FOREVER',

  showStamp: true,
  stampText: 'PAID IN FULL\nWITH MY HEART',
  showBarcode: true,
  showTornEdges: true,
  footerLine1: 'THANK YOU FOR YOUR LOVE',
  footerLine2: 'PLEASE VISIT AGAIN <3',

  styleOverrides: {},
  objectOverrides: {},
};

// Matches the { id, label, category } shape used in POSTER_PRESETS.RECEIPT
export const loveInvoicePreset = { id: 'love-invoice', label: 'Love Invoice', category: 'Love' };

// ---------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------

const ROLE_DEFAULTS: Record<string, { fontSize: number; bold?: boolean }> = {
  title: { fontSize: 30, bold: true },
  'store-name': { fontSize: 15, bold: true },
  'store-tagline': { fontSize: 9 },
  'meta-text': { fontSize: 11 },
  'items-header': { fontSize: 9, bold: true },
  'item-row': { fontSize: 12 },
  'totals-row': { fontSize: 11 },
  'total-row': { fontSize: 17, bold: true },
  stamp: { fontSize: 18, bold: true },
  footer: { fontSize: 9 },
};

function styleFor(state: LoveInvoiceState, role: string) {
  const base = ROLE_DEFAULTS[role] || { fontSize: 12 };
  const override = state.styleOverrides?.[role] || {};
  return { ...base, ...override };
}

function measureWidth(text: string, fontFamily: string, fontSize: number, fontWeight: number | string = 400) {
  const probe = new fabric.Text(text, { fontFamily, fontSize, fontWeight: fontWeight as any });
  return probe.width || text.length * fontSize * 0.55;
}

/** Builds "Label ......... Price" so it visually lines up like a till receipt. */
function dotLeader(label: string, price: string, fontFamily: string, fontSize: number, boxWidth: number) {
  const dotWidth = measureWidth('.', fontFamily, fontSize) || fontSize * 0.28;
  const usedWidth = measureWidth(`${label} `, fontFamily, fontSize) + measureWidth(` ${price}`, fontFamily, fontSize);
  const available = Math.max(0, boxWidth - usedWidth);
  const dotsCount = Math.max(3, Math.floor(available / dotWidth));
  return `${label} ${'.'.repeat(dotsCount)} ${price}`;
}

/** Zig-zag "torn paper" polygon points for the top or bottom edge of the receipt. */
function tornEdgePoints(x: number, y: number, w: number, teeth: number, amplitude: number, edge: 'top' | 'bottom') {
  const pts: { x: number; y: number }[] = [];
  const step = w / teeth;
  for (let i = 0; i <= teeth; i++) {
    const px = x + i * step;
    const py = y + (i % 2 === 0 ? 0 : (edge === 'top' ? amplitude : -amplitude));
    pts.push({ x: px, y: py });
  }
  return pts;
}

function getDims(state: LoveInvoiceState) {
  const [wRaw, hRaw] = state.canvasSize.split('x').map(Number);
  const w = state.orientation === 'landscape' ? Math.max(wRaw, hRaw) : Math.min(wRaw, hRaw);
  const h = state.orientation === 'landscape' ? Math.min(wRaw, hRaw) : Math.max(wRaw, hRaw);
  const aspect = w / h;
  let width = BASE_MAX_W;
  let height = width / aspect;
  if (height > BASE_MAX_H) {
    height = BASE_MAX_H;
    width = height * aspect;
  }
  return { width: Math.round(width), height: Math.round(height) };
}

function tagged(obj: fabric.Object, key: string, edType: string, extra: Record<string, any> = {}) {
  obj.set('data', { edLoveInvoice: true, key, edType, ...extra });
  return obj;
}

/** Re-applies a previously captured drag/resize/rotate override, if the user made one. */
function applyOverride(obj: fabric.Object, state: LoveInvoiceState, key: string) {
  const o = state.objectOverrides?.[key];
  if (!o) return;
  obj.set({
    left: o.left ?? obj.left,
    top: o.top ?? obj.top,
    angle: o.angle ?? obj.angle,
    scaleX: o.scaleX ?? obj.scaleX,
    scaleY: o.scaleY ?? obj.scaleY,
  });
  obj.setCoords();
}

// ---------------------------------------------------------------------
// The core builder — called by setupCanvas, updateCanvas AND onLayoutChange
// so there is exactly one source of truth for what the receipt looks like.
// ---------------------------------------------------------------------

function buildReceipt(canvas: fabric.Canvas, dims: { width: number; height: number }, state: LoveInvoiceState) {
  // Wipe only our own objects — never touch PosterEngine's background rect.
  canvas.getObjects().filter((o: any) => o.data?.edLoveInvoice).forEach((o) => canvas.remove(o));

  const { width: W, height: H } = dims;
  const padX = W * 0.09;
  const contentW = W - padX * 2;
  const teeth = Math.max(8, Math.round(W / 22));
  const amp = W * 0.012;

  // --- paper (torn-edge polygon, or a plain rounded rect if disabled) ---
  let paper: fabric.Object;
  if (state.showTornEdges) {
    const top = tornEdgePoints(0, 0, W, teeth, amp, 'top');
    const bottom = tornEdgePoints(0, H, W, teeth, amp, 'bottom').reverse();
    paper = new fabric.Polygon([...top, ...bottom], {
      left: 0,
      top: 0,
      fill: state.paperColor,
      selectable: false,
      evented: false,
      shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.25)', blur: 18, offsetY: 8 }),
    });
  } else {
    paper = new fabric.Rect({
      left: 0,
      top: 0,
      width: W,
      height: H,
      rx: 4,
      ry: 4,
      fill: state.paperColor,
      selectable: false,
      evented: false,
      shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.25)', blur: 18, offsetY: 8 }),
    });
  }
  tagged(paper, 'paper', 'paper');
  canvas.add(paper);

  let cursorY = H * 0.07;
  const centerX = W / 2;

  const addCentered = (text: string, role: string, key: string, extraFontSize = 0) => {
    const s = styleFor(state, role);
    const obj = new fabric.Textbox(text, {
      left: centerX,
      top: cursorY,
      width: contentW,
      fontSize: s.fontSize + extraFontSize,
      fontWeight: s.bold ? 700 : 400,
      fontFamily: state.fontFamily,
      fill: state.styleOverrides?.[role]?.fill || state.inkColor,
      textAlign: 'center',
      originX: 'center',
      originY: 'top',
      editable: false,
    });
    tagged(obj, key, role);
    applyOverride(obj, state, key);
    canvas.add(obj);
    cursorY += obj.height! * (obj.scaleY || 1) + s.fontSize * 0.35;
    return obj;
  };

  const addDashedDivider = (key: string, dashed = true) => {
    const line = new fabric.Line([padX, cursorY, W - padX, cursorY], {
      stroke: state.inkColor,
      strokeWidth: dashed ? 1.4 : 2,
      strokeDashArray: dashed ? [5, 5] : undefined,
      selectable: false,
      evented: false,
      opacity: 0.55,
    });
    tagged(line, key, 'divider');
    canvas.add(line);
    cursorY += 14;
  };

  // --- header ---
  addCentered('♥', 'title', 'heart-icon', -6);
  cursorY -= 4;
  addCentered(state.title, 'title', 'title');
  addCentered(state.storeName, 'store-name', 'store-name');
  addCentered(state.storeTagline, 'store-tagline', 'store-tagline');
  cursorY += 6;
  addDashedDivider('divider-1');

  // --- meta block (two-column rows: label left / value right) ---
  const metaRows: Array<[string, string, string]> = [
    ['TO', state.recipientName, 'meta-to'],
    ['FROM', state.senderName, 'meta-from'],
    ['DATE', state.invoiceDate, 'meta-date'],
    ['INVOICE NO.', state.invoiceNumber, 'meta-invoice'],
  ];
  metaRows.forEach(([label, value, key]) => {
    const s = styleFor(state, 'meta-text');
    const row = new fabric.Textbox(`${label}: ${value}`, {
      left: padX,
      top: cursorY,
      width: contentW,
      fontSize: s.fontSize,
      fontWeight: s.bold ? 700 : 400,
      fontFamily: state.fontFamily,
      fill: state.styleOverrides?.['meta-text']?.fill || state.inkColor,
      textAlign: 'left',
      originX: 'left',
      originY: 'top',
      editable: false,
    });
    tagged(row, key, 'meta-text');
    applyOverride(row, state, key);
    canvas.add(row);
    cursorY += row.height! * (row.scaleY || 1) + 4;
  });

  cursorY += 6;
  addDashedDivider('divider-2');

  // --- items header row ---
  {
    const s = styleFor(state, 'items-header');
    const header = new fabric.Textbox('DESCRIPTION                                            AMOUNT', {
      left: padX,
      top: cursorY,
      width: contentW,
      fontSize: s.fontSize,
      fontWeight: 700,
      fontFamily: state.fontFamily,
      fill: state.styleOverrides?.['items-header']?.fill || state.inkColor,
      textAlign: 'left',
      originX: 'left',
      originY: 'top',
      editable: false,
      opacity: 0.7,
    });
    tagged(header, 'items-header', 'items-header');
    applyOverride(header, state, 'items-header');
    canvas.add(header);
    cursorY += header.height! + 6;
  }
  addDashedDivider('divider-3', false);

  // --- line items ---
  state.items.forEach((item, idx) => {
    const s = styleFor(state, 'item-row');
    const key = `item-${item.id}`;
    const text = dotLeader(item.label, item.price, state.fontFamily, s.fontSize, contentW);
    const row = new fabric.Textbox(text, {
      left: padX,
      top: cursorY,
      width: contentW,
      fontSize: s.fontSize,
      fontWeight: s.bold ? 700 : 400,
      fontFamily: state.fontFamily,
      fill: state.styleOverrides?.['item-row']?.fill || state.inkColor,
      textAlign: 'left',
      originX: 'left',
      originY: 'top',
      editable: false,
    });
    tagged(row, key, 'item-row', { itemId: item.id, itemIndex: idx });
    applyOverride(row, state, key);
    canvas.add(row);
    cursorY += row.height! * (row.scaleY || 1) + s.fontSize * 0.55;
  });

  cursorY += 4;
  addDashedDivider('divider-4');

  // --- totals ---
  const totalsRows: Array<[string, string, string]> = [
    [state.subtotalLabel, state.subtotalValue, 'totals-subtotal'],
    [state.discountLabel, state.discountValue, 'totals-discount'],
    [state.taxLabel, state.taxValue, 'totals-tax'],
  ];
  totalsRows.forEach(([label, value, key]) => {
    const s = styleFor(state, 'totals-row');
    const text = dotLeader(label, value, state.fontFamily, s.fontSize, contentW);
    const row = new fabric.Textbox(text, {
      left: padX,
      top: cursorY,
      width: contentW,
      fontSize: s.fontSize,
      fontWeight: s.bold ? 700 : 400,
      fontFamily: state.fontFamily,
      fill: state.styleOverrides?.['totals-row']?.fill || state.inkColor,
      textAlign: 'left',
      originX: 'left',
      originY: 'top',
      editable: false,
      opacity: 0.85,
    });
    tagged(row, key, 'totals-row');
    applyOverride(row, state, key);
    canvas.add(row);
    cursorY += row.height! * (row.scaleY || 1) + 4;
  });

  cursorY += 6;
  addDashedDivider('divider-5', false);

  {
    const s = styleFor(state, 'total-row');
    const text = dotLeader(state.totalLabel, state.totalValue, state.fontFamily, s.fontSize, contentW);
    const row = new fabric.Textbox(text, {
      left: padX,
      top: cursorY,
      width: contentW,
      fontSize: s.fontSize,
      fontWeight: s.bold ? 700 : 400,
      fontFamily: state.fontFamily,
      fill: state.styleOverrides?.['total-row']?.fill || state.accentColor,
      textAlign: 'left',
      originX: 'left',
      originY: 'top',
      editable: false,
    });
    tagged(row, 'total-row', 'total-row');
    applyOverride(row, state, 'total-row');
    canvas.add(row);
    cursorY += row.height! * (row.scaleY || 1) + 18;
  }

  // --- stamp ---
  if (state.showStamp) {
    const s = styleFor(state, 'stamp');
    const stampGroupTop = cursorY;
    const stampWidth = contentW * 0.62;
    const stampText = new fabric.Textbox(state.stampText, {
      left: centerX,
      top: stampGroupTop,
      width: stampWidth,
      fontSize: s.fontSize,
      fontWeight: 700,
      fontFamily: state.fontFamily,
      fill: state.styleOverrides?.stamp?.fill || state.accentColor,
      textAlign: 'center',
      originX: 'center',
      originY: 'top',
      angle: -8,
      editable: false,
    });
    const stampBorder = new fabric.Rect({
      left: centerX,
      top: stampGroupTop - 6,
      width: stampWidth + 24,
      height: stampText.height! + 24,
      fill: 'transparent',
      stroke: state.styleOverrides?.stamp?.fill || state.accentColor,
      strokeWidth: 3,
      rx: 8,
      ry: 8,
      originX: 'center',
      originY: 'top',
      angle: -8,
      selectable: false,
      evented: false,
      opacity: 0.85,
    });
    const stampGroup = new fabric.Group([stampBorder, stampText], {
      left: centerX,
      top: stampGroupTop,
      originX: 'center',
      originY: 'top',
    });
    tagged(stampGroup, 'stamp', 'stamp');
    applyOverride(stampGroup, state, 'stamp');
    canvas.add(stampGroup);
    cursorY += (stampText.height! + 40);
  }

  cursorY += 10;

  // --- barcode (purely decorative bars + invoice number) ---
  if (state.showBarcode) {
    const barcodeBars: fabric.Rect[] = [];
    const barcodeH = 34;
    const barCount = 34;
    const barcodeW = contentW * 0.7;
    const barGap = barcodeW / barCount;
    // Deterministic pseudo-random bar widths seeded from invoiceNumber so it
    // doesn't jitter on every unrelated re-render.
    let seed = 0;
    for (let i = 0; i < state.invoiceNumber.length; i++) seed += state.invoiceNumber.charCodeAt(i);
    for (let i = 0; i < barCount; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      const rnd = seed / 233280;
      const w = rnd > 0.6 ? barGap * 0.75 : barGap * 0.35;
      barcodeBars.push(new fabric.Rect({
        left: i * barGap,
        top: 0,
        width: w,
        height: barcodeH,
        fill: state.inkColor,
        selectable: false,
        evented: false,
      }));
    }
    const barcodeGroup = new fabric.Group(barcodeBars, {
      left: centerX,
      top: cursorY,
      originX: 'center',
      originY: 'top',
    });
    tagged(barcodeGroup, 'barcode', 'footer');
    applyOverride(barcodeGroup, state, 'barcode');
    canvas.add(barcodeGroup);
    cursorY += barcodeH + 6;

    const s = styleFor(state, 'footer');
    const barcodeNum = new fabric.Textbox(`* ${state.invoiceNumber} *`, {
      left: centerX,
      top: cursorY,
      width: contentW,
      fontSize: s.fontSize,
      fontFamily: state.fontFamily,
      fill: state.inkColor,
      textAlign: 'center',
      originX: 'center',
      originY: 'top',
      editable: false,
      opacity: 0.8,
    });
    tagged(barcodeNum, 'barcode-number', 'footer');
    applyOverride(barcodeNum, state, 'barcode-number');
    canvas.add(barcodeNum);
    cursorY += barcodeNum.height! + 10;
  }

  // --- footer ---
  addCentered(state.footerLine1, 'footer', 'footer-1');
  addCentered(state.footerLine2, 'footer', 'footer-2');

  canvas.requestRenderAll();
}

// ---------------------------------------------------------------------
// PosterEngine hooks
// ---------------------------------------------------------------------

export function loveInvoiceOnApplyPreset(presetId: string, currentState: any): LoveInvoiceState {
  if (presetId !== 'love-invoice') return currentState;
  // Keep the size/orientation the user already picked; reset everything else.
  return {
    ...loveInvoiceDefaultState,
    canvasSize: currentState?.canvasSize || loveInvoiceDefaultState.canvasSize,
    orientation: currentState?.orientation || loveInvoiceDefaultState.orientation,
  };
}

export function loveInvoiceSetupCanvas(
  canvas: fabric.Canvas,
  dims: { width: number; height: number },
  state: LoveInvoiceState
) {
  buildReceipt(canvas, dims, state);

  // Capture manual drags/resizes/rotations so they survive the next rebuild.
  canvas.on('object:modified', (e: any) => {
    const obj = e.target;
    const key = obj?.data?.key;
    if (!key || !obj?.data?.edLoveInvoice) return;
    // NOTE: in the real app, wire this to updateState via a ref or context —
    // PosterEngine only threads `updateState` through the panel renderers,
    // so store it on window/a shared ref you control, e.g.:
    //   overridesRef.current[key] = { left: obj.left, top: obj.top, angle: obj.angle, scaleX: obj.scaleX, scaleY: obj.scaleY };
    //   updateStateRef.current('objectOverrides', { ...overridesRef.current });
  });
}

export function loveInvoiceUpdateCanvas(canvas: fabric.Canvas, state: LoveInvoiceState) {
  buildReceipt(canvas, getDims(state), state);
}

export function loveInvoiceOnLayoutChange(
  canvas: fabric.Canvas,
  dims: { width: number; height: number },
  state: LoveInvoiceState
) {
  buildReceipt(canvas, dims, state);
}

// ---------------------------------------------------------------------
// Left panel — content editing (names, items, totals, style)
// ---------------------------------------------------------------------

export function loveInvoiceRenderLeftPanels(
  state: LoveInvoiceState,
  updateState: (key: string, val: any) => void,
  openSections: Record<string, boolean>,
  toggleSection: (key: string) => void
) {
  const updateItem = (id: string, field: 'label' | 'price', value: string) => {
    updateState('items', state.items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  };
  const addItem = () => {
    if (state.items.length >= 12) return;
    updateState('items', [...state.items, { id: `item-${Date.now()}`, label: 'A new reason I love you', price: 'FREE' }]);
  };
  const removeItem = (id: string) => updateState('items', state.items.filter((it) => it.id !== id));

  return (
    <>
      <Accordion title="&#128172; Names & Details" isOpen={!!openSections.details} onToggle={() => toggleSection('details')}>
        <div className="form-row">
          <label>Document Title</label>
          <input type="text" value={state.title} onChange={(e) => updateState('title', e.target.value)} />
        </div>
        <div className="form-row">
          <label>To (recipient)</label>
          <input type="text" value={state.recipientName} onChange={(e) => updateState('recipientName', e.target.value)} />
        </div>
        <div className="form-row">
          <label>From (you)</label>
          <input type="text" value={state.senderName} onChange={(e) => updateState('senderName', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Date</label>
          <input type="text" value={state.invoiceDate} onChange={(e) => updateState('invoiceDate', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Invoice No.</label>
          <input type="text" value={state.invoiceNumber} onChange={(e) => updateState('invoiceNumber', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Brand Name</label>
          <input type="text" value={state.storeName} onChange={(e) => updateState('storeName', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Tagline</label>
          <input type="text" value={state.storeTagline} onChange={(e) => updateState('storeTagline', e.target.value)} />
        </div>
      </Accordion>

      <Accordion title="&#10084;&#65039; Reasons I Love You" isOpen={!!openSections.items} onToggle={() => toggleSection('items')}>
        {state.items.map((item, idx) => (
          <div key={item.id} className="form-row" style={{ borderBottom: '1px solid #1e1e1e', paddingBottom: 10, marginBottom: 10 }}>
            <label>Reason #{idx + 1}</label>
            <input
              type="text"
              value={item.label}
              onChange={(e) => updateItem(item.id, 'label', e.target.value)}
              style={{ marginBottom: 6 }}
            />
            <input
              type="text"
              value={item.price}
              placeholder="PRICELESS / FREE / $0.00 ..."
              onChange={(e) => updateItem(item.id, 'price', e.target.value)}
            />
            <button
              className="btn btn-secondary"
              style={{ marginTop: 6, width: '100%' }}
              onClick={() => removeItem(item.id)}
              disabled={state.items.length <= 1}
            >
              Remove
            </button>
          </div>
        ))}
        <div className="form-row">
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={addItem} disabled={state.items.length >= 12}>
            + Add Reason
          </button>
        </div>
      </Accordion>

      <Accordion title="&#128176; Totals & Stamp" isOpen={!!openSections.totals} onToggle={() => toggleSection('totals')}>
        <div className="form-row">
          <label>Subtotal Value</label>
          <input type="text" value={state.subtotalValue} onChange={(e) => updateState('subtotalValue', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Discount Value</label>
          <input type="text" value={state.discountValue} onChange={(e) => updateState('discountValue', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Tax Value</label>
          <input type="text" value={state.taxValue} onChange={(e) => updateState('taxValue', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Total Due Value</label>
          <input type="text" value={state.totalValue} onChange={(e) => updateState('totalValue', e.target.value)} />
        </div>
        <div className="form-row">
          <label>
            <input
              type="checkbox"
              checked={state.showStamp}
              onChange={(e) => updateState('showStamp', e.target.checked)}
              style={{ width: 'auto', marginRight: 8 }}
            />
            Show "Paid" Stamp
          </label>
        </div>
        {state.showStamp && (
          <div className="form-row">
            <label>Stamp Text</label>
            <textarea
              value={state.stampText}
              onChange={(e) => updateState('stampText', e.target.value)}
              style={{ minHeight: 60 }}
            />
          </div>
        )}
      </Accordion>

      <Accordion title="&#127912; Style & Footer" isOpen={!!openSections.style} onToggle={() => toggleSection('style')}>
        <div className="color-row">
          <input type="color" value={state.paperColor} onChange={(e) => updateState('paperColor', e.target.value)} />
          <input type="text" value={state.paperColor} onChange={(e) => updateState('paperColor', e.target.value)} />
        </div>
        <div className="form-row"><label>Paper Color</label></div>
        <div className="color-row">
          <input type="color" value={state.inkColor} onChange={(e) => updateState('inkColor', e.target.value)} />
          <input type="text" value={state.inkColor} onChange={(e) => updateState('inkColor', e.target.value)} />
        </div>
        <div className="form-row"><label>Ink Color</label></div>
        <div className="color-row">
          <input type="color" value={state.accentColor} onChange={(e) => updateState('accentColor', e.target.value)} />
          <input type="text" value={state.accentColor} onChange={(e) => updateState('accentColor', e.target.value)} />
        </div>
        <div className="form-row"><label>Accent Color (stamp / total)</label></div>
        <div className="form-row">
          <label>
            <input
              type="checkbox"
              checked={state.showTornEdges}
              onChange={(e) => updateState('showTornEdges', e.target.checked)}
              style={{ width: 'auto', marginRight: 8 }}
            />
            Torn Receipt Edges
          </label>
        </div>
        <div className="form-row">
          <label>
            <input
              type="checkbox"
              checked={state.showBarcode}
              onChange={(e) => updateState('showBarcode', e.target.checked)}
              style={{ width: 'auto', marginRight: 8 }}
            />
            Show Barcode
          </label>
        </div>
        <div className="form-row">
          <label>Footer Line 1</label>
          <input type="text" value={state.footerLine1} onChange={(e) => updateState('footerLine1', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Footer Line 2</label>
          <input type="text" value={state.footerLine2} onChange={(e) => updateState('footerLine2', e.target.value)} />
        </div>
      </Accordion>
    </>
  );
}

// ---------------------------------------------------------------------
// Right panel — quick style controls for whatever is selected on canvas
// ---------------------------------------------------------------------

const EDITABLE_ROLES = new Set([
  'title', 'store-name', 'store-tagline', 'meta-text', 'items-header',
  'item-row', 'totals-row', 'total-row', 'stamp', 'footer',
]);

export function loveInvoiceRenderRightPanels(
  selectedType: string | null,
  state: LoveInvoiceState,
  updateState: (key: string, val: any) => void
) {
  if (!selectedType || !EDITABLE_ROLES.has(selectedType)) return null;

  const current = styleFor(state, selectedType);
  const currentFill = state.styleOverrides?.[selectedType]?.fill;

  const setOverride = (patch: StyleOverride) => {
    updateState('styleOverrides', {
      ...state.styleOverrides,
      [selectedType]: { ...state.styleOverrides?.[selectedType], ...patch },
    });
  };

  return (
    <div className="pf-section">
      <div className="pf-section-title">{selectedType.replace(/-/g, ' ')}</div>

      <div className="pf-row">
        <label>Font Size</label>
        <div className="pf-range-row">
          <input
            type="range"
            min={8}
            max={64}
            value={current.fontSize}
            onChange={(e) => setOverride({ fontSize: Number(e.target.value) })}
          />
          <span className="pf-range-val">{current.fontSize}px</span>
        </div>
      </div>

      <div className="pf-row">
        <label>Color</label>
        <div className="pf-color-row">
          <input
            type="color"
            value={currentFill || state.inkColor}
            onChange={(e) => setOverride({ fill: e.target.value })}
          />
          <input
            type="text"
            value={currentFill || ''}
            placeholder="inherit"
            onChange={(e) => setOverride({ fill: e.target.value })}
          />
        </div>
      </div>

      <div className="pf-row">
        <label>
          <input
            type="checkbox"
            checked={!!current.bold}
            onChange={(e) => setOverride({ bold: e.target.checked })}
            style={{ width: 'auto', marginRight: 8 }}
          />
          Bold
        </label>
      </div>
    </div>
  );
}
