import React, { useState } from 'react';
import {
  GraduationCap,
  Plane,
  Activity,
  Home,
  Briefcase,
  CloudRain,
  Building,
  Compass,
  Check,
  Sparkles,
  ShoppingBag,
  Sliders,
  ArrowRight,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { Kit, Product } from '../types.js';
import { useCart } from '../context/CartContext.js';

interface SituationKitsProps {
  kits: Kit[];
  allProducts: Product[];
  selectedSituation: string;
  onSelectSituation: (situation: string) => void;
  onCustomizeKit: (kit: Kit) => void;
}

export function SituationKits({
  kits,
  allProducts,
  selectedSituation,
  onSelectSituation,
  onCustomizeKit,
}: SituationKitsProps) {
  const { addToCart } = useCart();

  const situations = [
    { id: 'College', label: 'College', icon: GraduationCap, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { id: 'Travel', label: 'Travel', icon: Plane, color: 'text-sky-600 bg-sky-50 border-sky-200' },
    { id: 'Sports', label: 'Sports', icon: Activity, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { id: 'Home', label: 'Home', icon: Home, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { id: 'Office', label: 'Office', icon: Briefcase, color: 'text-slate-600 bg-slate-100 border-slate-300' },
    { id: 'Monsoon', label: 'Monsoon', icon: CloudRain, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
    { id: 'Hostel', label: 'Hostel', icon: Building, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { id: 'Outdoor Activities', label: 'Outdoor', icon: Compass, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  ];

  // Filter kits according to selected situation, or show all if "All"
  const currentKits = selectedSituation === 'All'
    ? kits
    : kits.filter(k => k.situation.toLowerCase() === selectedSituation.toLowerCase());

  // Helper to resolve product names in a kit
  const getKitProductNames = (kit: Kit) => {
    return kit.items.map(item => {
      const prod = allProducts.find(p => p.id === item.productId);
      return prod ? prod.name : 'Essential Product';
    });
  };

  return (
    <section id="situation-kits-section" className="py-14 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                Smart Curated Solutions
              </span>
              <span className="text-xs text-slate-500 font-medium">Ready in 1-Click</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Choose Your Situation
            </h2>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              Don't waste time searching for individual items. Select your situation to receive a complete,
              doctor-verified collection of non-prescription emergency essentials with built-in bundle savings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Filter:</span>
            <button
              onClick={() => onSelectSituation('All')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedSituation === 'All'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Situations
            </button>
          </div>
        </div>

        {/* Situation Cards Grid (The 8 requested cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 mb-10">
          {situations.map(sit => {
            const Icon = sit.icon;
            const isSelected = selectedSituation.toLowerCase() === sit.id.toLowerCase();
            return (
              <button
                key={sit.id}
                id={`situation-btn-${sit.id.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onSelectSituation(sit.id)}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all text-center cursor-pointer ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50/80 shadow-md ring-2 ring-teal-500/20 scale-102'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 border ${sit.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-semibold ${isSelected ? 'text-teal-900' : 'text-slate-800'}`}>
                  {sit.label}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {kits.filter(k => k.situation.toLowerCase() === sit.id.toLowerCase()).length} Kit
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Situation Header & Kit Cards */}
        {currentKits.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-600 font-medium">No kit available for this situation currently.</p>
            <button
              onClick={() => onSelectSituation('All')}
              className="mt-3 text-xs text-teal-600 font-semibold hover:underline"
            >
              Show all situation kits &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentKits.map(kit => {
              const productNames = getKitProductNames(kit);
              return (
                <div
                  key={kit.id}
                  id={`situation-kit-card-${kit.id}`}
                  className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col group"
                >
                  {/* Kit Image Banner */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={kit.image}
                      alt={kit.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
                        {kit.situation} Kit
                      </span>
                      {kit.isPopular && (
                        <span className="bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Popular
                        </span>
                      )}
                    </div>
                    {/* Bundle Savings Badge */}
                    <div className="absolute bottom-3 right-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md">
                      Save ₹{kit.savings}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 group-hover:text-teal-700 transition-colors">
                        {kit.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {kit.description}
                      </p>

                      {/* Items checklist */}
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                          Contains {kit.items.length} Essential Products:
                        </div>
                        <ul className="space-y-1.5">
                          {productNames.slice(0, 4).map((name, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                              <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                              <span className="truncate">{name}</span>
                            </li>
                          ))}
                          {productNames.length > 4 && (
                            <li className="text-[11px] text-teal-700 font-semibold pl-5">
                              + {productNames.length - 4} more sterile supplies
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Price & Action Row */}
                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <div className="flex items-baseline justify-between mb-3">
                        <div>
                          <span className="text-xs text-slate-400 line-through mr-2">
                            ₹{kit.normalPrice}
                          </span>
                          <span className="text-2xl font-black text-slate-900">
                            ₹{kit.bundlePrice}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          Bundle Savings: ₹{kit.savings}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Customize button (Core Competition Requirement) */}
                        <button
                          id={`customize-kit-btn-${kit.id}`}
                          onClick={() => onCustomizeKit(kit)}
                          className="px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5 text-teal-600" />
                          <span>Customize Kit</span>
                        </button>

                        {/* Direct Add to Cart */}
                        <button
                          id={`add-kit-cart-btn-${kit.id}`}
                          onClick={() => addToCart({ kitId: kit.id, quantity: 1 })}
                          className="px-3 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-all shadow-xs shadow-teal-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
