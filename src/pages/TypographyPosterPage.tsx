import React from 'react';
import * as fabric from 'fabric';
import { Trash2, Plus } from 'lucide-react';
import PosterEngine, { Accordion, FontStyleSelector, GOOGLE_FONTS } from '../components/PosterEngine';
import { POSTER_PRESETS } from '../lib/presets';

const defaultState = {
  canvasSize: '8.27x11.69',
  orientation: 'portrait',
  bgColor: '#fafafa',
  textColor: '#171717',
  fontFamily: 'Courier Prime',
  shopName: 'THE LOVE STORE CO.',
  address: 'INFINITY ROAD, AMOR DISTRICT',
  cashier: 'DESTINY',
  receiptNo: 'REC-LOVE-2026',
  taxRate: 0,
  discount: 100,
  footer: 'THANK YOU FOR BEING MY FOREVER',
  totalLabel: 'ETERNAL LOVE',
  baseFontSize: 14,
  items: [
    { qty: '1', name: 'FIRST EYE CONTACT', price: 0.00 },
    { qty: '1', name: 'FIRST SWEET COFFEE DATE', price: 12.50 },
    { qty: '45', name: 'LATE NIGHT PHONE CALLS', price: 90.00 },
    { qty: '3', name: 'UNPLANNED ROAD TRIPS', price: 150.00 },
    { qty: '99', name: 'SHARED WARM HUGS', price: 0.00 },
    { qty: '1', name: 'PROMISE TO STAY FOREVER', price: 1000.00 }
  ]
};

export default function ReceiptPosterPage({ navigate }: { navigate: (path: string) => void }) {

  const handleApplyPreset = (presetId: string, currentState: any) => {
    const preset = POSTER_PRESETS.RECEIPT.find((p: any) => p.id === presetId);
    if (!preset) return currentState;

    if (presetId === 'marathon-finisher') {
      return {
        ...currentState,
        shopName: 'ATHLETIC TIMING INC.',
        address: '26.2 MILES FINISH LINE, BOSTON',
        cashier: 'CHIP TIMER #410',
        receiptNo: 'REC-RUN-42K',
        taxRate: 0,
        discount: 0,
        footer: 'PAIN IS TEMPORARY, PRIDE IS FOREVER',
        totalLabel: 'FINISH TIME',
        bgColor: '#0f172a',
        textColor: '#38bdf8',
        fontFamily: 'Space Mono',
        items: [
          { qty: '10K', name: 'FIRST SECTOR SPLIT', price: 48.30 },
          { qty: '21K', name: 'HALF MARATHON MILESTONE', price: 104.15 },
          { qty: '30K', name: 'HIT THE WALL DEFIANCE', price: 155.00 },
          { qty: '42K', name: 'FINAL SPRINT REVELATION', price: 215.42 },
          { qty: '1', name: 'TOTAL CALORIES BURNED', price: 2800.00 }
        ]
      };
    }

    if (presetId === 'gamer-match-stats') {
      return {
        ...currentState,
        shopName: 'BATTLEFIELD MATRIX',
        address: 'SECTOR-7 COMPILER GATE',
        cashier: 'SYSTEM AI v2',
        receiptNo: 'REC-MATCH-107',
        taxRate: 0,
        discount: 0,
        footer: 'GG WP - LEVEL UP COMPLETED',
        totalLabel: 'XP EARNED',
        bgColor: '#020617',
        textColor: '#22c55e',
        fontFamily: 'VT323',
        items: [
          { qty: '24', name: 'CONFIRMED RIVAL KILLS', price: 2400 },
          { qty: '12', name: 'TACTICAL ASSISTS SECURED', price: 1200 },
          { qty: '1', name: 'CHAMPIONS MATCH WIN', price: 5000 },
          { qty: '3', name: 'HEADSHOT BONUSES', price: 300 }
        ]
      };
    }

    if (presetId === 'cafe-bistro') {
      return {
        ...currentState,
        shopName: 'THE ROAST & BREW',
        address: '404 BEAN ST, ESPRESSOLAND',
        cashier: 'BARISTA MAX',
        receiptNo: 'REC-BREW-99',
        taxRate: 8,
        discount: 10,
        footer: 'LIFE BEGINS AFTER COFFEE',
        totalLabel: 'GRAND TOTAL',
        bgColor: '#fffbf2',
        textColor: '#451a03',
        fontFamily: 'Courier Prime',
        items: [
          { qty: '2', name: 'DOUBLE SHOT CORTADO', price: 9.00 },
          { qty: '1', name: 'FRESH ALMOND CROISSANT', price: 5.50 },
          { qty: '1', name: 'V60 ETHIOPIA HAND BREW', price: 6.50 },
          { qty: '1', name: 'EXTRA COLD GOOD VIBES', price: 0.00 }
        ]
      };
    }

    return defaultState;
  };

  const renderLeftPanels = (state: any, updateState: any, openSections: any, toggleSection: any) => {
    
    const updateItemField = (index: number, key: string, value: string | number) => {
      const next = [...state.items];
      next[index] = { ...next[index], [key]: value };
      updateState('items', next);
    };

    const addItemRow = () => {
      updateState('items', [...state.items, { qty: '1', name: 'NEW ITEM', price: 0.00 }]);
    };

    const removeItemRow = (index: number) => {
      updateState('items', state.items.filter((_: any, i: number) => i !== index));
    };

    return (
      <>
        <Accordion title="&#128444;&#65039; Background & Styling" isOpen={openSections.styling} onToggle={() => toggleSection('styling')}>
          <div className="form-row">
            <label>Font Family</label>
            <select value={state.fontFamily} onChange={(e) => updateState('fontFamily', e.target.value)}>
              {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Paper Background Color</label>
            <div className="color-row">
              <input type="color" value={state.bgColor} onChange={(e) => updateState('bgColor', e.target.value)} />
              <input type="text" value={state.bgColor} onChange={(e) => updateState('bgColor', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <label>Text & Ink Color</label>
            <div className="color-row">
              <input type="color" value={state.textColor} onChange={(e) => updateState('textColor', e.target.value)} />
              <input type="text" value={state.textColor} onChange={(e) => updateState('textColor', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <label>Base Font Size</label>
            <div className="range-row">
              <input type="range" min="8" max="48" value={state.baseFontSize} onChange={(e) => updateState('baseFontSize', Number(e.target.value))} />
              <span className="range-val">{state.baseFontSize}px</span>
            </div>
          </div>
        </Accordion>

        <Accordion title="&#128294; Header Information" isOpen={openSections.header} onToggle={() => toggleSection('header')}>
          <div className="form-row">
            <label>Store / Shop Name</label>
            <input type="text" value={state.shopName} onChange={(e) => updateState('shopName', e.target.value)} />
          </div>
          <div className="form-row">
            <label>Address Line</label>
            <input type="text" value={state.address} onChange={(e) => updateState('address', e.target.value)} />
          </div>
          <div className="form-row">
            <label>Cashier Name</label>
            <input type="text" value={state.cashier} onChange={(e) => updateState('cashier', e.target.value)} />
          </div>
          <div className="form-row">
            <label>Receipt Code / No</label>
            <input type="text" value={state.receiptNo} onChange={(e) => updateState('receiptNo', e.target.value)} />
          </div>
        </Accordion>

        <Accordion title="&#128221; Receipt Line Items" isOpen={openSections.items} onToggle={() => toggleSection('items')}>
          <div style={{ padding: '0 16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', fontSize: '9px', textTransform: 'uppercase', color: 'var(--spotify-subtext)', paddingBottom: '6px', width: '45px' }}>Qty</th>
                  <th style={{ textAlign: 'left', fontSize: '9px', textTransform: 'uppercase', color: 'var(--spotify-subtext)', paddingBottom: '6px' }}>Name / Desc</th>
                  <th style={{ textAlign: 'left', fontSize: '9px', textTransform: 'uppercase', color: 'var(--spotify-subtext)', paddingBottom: '6px', width: '70px' }}>Value</th>
                  <th style={{ width: '30px' }}></th>
                </tr>
              </thead>
              <tbody>
                {state.items.map((item: any, idx: number) => (
                  <tr key={`item-tr-${idx}`}>
                    <td style={{ padding: '4px 0' }}>
                      <input type="text" style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: '#fff', fontSize: '11px', padding: '6px', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }} value={item.qty} onChange={(e) => updateItemField(idx, 'qty', e.target.value)} />
                    </td>
                    <td style={{ padding: '4px 0' }}>
                      <input type="text" style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: '#fff', fontSize: '11px', padding: '6px', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }} value={item.name} onChange={(e) => updateItemField(idx, 'name', e.target.value)} />
                    </td>
                    <td style={{ padding: '4px 0' }}>
                      <input type="number" step="0.01" style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: '#fff', fontSize: '11px', padding: '6px', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }} value={item.price} onChange={(e) => updateItemField(idx, 'price', parseFloat(e.target.value) || 0)} />
                    </td>
                    <td style={{ padding: '4px 0', textAlign: 'center' }}>
                      <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} onClick={() => removeItemRow(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-secondary w-full flex items-center justify-center gap-2 mt-4" onClick={addItemRow}>
              <Plus className="w-4 h-4" /> Add Row Item
            </button>
          </div>
        </Accordion>

        <Accordion title="&#128526; Totals & Footer" isOpen={openSections.calculations} onToggle={() => toggleSection('calculations')}>
          <div className="form-row">
            <label>Total Label Text</label>
            <input type="text" value={state.totalLabel} onChange={(e) => updateState('totalLabel', e.target.value)} />
          </div>
          <div className="form-row">
            <label>Tax Rate (%)</label>
            <input type="number" value={state.taxRate} onChange={(e) => updateState('taxRate', parseFloat(e.target.value) || 0)} />
          </div>
          <div className="form-row">
            <label>Discount Amount</label>
            <input type="number" value={state.discount} onChange={(e) => updateState('discount', parseFloat(e.target.value) || 0)} />
          </div>
          <div className="form-row">
            <label>Footer Note</label>
            <input type="text" value={state.footer} onChange={(e) => updateState('footer', e.target.value)} />
          </div>
        </Accordion>
      </>
    );
  };

  const renderRightPanels = (selectedType: string | null, state: any, updateState: any) => {
    if (selectedType === 'receipt-element') {
      return (
        <div className="pf-section">
          <div className="pf-section-title">Receipt Elements</div>
          <div className="pf-row">
            <label>Global Text Color</label>
            <div className="pf-color-row">
              <input type="color" value={state.textColor} onChange={(e) => updateState('textColor', e.target.value)} />
              <input type="text" value={state.textColor} onChange={(e) => updateState('textColor', e.target.value)} />
            </div>
          </div>
          <div className="pf-row">
            <label>Global Font Size</label>
            <div className="pf-range-row">
              <input type="range" min="8" max="48" value={state.baseFontSize} onChange={(e) => updateState('baseFontSize', Number(e.target.value))} />
              <span className="pf-range-val">{state.baseFontSize}px</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const setupCanvas = () => {};

  const updateCanvas = (canvas: fabric.Canvas, state: any) => {
    const objs = canvas.getObjects().filter(o => o.type !== 'rect' || (o as fabric.Rect).fill !== state.bgColor);
    objs.forEach(o => canvas.remove(o));

    const cw = canvas.width!;
    const padding = cw * 0.1;
    const rw = cw - padding * 2;
    const lX = padding;
    const rX = cw - padding;

    let y = canvas.height! * 0.08;

    const createText = (txt: string, sizeMultiplier: number, weight: string, align: 'left' | 'center' | 'right', italic = false) => {
      const obj = new fabric.Text(txt, {
        left: align === 'center' ? cw / 2 : align === 'left' ? lX : rX,
        top: y,
        originX: align,
        fontSize: state.baseFontSize * sizeMultiplier,
        fontFamily: state.fontFamily,
        fontWeight: weight,
        fontStyle: italic ? 'italic' : 'normal',
        fill: state.textColor,
        selectable: true,
        data: { edType: 'receipt-element' }
      });
      canvas.add(obj);
      return obj;
    };

    const createDashedLine = () => {
      const line = new fabric.Line([lX, y, rX, y], {
        stroke: state.textColor,
        strokeWidth: state.baseFontSize * 0.1,
        strokeDashArray: [state.baseFontSize * 0.4, state.baseFontSize * 0.3],
        selectable: true,
        data: { edType: 'receipt-element' }
      });
      canvas.add(line);
      y += state.baseFontSize * 1.2;
    };

    createText(state.shopName.toUpperCase(), 1.8, '800', 'center');
    y += state.baseFontSize * 2.2;

    if (state.address) {
      createText(state.address.toUpperCase(), 0.9, '400', 'center');
      y += state.baseFontSize * 1.4;
    }

    y += state.baseFontSize * 0.8;
    createDashedLine();

    const now = new Date();
    const dateStr = `DATE: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    createText(dateStr, 0.85, '400', 'left');
    createText(`RECEIPT: ${state.receiptNo.toUpperCase()}`, 0.85, '400', 'right');
    y += state.baseFontSize * 1.4;

    createText(`CASHIER: ${state.cashier.toUpperCase()}`, 0.85, '400', 'left');
    y += state.baseFontSize * 1.8;

    createDashedLine();

    createText('QTY', 0.9, '700', 'left');
    const descHeader = new fabric.Text('DESCRIPTION', {
      left: lX + state.baseFontSize * 3.5,
      top: y,
      fontSize: state.baseFontSize * 0.9,
      fontFamily: state.fontFamily,
      fontWeight: '700',
      fill: state.textColor,
      selectable: true,
      data: { edType: 'receipt-element' }
    });
    canvas.add(descHeader);
    createText('VALUE', 0.9, '700', 'right');
    y += state.baseFontSize * 1.6;

    createDashedLine();

    let subtotal = 0;
    state.items.forEach((item: any) => {
      subtotal += item.price;
      createText(item.qty, 0.9, '400', 'left');
      
      const descItem = new fabric.Text(item.name.toUpperCase(), {
        left: lX + state.baseFontSize * 3.5,
        top: y,
        fontSize: state.baseFontSize * 0.9,
        fontFamily: state.fontFamily,
        fontWeight: '400',
        fill: state.textColor,
        selectable: true,
        data: { edType: 'receipt-element' }
      });
      canvas.add(descItem);

      const priceStr = item.price === 0 ? 'FREE' : item.price.toFixed(2);
      createText(priceStr, 0.9, '400', 'right');

      y += state.baseFontSize * 1.4;
    });

    y += state.baseFontSize * 0.8;
    createDashedLine();

    const drawCalcLine = (label: string, valStr: string, sizeMult = 0.9, weight = '400') => {
      createText(label, sizeMult, weight, 'left');
      createText(valStr, sizeMult, weight, 'right');
      y += state.baseFontSize * 1.4;
    };

    const calculatedTax = subtotal * (state.taxRate / 100);
    const grandTotal = Math.max(0, subtotal + calculatedTax - state.discount);

    drawCalcLine('SUBTOTAL', subtotal.toFixed(2));
    if (state.taxRate > 0) drawCalcLine(`TAX (${state.taxRate}%)`, calculatedTax.toFixed(2));
    if (state.discount > 0) drawCalcLine('DISCOUNT', `-${state.discount.toFixed(2)}`);

    y += state.baseFontSize * 0.5;
    createDashedLine();

    drawCalcLine(state.totalLabel.toUpperCase(), grandTotal.toFixed(2), 1.2, '800');

    y += state.baseFontSize * 1.6;
    createDashedLine();

    if (state.footer) {
      createText(state.footer.toUpperCase(), 0.9, '600', 'center', true);
      y += state.baseFontSize * 2.5;
    }

    const drawBarcode = () => {
      const codeStr = state.receiptNo.replace(/[^A-Za-z0-9]/g, '') || '0000';
      const barcodeW = rw * 0.7;
      const barcodeX = (cw - barcodeW) / 2;
      const barcodeH = state.baseFontSize * 2.5;

      const randomWithSeed = (seed: number) => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
      };

      let bX = barcodeX;
      let seed = 42;
      while (bX < barcodeX + barcodeW) {
        const rVal = randomWithSeed(seed++);
        const thickness = rVal > 0.7 ? 4 : rVal > 0.4 ? 2 : 1;
        const gap = randomWithSeed(seed++) * 3 + 1;

        if (bX + thickness <= barcodeX + barcodeW) {
          const bar = new fabric.Rect({
            left: bX,
            top: y,
            width: thickness,
            height: barcodeH,
            fill: state.textColor,
            selectable: true,
            data: { edType: 'receipt-element' }
          });
          canvas.add(bar);
        }
        bX += thickness + gap;
      }
      y += barcodeH + state.baseFontSize * 0.8;
      createText(codeStr.toUpperCase(), 0.8, '400', 'center');
    };

    drawBarcode();
    canvas.requestRenderAll();
  };

  const onLayoutChange = () => {};

  return (
    <PosterEngine 
      title="Vintage Receipt"
      defaultState={defaultState}
      presets={[{ label: 'Receipt Themes', items: POSTER_PRESETS.RECEIPT }]}
      onApplyPreset={handleApplyPreset}
      setupCanvas={setupCanvas}
      updateCanvas={updateCanvas}
      onLayoutChange={onLayoutChange}
      renderLeftPanels={renderLeftPanels}
      renderRightPanels={renderRightPanels}
      navigate={navigate}
    />
  );
}
