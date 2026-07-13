import React, { useRef } from 'react';
import * as fabric from 'fabric';
import PosterEngine from '../components/PosterEngine';
import { POSTER_PRESETS } from '../lib/presets';

interface AirbnbDesignState {
  canvasSize: string;
  orientation: 'portrait' | 'landscape';
  presetId: string;

  bgColor: string;
  inkColor: string;
  accentColor: string;
  headerFont: string;
  bodyFont: string;

  titleText: string;
  subtitleText: string;
  
  wifiNetwork: string;
  wifiPass: string;
  
  locationText: string;
  contactHost: string;
  contactPhone: string;
  
  checkoutTime: string;
  rulesText: string;
  
  layoutStyle: string;
}

interface Mood {
  bg: string;
  ink: string;
  accent: string;
  headerFont: string;
  bodyFont: string;
  layoutStyle: string;
}

const MOODS: Record<string, Mood> = {
  'cozy-beach-retreat': { bg: '#FDFBF7', ink: '#2F4F4F', accent: '#D2B48C', headerFont: 'Playfair Display', bodyFont: 'Montserrat', layoutStyle: 'two-column-elegant' },
  'urban-industrial-loft': { bg: '#F4F4F4', ink: '#1A1A1A', accent: '#8B4513', headerFont: 'Anton', bodyFont: 'Space Mono', layoutStyle: 'brutalist-block' },
  'alpine-mountain-cabin': { bg: '#FAFAFA', ink: '#2C3E35', accent: '#C87941', headerFont: 'Vollkorn', bodyFont: 'Lato', layoutStyle: 'two-column-elegant' },
  'desert-oasis-guide': { bg: '#FDF5E6', ink: '#5C4033', accent: '#8FBC8F', headerFont: 'Lora', bodyFont: 'Open Sans', layoutStyle: 'two-column-elegant' },
  'lake-house-rules': { bg: '#FFFFFF', ink: '#1A365D', accent: '#708090', headerFont: 'Merriweather', bodyFont: 'Roboto', layoutStyle: 'two-column-elegant' },
  'city-center-apartment': { bg: '#FFFFFF', ink: '#000000', accent: '#A9A9A9', headerFont: 'Inter', bodyFont: 'Inter', layoutStyle: 'modern-minimal' },
  'forest-treehouse': { bg: '#F5F5DC', ink: '#3E4F3C', accent: '#DAA520', headerFont: 'Dancing Script', bodyFont: 'Nunito', layoutStyle: 'two-column-elegant' },
  'luxury-villa-guide': { bg: '#0A0A0A', ink: '#F5F5F5', accent: '#D4AF37', headerFont: 'Cinzel', bodyFont: 'Montserrat', layoutStyle: 'two-column-elegant' },
  'vintage-cottage': { bg: '#FFFAF0', ink: '#4A3728', accent: '#CD5C5C', headerFont: 'Caveat', bodyFont: 'Lora', layoutStyle: 'two-column-elegant' },
  'tropical-resort': { bg: '#FFFFF0', ink: '#006400', accent: '#FF7F50', headerFont: 'Oswald', bodyFont: 'Montserrat', layoutStyle: 'brutalist-block' },
  'family-guest-house': { bg: '#FFFFFF', ink: '#333333', accent: '#4682B4', headerFont: 'Nunito', bodyFont: 'Nunito', layoutStyle: 'modern-minimal' },
  'farmhouse-getaway': { bg: '#F9F6F0', ink: '#2C2C2C', accent: '#556B2F', headerFont: 'Courier Prime', bodyFont: 'Open Sans', layoutStyle: 'two-column-elegant' },
  'ski-chalet-guide': { bg: '#F0F8FF', ink: '#000080', accent: '#B22222', headerFont: 'Playfair Display', bodyFont: 'Roboto', layoutStyle: 'two-column-elegant' },
  'houseboat-retreat': { bg: '#FFFFFF', ink: '#003366', accent: '#CC0000', headerFont: 'Montserrat', bodyFont: 'Open Sans', layoutStyle: 'modern-minimal' },
  'glamping-tent-guide': { bg: '#FFF8DC', ink: '#4B5320', accent: '#D2691E', headerFont: 'Caveat', bodyFont: 'Caveat', layoutStyle: 'two-column-elegant' },
  'christmas-cabin-guide': { bg: '#FFFFFF', ink: '#800000', accent: '#006400', headerFont: 'Playfair Display', bodyFont: 'Lora', layoutStyle: 'two-column-elegant' },
  'halloween-haunted-house': { bg: '#1A1A1A', ink: '#D3D3D3', accent: '#8B0000', headerFont: 'Creepster', bodyFont: 'Crimson Text', layoutStyle: 'two-column-elegant' }
};

interface PresetContent {
  title: string;
  subtitle: string;
  network: string;
  pass: string;
  location: string;
  host: string;
  phone: string;
  checkout: string;
  rules: string;
}

const PRESET_CONTENT: Record<string, PresetContent> = {
  'cozy-beach-retreat': { 
    title: 'Welcome', subtitle: 'THANK YOU FOR STAYING WITH US!', 
    network: 'SandyToes_5G', pass: 'beachvibes24',
    location: '123 Ocean Drive, Seaside, CA', host: 'Sarah & John', phone: '+1 (555) 123-4567', checkout: '11:00 AM',
    rules: 'No smoking inside\nNo pets allowed\nNo parties or events\nQuiet hours start at 10 PM\nWash off sand outside\nPlease report any damage' 
  },
  'urban-industrial-loft': { 
    title: 'Welcome Home', subtitle: 'ENJOY YOUR STAY IN THE CITY', 
    network: 'Loft_Network', pass: 'concrete123',
    location: '456 Urban Ave, Apt 4B, NY', host: 'Alex', phone: '+1 (555) 987-6543', checkout: '10:00 AM',
    rules: 'No loud music after 10 PM\nLock the deadbolt when leaving\nTrash chute is down the hall\nDo not prop building doors\nNo smoking' 
  },
  // Default fallback content for others to save space, assuming they follow a similar rich structure
  'default': { 
    title: 'Welcome', subtitle: 'WE ARE SO GLAD YOU ARE HERE', 
    network: 'Guest_WiFi', pass: 'enjoyyourstay',
    location: '101 Holiday Lane, Resort Town', host: 'Your Host', phone: '+1 (123) 456-7890', checkout: '11:00 AM',
    rules: 'No smoking inside\nRespect the neighbors\nQuiet hours 10 PM - 8 AM\nTurn off AC when leaving\nLock all doors and windows\nDispose of trash in bins' 
  }
};

export function buildPresetState(presetId: string, base?: Partial<AirbnbDesignState>): AirbnbDesignState {
  const content = PRESET_CONTENT[presetId] || PRESET_CONTENT['default'];
  const mood = MOODS[presetId] || MOODS['cozy-beach-retreat'];

  return {
    canvasSize: base?.canvasSize || '18x24',
    orientation: base?.orientation || 'portrait',
    presetId,
    bgColor: mood.bg, inkColor: mood.ink, accentColor: mood.accent,
    headerFont: mood.headerFont, bodyFont: mood.bodyFont, layoutStyle: mood.layoutStyle,
    titleText: content.title, subtitleText: content.subtitle,
    wifiNetwork: content.network, wifiPass: content.pass,
    locationText: content.location, contactHost: content.host, contactPhone: content.phone,
    checkoutTime: content.checkout, rulesText: content.rules,
  };
}

export const AIRBNB_DEFAULT_STATE: AirbnbDesignState = buildPresetState('cozy-beach-retreat');

function groupPresets(list: { id: string; label: string; category: string }[]) {
  const map = new Map<string, { id: string; label: string }[]>();
  list.forEach((p) => {
    if (!map.has(p.category)) map.set(p.category, []);
    map.get(p.category)!.push({ id: p.id, label: p.label });
  });
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

const AIRBNB_PRESETS_GROUPED = groupPresets(POSTER_PRESETS.AIRBNB);

function drawPoster(canvas: fabric.Canvas, dims: { width: number; height: number }, state: AirbnbDesignState, built: React.MutableRefObject<fabric.Object[]>) {
  built.current.forEach((o) => { try { canvas.remove(o); } catch { } });
  built.current = [];

  const locked = canvas.selection === false;
  const cw = dims.width;
  const ch = dims.height;
  const fit = cw / 600;
  const fs = (px: number) => px * fit;

  const add = (o: fabric.Object) => { canvas.add(o); built.current.push(o); };

  const createText = (text: string, size: number, font: string, color: string, opts: any = {}) => {
    return new fabric.Textbox(text, {
      fontSize: fs(size), fontFamily: font, fill: color,
      selectable: !locked, editable: !locked, evented: !locked,
      ...opts
    });
  };

  // OUTER BORDER
  const margin = fs(25);
  const border = new fabric.Rect({
    left: margin, top: margin, width: cw - (margin * 2), height: ch - (margin * 2),
    fill: 'transparent', stroke: state.inkColor, strokeWidth: fs(1.5),
    selectable: false, evented: false
  });
  add(border);
  
  // INNER THIN BORDER (Double border effect)
  const innerMargin = fs(30);
  const innerBorder = new fabric.Rect({
    left: innerMargin, top: innerMargin, width: cw - (innerMargin * 2), height: ch - (innerMargin * 2),
    fill: 'transparent', stroke: state.inkColor, strokeWidth: fs(0.5), opacity: 0.5,
    selectable: false, evented: false
  });
  add(innerBorder);

  // HEADER SECTION
  let currentY = fs(60);
  
  const title = createText(state.titleText, 65, state.headerFont, state.inkColor, {
    left: cw / 2, top: currentY, originX: 'center', textAlign: 'center', width: cw * 0.8,
    data: { edType: 'header', stateKey: 'titleText' }
  });
  add(title);
  currentY += (title.height || fs(70)) + fs(5);

  const subtitle = createText(state.subtitleText.toUpperCase(), 12, state.bodyFont, state.inkColor, {
    left: cw / 2, top: currentY, originX: 'center', textAlign: 'center', width: cw * 0.8, charSpacing: 150, fontWeight: 'bold',
    data: { edType: 'header', stateKey: 'subtitleText' }
  });
  add(subtitle);
  currentY += (subtitle.height || fs(15)) + fs(20);

  // DIVIDER LINE
  const dividerLine = new fabric.Line([cw * 0.3, currentY, cw * 0.7, currentY], {
    stroke: state.inkColor, strokeWidth: fs(1), opacity: 0.3, selectable: false
  });
  add(dividerLine);
  currentY += fs(30);

  // TWO COLUMN LAYOUT VARIABLES
  const colLeftX = fs(70);
  const colRightX = cw / 2 + fs(20);
  const colWidth = (cw / 2) - fs(90);

  // HELPER FUNCTION: DRAW INFO BLOCK WITH ICON
  const drawInfoBlock = (x: number, y: number, iconStr: string, titleStr: string, line1: string, line2: string, keys: string[]) => {
    let blockY = y;
    
    // Icon (Using Unicode characters as reliable icons across devices in canvas)
    const icon = createText(iconStr, 24, 'sans-serif', state.inkColor, {
      left: x, top: blockY, originX: 'center', width: fs(30), textAlign: 'center', selectable: false, evented: false
    });
    add(icon);

    const blockTitle = createText(titleStr.toUpperCase(), 14, state.bodyFont, state.inkColor, {
      left: x + fs(25), top: blockY + fs(5), width: colWidth - fs(25), fontWeight: 'bold', charSpacing: 100, selectable: false
    });
    add(blockTitle);
    
    const line = new fabric.Line([x + fs(25), blockY + fs(25), x + colWidth, blockY + fs(25)], {
      stroke: state.accentColor, strokeWidth: fs(1.5), opacity: 0.6, selectable: false
    });
    add(line);
    blockY += fs(35);

    if (line1) {
      const l1 = createText(line1, 11, state.bodyFont, state.inkColor, {
        left: x + fs(25), top: blockY, width: colWidth - fs(25),
        data: { edType: 'meta', stateKey: keys[0] }
      });
      add(l1);
      blockY += (l1.height || fs(15)) + fs(5);
    }
    
    if (line2) {
      const l2 = createText(line2, 11, state.bodyFont, state.inkColor, {
        left: x + fs(25), top: blockY, width: colWidth - fs(25),
        data: { edType: 'meta', stateKey: keys[1] }
      });
      add(l2);
      blockY += (l2.height || fs(15)) + fs(5);
    }
    
    return blockY + fs(20);
  };

  // --- LEFT COLUMN ---
  let leftY = currentY;
  
  // WiFi Block
  leftY = drawInfoBlock(colLeftX, leftY, '📶', 'WIFI', `Network:\n${state.wifiNetwork}`, `Password:\n${state.wifiPass}`, ['wifiNetwork', 'wifiPass']);
  
  // Location Block
  leftY = drawInfoBlock(colLeftX, leftY, '📍', 'LOCATION', state.locationText, '', ['locationText', '']);
  
  // Contact Block
  leftY = drawInfoBlock(colLeftX, leftY, '📱', 'CONTACT', `Host: ${state.contactHost}`, `Phone: ${state.contactPhone}`, ['contactHost', 'contactPhone']);

  // Check-Out Block (Moved to left to balance)
  leftY = drawInfoBlock(colLeftX, leftY, '🔑', 'CHECK OUT', `Time: ${state.checkoutTime}`, 'Please leave keys on the counter.', ['checkoutTime', '']);


  // --- RIGHT COLUMN (RULES) ---
  let rightY = currentY;
  
  const rulesIcon = createText('📋', 24, 'sans-serif', state.inkColor, {
    left: colRightX, top: rightY, originX: 'center', width: fs(30), textAlign: 'center', selectable: false
  });
  add(rulesIcon);

  const rulesTitle = createText('HOUSE RULES', 14, state.bodyFont, state.inkColor, {
    left: colRightX + fs(25), top: rightY + fs(5), width: colWidth - fs(25), fontWeight: 'bold', charSpacing: 100, selectable: false
  });
  add(rulesTitle);

  const rulesLine = new fabric.Line([colRightX + fs(25), rightY + fs(25), colRightX + colWidth, rightY + fs(25)], {
    stroke: state.accentColor, strokeWidth: fs(1.5), opacity: 0.6, selectable: false
  });
  add(rulesLine);
  rightY += fs(35);

  // Parse rules text and draw with checkboxes/bullets
  const rulesArray = state.rulesText.split('\n').filter(r => r.trim().length > 0);
  rulesArray.forEach((rule, idx) => {
    // Bullet/Checkbox
    const bullet = createText('☑', 14, 'sans-serif', state.accentColor, {
      left: colRightX + fs(25), top: rightY, width: fs(20), selectable: false
    });
    add(bullet);

    // Dynamic Rule Text
    // Note: We combine them in state, but draw them separately for aesthetic alignment
    const ruleObj = createText(rule, 11, state.bodyFont, state.inkColor, {
      left: colRightX + fs(45), top: rightY + fs(2), width: colWidth - fs(45),
      data: { edType: 'text', stateKey: 'rulesText' } // Editing any rule updates the whole block via panel
    });
    add(ruleObj);
    
    rightY += (ruleObj.height || fs(15)) + fs(10);
  });

  // --- FOOTER REVIEWS SECTION ---
  const bottomY = ch - fs(120);
  
  const footerLine = new fabric.Line([cw * 0.2, bottomY, cw * 0.8, bottomY], {
    stroke: state.inkColor, strokeWidth: fs(1), opacity: 0.2, selectable: false
  });
  add(footerLine);

  const reviewStars = createText('★★★★★', 20, 'sans-serif', state.inkColor, {
    left: cw / 2, top: bottomY + fs(15), originX: 'center', width: cw, textAlign: 'center', selectable: false
  });
  add(reviewStars);

  const reviewText = createText('If you enjoyed your stay, please leave us a review!\nWe\'d love to hear from you.', 10, state.bodyFont, state.inkColor, {
    left: cw / 2, top: bottomY + fs(45), originX: 'center', width: cw * 0.6, textAlign: 'center', fontStyle: 'italic', selectable: false
  });
  add(reviewText);

  canvas.requestRenderAll();
}

function renderLeftPanels(
  state: AirbnbDesignState,
  updateState: (key: string, val: any) => void,
  openSections: Record<string, boolean>,
  toggleSection: (k: string) => void
): React.ReactNode {
  const Accordion = (props: { id: string; title: string; children: React.ReactNode }) => (
    <>
      <button className={`accordion-btn${openSections[props.id] ? ' open' : ''}`} onClick={() => toggleSection(props.id)}>
        {props.title}<span className="arrow">&#9660;</span>
      </button>
      <div className={`accordion-content${openSections[props.id] ? ' open' : ''}`}>{props.children}</div>
    </>
  );

  return (
    <>
      <Accordion id="airbnbContent" title="Header & WiFi">
        <div className="form-row">
          <label>Main Title</label>
          <input type="text" value={state.titleText} onChange={(e) => updateState('titleText', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Subtitle</label>
          <input type="text" value={state.subtitleText} onChange={(e) => updateState('subtitleText', e.target.value)} />
        </div>
        <div className="form-row">
          <label>WiFi Network</label>
          <input type="text" value={state.wifiNetwork} onChange={(e) => updateState('wifiNetwork', e.target.value)} />
        </div>
        <div className="form-row">
          <label>WiFi Password</label>
          <input type="text" value={state.wifiPass} onChange={(e) => updateState('wifiPass', e.target.value)} />
        </div>
      </Accordion>

      <Accordion id="airbnbDetails" title="Location & Contact">
        <div className="form-row">
          <label>Location / Address</label>
          <input type="text" value={state.locationText} onChange={(e) => updateState('locationText', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Host Name</label>
          <input type="text" value={state.contactHost} onChange={(e) => updateState('contactHost', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Contact Phone</label>
          <input type="text" value={state.contactPhone} onChange={(e) => updateState('contactPhone', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Check-Out Time</label>
          <input type="text" value={state.checkoutTime} onChange={(e) => updateState('checkoutTime', e.target.value)} />
        </div>
      </Accordion>

      <Accordion id="airbnbRules" title="House Rules">
        <div className="form-row">
          <label>Rules (One per line)</label>
          <textarea rows={8} value={state.rulesText} onChange={(e) => updateState('rulesText', e.target.value)} />
        </div>
      </Accordion>

      <Accordion id="airbnbStyle" title="Style">
        <div className="color-row">
          <input type="color" value={state.bgColor} onChange={(e) => updateState('bgColor', e.target.value)} />
          <input type="text" value={state.bgColor} onChange={(e) => updateState('bgColor', e.target.value)} />
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
            {['Playfair Display', 'Caveat', 'Lora', 'Anton', 'Vollkorn', 'Josefin Sans', 'Inter', 'Merriweather', 'Dancing Script', 'Oswald', 'Nunito', 'Courier Prime', 'Cinzel'].map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="form-row">
          <label>Body Font</label>
          <select value={state.bodyFont} onChange={(e) => updateState('bodyFont', e.target.value)}>
            {['Montserrat', 'Open Sans', 'Roboto', 'Lato', 'Space Mono', 'Inter', 'Lora', 'Nunito', 'Caveat', 'Crimson Text'].map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </Accordion>
    </>
  );
}

function renderRightPanels(
  selectedType: string | null,
  state: AirbnbDesignState,
  updateState: (key: string, val: any) => void
): React.ReactNode {
  if (!selectedType) return null;
  const labelFor: Record<string, string> = { header: 'Header Element', meta: 'Information Block', text: 'Rules List' };

  return (
    <div className="pf-section">
      <div className="pf-section-title">{labelFor[selectedType] || 'Element'}</div>
      <div className="pf-row">
        <div style={{ fontSize: 11, color: 'var(--spotify-subtext)', lineHeight: 1.5 }}>
          You selected an element on the canvas. To ensure perfectly aligned grids and icons, text editing for structural blocks is done through the left panels.
        </div>
      </div>
    </div>
  );
}

export default function AirbnbPosterPage({ navigate }: { navigate: (path: string) => void }) {
  const builtObjectsRef = useRef<fabric.Object[]>([]);
  const lastSignatureRef = useRef<string>('');

  const signatureOf = (state: AirbnbDesignState) =>
    JSON.stringify({
      headerFont: state.headerFont, bodyFont: state.bodyFont,
      orientation: state.orientation, canvasSize: state.canvasSize,
      inkColor: state.inkColor, accentColor: state.accentColor, bgColor: state.bgColor,
      titleText: state.titleText, subtitleText: state.subtitleText,
      wifiNetwork: state.wifiNetwork, wifiPass: state.wifiPass,
      locationText: state.locationText, contactHost: state.contactHost, contactPhone: state.contactPhone,
      checkoutTime: state.checkoutTime, rulesText: state.rulesText
    });

  const setupCanvas = (canvas: fabric.Canvas, dims: { width: number; height: number }, state: any) => {
    drawPoster(canvas, dims, state, builtObjectsRef);
    lastSignatureRef.current = signatureOf(state);
  };

  const updateCanvas = (canvas: fabric.Canvas, state: any) => {
    const sig = signatureOf(state);
    if (sig !== lastSignatureRef.current || builtObjectsRef.current.length === 0) {
      drawPoster(canvas, { width: canvas.getWidth() / canvas.getZoom(), height: canvas.getHeight() / canvas.getZoom() }, state, builtObjectsRef);
      lastSignatureRef.current = sig;
      return;
    }
  };

  const onLayoutChange = (canvas: fabric.Canvas, dims: { width: number; height: number }, state: any) => {
    drawPoster(canvas, dims, state, builtObjectsRef);
    lastSignatureRef.current = signatureOf(state);
  };

  const onApplyPreset = (presetId: string, currentState: AirbnbDesignState): AirbnbDesignState => {
    return buildPresetState(presetId, { canvasSize: currentState.canvasSize, orientation: currentState.orientation });
  };

  return (
    <PosterEngine
      title="AirBNB Poster"
      defaultState={AIRBNB_DEFAULT_STATE}
      presets={AIRBNB_PRESETS_GROUPED}
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
