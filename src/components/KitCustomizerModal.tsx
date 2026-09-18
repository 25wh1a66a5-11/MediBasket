import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  ShoppingBag,
  Bookmark,
  Check,
  AlertTriangle,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Kit, Product, KitCalculation } from '../types.js';
import { api } from '../services/api.js';
import { useCart } from '../context/CartContext.js';
import { useToast } from '../context/ToastContext.js';

interface KitCustomizerModalProps {
  kit: Kit | null;
  allProducts: Product[];
  isOpen: boolean;
  onClose: () => void;
  onKitSaved?: () => void;
}

export function KitCustomizerModal({
  kit,
  allProducts,
  isOpen,
  onClose,
  onKitSaved,
}: KitCustomizerModalProps) {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [currentItems, setCurrentItems] = useState<Array<{ productId: string; quantity: number }>>([]);
  const [calculation, setCalculation] = useState<KitCalculation | null>(null);
  const [loadingCalc, setLoadingCalc] = useState(false);
  const [customName, setCustomName] = useState('');
  const [showAddProductPicker, setShowAddProductPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [savingToMyKits, setSavingToMyKits] = useState(false);

  // Initialize kit items on open
  useEffect(() => {
    if (kit) {
      setCurrentItems(kit.items.map(i => ({ ...i })));
      setCustomName(`Customized ${kit.name}`);
      recalculate(kit.items);
    }
  }, [kit]);

  const recalculate = async (items: Array<{ productId: string; quantity: number }>) => {
    if (items.length === 0) {
      setCalculation(null);
      return;
    }
    try {
      setLoadingCalc(true);
      const calc = await api.kits.calculate(items);
      setCalculation(calc);
    } catch {
      // fallback manual calculation
      let normal = 0;
      const populated = items.map(item => {
        const prod = allProducts.find(p => p.id === item.productId);
        const price = prod?.price || 100;
        normal += price * item.quantity;
        return {
          product: prod || ({} as any),
          quantity: item.quantity,
          itemTotal: price * item.quantity,
        };
      });
      const bundle = Math.round(normal * 0.85);
      setCalculation({
        normalPrice: normal,
        bundlePrice: bundle,
        savings: normal - bundle,
        discountPercentage: 15,
        items: populated,
      });
    } finally {
      setLoadingCalc(false);
    }
  };

  if (!isOpen || !kit) return null;

  const handleQuantityChange = (productId: string, delta: number) => {
    const updated = currentItems.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    setCurrentItems(updated);
    recalculate(updated);
  };

  const handleRemoveItem = (productId: string) => {
    const updated = currentItems.filter(item => item.productId !== productId);
    setCurrentItems(updated);
    recalculate(updated);
    showToast('info', 'Product removed from kit', 'Dynamic bundle pricing updated.');
  };

  const handleAddProduct = (prod: Product) => {
    const existingIndex = currentItems.findIndex(i => i.productId === prod.id);
    let updated: Array<{ productId: string; quantity: number }>;

    if (existingIndex > -1) {
      updated = [...currentItems];
      updated[existingIndex].quantity += 1;
    } else {
      updated = [...currentItems, { productId: prod.id, quantity: 1 }];
    }

    setCurrentItems(updated);
    recalculate(updated);
    setShowAddProductPicker(false);
    showToast('savings', `Added ${prod.name}`, 'Dynamic bundle savings recalculated.');
  };

  const handleAddToCart = async () => {
    if (!calculation || calculation.items.length === 0) {
      showToast('error', 'Kit is empty', 'Please add at least one emergency product');
      return;
    }

    await addToCart({
      isCustomKit: true,
      customKitName: customName || kit.name,
      customKitItems: calculation.items.map(i => ({
        productId: i.product.id,
        quantity: i.quantity,
        price: i.product.price,
        name: i.product.name,
      })),
      quantity: 1,
    });

    onClose();
  };

  const handleSaveToMyKits = async () => {
    if (!calculation || calculation.items.length === 0) {
      showToast('error', 'Kit is empty', 'Add products first');
      return;
    }

    try {
      setSavingToMyKits(true);
      await api.myKits.create({
        name: customName || `My ${kit.situation} Kit`,
        purpose: kit.situation,
        items: currentItems,
      });
      showToast('success', 'Kit Saved!', `Saved to your "My Kits" collection.`);
      if (onKitSaved) onKitSaved();
    } catch (err: any) {
      showToast('error', 'Could not save kit', err.message);
    } finally {
      setSavingToMyKits(false);
    }
  };

  // Products available to add that aren't already in the kit
  const availableToAdd = allProducts.filter(p => {
    const matchesSearch = pickerSearch === '' ||
      p.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(pickerSearch.toLowerCase());
    return matchesSearch;
  });

  return (
    <div id="kit-customizer-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                Customize Emergency Kit
              </span>
              <span className="text-xs text-slate-500 font-medium">{kit.situation} Situation</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{kit.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add or remove products freely. Dynamic bundle savings apply to your total!
            </p>
          </div>
          <button
            id="close-kit-customizer-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* Custom Kit Name Edit */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Kit Label / Name:</label>
            <input
              type="text"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-medium"
              placeholder="e.g. My College Dorm Emergency Kit"
            />
          </div>

          {/* Current Kit Items List */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Included Products ({currentItems.length})
              </div>
              <button
                id="add-product-to-kit-trigger"
                onClick={() => setShowAddProductPicker(!showAddProductPicker)}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg border border-teal-200 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add More Products</span>
              </button>
            </div>

            {/* Product Picker Accordion */}
            {showAddProductPicker && (
              <div className="mb-4 p-3.5 bg-slate-50 rounded-xl border border-teal-200 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">Select Essential to Add:</span>
                  <input
                    type="text"
                    placeholder="Search product..."
                    value={pickerSearch}
                    onChange={e => setPickerSearch(e.target.value)}
                    className="text-xs px-2.5 py-1 border border-slate-200 rounded-md bg-white w-44"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {availableToAdd.map(p => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover" />
                        <div>
                          <div className="font-semibold text-slate-800 truncate max-w-[240px]">{p.name}</div>
                          <div className="text-slate-500">₹{p.price} • {p.category}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddProduct(p)}
                        className="px-2.5 py-1 bg-teal-600 text-white rounded font-medium hover:bg-teal-700 text-xs flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Items list */}
            {currentItems.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">Your kit is empty</p>
                <p className="text-xs text-slate-500 mt-0.5">Click 'Add More Products' above to include items.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {calculation?.items.map(item => (
                  <div
                    key={item.product.id}
                    id={`kit-item-row-${item.product.id}`}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-11 h-11 rounded-lg object-cover border border-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-800 truncate">{item.product.name}</div>
                        <div className="text-[11px] text-slate-500">
                          ₹{item.product.price} each • {item.product.brand}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button
                          onClick={() => handleQuantityChange(item.product.id, -1)}
                          disabled={item.quantity <= 1}
                          className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold px-2">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product.id, 1)}
                          className="p-1 text-slate-500 hover:text-slate-800"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-xs font-bold text-slate-800 w-14 text-right">
                        ₹{item.itemTotal}
                      </div>

                      {/* Remove item button */}
                      <button
                        id={`remove-kit-item-${item.product.id}`}
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="Remove product from kit"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DYNAMIC BUNDLE SAVINGS BOX */}
          {calculation && (
            <div id="dynamic-bundle-savings-box" className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border border-emerald-200">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span>Individual Products Total:</span>
                <span className="font-semibold line-through text-slate-400">₹{calculation.normalPrice}</span>
              </div>
              <div className="flex items-center justify-between text-base font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Kit Bundle Price:
                </span>
                <span className="text-teal-700 text-lg">₹{calculation.bundlePrice}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-800">
                  🎉 Smart Bundle Savings ({calculation.discountPercentage}% OFF):
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  You Save ₹{calculation.savings}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleSaveToMyKits}
            disabled={savingToMyKits || currentItems.length === 0}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-white flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-teal-600" />
            <span>{savingToMyKits ? 'Saving...' : 'Save to "My Kits"'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 text-xs font-medium hover:bg-slate-200/60 transition-colors"
            >
              Cancel
            </button>
            <button
              id="kit-customizer-add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={currentItems.length === 0}
              className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 flex items-center gap-2 transition-all shadow-md shadow-teal-600/20 disabled:opacity-50 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add Customized Kit to Cart</span>
              {calculation && <span className="font-bold">• ₹{calculation.bundlePrice}</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
