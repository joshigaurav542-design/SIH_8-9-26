import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, ShieldAlert, Sparkles, Scale, Info } from 'lucide-react';

const SKILL_RATES = {
  'Apprentice': { rate: 90, label: 'Apprentice (प्रशिक्षु - ₹90/hr)' },
  'Skilled': { rate: 135, label: 'Skilled Artisan (कुशल - ₹135/hr)' },
  'Master Artisan': { rate: 200, label: 'Master Artisan (उस्ताद - ₹200/hr)' }
};

export default function PricingCalculator({ initialCost = 160, initialHours = 9, onPriceCalculated }) {
  const [rawCost, setRawCost] = useState(initialCost);
  const [laborHours, setLaborHours] = useState(initialHours);
  const [skillLevel, setSkillLevel] = useState('Master Artisan');
  const [marginPercent, setMarginPercent] = useState(20);

  // Sync when initial values change from voice/scan
  useEffect(() => {
    if (initialCost) setRawCost(initialCost);
    if (initialHours) setLaborHours(initialHours);
  }, [initialCost, initialHours]);

  const hourlyRate = SKILL_RATES[skillLevel].rate;
  const complexityFactor = 1.25;
  const totalLaborCost = Math.round(laborHours * hourlyRate * complexityFactor);
  const baseCost = rawCost + totalLaborCost;
  const artisanProfit = Math.round(baseCost * (marginPercent / 100));
  const fairMarketPrice = baseCost + artisanProfit;

  // Middleman rate calculation (traditional exploitative trader payout)
  const middlemanArtisanPayout = Math.round(rawCost + (laborHours * 45));
  const middlemanRetailPrice = Math.round(middlemanArtisanPayout * 2.3);
  const artisanExtraGain = Math.round(((fairMarketPrice - middlemanArtisanPayout) / Math.max(middlemanArtisanPayout, 1)) * 100);

  useEffect(() => {
    if (onPriceCalculated) {
      onPriceCalculated({
        rawCost,
        laborHours,
        skillLevel,
        fairMarketPrice,
        totalLaborCost
      });
    }
  }, [rawCost, laborHours, skillLevel, marginPercent]);

  return (
    <div className="glass-panel p-5 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[var(--color-terracotta)] text-white text-xs font-bold flex items-center justify-center">
            3
          </span>
          <h2 className="text-base font-bold text-white font-heading">
            Heritage Pricing Engine (PM Vishwakarma Living Wage)
          </h2>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Zero Middlemen
        </span>
      </div>

      <p className="text-xs text-[var(--text-muted)] mb-5">
        Replaces arbitrary trader exploitation with algorithmic fair wages based on raw materials, craft complexity, and master labor hours.
      </p>

      {/* Main Grid: Controls & Comparison Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Sliders and Selectors */}
        <div className="space-y-4">
          
          {/* Raw Material Cost */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label className="text-gray-300 font-medium">Raw Material Cost (कच्चे माल का खर्च):</label>
              <span className="font-mono text-white font-bold text-sm">₹{rawCost}</span>
            </div>
            <input
              type="range"
              min="50"
              max="2000"
              step="25"
              value={rawCost}
              onChange={(e) => setRawCost(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Labor Hours Invested */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label className="text-gray-300 font-medium">Labor Hours Invested (मेहनत के घंटे):</label>
              <span className="font-mono text-[var(--color-saffron)] font-bold text-sm">{laborHours} hrs</span>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={laborHours}
              onChange={(e) => setLaborHours(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Artisan Skill Level */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Artisan Skill Tier (कारीगर का स्तर):
            </label>
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-black/40 border border-[var(--border-glass)] text-xs text-white outline-none cursor-pointer focus:border-[var(--color-saffron)]"
            >
              {Object.keys(SKILL_RATES).map((tier) => (
                <option key={tier} value={tier} className="bg-[#131B2E]">
                  {SKILL_RATES[tier].label}
                </option>
              ))}
            </select>
          </div>

          {/* Profit Margin */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label className="text-gray-300 font-medium">Artisan Fair Profit Margin (कारीगर लाभ):</label>
              <span className="font-mono text-emerald-400 font-bold text-sm">{marginPercent}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="40"
              step="5"
              value={marginPercent}
              onChange={(e) => setMarginPercent(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

        </div>

        {/* Dynamic Comparison Card (Artisan Direct vs Middleman) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#18233C] to-[#0D1527] border border-[var(--border-active)] flex flex-col justify-between shadow-xl">
          
          <div>
            <div className="flex items-center justify-between text-xs text-gray-300 pb-3 border-b border-[var(--border-glass)]">
              <span className="flex items-center gap-1 text-[var(--color-saffron)] font-semibold">
                <Scale className="w-3.5 h-3.5" /> Fair Trade Living Wage Breakdown
              </span>
              <span className="text-[10px] text-gray-400 font-mono">Algorithm v1.4</span>
            </div>

            <div className="space-y-2 py-3 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Raw Materials:</span>
                <span className="font-mono">₹{rawCost}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Guaranteed Fair Labor ({laborHours} hrs @ ₹{hourlyRate}/hr):</span>
                <span className="font-mono text-[var(--color-saffron)]">₹{totalLaborCost}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Artisan Margin ({marginPercent}%):</span>
                <span className="font-mono text-emerald-400">₹{artisanProfit}</span>
              </div>
            </div>

            {/* Total Highlight */}
            <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/30 flex items-center justify-between mt-1">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-gray-400">Suggested ONDC Listing Price</div>
                <div className="text-2xl font-extrabold text-white font-heading flex items-center">
                  <IndianRupee className="w-5 h-5 text-emerald-400" />
                  <span>{fairMarketPrice}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +{artisanExtraGain}%
                </span>
                <div className="text-[9px] text-gray-400 mt-0.5">Income Increase</div>
              </div>
            </div>
          </div>

          {/* Middleman Comparison Warning */}
          <div className="mt-3 p-2.5 rounded-lg bg-amber-950/25 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Middleman Bypass:</strong> Traders typically pay only ₹{middlemanArtisanPayout} for this piece and sell it in metropolitan stores for ₹{middlemanRetailPrice}. Direct ONDC ensures 100% of the ₹{fairMarketPrice} reaches the artisan.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
