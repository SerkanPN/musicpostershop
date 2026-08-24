import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const DEFAULT_PRESETS: Record<string, any> = {
  marathon: { storeName: "BERLIN MARATHON", receiptNum: "REF: 42195", date: "SEP 24, 2023", items: [{ name: "DISTANCE", price: "42.195 KM" }, { name: "NET TIME", price: "03:45:12" }, { name: "PACE", price: "05:20/KM" }, { name: "OVERALL RANK", price: "14582" }], totalLabel: "STATUS", totalValue: "FINISHER", barcodeText: "NEVER GIVE UP" },
  cafe: { storeName: "THE BREW ROASTERS", receiptNum: "ORDER #042", date: "TODAY", items: [{ name: "ESPRESSO", price: "$3.50" }, { name: "CORTADO", price: "$4.00" }, { name: "POUR OVER", price: "$6.00" }, { name: "CROISSANT", price: "$4.50" }], totalLabel: "TOTAL", totalValue: "$18.00", barcodeText: "CRAFT COFFEE & GOOD VIBES" },
  anniversary: { storeName: "5 YEARS TOGETHER", receiptNum: "REF: FOREVER", date: "MAY 14, 2024", items: [{ name: "LAUGHS SHARED", price: "COUNTLESS" }, { name: "COFFEES DRUNK", price: "1,452" }, { name: "MOVIE NIGHTS", price: "340" }, { name: "ARGUMENTS WON", price: "0" }], totalLabel: "TOTAL LOVE", totalValue: "100%", barcodeText: "HAPPY ANNIVERSARY" },
  first_date: { storeName: "WHERE IT BEGAN", receiptNum: "TABLE 4", date: "AUG 24, 2019", items: [{ name: "NERVOUS SMILES", price: "LOTS" }, { name: "AWKWARD SILENCE", price: "2 MINS" }, { name: "LATTE MACCHIATO", price: "2" }, { name: "FIRST KISS", price: "PRICELESS" }], totalLabel: "STATUS", totalValue: "MATCHED", barcodeText: "BEST DAY EVER" },
  long_distance: { storeName: "DISTANCE MEANS NOTHING", receiptNum: "LHR -> JFK", date: "2023-2024", items: [{ name: "KILOMETERS", price: "5,540" }, { name: "FLIGHTS TAKEN", price: "12" }, { name: "FACETIME HOURS", price: "840" }, { name: "TEARS SHED", price: "TOO MANY" }], totalLabel: "CONNECTION", totalValue: "STRONG", barcodeText: "SEE YOU SOON" },
  graduation: { storeName: "CLASS OF 2024", receiptNum: "ALUMNI", date: "JUN 15, 2024", items: [{ name: "ALL NIGHTERS", price: "54" }, { name: "ENERGY DRINKS", price: "320" }, { name: "LATE ASSIGNMENTS", price: "3" }, { name: "FINAL GPA", price: "3.8" }], totalLabel: "STATUS", totalValue: "GRADUATED", barcodeText: "HIRE ME PLEASE" },
  new_home: { storeName: "HOME SWEET HOME", receiptNum: "APT 4B", date: "OCT 1, 2024", items: [{ name: "KEYS RECEIVED", price: "2" }, { name: "BOXES MOVED", price: "45" }, { name: "PAINT CANS", price: "6" }, { name: "PIZZA ORDERS", price: "3" }], totalLabel: "MORTGAGE", totalValue: "PAID", barcodeText: "NEW BEGINNINGS" },
  gym: { storeName: "BEAST MODE", receiptNum: "PHASE 1", date: "2023-2024", items: [{ name: "STARTING WEIGHT", price: "95 KG" }, { name: "CURRENT WEIGHT", price: "75 KG" }, { name: "CHICKEN & RICE", price: "ALWAYS" }, { name: "SWEAT SHED", price: "GALLONS" }], totalLabel: "TRANSFORMATION", totalValue: "COMPLETE", barcodeText: "NEVER SKIP LEG DAY" },
  champions: { storeName: "CHAMPIONS 2024", receiptNum: "FINALS", date: "MAY 2024", items: [{ name: "GAMES PLAYED", price: "38" }, { name: "WINS", price: "30" }, { name: "GOALS SCORED", price: "84" }, { name: "CLEAN SHEETS", price: "15" }], totalLabel: "TROPHY", totalValue: "SECURED", barcodeText: "WE ARE THE CHAMPIONS" },
  dog_rules: { storeName: "HOUSE RULES", receiptNum: "CHARLIE", date: "EST. 2020", items: [{ name: "BARK AT MAILMAN", price: "DAILY" }, { name: "DROPPED FOOD", price: "MINE" }, { name: "BELLY RUBS", price: "REQUIRED" }, { name: "PERSONAL SPACE", price: "NONE" }], totalLabel: "GOOD BOY", totalValue: "100%", barcodeText: "WOOF WOOF" },
  gaming: { storeName: "GG WP", receiptNum: "RANKED", date: "SEASON 14", items: [{ name: "KILLS", price: "24" }, { name: "DEATHS", price: "2" }, { name: "ASSISTS", price: "15" }, { name: "MATCH LENGTH", price: "45:12" }], totalLabel: "RANK", totalValue: "DIAMOND", barcodeText: "EZ GAME" },
  travel: { storeName: "WORLD TRAVELER", receiptNum: "PASSPORT", date: "2020-2024", items: [{ name: "COUNTRIES VISITED", price: "15" }, { name: "FLIGHTS", price: "34" }, { name: "HOSTELS", price: "12" }, { name: "NEW FRIENDS", price: "COUNTLESS" }], totalLabel: "ADVENTURE", totalValue: "CONTINUES", barcodeText: "WANDERLUST" },
  car: { storeName: "BUILT NOT BOUGHT", receiptNum: "GARAGE", date: "PROJECT 1", items: [{ name: "HORSEPOWER", price: "450 HP" }, { name: "TURBO KIT", price: "INSTALLED" }, { name: "EXHAUST", price: "CUSTOM" }, { name: "MONEY SPENT", price: "TOO MUCH" }], totalLabel: "STATUS", totalValue: "TUNED", barcodeText: "RACE CAR" },
  tracklist: { storeName: "NOW SPINNING", receiptNum: "VINYL", date: "1973", items: [{ name: "SPEAK TO ME", price: "1:13" }, { name: "BREATHE", price: "2:43" }, { name: "TIME", price: "7:01" }, { name: "MONEY", price: "6:22" }], totalLabel: "ALBUM", totalValue: "CLASSIC", barcodeText: "DARK SIDE OF THE MOON" },
  roommate: { storeName: "SURVIVAL GUIDE", receiptNum: "APT 4B", date: "RULEBOOK", items: [{ name: "TRASH DUTY", price: "ROTATE" }, { name: "DISHES", price: "24HR MAX" }, { name: "WIFI PW", price: "NEVERTELL" }, { name: "RENT DUE", price: "1ST OF MO" }], totalLabel: "STATUS", totalValue: "ROOMMATES", barcodeText: "RESPECT THE SPACE" }
};

export default function ReceiptEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetKey = searchParams.get('preset') || 'marathon';
  const initialData = DEFAULT_PRESETS[presetKey] || DEFAULT_PRESETS.marathon;

  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  const [storeName, setStoreName] = useState(initialData.storeName);
  const [receiptNum, setReceiptNum] = useState(initialData.receiptNum);
  const [date, setDate] = useState(initialData.date);
  const [items, setItems] = useState(initialData.items);
  const [totalLabel, setTotalLabel] = useState(initialData.totalLabel);
  const [totalValue, setTotalValue] = useState(initialData.totalValue);
  const [barcodeText, setBarcodeText] = useState(initialData.barcodeText);
  const [bgColor, setBgColor] = useState('#f8f9fa');
  const [textColor, setTextColor] = useState('#1a1a1a');

  // Load custom fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&family=Libre+Barcode+39+Text&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const renderCanvas = () => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    canvas.clear();

    const w = 400;
    const h = 600;
    
    // Background
    const bg = new fabric.Rect({
      left: 0, top: 0, width: w, height: h, fill: bgColor, selectable: false
    });
    canvas.add(bg);

    const fontSettings = {
      fontFamily: 'Space Mono, monospace',
      fill: textColor,
      selectable: true,
      originX: 'center',
    };

    let yOffset = 60;

    // Store Name
    const storeText = new fabric.Textbox(storeName, {
      ...fontSettings,
      left: w / 2, top: yOffset,
      fontSize: 24, fontWeight: 700,
      width: w - 80, textAlign: 'center'
    });
    canvas.add(storeText);
    yOffset += storeText.height + 20;

    // Header info
    const infoText = new fabric.Textbox(`${receiptNum}\n${date}`, {
      ...fontSettings,
      left: w / 2, top: yOffset,
      fontSize: 12,
      width: w - 80, textAlign: 'center'
    });
    canvas.add(infoText);
    yOffset += infoText.height + 20;

    // Dashed line
    const dashLine1 = new fabric.Line([40, yOffset, w - 40, yOffset], {
      stroke: textColor, strokeWidth: 1, strokeDashArray: [4, 4], selectable: false
    });
    canvas.add(dashLine1);
    yOffset += 20;

    // Items
    items.forEach((item: any) => {
      const name = new fabric.Textbox(item.name, {
        ...fontSettings, originX: 'left',
        left: 40, top: yOffset, fontSize: 12, width: 200
      });
      const price = new fabric.Textbox(item.price, {
        ...fontSettings, originX: 'right', textAlign: 'right',
        left: w - 40, top: yOffset, fontSize: 12, width: 100
      });
      canvas.add(name, price);
      yOffset += Math.max(name.height, price.height) + 10;
    });

    // Dashed line
    yOffset += 10;
    const dashLine2 = new fabric.Line([40, yOffset, w - 40, yOffset], {
      stroke: textColor, strokeWidth: 1, strokeDashArray: [4, 4], selectable: false
    });
    canvas.add(dashLine2);
    yOffset += 20;

    // Total
    const tLabel = new fabric.Textbox(totalLabel, {
      ...fontSettings, originX: 'left',
      left: 40, top: yOffset, fontSize: 16, fontWeight: 700, width: 150
    });
    const tValue = new fabric.Textbox(totalValue, {
      ...fontSettings, originX: 'right', textAlign: 'right',
      left: w - 40, top: yOffset, fontSize: 16, fontWeight: 700, width: 150
    });
    canvas.add(tLabel, tValue);
    yOffset += Math.max(tLabel.height, tValue.height) + 30;

    // Barcode
    const barcode = new fabric.Textbox(barcodeText.toUpperCase(), {
      fontFamily: 'Libre Barcode 39 Text, cursive',
      fill: textColor, selectable: true,
      left: w / 2, top: yOffset, originX: 'center',
      fontSize: 48, width: w - 80, textAlign: 'center'
    });
    canvas.add(barcode);

    canvas.renderAll();
  };

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    const canvasEl = document.createElement('canvas');
    canvasEl.width = 400;
    canvasEl.height = 600;
    containerRef.current.appendChild(canvasEl);

    fabricRef.current = new fabric.Canvas(canvasEl, {
      width: 400, height: 600, backgroundColor: '#f0f0f0'
    });
    renderCanvas();
    setTimeout(renderCanvas, 500); // Wait for fonts to load
    return () => { fabricRef.current?.dispose(); };
  }, []);

  useEffect(() => {
    renderCanvas();
  }, [storeName, receiptNum, date, items, totalLabel, totalValue, barcodeText, bgColor, textColor]);

  const handleDownload = () => {
    if (!fabricRef.current) return;
    const dataUrl = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'receipt-poster.png';
    a.click();
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white">
      {/* Editor Panel */}
      <div className="w-80 bg-neutral-900 border-r border-neutral-800 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">Receipt Editor</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Store / Main Title</label>
            <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-white outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Receipt Ref</label>
            <input type="text" value={receiptNum} onChange={e => setReceiptNum(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-white outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Date</label>
            <input type="text" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-white outline-none" />
          </div>

          <div className="pt-4 border-t border-neutral-800">
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Items</label>
            {items.map((item: any, i: number) => (
              <div key={i} className="flex gap-2 mb-2">
                <input type="text" value={item.name} onChange={e => {
                  const newItems = [...items]; newItems[i].name = e.target.value; setItems(newItems);
                }} className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-white outline-none" />
                <input type="text" value={item.price} onChange={e => {
                  const newItems = [...items]; newItems[i].price = e.target.value; setItems(newItems);
                }} className="w-20 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-white outline-none" />
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-neutral-800">
            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Total Label</label>
                <input type="text" value={totalLabel} onChange={e => setTotalLabel(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-white outline-none" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Total Value</label>
                <input type="text" value={totalValue} onChange={e => setTotalValue(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-white outline-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Barcode Message</label>
            <input type="text" value={barcodeText} onChange={e => setBarcodeText(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-white outline-none" />
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-neutral-950 overflow-y-auto">
        <div className="mb-6 flex gap-4 w-full max-w-[400px]">
          <button onClick={() => navigate('/')} className="flex items-center justify-center gap-2 bg-neutral-800 text-white font-semibold py-3 px-6 rounded-xl hover:bg-neutral-700 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <button onClick={handleDownload} className="flex-1 bg-white text-black font-semibold py-3 rounded-xl hover:bg-neutral-200 transition-colors">
            Download PNG
          </button>
        </div>
        <div ref={containerRef} className="shadow-2xl rounded-sm overflow-hidden flex-shrink-0" style={{ width: 400, height: 600 }} />
      </div>
    </div>
  );
}
