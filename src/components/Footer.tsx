import React from 'react';
import {
  ShoppingBag,
  ShieldCheck,
  PhoneCall,
  HeartPulse,
  AlertTriangle,
  Award,
  CheckCircle,
} from 'lucide-react';

interface FooterProps {
  onSelectCategory: (category: string) => void;
  onSelectSituation: (situation: string) => void;
  onOpenDemoGuide: () => void;
}

export function Footer({ onSelectCategory, onSelectSituation, onOpenDemoGuide }: FooterProps) {
  return (
    <footer id="main-footer" className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Strict Regulatory & Medical Safety Disclosure (MANDATORY REQUIREMENT) */}
      <div className="bg-slate-950 border-b border-slate-800/80 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1.5 text-slate-400 leading-relaxed">
            <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <span>Important Medical Notice & Regulatory Compliance:</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-400/30">
                NON-PRESCRIPTION ONLY
              </span>
            </div>
            <p>
              MediBasket is an e-commerce platform dedicated strictly to non-prescription healthcare, hygiene, first-aid,
              and emergency preparedness equipment and supplies. <strong>We do NOT sell prescription medicines. We do NOT provide medical diagnosis. We do NOT recommend medicines based on symptoms. We do NOT make clinical medical claims.</strong>
            </p>
            <p className="text-[11px] text-slate-500">
              The purpose of MediBasket is to help households, travelers, students, and businesses prepare ahead with essential supplies before an unforeseen incident occurs. If you or someone around you is experiencing a medical emergency, call your local ambulance or emergency dispatch service immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-xl text-white tracking-tight">MediBasket</span>
                <div className="text-xs text-teal-400 font-semibold tracking-wide">Be Ready. Stay Safe.</div>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Smart situation-based emergency kits and verified healthcare essentials for college students, travelers, families, and organizations.
            </p>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>National Emergency: <strong>112</strong> / Ambulance: <strong>108</strong></span>
              </div>
            </div>

            <button
              onClick={onOpenDemoGuide}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 text-xs font-semibold border border-teal-500/30 transition-colors"
            >
              <Award className="w-4 h-4" />
              <span>Review Competition 15-Step Flow</span>
            </button>
          </div>

          {/* Quick Situations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Situation Kits
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {['College', 'Travel', 'Sports', 'Home', 'Office', 'Monsoon', 'Hostel', 'Outdoor Activities'].map(s => (
                <li key={s}>
                  <button
                    onClick={() => onSelectSituation(s)}
                    className="hover:text-teal-400 transition-colors cursor-pointer text-left"
                  >
                    {s} Emergency Kit
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Essentials Catalog
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {[
                'First Aid',
                'Hygiene',
                'Personal Care',
                'Emergency Essentials',
                'Travel Essentials',
                'Sports Care',
                'Monsoon Essentials',
              ].map(c => (
                <li key={c}>
                  <button
                    onClick={() => onSelectCategory(c)}
                    className="hover:text-teal-400 transition-colors cursor-pointer text-left"
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Standards & Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Safety Guarantees
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>100% Non-Prescription</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Gamma-Sterilized Bandages</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Dynamic Bundle Discounts</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Instant 1-Click Reorder</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Express Dispatch Ready</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-10 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>&copy; {new Date().getFullYear()} MediBasket Inc. "Be Ready. Stay Safe." All rights reserved.</div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Sterile OTC Certified</span>
            <span>•</span>
            <span>Emergency Preparedness</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
