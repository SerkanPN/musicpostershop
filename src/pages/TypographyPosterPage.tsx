import React from 'react';
import * as fabric from 'fabric';
import { Trash2, Plus } from 'lucide-react';
import PosterEngine, { Accordion, GOOGLE_FONTS } from '../components/PosterEngine';
import { POSTER_PRESETS } from '../lib/presets';

const defaultState = {
  canvasSize: '11.69x16.54',
  orientation: 'portrait',
  bgColor: '#f4f4f5',
  textColor: '#18181b',
  fontFamily: 'Courier Prime',
  baseFontSize: 16,
  
  shopName: 'THE LOVE STORE CO.',
  address: 'INFINITY ROAD, AMOR DISTRICT',
  cashier: 'DESTINY',
  receiptNo: 'REC-LOVE-2026',
  
  items: [
    { qty: '1', name: 'FIRST EYE CONTACT', price: 0.00 },
    { qty: '1', name: 'FIRST SWEET COFFEE DATE', price: 12.50 },
    { qty: '45', name: 'LATE NIGHT PHONE CALLS', price: 90.00 },
    { qty: '3', name: 'UNPLANNED ROAD TRIPS', price: 150.00 },
    { qty: '99', name: 'SHARED WARM HUGS', price: 0.00 },
    { qty: '1', name: 'PROMISE TO STAY FOREVER', price: 1000.00 }
  ],
  
  taxRate: 0,
  discount: 100,
  totalLabel: 'ETERNAL LOVE',
  footer: 'THANK YOU FOR BEING MY FOREVER',

  dividerStyle: 'dashed',
  headerAlign: 'center',
  showBarcode: true,
  uppercaseAll: true
};

export default function ReceiptPosterPage({ navigate }: { navigate: (path: string) => void }) {

  const handleApplyPreset = (presetId: string, currentState: any) => {
    const base = { ...currentState };
    
    switch (presetId) {
      case 'love-invoice':
        return {
          ...base,
          bgColor: '#fff0f5',
          textColor: '#4a044e',
          fontFamily: 'Playfair Display',
          baseFontSize: 18,
          shopName: 'The Love Story',
          address: 'Avenue of Eternity, Heart District',
          cashier: 'Cupid',
          receiptNo: 'LOV-2026-XOXO',
          taxRate: 0,
          discount: 100,
          totalLabel: 'Eternal Love',
          footer: 'Thank you for choosing me.',
          dividerStyle: 'solid',
          headerAlign: 'center',
          showBarcode: false,
          uppercaseAll: false,
          items: [
            { qty: '1', name: 'First Eye Contact', price: 0.00 },
            { qty: '1', name: 'First Sweet Coffee Date', price: 12.50 },
            { qty: '45', name: 'Late Night Phone Calls', price: 90.00 },
            { qty: '3', name: 'Unplanned Road Trips', price: 150.00 },
            { qty: '99', name: 'Shared Warm Hugs', price: 0.00 },
            { qty: '1', name: 'Promise To Stay Forever', price: 1000.00 }
          ]
        };

      case 'marathon-finisher':
        return {
          ...base,
          bgColor: '#0f172a',
          textColor: '#38bdf8',
          fontFamily: 'Bebas Neue',
          baseFontSize: 24,
          shopName: 'BOSTON ATHLETICS',
          address: 'FINISH LINE - 26.2 MILES',
          cashier: 'CHIP TIMER #410',
          receiptNo: 'RUN-42K-FINISHER',
          taxRate: 0,
          discount: 0,
          totalLabel: 'FINISH TIME',
          footer: 'PAIN IS TEMPORARY. PRIDE IS FOREVER.',
          dividerStyle: 'solid',
          headerAlign: 'center',
          showBarcode: true,
          uppercaseAll: true,
          items: [
            { qty: '10K', name: 'FIRST SECTOR SPLIT', price: 48.30 },
            { qty: '21K', name: 'HALF MARATHON MILESTONE', price: 104.15 },
            { qty: '30K', name: 'HIT THE WALL DEFIANCE', price: 155.00 },
            { qty: '42K', name: 'FINAL SPRINT REVELATION', price: 215.42 },
            { qty: '1', name: 'TOTAL CALORIES BURNED', price: 2800.00 }
          ]
        };

      case 'cafe-bistro':
        return {
          ...base,
          bgColor: '#fef3c7',
          textColor: '#451a03',
          fontFamily: 'Courier Prime',
          baseFontSize: 16,
          shopName: 'THE ROAST & BREW',
          address: '404 BEAN ST, ESPRESSOLAND',
          cashier: 'BARISTA MAX',
          receiptNo: 'BREW-99-CAFE',
          taxRate: 8,
          discount: 10,
          totalLabel: 'GRAND TOTAL',
          footer: 'LIFE BEGINS AFTER COFFEE',
          dividerStyle: 'dashed',
          headerAlign: 'center',
          showBarcode: true,
          uppercaseAll: true,
          items: [
            { qty: '2', name: 'DOUBLE SHOT CORTADO', price: 9.00 },
            { qty: '1', name: 'FRESH ALMOND CROISSANT', price: 5.50 },
            { qty: '1', name: 'V60 ETHIOPIA HAND BREW', price: 6.50 },
            { qty: '1', name: 'EXTRA COLD GOOD VIBES', price: 0.00 }
          ]
        };

      case 'gamer-match-stats':
        return {
          ...base,
          bgColor: '#020617',
          textColor: '#22c55e',
          fontFamily: 'Share Tech Mono',
          baseFontSize: 16,
          shopName: '> SYSTEM_OVERRIDE',
          address: '> SECTOR-7 COMPILER GATE',
          cashier: 'AI_v2.0',
          receiptNo: 'MATCH-107-WIN',
          taxRate: 0,
          discount: 0,
          totalLabel: 'TOTAL XP EARNED',
          footer: 'MATCH SUMMARY SAVED. GG WP.',
          dividerStyle: 'dotted',
          headerAlign: 'left',
          showBarcode: false,
          uppercaseAll: true,
          items: [
            { qty: '24', name: 'CONFIRMED RIVAL KILLS', price: 2400 },
            { qty: '12', name: 'TACTICAL ASSISTS SECURED', price: 1200 },
            { qty: '1', name: 'CHAMPIONS MATCH WIN', price: 5000 },
            { qty: '3', name: 'HEADSHOT BONUSES', price: 300 }
          ]
        };

      case 'birthday-invoice-30':
        return {
          ...base,
          bgColor: '#fdfbf7',
          textColor: '#171717',
          fontFamily: 'Inconsolata',
          baseFontSize: 16,
          shopName: 'LIFE EXPERIENCE CO.',
          address: 'EARTH PLANET, SOLAR SYSTEM',
          cashier: 'FATHER TIME',
          receiptNo: 'AGE-30-YEARS',
          taxRate: 0,
          discount: 0,
          totalLabel: 'YEARS LIVED',
          footer: 'WELCOME TO THE DIRTY THIRTY CLUB',
          dividerStyle: 'dashed',
          headerAlign: 'center',
          showBarcode: true,
          uppercaseAll: true,
          items: [
            { qty: '10K', name: 'CUPS OF COFFEE CONSUMED', price: 0.00 },
            { qty: '99', name: 'MISTAKES LEARNED FROM', price: 0.00 },
            { qty: '5', name: 'AMAZING LIFELONG FRIENDS', price: 0.00 },
            { qty: '1', name: 'COLLEGE DEGREE SURVIVED', price: 0.00 },
            { qty: '30', name: 'CANDLES ON THE CAKE', price: 30.00 }
          ]
        };

      default:
        return base;
    }
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
            <label>Paper Background</label>
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
              <input type="range" min="8" max="72" value={state.baseFontSize} onChange={(e) => updateState('baseFontSize', Number(e.target.value))} />
              <span className="range-val">{state.baseFontSize}px</span>
            </div>
          </div>
          <div className="form-row">
            <label>Divider Style</label>
            <select value={state.dividerStyle} onChange={(e) => updateState('dividerStyle', e.target.value)}>
              <option value="dashed">Dashed Line</option>
              <option value="solid">Solid Line</option>
              <option value="dotted">Dotted Line</option>
              <option value="none">None</option>
            </select>
          </div>
          <div className="form-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={state.uppercaseAll} onChange={(e) => updateState('uppercaseAll', e.target.checked)} style={{ width: '16px', height: '16px' }} />
            <label style={{ margin: 0, textTransform: 'none', cursor: 'pointer' }}>Force Uppercase</label>
          </div>
          <div className="form-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={state.showBarcode} onChange={(e) => updateState('showBarcode', e.target.checked)} style={{ width: '16px', height: '16px' }} />
            <label style={{ margin: 0, textTransform: 'none', cursor: 'pointer' }}>Show Barcode</label>
          </div>
        </Accordion>

        <Accordion title="&#128294; Header Information" isOpen={openSections.header} onToggle={() => toggleSection('header')}>
          <div className="form-row">
            <label>Header Alignment</label>
            <select value={state.headerAlign} onChange={(e) => updateState('headerAlign', e.target.value)}>
              <option value="center">Center</option>
              <option value="left">Left</option>
            </select>
          </div>
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
                    <td style={{ padding: '4px 0', paddingRight: '4px' }}>
                      <input type="text" style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: '#fff', fontSize: '11px', padding: '6px', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }} value={item.qty} onChange={(e) => updateItemField(idx, 'qty', e.target.value)} />
                    </td>
                    <td style={{ padding: '4px 0', paddingRight: '4px' }}>
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
          <div className="pf-section-title">Receipt Design</div>
          <p style={{ fontSize: '11px', color: '#888', marginBottom: '12px', lineHeight: '1.5' }}>
            Receipt structures are auto-calculated and dynamically scaled to perfectly fit the canvas, regardless of orientation or line item count.
          </p>
          <div className="pf-row">
            <label>Global Ink Color</label>
            <div className="pf-color-row">
              <input type="color" value={state.textColor} onChange={(e) => updateState('textColor', e.target.value)} />
              <input type="text" value={state.textColor} onChange={(e) => updateState('textColor', e.target.value)} />
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const setupCanvas = () => {};

  const updateCanvas = (canvas: fabric.Canvas, state: any) => {
    const existingObjects = canvas.getObjects();
    const objectsToRemove = existingObjects.filter(obj => obj.data?.isReceiptElement);
    objectsToRemove.forEach(obj => canvas.remove(obj));

    const cw = canvas.width!;
    const ch = canvas.height!;
    
    let safeWidth = cw * 0.8;
    if (safeWidth > 800) safeWidth = 800;
    
    const safeHeight = ch * 0.85;

    let lineCount = 0;
    lineCount += 4; 
    lineCount += 3; 
    lineCount += 2; 
    lineCount += state.items.length * 1.6;
    lineCount += 5; 
    if (state.footer) lineCount += 3;
    if (state.showBarcode) lineCount += 5;

    const rawHeightRequired = lineCount * (state.baseFontSize * 1.5);
    
    let activeFontSize = state.baseFontSize;
    if (rawHeightRequired > safeHeight) {
      activeFontSize = safeHeight / (lineCount * 1.5);
    }
    
    const maxCharsEstimate = 45;
    const avgCharW = activeFontSize * 0.6;
    if (maxCharsEstimate * avgCharW > safeWidth) {
      activeFontSize = Math.min(activeFontSize, safeWidth / (maxCharsEstimate * 0.6));
    }

    const finalTotalHeight = lineCount * (activeFontSize * 1.5);
    let cursorY = (ch - finalTotalHeight) / 2;
    cursorY = Math.max(cursorY, ch * 0.05);

    const leftX = (cw - safeWidth) / 2;
    const rightX = leftX + safeWidth;
    const centerX = cw / 2;
    const bf = activeFontSize;

    const addObj = (obj: any) => {
      obj.set({ data: { isReceiptElement: true, edType: 'receipt-element' } });
      canvas.add(obj);
    };

    const fmtText = (txt: string) => state.uppercaseAll ? txt.toUpperCase() : txt;

    const drawText = (txt: string, sizeMult: number, weight: string, align: 'left' | 'center' | 'right', italic = false) => {
      const xPos = state.headerAlign === 'left' && align === 'center' ? leftX : (align === 'center' ? centerX : align === 'left' ? leftX : rightX);
      const alignRule = state.headerAlign === 'left' && align === 'center' ? 'left' : align;

      const obj = new fabric.Text(fmtText(txt), {
        left: xPos,
        top: cursorY,
        originX: alignRule,
        fontSize: bf * sizeMult,
        fontFamily: state.fontFamily,
        fontWeight: weight,
        fontStyle: italic ? 'italic' : 'normal',
        fill: state.textColor,
        selectable: true
      });
      addObj(obj);
      return obj;
    };

    const drawDash = () => {
      if (state.dividerStyle === 'none') {
        cursorY += bf * 1.0;
        return;
      }
      
      const dashArray = state.dividerStyle === 'dotted' ? [bf * 0.15, bf * 0.3] : state.dividerStyle === 'dashed' ? [bf * 0.6, bf * 0.4] : undefined;
      
      const line = new fabric.Line([leftX, cursorY, rightX, cursorY], {
        stroke: state.textColor,
        strokeWidth: bf * 0.12,
        strokeDashArray: dashArray,
        selectable: true
      });
      addObj(line);
      cursorY += bf * 1.5;
    };

    drawText(state.shopName, 2.2, '800', 'center');
    cursorY += bf * 2.8;

    if (state.address) {
      drawText(state.address, 0.9, '400', 'center');
      cursorY += bf * 1.8;
    }

    cursorY += bf * 1.0;
    drawDash();

    const now = new Date();
    const dateStr = `DATE: ${now.toLocaleDateString()}`;
    const timeStr = `TIME: ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    drawText(dateStr, 0.85, '400', 'left');
    drawText(timeStr, 0.85, '400', 'right');
    cursorY += bf * 1.5;
    
    drawText(`RECEIPT: ${fmtText(state.receiptNo)}`, 0.85, '400', 'left');
    drawText(`CASHIER: ${fmtText(state.cashier)}`, 0.85, '400', 'right');
    cursorY += bf * 2.0;

    drawDash();

    drawText('QTY', 0.9, '700', 'left');
    
    const descHeader = new fabric.Text(fmtText('DESCRIPTION'), {
      left: leftX + (safeWidth * 0.18),
      top: cursorY,
      fontSize: bf * 0.9,
      fontFamily: state.fontFamily,
      fontWeight: '700',
      fill: state.textColor,
      selectable: true
    });
    addObj(descHeader);
    
    drawText('VALUE', 0.9, '700', 'right');
    cursorY += bf * 1.8;

    drawDash();

    let subtotal = 0;
    state.items.forEach((item: any) => {
      subtotal += item.price;
      
      drawText(item.qty, 0.9, '400', 'left');
      
      const descItem = new fabric.Text(fmtText(item.name), {
        left: leftX + (safeWidth * 0.18),
        top: cursorY,
        fontSize: bf * 0.9,
        fontFamily: state.fontFamily,
        fontWeight: '400',
        fill: state.textColor,
        selectable: true
      });
      addObj(descItem);

      const priceStr = item.price === 0 ? 'FREE' : item.price.toFixed(2);
      drawText(priceStr, 0.9, '400', 'right');

      cursorY += bf * 1.6;
    });

    cursorY += bf * 0.8;
    drawDash();

    const drawCalc = (label: string, valStr: string, sizeMult = 0.9, weight = '400') => {
      drawText(label, sizeMult, weight, 'left');
      drawText(valStr, sizeMult, weight, 'right');
      cursorY += bf * 1.6;
    };

    const taxCalc = subtotal * (state.taxRate / 100);
    const grandTotal = Math.max(0, subtotal + taxCalc - state.discount);

    drawCalc('SUBTOTAL', subtotal.toFixed(2));
    if (state.taxRate > 0) drawCalc(`TAX (${state.taxRate}%)`, taxCalc.toFixed(2));
    if (state.discount > 0) drawCalc('DISCOUNT', `-${state.discount.toFixed(2)}`);

    cursorY += bf * 0.5;
    drawDash();

    drawCalc(state.totalLabel, grandTotal.toFixed(2), 1.4, '800');

    cursorY += bf * 1.5;
    drawDash();

    if (state.footer) {
      drawText(state.footer, 0.9, '600', 'center', true);
      cursorY += bf * 3.0;
    }

    if (state.showBarcode) {
      const codeStr = state.receiptNo.replace(/[^A-Za-z0-9]/g, '') || '0000';
      const barcodeW = safeWidth * 0.65;
      const barcodeX = (cw - barcodeW) / 2;
      const barcodeH = bf * 2.8;

      const randomWithSeed = (seed: number) => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
      };

      let bX = barcodeX;
      let seed = 12345;
      
      while (bX < barcodeX + barcodeW) {
        const rVal = randomWithSeed(seed++);
        const thickness = rVal > 0.75 ? bf * 0.3 : rVal > 0.4 ? bf * 0.15 : bf * 0.08;
        const gap = randomWithSeed(seed++) * bf * 0.25 + (bf * 0.05);

        if (bX + thickness <= barcodeX + barcodeW) {
          const bar = new fabric.Rect({
            left: bX,
            top: cursorY,
            width: thickness,
            height: barcodeH,
            fill: state.textColor,
            selectable: true
          });
          addObj(bar);
        }
        bX += thickness + gap;
      }
      
      cursorY += barcodeH + bf * 0.5;
      drawText(codeStr, 0.7, '400', 'center');
    }
    
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
