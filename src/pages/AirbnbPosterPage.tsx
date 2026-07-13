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
  'urban-industrial-loft': { bg: '#111111', ink: '#F4F4F4', accent: '#FF4500', headerFont: 'Anton', bodyFont: 'Space Mono', layoutStyle: 'brutalist-block' },
  'alpine-mountain-cabin': { bg: '#FAFAFA', ink: '#2C3E35', accent: '#C87941', headerFont: 'Vollkorn', bodyFont: 'Lato', layoutStyle: 'two-column-elegant' },
  'desert-oasis-guide': { bg: '#FDF5E6', ink: '#5C4033', accent: '#8FBC8F', headerFont: 'Lora', bodyFont: 'Open Sans', layoutStyle: 'two-column-elegant' },
  'lake-house-rules': { bg: '#FFFFFF', ink: '#1A365D', accent: '#708090', headerFont: 'Merriweather', bodyFont: 'Roboto', layoutStyle: 'two-column-elegant' },
  'city-center-apartment': { bg: '#FFFFFF', ink: '#000000', accent: '#0047AB', headerFont: 'Inter', bodyFont: 'Inter', layoutStyle: 'modern-minimal' },
  'forest-treehouse': { bg: '#F5F5DC', ink: '#3E4F3C', accent: '#DAA520', headerFont: 'Dancing Script', bodyFont: 'Nunito', layoutStyle: 'two-column-elegant' },
  'luxury-villa-guide': { bg: '#0A0A0A', ink: '#F5F5F5', accent: '#D4AF37', headerFont: 'Cinzel', bodyFont: 'Montserrat', layoutStyle: 'modern-minimal' },
  'vintage-cottage': { bg: '#FFFAF0', ink: '#4A3728', accent: '#CD5C5C', headerFont: 'Caveat', bodyFont: 'Lora', layoutStyle: 'two-column-elegant' },
  'tropical-resort': { bg: '#FFFFF0', ink: '#006400', accent: '#FF7F50', headerFont: 'Oswald', bodyFont: 'Montserrat', layoutStyle: 'brutalist-block' },
  'family-guest-house': { bg: '#FFFFFF', ink: '#333333', accent: '#4682B4', headerFont: 'Nunito', bodyFont: 'Nunito', layoutStyle: 'modern-minimal' },
  'farmhouse-getaway': { bg: '#F9F6F0', ink: '#2C2C2C', accent: '#556B2F', headerFont: 'Courier Prime', bodyFont: 'Open Sans', layoutStyle: 'two-column-elegant' },
  'ski-chalet-guide': { bg: '#F0F8FF', ink: '#000080', accent: '#B22222', headerFont: 'Playfair Display', bodyFont: 'Roboto', layoutStyle: 'two-column-elegant' },
  'houseboat-retreat': { bg: '#FFFFFF', ink: '#003366', accent: '#CC0000', headerFont: 'Montserrat', bodyFont: 'Open Sans', layoutStyle: 'modern-minimal' },
  'glamping-tent-guide': { bg: '#FFF8DC', ink: '#4B5320', accent: '#D2691E', headerFont: 'Caveat', bodyFont: 'Caveat', layoutStyle: 'two-column-elegant' },
  'christmas-cabin-guide': { bg: '#FFFFFF', ink: '#800000', accent: '#006400', headerFont: 'Playfair Display', bodyFont: 'Lora', layoutStyle: 'two-column-elegant' },
  'halloween-haunted-house': { bg: '#1A1A1A', ink: '#D3D3D3', accent: '#8B0000', headerFont: 'Creepster', bodyFont: 'Crimson Text', layoutStyle: 'brutalist-block' }
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
    title: 'URBAN LOFT', subtitle: 'ENJOY YOUR STAY IN THE CITY', 
    network: 'Loft_Network', pass: 'concrete123',
    location: '456 Urban Ave, Apt 4B', host: 'Alex', phone: '+1 (555) 987-6543', checkout: '10:00 AM',
    rules: 'No loud music after 10 PM\nLock deadbolt when leaving\nTrash chute is down the hall\nDo not prop building doors\nNo smoking' 
  },
  'default': { 
    title: 'Welcome', subtitle: 'WE ARE SO GLAD YOU ARE HERE', 
    network: 'Guest_WiFi', pass: 'enjoyyourstay',
    location: '101 Holiday Lane', host: 'Your Host', phone: '+1 (123) 456-7890', checkout: '11:00 AM',
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
  const isLand = state.orientation === 'landscape';
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

  const style = state.layoutStyle;

  // ============================================================================
  // 1. TWO-COLUMN ELEGANT (Classic Wedding / Fine Art Resort Style)
  // ============================================================================
  if (style === 'two-column-elegant') {
    const margin = fs(25);
    add(new fabric.Rect({ left: margin, top: margin, width: cw - margin*2, height: ch - margin*2, fill: 'transparent', stroke: state.inkColor, strokeWidth: fs(1.5), selectable: false }));
    add(new fabric.Rect({ left: margin + fs(5), top: margin + fs(5), width: cw - (margin*2) - fs(10), height: ch - (margin*2) - fs(10), fill: 'transparent', stroke: state.inkColor, strokeWidth: fs(0.5), opacity: 0.5, selectable: false }));

    if (isLand) {
      // LANDSCAPE: 3 Sections (Left: Header, Mid: Info, Right: Rules)
      const leftColX = cw * 0.08;
      const midColX = cw * 0.42;
      const rightColX = cw * 0.70;
      const colW = cw * 0.22;

      // Header (Left)
      const title = createText(state.titleText, 55, state.headerFont, state.inkColor, { left: leftColX, top: ch * 0.35, width: cw * 0.3, textAlign: 'left', data: { edType: 'header', stateKey: 'titleText' } });
      add(title);
      const sub = createText(state.subtitleText.toUpperCase(), 10, state.bodyFont, state.inkColor, { left: leftColX, top: title.top! + (title.height||0) + fs(10), width: cw * 0.3, charSpacing: 100, data: { edType: 'header', stateKey: 'subtitleText' } });
      add(sub);

      add(new fabric.Line([midColX - fs(20), ch * 0.15, midColX - fs(20), ch * 0.85], { stroke: state.inkColor, strokeWidth: fs(0.5), opacity: 0.3, selectable: false }));

      // Info Blocks (Mid)
      let cy = ch * 0.15;
      const drawBlock = (icon: string, tit: string, l1: string, l2: string, x: number) => {
        add(createText(icon, 18, 'sans-serif', state.inkColor, { left: x, top: cy, width: fs(25), textAlign: 'center', selectable: false }));
        add(createText(tit, 12, state.bodyFont, state.inkColor, { left: x + fs(30), top: cy + fs(2), width: colW - fs(30), fontWeight: 'bold', charSpacing: 50, selectable: false }));
        add(new fabric.Line([x + fs(30), cy + fs(20), x + colW, cy + fs(20)], { stroke: state.accentColor, strokeWidth: fs(1), opacity: 0.5, selectable: false }));
        cy += fs(30);
        if(l1) { const t1 = createText(l1, 10, state.bodyFont, state.inkColor, { left: x + fs(30), top: cy, width: colW - fs(30) }); add(t1); cy += (t1.height||0) + fs(5); }
        if(l2) { const t2 = createText(l2, 10, state.bodyFont, state.inkColor, { left: x + fs(30), top: cy, width: colW - fs(30) }); add(t2); cy += (t2.height||0) + fs(5); }
        cy += fs(15);
      };
      
      drawBlock('📶', 'WIFI', `Net: ${state.wifiNetwork}`, `Pass: ${state.wifiPass}`, midColX);
      drawBlock('📍', 'LOCATION', state.locationText, '', midColX);
      drawBlock('📱', 'CONTACT', `Host: ${state.contactHost}`, `Ph: ${state.contactPhone}`, midColX);
      drawBlock('🔑', 'CHECK OUT', `Time: ${state.checkoutTime}`, '', midColX);

      // Rules (Right)
      let ry = ch * 0.15;
      add(createText('📋', 18, 'sans-serif', state.inkColor, { left: rightColX, top: ry, width: fs(25), textAlign: 'center', selectable: false }));
      add(createText('HOUSE RULES', 12, state.bodyFont, state.inkColor, { left: rightColX + fs(30), top: ry + fs(2), width: colW - fs(30), fontWeight: 'bold', charSpacing: 50, selectable: false }));
      add(new fabric.Line([rightColX + fs(30), ry + fs(20), rightColX + colW, ry + fs(20)], { stroke: state.accentColor, strokeWidth: fs(1), opacity: 0.5, selectable: false }));
      ry += fs(30);

      state.rulesText.split('\n').filter(r => r.trim()).forEach(rule => {
        add(createText('•', 12, 'sans-serif', state.accentColor, { left: rightColX + fs(25), top: ry, width: fs(15), textAlign: 'center', selectable: false }));
        const rObj = createText(rule, 10, state.bodyFont, state.inkColor, { left: rightColX + fs(40), top: ry, width: colW - fs(40), data: { edType: 'text', stateKey: 'rulesText' } });
        add(rObj);
        ry += (rObj.height || fs(15)) + fs(8);
      });

    } else {
      // PORTRAIT: Header Top, 2 Columns Below
      let cy = ch * 0.12;
      const title = createText(state.titleText, 55, state.headerFont, state.inkColor, { left: cw/2, top: cy, originX: 'center', textAlign: 'center', width: cw*0.8, data: { edType: 'header', stateKey: 'titleText' } });
      add(title);
      cy += (title.height||0) + fs(10);

      const sub = createText(state.subtitleText.toUpperCase(), 11, state.bodyFont, state.inkColor, { left: cw/2, top: cy, originX: 'center', textAlign: 'center', width: cw*0.8, charSpacing: 100, fontWeight: 'bold', data: { edType: 'header', stateKey: 'subtitleText' } });
      add(sub);
      cy += (sub.height||0) + fs(30);

      add(new fabric.Line([cw * 0.2, cy, cw * 0.8, cy], { stroke: state.inkColor, strokeWidth: fs(0.5), opacity: 0.3, selectable: false }));
      cy += fs(30);

      const colW = cw * 0.35;
      const leftX = cw * 0.12;
      const rightX = cw * 0.53;

      let leftY = cy;
      const drawBlock = (icon: string, tit: string, l1: string, l2: string, x: number, currentY: number) => {
        let blockY = currentY;
        add(createText(icon, 18, 'sans-serif', state.inkColor, { left: x, top: blockY, width: fs(25), textAlign: 'center', selectable: false }));
        add(createText(tit, 12, state.bodyFont, state.inkColor, { left: x + fs(30), top: blockY + fs(2), width: colW - fs(30), fontWeight: 'bold', charSpacing: 50, selectable: false }));
        add(new fabric.Line([x + fs(30), blockY + fs(20), x + colW, blockY + fs(20)], { stroke: state.accentColor, strokeWidth: fs(1.5), opacity: 0.5, selectable: false }));
        blockY += fs(30);
        if(l1) { const t1 = createText(l1, 10, state.bodyFont, state.inkColor, { left: x + fs(30), top: blockY, width: colW - fs(30) }); add(t1); blockY += (t1.height||0) + fs(5); }
        if(l2) { const t2 = createText(l2, 10, state.bodyFont, state.inkColor, { left: x + fs(30), top: blockY, width: colW - fs(30) }); add(t2); blockY += (t2.height||0) + fs(5); }
        return blockY + fs(15);
      };

      leftY = drawBlock('📶', 'WIFI', `Network: ${state.wifiNetwork}`, `Password: ${state.wifiPass}`, leftX, leftY);
      leftY = drawBlock('📍', 'LOCATION', state.locationText, '', leftX, leftY);
      leftY = drawBlock('📱', 'CONTACT', `Host: ${state.contactHost}`, `Ph: ${state.contactPhone}`, leftX, leftY);
      leftY = drawBlock('🔑', 'CHECK OUT', `Time: ${state.checkoutTime}`, '', leftX, leftY);

      let rightY = cy;
      add(createText('📋', 18, 'sans-serif', state.inkColor, { left: rightX, top: rightY, width: fs(25), textAlign: 'center', selectable: false }));
      add(createText('HOUSE RULES', 12, state.bodyFont, state.inkColor, { left: rightX + fs(30), top: rightY + fs(2), width: colW - fs(30), fontWeight: 'bold', charSpacing: 50, selectable: false }));
      add(new fabric.Line([rightX + fs(30), rightY + fs(20), rightX + colW, rightY + fs(20)], { stroke: state.accentColor, strokeWidth: fs(1.5), opacity: 0.5, selectable: false }));
      rightY += fs(30);

      state.rulesText.split('\n').filter(r => r.trim()).forEach(rule => {
        add(createText('☑', 12, 'sans-serif', state.accentColor, { left: rightX + fs(25), top: rightY, width: fs(20), textAlign: 'center', selectable: false }));
        const rObj = createText(rule, 11, state.bodyFont, state.inkColor, { left: rightX + fs(45), top: rightY, width: colW - fs(45), data: { edType: 'text', stateKey: 'rulesText' } });
        add(rObj);
        rightY += (rObj.height || fs(15)) + fs(10);
      });
      
      const bottomY = ch - fs(70);
      add(new fabric.Line([cw * 0.3, bottomY, cw * 0.7, bottomY], { stroke: state.inkColor, strokeWidth: fs(0.5), opacity: 0.3, selectable: false }));
      add(createText('★★★★★', 16, 'sans-serif', state.inkColor, { left: cw/2, top: bottomY + fs(10), originX: 'center', width: cw, textAlign: 'center', selectable: false }));
      add(createText('If you enjoyed your stay, please leave us a review!\nWe\'d love to hear from you.', 9, state.bodyFont, state.inkColor, { left: cw/2, top: bottomY + fs(35), originX: 'center', width: cw*0.6, textAlign: 'center', fontStyle: 'italic', selectable: false }));
    }
  }

  // ============================================================================
  // 2. BRUTALIST BLOCK (Urban Loft / Tropical Block Style)
  // ============================================================================
  else if (style === 'brutalist-block') {
    if (isLand) {
      // LANDSCAPE: 3 Bold Vertical Panels
      const panelW = cw / 3;
      add(new fabric.Rect({ left: 0, top: 0, width: panelW, height: ch, fill: state.inkColor, selectable: false }));
      add(new fabric.Line({ x1: panelW*2, y1: 0, x2: panelW*2, y2: ch, stroke: state.inkColor, strokeWidth: fs(4), selectable: false }));

      // Panel 1: Header (Inverted)
      const title = createText(state.titleText.toUpperCase(), 60, state.headerFont, state.bgColor, { left: panelW/2, top: ch*0.2, originX: 'center', width: panelW*0.8, textAlign: 'center', data: { edType: 'header', stateKey: 'titleText' } });
      add(title);
      add(createText(state.subtitleText.toUpperCase(), 14, state.bodyFont, state.accentColor, { left: panelW/2, top: title.top! + (title.height||0) + fs(20), originX: 'center', width: panelW*0.8, textAlign: 'center', fontWeight: 'bold', data: { edType: 'header', stateKey: 'subtitleText' } }));

      // Panel 2: Info
      let p2y = ch*0.15;
      const drawInfo = (label: string, val: string) => {
        add(createText(label, 10, state.bodyFont, state.accentColor, { left: panelW + fs(30), top: p2y, width: panelW - fs(60), fontWeight: 'bold', charSpacing: 100, selectable: false }));
        p2y += fs(15);
        const v = createText(val, 14, state.bodyFont, state.inkColor, { left: panelW + fs(30), top: p2y, width: panelW - fs(60) });
        add(v);
        p2y += (v.height||0) + fs(25);
        add(new fabric.Line([panelW + fs(30), p2y - fs(10), panelW*2 - fs(30), p2y - fs(10)], { stroke: state.inkColor, strokeWidth: fs(2), selectable: false }));
      };
      drawInfo('WIFI', `${state.wifiNetwork}\nPASS: ${state.wifiPass}`);
      drawInfo('LOCATION', state.locationText);
      drawInfo('CONTACT', `${state.contactHost} | ${state.contactPhone}`);
      drawInfo('CHECK-OUT', state.checkoutTime);

      // Panel 3: Rules
      add(new fabric.Rect({ left: panelW*2 + fs(30), top: ch*0.15, width: panelW - fs(60), height: fs(40), fill: state.inkColor, selectable: false }));
      add(createText('HOUSE RULES', 16, state.headerFont, state.bgColor, { left: panelW*2.5, top: ch*0.15 + fs(10), originX: 'center', width: panelW - fs(60), textAlign: 'center', charSpacing: 50, selectable: false }));
      
      let ry = ch*0.15 + fs(60);
      state.rulesText.split('\n').filter(r => r.trim()).forEach(rule => {
        add(createText('>', 14, state.headerFont, state.accentColor, { left: panelW*2 + fs(30), top: ry, width: fs(20), selectable: false }));
        const rObj = createText(rule.toUpperCase(), 12, state.bodyFont, state.inkColor, { left: panelW*2 + fs(50), top: ry, width: panelW - fs(80), data: { edType: 'text', stateKey: 'rulesText' } });
        add(rObj);
        ry += (rObj.height || fs(15)) + fs(15);
      });

    } else {
      // PORTRAIT: Heavy stacked blocks
      add(new fabric.Rect({ left: cw*0.05, top: ch*0.05, width: cw*0.9, height: fs(120), fill: state.inkColor, selectable: false }));
      const title = createText(state.titleText.toUpperCase(), 50, state.headerFont, state.bgColor, { left: cw/2, top: ch*0.05 + fs(20), originX: 'center', width: cw*0.8, textAlign: 'center', data: { edType: 'header', stateKey: 'titleText' } });
      add(title);
      add(createText(state.subtitleText.toUpperCase(), 12, state.bodyFont, state.accentColor, { left: cw/2, top: ch*0.05 + fs(80), originX: 'center', width: cw*0.8, textAlign: 'center', charSpacing: 100, fontWeight: 'bold' }));

      // Info row
      let cy = ch*0.05 + fs(140);
      const iw = cw*0.42;
      const drawBox = (x: number, y: number, label: string, val: string) => {
        add(new fabric.Rect({ left: x, top: y, width: iw, height: fs(80), fill: 'transparent', stroke: state.inkColor, strokeWidth: fs(3), selectable: false }));
        add(createText(label, 10, state.bodyFont, state.bgColor, { left: x, top: y, width: iw, height: fs(25), fill: state.inkColor, textAlign: 'center', fontWeight: 'bold' }));
        add(new fabric.Rect({ left: x, top: y, width: iw, height: fs(25), fill: state.inkColor, selectable: false }));
        add(createText(label, 10, state.bodyFont, state.bgColor, { left: x, top: y + fs(6), width: iw, textAlign: 'center', fontWeight: 'bold', charSpacing: 50, selectable: false }));
        add(createText(val, 12, state.bodyFont, state.inkColor, { left: x + fs(10), top: y + fs(35), width: iw - fs(20), textAlign: 'center' }));
      };

      drawBox(cw*0.05, cy, 'WIFI', `${state.wifiNetwork}\nPW: ${state.wifiPass}`);
      drawBox(cw*0.53, cy, 'CHECK-OUT', `TIME: ${state.checkoutTime}`);
      cy += fs(100);
      
      drawBox(cw*0.05, cy, 'LOCATION', state.locationText);
      drawBox(cw*0.53, cy, 'CONTACT', `${state.contactHost}\n${state.contactPhone}`);
      cy += fs(100);

      // Rules Block
      add(new fabric.Rect({ left: cw*0.05, top: cy, width: cw*0.9, height: fs(35), fill: state.inkColor, selectable: false }));
      add(createText('HOUSE RULES', 16, state.headerFont, state.bgColor, { left: cw/2, top: cy + fs(8), originX: 'center', width: cw*0.8, textAlign: 'center', charSpacing: 100, selectable: false }));
      cy += fs(55);

      state.rulesText.split('\n').filter(r => r.trim()).forEach(rule => {
        add(createText('■', 12, 'sans-serif', state.accentColor, { left: cw*0.08, top: cy, width: fs(20), selectable: false }));
        const rObj = createText(rule.toUpperCase(), 12, state.bodyFont, state.inkColor, { left: cw*0.15, top: cy, width: cw*0.8, fontWeight: 'bold', data: { edType: 'text', stateKey: 'rulesText' } });
        add(rObj);
        cy += (rObj.height || fs(15)) + fs(15);
      });
    }
  }

  // ============================================================================
  // 3. MODERN MINIMAL (City Center / Luxury Villa Style)
  // ============================================================================
  else {
    if (isLand) {
      // LANDSCAPE: Left Heavy Asymmetrical
      const title = createText(state.titleText, 70, state.headerFont, state.inkColor, { left: cw*0.05, top: ch*0.55, width: cw*0.4, textAlign: 'left', lineHeight: 1.1, charSpacing: -20, data: { edType: 'header', stateKey: 'titleText' } });
      add(title);
      add(createText(state.subtitleText, 10, state.bodyFont, state.accentColor, { left: cw*0.05, top: title.top! - fs(20), width: cw*0.4, charSpacing: 200, fontWeight: 'bold' }));

      add(new fabric.Line([cw*0.5, ch*0.1, cw*0.5, ch*0.9], { stroke: state.inkColor, strokeWidth: fs(1), opacity: 0.2, selectable: false }));

      let ry = ch*0.1;
      const rx = cw*0.55;
      const rw = cw*0.4;

      add(createText('WIFI & INFO', 10, state.bodyFont, state.accentColor, { left: rx, top: ry, width: rw, fontWeight: 'bold', charSpacing: 100, selectable: false }));
      ry += fs(25);
      const infoT = createText(`Net: ${state.wifiNetwork}  |  Pass: ${state.wifiPass}\nCheck-out: ${state.checkoutTime}\nHost: ${state.contactHost} (${state.contactPhone})`, 12, state.bodyFont, state.inkColor, { left: rx, top: ry, width: rw, lineHeight: 1.6 });
      add(infoT);
      ry += (infoT.height||0) + fs(40);

      add(createText('GUIDELINES', 10, state.bodyFont, state.accentColor, { left: rx, top: ry, width: rw, fontWeight: 'bold', charSpacing: 100, selectable: false }));
      ry += fs(25);
      const rObj = createText(state.rulesText, 14, state.bodyFont, state.inkColor, { left: rx, top: ry, width: rw, lineHeight: 1.8, data: { edType: 'text', stateKey: 'rulesText' } });
      add(rObj);

    } else {
      // PORTRAIT: Minimal bottom-heavy
      add(createText(state.subtitleText, 10, state.bodyFont, state.accentColor, { left: cw*0.08, top: ch*0.08, width: cw*0.84, charSpacing: 200, fontWeight: 'bold' }));
      const title = createText(state.titleText, 60, state.headerFont, state.inkColor, { left: cw*0.08, top: ch*0.08 + fs(20), width: cw*0.84, textAlign: 'left', lineHeight: 1.1, charSpacing: -20, data: { edType: 'header', stateKey: 'titleText' } });
      add(title);

      let cy = ch*0.4;
      const labelX = cw*0.08;
      const valX = cw*0.35;
      const valW = cw*0.57;

      const drawRow = (lbl: string, val: string) => {
        add(new fabric.Line([labelX, cy, cw*0.92, cy], { stroke: state.inkColor, strokeWidth: fs(0.5), opacity: 0.2, selectable: false }));
        cy += fs(15);
        add(createText(lbl, 10, state.bodyFont, state.accentColor, { left: labelX, top: cy, width: valX - labelX, fontWeight: 'bold', charSpacing: 100, selectable: false }));
        const v = createText(val, 12, state.bodyFont, state.inkColor, { left: valX, top: cy, width: valW, lineHeight: 1.5 });
        add(v);
        cy += (v.height||0) + fs(25);
      };

      drawRow('WIFI', `Network: ${state.wifiNetwork}\nPassword: ${state.wifiPass}`);
      drawRow('LOCATION', state.locationText);
      drawRow('CONTACT', `${state.contactHost}\n${state.contactPhone}`);
      drawRow('CHECK-OUT', state.checkoutTime);
      
      add(new fabric.Line([labelX, cy, cw*0.92, cy], { stroke: state.inkColor, strokeWidth: fs(0.5), opacity: 0.2, selectable: false }));
      cy += fs(15);
      add(createText('RULES', 10, state.bodyFont, state.accentColor, { left: labelX, top: cy, width: valX - labelX, fontWeight: 'bold', charSpacing: 100, selectable: false }));
      const rObj = createText(state.rulesText, 12, state.bodyFont, state.inkColor, { left: valX, top: cy, width: valW, lineHeight: 1.8, data: { edType: 'text', stateKey: 'rulesText' } });
      add(rObj);
    }
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
            {['Playfair Display', 'Caveat', 'Lora', 'Anton', 'Vollkorn', 'Josefin Sans', 'Inter', 'Merriweather', 'Dancing Script', 'Oswald', 'Nunito', 'Courier Prime', 'Cinzel', 'Creepster'].map((f) => <option key={f} value={f}>{f}</option>)}
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
