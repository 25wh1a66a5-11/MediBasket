import React from 'react';
import {
  X,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Award,
  Sliders,
  Search,
  ShoppingBag,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

interface CompetitionDemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStepAction: (stepNumber: number) => void;
}

export function CompetitionDemoGuideModal({
  isOpen,
  onClose,
  onStepAction,
}: CompetitionDemoGuideModalProps) {
  if (!isOpen) return null;

  const steps = [
    {
      num: 1,
      title: 'Open App & Hero',
      desc: 'View tagline "Be Ready. Stay Safe." and 8 healthcare categories.',
      actionLabel: 'View Hero',
    },
    {
      num: 2,
      title: 'Browse Pre-Built Kits',
      desc: 'Explore curated situation kits: College, Travel, Sports, Home, etc.',
      actionLabel: 'Browse Kits',
    },
    {
      num: 3,
      title: 'Select Situation: College',
      desc: 'Filter by College to see dorm bandages, antiseptic, thermometer kit.',
      actionLabel: 'Select College',
    },
    {
      num: 4,
      title: 'Customize Emergency Kit',
      desc: 'Add or remove products freely inside the Kit Customizer modal.',
      actionLabel: 'Open Customizer',
    },
    {
      num: 5,
      title: 'Notice Dynamic Bundle Savings',
      desc: 'Watch real-time calculation: Individual Total vs Kit Bundle Price.',
      actionLabel: 'Check Savings',
    },
    {
      num: 6,
      title: 'Add Kit to Cart',
      desc: 'Put the customized kit into the cart with bundle discount preserved.',
      actionLabel: 'Open Cart',
    },
    {
      num: 7,
      title: 'Search Product "Bandage"',
      desc: 'Search for sterile adhesive bandages in the catalog.',
      actionLabel: 'Search "Bandage"',
    },
    {
      num: 8,
      title: 'Filter by Category: "First Aid"',
      desc: 'Filter products catalog by First Aid medical essentials.',
      actionLabel: 'Filter First Aid',
    },
    {
      num: 9,
      title: 'View Product Details & Low Stock Alert',
      desc: 'Notice the red "Only 3 left" badge on items with stock <= 5.',
      actionLabel: 'Inspect Product',
    },
    {
      num: 10,
      title: 'Add Individual Product to Cart',
      desc: 'Add individual item to demonstrate mixed shopping basket.',
      actionLabel: 'Go to Catalog',
    },
    {
      num: 11,
      title: 'Open Cart & Free Delivery Bar',
      desc: 'Check items, bundle discount line item, and free delivery threshold.',
      actionLabel: 'Open Cart Drawer',
    },
    {
      num: 12,
      title: 'Simulated Checkout',
      desc: 'Fill shipping details & choose simulated payment or COD.',
      actionLabel: 'Go to Checkout',
    },
    {
      num: 13,
      title: 'Place Order & Get Order ID',
      desc: 'Order is created with ID #MB-XXXXX and estimated delivery date.',
      actionLabel: 'Review Flow',
    },
    {
      num: 14,
      title: 'Track Order & 1-Click "Reorder this Kit"',
      desc: 'View 5-stage timeline and click "Reorder this Kit" button.',
      actionLabel: 'View Tracking',
    },
    {
      num: 15,
      title: 'Switch to Admin Dashboard',
      desc: 'Check revenue, orders, low-stock table, and update order status.',
      actionLabel: 'Open Admin Hub',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500 text-white flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">MediBasket Demo Walkthrough</h2>
              <p className="text-[11px] text-teal-300">Complete 15-Step Evaluation Checklist</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of 15 Steps */}
        <div className="p-5 overflow-y-auto flex-1 space-y-2.5 divide-y divide-slate-100">
          {steps.map(step => (
            <div
              key={step.num}
              className="pt-2.5 first:pt-0 flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {step.num}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug">{step.desc}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  onStepAction(step.num);
                  onClose();
                }}
                className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-semibold rounded-lg shrink-0 flex items-center gap-1 transition-colors border border-teal-200/80 cursor-pointer"
              >
                <span>{step.actionLabel}</span>
                <ArrowRight className="w-3 h-3 text-teal-600" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
          Click any step above to jump directly to that section in MediBasket.
        </div>
      </div>
    </div>
  );
}
