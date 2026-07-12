import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Lock, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ClaimOrder() {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // SKU kodunu okuyup hangi editörün açılacağını bulan sistem
  const resolveDesignRouteFromSKU = (sku: string | null) => {
    if (!sku) return 'soundwave'; // Default fallback
    
    const skuUpper = sku.toUpperCase();
    if (skuUpper.includes('RECEIPT')) return 'receipt';
    if (skuUpper.includes('TYPOGRAPHY')) return 'typography';
    if (skuUpper.includes('COORD') || skuUpper.includes('MAP')) return 'coordinates';
    if (skuUpper.includes('STAR')) return 'starmap';
    if (skuUpper.includes('CASSETTE')) return 'cassette';
    if (skuUpper.includes('TYPEWRITER')) return 'typewriter';
    if (skuUpper.includes('POLAROID')) return 'polaroid';
    if (skuUpper.includes('PATENT') || skuUpper.includes('BLUEPRINT')) return 'patent';
    if (skuUpper.includes('PANTONE') || skuUpper.includes('COLOR')) return 'pantone';
    if (skuUpper.includes('NEWS')) return 'newspaper';
    if (skuUpper.includes('HEART')) return 'heart';
    if (skuUpper.includes('AIRBNB') || skuUpper.includes('WELCOME')) return 'airbnb';
    if (skuUpper.includes('TODDLER') || skuUpper.includes('BABY')) return 'toddler';
    
    return 'soundwave'; // Default
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError('');

    // Demo girişi kontrolü (Doğrudan Soundwave demosuna atar)
    if (orderId.trim().toUpperCase() === 'DEMO123') {
      setTimeout(() => {
        navigate('/design/soundwave/demo-token');
      }, 1000);
      return;
    }

    try {
      // Veritabanından order_id ile siparişi çek
      const { data, error: dbError } = await supabase
        .from('etsy_orders')
        .select('*')
        .eq('order_id', orderId.trim())
        .single();

      if (dbError || !data) {
        setError("We couldn't find this Order ID. Please check your Etsy receipt.");
        setLoading(false);
        return;
      }

      if (data.status === 'completed') {
        setError("This design has already been downloaded and locked. Please contact support on Etsy.");
        setLoading(false);
        return;
      }

      // Supabase'den gelen SKU koduna göre rotayı belirle ve ID (token) ile birlikte yönlendir
      const designRoute = resolveDesignRouteFromSKU(data.sku);
      navigate(`/design/${designRoute}/${data.id}`);

    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl font-black tracking-tight uppercase text-zinc-100 mb-3">
            Access Your Design
          </h1>
          <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-md mx-auto">
            Enter the Order ID found on your Etsy receipt to unlock your premium digital canvas editor.
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleClaim} className="flex flex-col gap-6">
            <div className="relative">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">
                Etsy Order ID
              </label>
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="e.g. 314567890"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl py-4 pl-12 pr-4 text-zinc-100 font-bold tracking-wider outline-none transition-all placeholder:text-zinc-700"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-start gap-3 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || !orderId.trim()}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all
                ${loading || !orderId.trim() 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                }`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>Verify Order <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-800/50 flex items-center justify-center gap-2 text-zinc-500 text-xs font-medium">
            <Lock className="w-3.5 h-3.5" /> Secure 256-bit Encrypted Connection
          </div>
        </div>
      </div>
    </div>
  );
}
