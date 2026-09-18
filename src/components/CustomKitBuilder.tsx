import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Check,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Search,
  Layers,
  Bookmark,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { Product, KitCalculation } from '../types.js';
import { api } from '../services/api.js';
import { useCart } from '../context/CartContext.js';
import { useToast } from '../context/ToastContext.js';

interface CustomKitBuilderProps {
  products: Product[];
  onComplete?: () => void;
  onViewMyKits?: () => void;
}

export function CustomKitBuilder({ products, onComplete, onViewMyKits }: CustomKitBuilderProps) {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  // 5 Steps:
  // 1: Choose purpose
  // 2: Select products
  // 3: Choose quantity
  // 4: Show total price & savings
  // 5: Add entire kit to cart / finish
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Purpose
  const purposes = [
    { id: 'College', title: 'College & Dorm', desc: 'Late night study sessions, dorm scrapes, fever tracking' },
    { id: 'Travel', title: 'Travel & Trips', desc: 'Flights, road trips, motion sickness, compact hygiene' },
    { id: 'Sports', title: 'Sports & Fitness', desc: 'Sprains, muscle soreness, instant ice, electrolyte recovery' },
    { id: 'Home', title: 'Home & Family', desc: 'Family burn care, cuts, pediatric thermometers, daily essentials' },
    { id: 'Office', title: 'Office Workplace', desc: 'Corporate floor emergencies, sanitize stations, trauma care' },
    { id: 'Monsoon', title: 'Monsoon Defense', desc: 'Mosquito sprays, water purification, rainstorm emergencies' },
    { id: 'Hostel', title: 'Hostel Living', desc: 'Shared restroom hygiene, antibacterial protection' },
    { id: 'Outdoor', title: 'Outdoor & Trekking', desc: 'Survival blankets, emergency whistle, high-lumen flashlights' },
  ];
  const [selectedPurpose, setSelectedPurpose] = useState('College');
  const [kitName, setKitName] = useState('My Custom College Emergency Kit');

  // Step 2 & 3: Selected Products & Quantities
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({
    'prod_01': 1, // Bandages
    'prod_03': 1, // Antiseptic
    'prod_04': 1, // Thermometer
    'prod_05': 1, // Sanitizer
  });
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // Step 4: Calculation State
  const [calculation, setCalculation] = useState<KitCalculation | null>(null);
  const [loadingCalc, setLoadingCalc] = useState(false);

  // Auto-update default kit name when purpose changes
  const handlePurposeSelect = (p: string) => {
    setSelectedPurpose(p);
    setKitName(`My Custom ${p} Emergency Kit`);
  };

  // Toggle or modify product selection
  const handleToggleProduct = (productId: string) => {
    setSelectedItems(prev => {
      const next = { ...prev };
      if (next[productId]) {
        delete next[productId];
      } else {
        next[productId] = 1;
      }
      return next;
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setSelectedItems(prev => {
      const current = prev[productId] || 1;
      const nextQty = Math.max(1, current + delta);
      return { ...prev, [productId]: nextQty };
    });
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedItems(prev => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  // Recalculate dynamic savings whenever step 4 is entered or items change
  const fetchCalculation = async () => {
    const itemsArray = Object.entries(selectedItems).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));

    if (itemsArray.length === 0) {
      setCalculation(null);
      return;
    }

    try {
      setLoadingCalc(true);
      const res = await api.kits.calculate(itemsArray);
      setCalculation(res);
    } catch {
      // fallback
      let normal = 0;
      const pop = itemsArray.map(i => {
        const prod = products.find(p => p.id === i.productId);
        const price = prod?.price || 100;
        normal += price * i.quantity;
        return {
          product: prod || ({} as any),
          quantity: i.quantity,
          itemTotal: price * i.quantity,
        };
      });
      const bundle = Math.round(normal * 0.85);
      setCalculation({
        normalPrice: normal,
        bundlePrice: bundle,
        savings: normal - bundle,
        discountPercentage: 15,
        items: pop,
      });
    } finally {
      setLoadingCalc(false);
    }
  };

  useEffect(() => {
    if (currentStep >= 3) {
      fetchCalculation();
    }
  }, [currentStep, selectedItems]);

  // Step 5: Add entire kit to cart
  const handleAddEntireKitToCart = async () => {
    if (!calculation || calculation.items.length === 0) {
      showToast('error', 'Select items first');
      return;
    }

    await addToCart({
      isCustomKit: true,
      customKitName: kitName,
      customKitItems: calculation.items.map(i => ({
        productId: i.product.id,
        quantity: i.quantity,
        price: i.product.price,
        name: i.product.name,
      })),
      quantity: 1,
    });

    setCurrentStep(5);
  };

  // Save to My Kits
  const handleSaveToMyKits = async () => {
    const itemsArray = Object.entries(selectedItems).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));

    try {
      await api.myKits.create({
        name: kitName,
        purpose: selectedPurpose,
        items: itemsArray,
      });
      showToast('success', 'Kit Saved!', `"${kitName}" saved to My Kits.`);
    } catch (err: any) {
      showToast('error', 'Save failed', err.message);
    }
  };

  // Filter products for Step 2
  const filteredProducts = products.filter(p => {
    const matchSearch = productSearch === '' ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase());
    const matchCat = selectedCategoryFilter === 'All' || p.category === selectedCategoryFilter;
    return matchSearch && matchCat;
  });

  const selectedCount = Object.keys(selectedItems).length;

  return (
    <div id="custom-kit-builder-container" className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Intelligent Custom Kit Builder</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Build Your Own Emergency Kit
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Craft an emergency kit matching your exact specifications. As you add products,
          our engine dynamically recalculates bundle discounts so you never pay full retail price.
        </p>
      </div>

      {/* 5-Step Stepper Bar */}
      <div className="mb-10 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-5 gap-2">
          {[
            { step: 1, label: '1. Purpose' },
            { step: 2, label: '2. Products' },
            { step: 3, label: '3. Quantities' },
            { step: 4, label: '4. Dynamic Price' },
            { step: 5, label: '5. Complete' },
          ].map(s => {
            const isDone = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            return (
              <button
                key={s.step}
                onClick={() => {
                  if (s.step < currentStep || (s.step === 2 && selectedPurpose) || (s.step === 3 && selectedCount > 0)) {
                    setCurrentStep(s.step);
                  }
                }}
                className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all text-center ${
                  isCurrent
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : isDone
                    ? 'bg-teal-50 text-teal-800 font-semibold'
                    : 'bg-slate-50 text-slate-400 font-medium'
                }`}
              >
                <div className="flex items-center gap-1 text-xs">
                  {isDone ? <Check className="w-3.5 h-3.5 text-teal-600" /> : null}
                  <span>{s.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: CHOOSE PURPOSE */}
      {currentStep === 1 && (
        <div id="step-1-choose-purpose" className="space-y-6 animate-in fade-in">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Step 1: Choose Your Kit's Purpose</h3>
            <p className="text-xs text-slate-500 mb-6">
              Select the primary situation or scenario your emergency kit will serve.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {purposes.map(p => {
                const isSelected = selectedPurpose === p.id;
                return (
                  <button
                    key={p.id}
                    id={`purpose-card-${p.id.toLowerCase()}`}
                    onClick={() => handlePurposeSelect(p.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/70 shadow-xs ring-2 ring-teal-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-slate-900">{p.title}</span>
                      {isSelected && <Check className="w-4 h-4 text-teal-600" />}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kit Name:</label>
                <input
                  type="text"
                  value={kitName}
                  onChange={e => setKitName(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg w-72 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>

              <button
                id="purpose-next-step-btn"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue to Select Products</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT PRODUCTS */}
      {currentStep === 2 && (
        <div id="step-2-select-products" className="space-y-6 animate-in fade-in">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Step 2: Select Products for Your Kit</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Check off the products you need. Selected: <span className="font-bold text-teal-700">{selectedCount} items</span>
                </p>
              </div>

              {/* Search in builder */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder="Filter supplies..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {['All', 'First Aid', 'Hygiene', 'Emergency Essentials', 'Sports Care', 'Personal Care', 'Monsoon Essentials', 'Home Essentials'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    selectedCategoryFilter === cat
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredProducts.map(p => {
                const isSelected = Boolean(selectedItems[p.id]);
                return (
                  <div
                    key={p.id}
                    id={`builder-prod-card-${p.id}`}
                    onClick={() => handleToggleProduct(p.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/60 ring-2 ring-teal-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-slate-100 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-slate-900 truncate">{p.name}</div>
                        <div className="text-[11px] text-slate-500">₹{p.price} • {p.brand}</div>
                        {p.stock <= 5 && (
                          <div className="text-[10px] text-rose-600 font-bold">Only {p.stock} left</div>
                        )}
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                      isSelected ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                id="products-next-step-btn"
                onClick={() => {
                  if (selectedCount === 0) {
                    showToast('error', 'Select at least 1 product');
                    return;
                  }
                  setCurrentStep(3);
                }}
                disabled={selectedCount === 0}
                className="px-6 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                <span>Continue to Quantities ({selectedCount})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: CHOOSE QUANTITIES */}
      {currentStep === 3 && (
        <div id="step-3-choose-quantity" className="space-y-6 animate-in fade-in">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Step 3: Choose Quantities</h3>
            <p className="text-xs text-slate-500 mb-6">
              Adjust the count of each essential item in your bundle.
            </p>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {Object.entries(selectedItems).map(([productId, quantity]) => {
                const prod = products.find(p => p.id === productId);
                if (!prod) return null;
                const totalItemPrice = prod.price * quantity;

                return (
                  <div
                    key={productId}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <img src={prod.image} alt={prod.name} className="w-11 h-11 rounded-lg object-cover" />
                      <div>
                        <div className="font-semibold text-xs text-slate-900">{prod.name}</div>
                        <div className="text-[11px] text-slate-500">₹{prod.price} each</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Quantity buttons */}
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button
                          onClick={() => handleUpdateQuantity(productId, -1)}
                          disabled={quantity <= 1}
                          className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold px-3">{quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(productId, 1)}
                          className="p-1.5 text-slate-500 hover:text-slate-900"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-xs font-bold text-slate-800 w-16 text-right">
                        ₹{totalItemPrice}
                      </div>

                      <button
                        onClick={() => handleRemoveProduct(productId)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Products</span>
              </button>

              <button
                id="quantities-next-step-btn"
                onClick={() => setCurrentStep(4)}
                className="px-6 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Calculate Total Price & Savings</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: SHOW TOTAL PRICE & DYNAMIC SAVINGS */}
      {currentStep === 4 && (
        <div id="step-4-total-price-savings" className="space-y-6 animate-in fade-in">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Step 4: Dynamic Bundle Savings Breakdown</h3>
            <p className="text-xs text-slate-500 mb-6">
              Compare buying these items individually versus purchasing as a MediBasket Custom Kit.
            </p>

            {loadingCalc ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" />
                <p className="text-xs text-slate-500 mt-2">Calculating smart bundle discount...</p>
              </div>
            ) : calculation ? (
              <div className="space-y-6">
                {/* Table Breakdown */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                      <tr>
                        <th className="py-2.5 px-4">Selected Items</th>
                        <th className="py-2.5 px-4 text-center">Quantity</th>
                        <th className="py-2.5 px-4 text-right">Individual Price</th>
                        <th className="py-2.5 px-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {calculation.items.map(item => (
                        <tr key={item.product.id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-4 font-medium text-slate-800 flex items-center gap-2">
                            <img src={item.product.image} alt={item.product.name} className="w-7 h-7 rounded object-cover" />
                            <span className="truncate max-w-[280px]">{item.product.name}</span>
                          </td>
                          <td className="py-2.5 px-4 text-center text-slate-600 font-semibold">{item.quantity}</td>
                          <td className="py-2.5 px-4 text-right text-slate-500">₹{item.product.price}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-slate-800">₹{item.itemTotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Prominent Price Comparison & Bundle Savings (Requirement Display) */}
                <div className="p-5 rounded-xl bg-gradient-to-r from-teal-50 via-emerald-50 to-amber-50 border border-teal-200 space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Individual products total:</span>
                    <span className="font-semibold line-through text-slate-400">₹{calculation.normalPrice}</span>
                  </div>
                  <div className="flex items-center justify-between text-xl font-bold text-slate-900">
                    <span className="flex items-center gap-2 text-teal-900">
                      <Sparkles className="w-5 h-5 text-teal-600" />
                      MediBasket Kit Price:
                    </span>
                    <span className="text-teal-700 text-2xl font-black">₹{calculation.bundlePrice}</span>
                  </div>
                  <div className="pt-2 border-t border-teal-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      You Save ({calculation.discountPercentage}% Bundle Discount):
                    </span>
                    <span className="text-sm font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                      ₹{calculation.savings}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Quantities</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveToMyKits}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
                    >
                      <Bookmark className="w-4 h-4 text-teal-600" />
                      <span>Save to "My Kits"</span>
                    </button>

                    <button
                      id="builder-add-to-cart-btn"
                      onClick={handleAddEntireKitToCart}
                      className="px-6 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 flex items-center gap-2 transition-all shadow-md shadow-teal-600/20 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Step 5: Add Entire Kit to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* STEP 5: KIT ADDED & CELEBRATION */}
      {currentStep === 5 && (
        <div id="step-5-kit-added" className="space-y-6 animate-in zoom-in-95 text-center">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Kit Successfully Added to Cart!</h3>
            <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto">
              Your customized bundle <span className="font-semibold text-slate-900">"{kitName}"</span> has been placed in your cart with dynamic bundle savings of ₹{calculation?.savings}.
            </p>

            <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Kit Items:</span>
                <span className="font-semibold text-slate-800">{calculation?.items.length} Products</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bundle Price:</span>
                <span className="font-bold text-teal-700">₹{calculation?.bundlePrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Savings:</span>
                <span className="font-bold text-emerald-600">₹{calculation?.savings}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => {
                  if (onComplete) onComplete();
                }}
                className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 transition-colors"
              >
                View Cart & Checkout
              </button>
              <button
                onClick={() => {
                  setCurrentStep(1);
                  setSelectedItems({ 'prod_01': 1 });
                }}
                className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Build Another Kit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
