src/pages/AirbnbPosterPage.tsx
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
  wifiText: string;
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
  'cozy-beach-retreat': { bg: '#F4F1EA', ink: '#4A5D6B', accent: '#D8A47F', headerFont: 'Lora', bodyFont: 'Montserrat', layoutStyle: 'minimalist-bottom-left' },
  'urban-industrial-loft': { bg: '#1C1C1E', ink: '#E0E0E0', accent: '#FF5722', headerFont: 'Anton', bodyFont: 'Space Mono', layoutStyle: 'brutalist-grid' },
  'alpine-mountain-cabin': { bg: '#2C3E35', ink: '#F8F5F0', accent: '#C87941', headerFont: 'Vollkorn', bodyFont: 'Lato', layoutStyle: 'centered-tree' },
  'desert-oasis-guide': { bg: '#E8D8CE', ink: '#3B312B', accent: '#82937E', headerFont: 'Josefin Sans', bodyFont: 'Josefin Sans', layoutStyle: 'asymmetric-bottom-right' },
  'lake-house-rules': { bg: '#F5F7FA', ink: '#1A365D', accent: '#9CA3AF', headerFont: 'Playfair Display', bodyFont: 'Roboto', layoutStyle: 'traditional-centered' },
  'city-center-apartment': { bg: '#FFFFFF', ink: '#000000', accent: '#0047AB', headerFont: 'Inter', bodyFont: 'Inter', layoutStyle: 'museum-grid' },
  'forest-treehouse': { bg: '#4A5D23', ink: '#FDFBF7', accent: '#D4AF37', headerFont: 'Merriweather', bodyFont: 'Lora', layoutStyle: 'organic-fluid' },
  'luxury-villa-guide': { bg: '#0B0B0C', ink: '#D4AF37', accent: '#FFFFF0', headerFont: 'Playfair Display', bodyFont: 'Montserrat', layoutStyle: 'luxury-magazine' },
  'vintage-cottage': { bg: '#FDF9F1', ink: '#4A3728', accent: '#C08A8A', headerFont: 'Dancing Script', bodyFont: 'Lora', layoutStyle: 'vintage-symmetrical' },
  'tropical-resort': { bg: '#F4EBD9', ink: '#1F4E3D', accent: '#FF6F61', headerFont: 'Oswald', bodyFont: 'Montserrat', layoutStyle: 'playful-angled' },
  'family-guest-house': { bg: '#FDF1C3', ink: '#333333', accent: '#4A90E2', headerFont: 'Nunito', bodyFont: 'Nunito', layoutStyle: 'casual-grid' },
  'farmhouse-getaway': { bg: '#F4F4F4', ink: '#2C2C2C', accent: '#8F9E8B', headerFont: 'Courier Prime', bodyFont: 'Open Sans', layoutStyle: 'sturdy-centered' },
  'ski-chalet-guide': { bg: '#D9E8F5', ink: '#1A2B4C', accent: '#D32F2F', headerFont: 'Bungee', bodyFont: 'Roboto', layoutStyle: 'playful-angled' },
  'houseboat-retreat': { bg: '#003B5C', ink: '#FFFFFF', accent: '#E32636', headerFont: 'Montserrat', bodyFont: 'Open Sans', layoutStyle: 'nautical-minimal' },
  'glamping-tent-guide': { bg: '#D2B48C', ink: '#556B2F', accent: '#F28500', headerFont: 'Caveat', bodyFont: 'Caveat', layoutStyle: 'organic-fluid' },
  'christmas-cabin-guide': { bg: '#800020', ink: '#FFD700', accent: '#228B22', headerFont: 'Cinzel', bodyFont: 'Playfair Display', layoutStyle: 'vintage-symmetrical' },
  'halloween-haunted-house': { bg: '#190033', ink: '#C0C0C0', accent: '#CC3300', headerFont: 'Creepster', bodyFont: 'Crimson Text', layoutStyle: 'eerie-centered' }
};

interface PresetContent {
  title: string;
  wifi: string;
  rules: string;
}

const PRESET_CONTENT: Record<string, PresetContent> = {
  'cozy-beach-retreat': { 
    title: 'WELCOME TO THE BEACH HOUSE', 
    wifi: 'WIFI: SANDYTOES', 
    rules: 'HOUSE RULES:\n1. Wash off the sand before entering.\n2. Keep windows open for the breeze.\n3. Beach towels are in the basket.\n4. Check-out is at 11 AM.\n5. Relax and let the tide roll in.' 
  },
  'urban-industrial-loft': { 
    title: 'URBAN LOFT 4B', 
    wifi: 'WIFI: LOFT_5G / PASS: CONCRETE', 
    rules: 'HOUSE RULES:\n> No loud music after 10 PM.\n> Lock the deadbolt when leaving.\n> Trash chute is down the hall.\n> Check-out is 10 AM sharp.' 
  },
  'alpine-mountain-cabin': { 
    title: 'ALPINE CABIN', 
    wifi: 'WIFI: MOUNTAIN_AIR', 
    rules: 'CABIN RULES:\n1. Leave snowy boots by the fire.\n2. Keep the fireplace screen closed.\n3. Hot cocoa is in the pantry.\n4. Lock doors to keep bears out.\n5. Check-out 11 AM.' 
  },
  'desert-oasis-guide': { 
    title: 'DESERT OASIS', 
    wifi: 'WIFI: CACTUS', 
    rules: 'RULES:\n1. Conserve water, we are in the desert.\n2. Keep doors closed to keep critters out.\n3. Enjoy the stargazing on the patio.\n4. Check-out is 10 AM.\n5. Respect the silence.' 
  },
  'lake-house-rules': { 
    title: 'THE LAKE HOUSE', 
    wifi: 'WIFI: ON_THE_WATER', 
    rules: 'HOUSE RULES:\n1. Life jackets required on the dock.\n2. Hang wet swimsuits on the porch.\n3. No glass near the water.\n4. Fire pit out by 11 PM.\n5. Check-out at 10 AM.' 
  },
  'city-center-apartment': { 
    title: 'CITY CENTER APARTMENT', 
    wifi: 'WIFI: CITY_FIBER / PASS: SKYLINE24', 
    rules: 'HOUSE RULES:\n1. Quiet hours 10 PM to 8 AM.\n2. Use coasters on the glass tables.\n3. Leave keys on the kitchen counter.\n4. Check-out is strictly 11 AM.' 
  },
  'forest-treehouse': { 
    title: 'THE TREEHOUSE', 
    wifi: 'WIFI: UNPLUGGED', 
    rules: 'RULES OF THE TREES:\n1. Watch your step on the spiral stairs.\n2. Leave muddy shoes on the deck.\n3. Do not feed the wildlife.\n4. Listen to the owls at night.\n5. Check-out 11 AM.' 
  },
  'luxury-villa-guide': { 
    title: 'VILLA BIANCA', 
    wifi: 'WIFI: VILLA_VIP / PASS: LUXURY', 
    rules: 'CONCIERGE & RULES:\n1. Pool heating is automated.\n2. No glass near the pool edge.\n3. Contact staff for private chef requests.\n4. Check-out is 12 PM.' 
  },
  'vintage-cottage': { 
    title: 'VINTAGE COTTAGE', 
    wifi: 'WIFI: COTTAGE_GUEST', 
    rules: 'HOUSE RULES:\n1. Handle vintage teacups with care.\n2. Lock the garden gate.\n3. Enjoy the reading nook.\n4. Please water the ferns on Tuesdays.\n5. Check-out 10 AM.' 
  },
  'tropical-resort': { 
    title: 'TROPICAL ESCAPE', 
    wifi: 'WIFI: PALM_TREES', 
    rules: 'ISLAND RULES:\n1. Rinse sand at the outdoor shower.\n2. Shake out towels before washing.\n3. Watch for falling coconuts.\n4. Island time only.\n5. Check-out 11 AM.' 
  },
  'family-guest-house': { 
    title: 'THE GUEST HOUSE', 
    wifi: 'WIFI: WELCOME_HOME', 
    rules: 'HOUSE RULES:\n1. Make yourself at home.\n2. Extra blankets are in the trunk.\n3. Help yourself to the coffee bar.\n4. Board games are in the TV stand.\n5. Check-out 11 AM.' 
  },
  'farmhouse-getaway': { 
    title: 'THE FARMHOUSE', 
    wifi: 'WIFI: BARN_WIFI', 
    rules: 'HOUSE RULES:\n1. Leave muddy boots on the porch.\n2. Close the pasture gates behind you.\n3. Fresh eggs are in the fridge.\n4. Gather around the fire pit.\n5. Check-out 10 AM.' 
  },
  'ski-chalet-guide': { 
    title: 'SKI CHALET', 
    wifi: 'WIFI: POWDER_DAY', 
    rules: 'APRES SKI RULES:\n1. Skis and snowboards stay in the mudroom.\n2. Turn off the sauna after use.\n3. Hang wet gear on the drying racks.\n4. Check-out 10 AM.\n5. See you on the slopes.' 
  },
  'houseboat-retreat': { 
    title: 'THE HOUSEBOAT', 
    wifi: 'WIFI: ANCHOR_DOWN', 
    rules: 'CAPTAINS RULES:\n1. Only marine-safe toilet paper.\n2. Tie off the dinghy securely.\n3. Keep weight balanced.\n4. Watch your step on wet decks.\n5. Check-out 11 AM.' 
  },
  'glamping-tent-guide': { 
    title: 'GLAMPING RETREAT', 
    wifi: 'WIFI: INTO_THE_WILD', 
    rules: 'TENT RULES:\n1. Zip the tent completely to keep bugs out.\n2. No open flames near the canvas.\n3. Use the lanterns provided.\n4. Enjoy the starry nights.\n5. Check-out 10 AM.' 
  },
  'christmas-cabin-guide': { 
    title: 'WINTER CABIN', 
    wifi: 'WIFI: NORTH_POLE / PASS: REINDEER', 
    rules: 'HOLIDAY RULES:\n1. Hang your stockings by the fire.\n2. Hot cocoa station is open 24/7.\n3. Do not peek at the presents.\n4. Keep the fire crackling.\n5. Check-out 11 AM.' 
  },
  'halloween-haunted-house': { 
    title: 'THE HAUNTED HOUSE', 
    wifi: 'WIFI: NO_ESCAPE', 
    rules: 'HOUSE RULES:\n1. Ignore the creaking floorboards.\n2. Do not go into the basement.\n3. Garlic is provided in the kitchen.\n4. Lock the doors at midnight.\n5. Check-out if you survive until 11 AM.' 
  }
};

export function buildPresetState(presetId: string, base?: Partial<AirbnbDesignState>): AirbnbDesignState {
  const content = PRESET_CONTENT[presetId] || PRESET_CONTENT['cozy-beach-retreat'];
  const mood = MOODS[presetId] || MOODS['cozy-beach-retreat'];

  return {
    canvasSize: base?.canvasSize || '18x24',
    orientation: base?.orientation || 'portrait',
    presetId,

    bgColor: mood.bg,
    inkColor: mood.ink,
    accentColor: mood.accent,
    headerFont: mood.headerFont,
    bodyFont: mood.bodyFont,
    layoutStyle: mood.layoutStyle,

    titleText: content.title,
    wifiText: content.wifi,
    rulesText: content.rules,
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
  const isLand = state.orientation === 'landscape';
  const fit = cw / 600;
  const fs = (px: number) => px * fit;

  const add = (o: fabric.Object) => {
    canvas.add(o);
    built.current.push(o);
  };

  const createText = (text: string, size: number, font: string, color: string, opts: any = {}) => {
    return new fabric.Textbox(text, {
      fontSize: fs(size),
      fontFamily: font,
      fill: color,
      selectable: !locked,
      editable: !locked,
      evented: !locked,
      ...opts
    });
  };

  const style = state.layoutStyle;

  if (style === 'minimalist-bottom-left' || style === 'organic-fluid') {
    const title = createText(state.titleText, 45, state.headerFont, state.inkColor, {
      left: cw * 0.1, top: ch * 0.1, width: cw * 0.8, textAlign: 'center', charSpacing: 80,
      data: { edType: 'header', stateKey: 'titleText' }
    });
    add(title);
    
    const wifi = createText(state.wifiText, 16, state.bodyFont, state.accentColor, {
      left: cw * 0.1, top: title.top! + (title.height || 0) + fs(10), width: cw * 0.8, textAlign: 'center', fontWeight: 'bold', charSpacing: 40,
      data: { edType: 'meta', stateKey: 'wifiText' }
    });
    add(wifi);

    const rules = createText(state.rulesText, 20, state.bodyFont, state.inkColor, {
      left: cw * 0.15, top: ch * 0.5, width: cw * 0.7, textAlign: 'left', lineHeight: 1.8,
      data: { edType: 'text', stateKey: 'rulesText' }
    });
    add(rules);

  } else if (style === 'brutalist-grid' || style === 'museum-grid') {
    const title = createText(state.titleText, 40, state.headerFont, state.inkColor, {
      left: cw * 0.08, top: ch * 0.08, width: cw * 0.5, textAlign: 'left', fontWeight: 'bold',
      data: { edType: 'header', stateKey: 'titleText' }
    });
    add(title);

    const wifi = createText(state.wifiText, 14, state.bodyFont, state.accentColor, {
      left: isLand ? cw * 0.6 : cw * 0.08, top: isLand ? ch * 0.08 : title.top! + (title.height || 0) + fs(20), width: cw * 0.35, textAlign: isLand ? 'right' : 'left',
      data: { edType: 'meta', stateKey: 'wifiText' }
    });
    add(wifi);

    const line = new fabric.Line([cw * 0.08, ch * 0.25, cw * 0.92, ch * 0.25], {
      stroke: state.inkColor, strokeWidth: fs(3), selectable: false
    });
    add(line);

    const rules = createText(state.rulesText, 18, state.bodyFont, state.inkColor, {
      left: cw * 0.08, top: ch * 0.3, width: cw * 0.84, textAlign: 'left', lineHeight: 1.6,
      data: { edType: 'text', stateKey: 'rulesText' }
    });
    add(rules);

  } else if (style === 'centered-tree' || style === 'traditional-centered' || style === 'vintage-symmetrical' || style === 'eerie-centered' || style === 'sturdy-centered') {
    const title = createText(state.titleText, 55, state.headerFont, state.inkColor, {
      left: cw * 0.1, top: ch * 0.15, width: cw * 0.8, textAlign: 'center', charSpacing: 50,
      data: { edType: 'header', stateKey: 'titleText' }
    });
    add(title);

    if (style === 'traditional-centered' || style === 'vintage-symmetrical') {
      const line1 = new fabric.Line([cw * 0.3, title.top! + (title.height || 0) + fs(10), cw * 0.7, title.top! + (title.height || 0) + fs(10)], { stroke: state.accentColor, strokeWidth: fs(1), selectable: false });
      const line2 = new fabric.Line([cw * 0.3, title.top! + (title.height || 0) + fs(14), cw * 0.7, title.top! + (title.height || 0) + fs(14)], { stroke: state.accentColor, strokeWidth: fs(1), selectable: false });
      add(line1); add(line2);
    }

    const wifi = createText(state.wifiText, 16, state.bodyFont, state.accentColor, {
      left: cw * 0.1, top: title.top! + (title.height || 0) + fs(40), width: cw * 0.8, textAlign: 'center',
      data: { edType: 'meta', stateKey: 'wifiText' }
    });
    add(wifi);

    const rules = createText(state.rulesText, 22, state.bodyFont, state.inkColor, {
      left: cw * 0.1, top: ch * 0.5, width: cw * 0.8, textAlign: 'center', lineHeight: 2,
      data: { edType: 'text', stateKey: 'rulesText' }
    });
    add(rules);

  } else if (style === 'asymmetric-bottom-right' || style === 'luxury-magazine') {
    const title = createText(state.titleText, 70, state.headerFont, state.inkColor, {
      left: cw * 0.05, top: ch * 0.05, width: cw * 0.9, textAlign: 'left', fontWeight: '100', charSpacing: -20,
      data: { edType: 'header', stateKey: 'titleText' }
    });
    add(title);

    const rules = createText(state.rulesText, 18, state.bodyFont, state.inkColor, {
      left: cw * 0.4, top: ch * 0.5, width: cw * 0.5, textAlign: 'left', lineHeight: 1.8,
      data: { edType: 'text', stateKey: 'rulesText' }
    });
    add(rules);

    const wifi = createText(state.wifiText, 14, state.bodyFont, state.accentColor, {
      left: cw * 0.4, top: rules.top! - fs(40), width: cw * 0.5, textAlign: 'left',
      data: { edType: 'meta', stateKey: 'wifiText' }
    });
    add(wifi);

  } else if (style === 'playful-angled') {
    const title = createText(state.titleText, 60, state.headerFont, state.inkColor, {
      left: cw * 0.1, top: ch * 0.1, width: cw * 0.8, textAlign: 'left', angle: -5,
      data: { edType: 'header', stateKey: 'titleText' }
    });
    add(title);

    const wifi = createText(state.wifiText, 18, state.bodyFont, state.accentColor, {
      left: cw * 0.1, top: ch * 0.3, width: cw * 0.8, textAlign: 'left', angle: -5,
      data: { edType: 'meta', stateKey: 'wifiText' }
    });
    add(wifi);

    const rules = createText(state.rulesText, 20, state.bodyFont, state.inkColor, {
      left: isLand ? cw * 0.5 : cw * 0.15, top: isLand ? ch * 0.3 : ch * 0.5, width: isLand ? cw * 0.4 : cw * 0.7, textAlign: 'left', lineHeight: 1.7,
      data: { edType: 'text', stateKey: 'rulesText' }
    });
    add(rules);

  } else {
    // Fallback casual grid
    const title = createText(state.titleText, 45, state.headerFont, state.inkColor, {
      left: cw * 0.1, top: ch * 0.1, width: cw * 0.8, textAlign: 'center',
      data: { edType: 'header', stateKey: 'titleText' }
    });
    add(title);
    
    const wifi = createText(state.wifiText, 16, state.bodyFont, state.accentColor, {
      left: cw * 0.1, top: ch * 0.25, width: cw * 0.8, textAlign: 'center',
      data: { edType: 'meta', stateKey: 'wifiText' }
    });
    add(wifi);

    const rules = createText(state.rulesText, 20, state.bodyFont, state.inkColor, {
      left: cw * 0.1, top: ch * 0.4, width: cw * 0.8, textAlign: 'left', lineHeight: 1.8,
      data: { edType: 'text', stateKey: 'rulesText' }
    });
    add(rules);
  }

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
      <Accordion id="airbnbContent" title="Content">
        <div className="form-row">
          <label>Header / Title</label>
          <input type="text" value={state.titleText} onChange={(e) => updateState('titleText', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Wi-Fi Details</label>
          <input type="text" value={state.wifiText} onChange={(e) => updateState('wifiText', e.target.value)} />
        </div>
        <div className="form-row">
          <label>House Rules</label>
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
            {['Lora', 'Anton', 'Vollkorn', 'Josefin Sans', 'Playfair Display', 'Inter', 'Merriweather', 'Dancing Script', 'Oswald', 'Nunito', 'Courier Prime', 'Bungee', 'Montserrat', 'Caveat', 'Cinzel', 'Creepster'].map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="form-row">
          <label>Body Font</label>
          <select value={state.bodyFont} onChange={(e) => updateState('bodyFont', e.target.value)}>
            {['Montserrat', 'Space Mono', 'Lato', 'Josefin Sans', 'Roboto', 'Inter', 'Lora', 'Nunito', 'Open Sans', 'Caveat', 'Playfair Display', 'Crimson Text'].map((f) => <option key={f} value={f}>{f}</option>)}
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
  const labelFor: Record<string, string> = { header: 'Header Element', meta: 'Meta Info', text: 'Rules Text Block' };

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

export default function AirbnbPosterPage({ navigate }: { navigate: (path: string) => void }) {
  const builtObjectsRef = useRef<fabric.Object[]>([]);
  const lastSignatureRef = useRef<string>('');

  const signatureOf = (state: AirbnbDesignState) =>
    JSON.stringify({
      headerFont: state.headerFont,
      bodyFont: state.bodyFont,
      orientation: state.orientation,
      canvasSize: state.canvasSize,
      inkColor: state.inkColor,
      accentColor: state.accentColor,
      bgColor: state.bgColor,
      layoutStyle: state.layoutStyle
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

    const findByKey = (key: string) => builtObjectsRef.current.find((o: any) => o.data && o.data.stateKey === key);
    const patchText = (key: string, val: string) => {
      const obj: any = findByKey(key);
      if (!obj) return;
      if (obj.isEditing) return;
      if (obj.text !== val) obj.set({ text: val });
    };

    patchText('titleText', state.titleText);
    patchText('wifiText', state.wifiText);
    patchText('rulesText', state.rulesText);
    canvas.requestRenderAll();
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
