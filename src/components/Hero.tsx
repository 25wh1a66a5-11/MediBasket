import React from 'react';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Package,
  Layers,
  HeartPulse,
  Flame,
  Plane,
  Activity,
  GraduationCap,
  Home,
  CheckCircle2,
} from 'lucide-react';

interface HeroProps {
  onExploreKits: () => void;
  onShopProducts: () => void;
  onBuildMyKit: () => void;
  onSelectCategory: (categoryName: string) => void;
}

export function Hero({
  onExploreKits,
  onShopProducts,
  onBuildMyKit,
  onSelectCategory,
}: HeroProps) {
  const categories = [
    { name: 'First Aid', icon: HeartPulse, color: 'text-rose-600 bg-rose-50 border-rose-100' },
    { name: 'Hygiene', icon: ShieldCheck, color: 'text-teal-600 bg-teal-50 border-teal-100' },
    { name: 'Personal Care', icon: Sparkles, color: 'text-purple-600 bg-purple-50 border-purple-100' },
    { name: 'Emergency Essentials', icon: Flame, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { name: 'Travel Essentials', icon: Plane, color: 'text-sky-600 bg-sky-50 border-sky-100' },
    { name: 'Sports Care', icon: Activity, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { name: 'College Essentials', icon: GraduationCap, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { name: 'Home Essentials', icon: Home, color: 'text-blue-600 bg-blue-50 border-blue-100' },
  ];

  return (
    <div id="hero-section" className="relative bg-gradient-to-b from-teal-50/50 via-white to-slate-50 border-b border-slate-200/80 overflow-hidden">
      {/* Background Subtle Medical Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0d94880a_1px,transparent_1px),linear-gradient(to_bottom,#0d94880a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 relative">
        {/* Compliance Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100/70 border border-teal-200 text-teal-800 text-xs font-semibold mb-6">
          <ShieldCheck className="w-4 h-4 text-teal-700" />
          <span>100% Non-Prescription & Emergency Essentials • No Medical Diagnosis Required</span>
        </div>

        {/* Hero Title and Subtitle */}
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Be Ready for the <span className="text-teal-600 underline decoration-teal-300 decoration-wavy decoration-2">Unexpected.</span>
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl font-normal">
            Shop essential healthcare, hygiene and emergency-preparedness products in one place.
            Get smart pre-built kits designed for your situation or build your customized kit with dynamic bundle savings.
          </p>

          {/* Call to Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <button
              id="hero-explore-kits-btn"
              onClick={onExploreKits}
              className="px-6 py-3.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 active:scale-95 transition-all shadow-md shadow-teal-600/20 flex items-center gap-2 cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>Explore Kits</span>
            </button>

            <button
              id="hero-shop-products-btn"
              onClick={onShopProducts}
              className="px-6 py-3.5 rounded-xl bg-white text-slate-800 border border-slate-300 font-semibold text-sm hover:bg-slate-50 hover:border-slate-400 active:scale-95 transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>Shop Products</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              id="hero-build-kit-btn"
              onClick={onBuildMyKit}
              className="px-6 py-3.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 active:scale-95 transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Build My Kit</span>
            </button>
          </div>

          {/* Trust bullet points */}
          <div className="mt-8 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Pre-Built Situation Bundles</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Dynamic Bundle Savings</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Sterile Verified Packaging</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Instant 1-Click Reorder</span>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mt-14 pt-10 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Explore Healthcare Essentials by Category
              </h2>
            </div>
            <button
              onClick={onShopProducts}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline"
            >
              View All Products &rarr;
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  id={`cat-card-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onSelectCategory(cat.name)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-slate-200/90 hover:border-teal-400 hover:shadow-sm transition-all group text-center cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 border ${cat.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-slate-800 group-hover:text-teal-700 leading-tight">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
