import React from 'react';
import { Star, ShoppingBag, Zap, Heart, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Product } from '../types.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useCart } from '../context/CartContext.js';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export function ProductCard({ product, onSelect, onBuyNow }: ProductCardProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const wishlisted = isWishlisted(product.id);

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;
  const isPrescription = Boolean(product.requiresPrescription);

  return (
    <div
      id={`product-card-${product.id}`}
      className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
      onClick={() => onSelect(product)}
    >
      <div>
        {/* Image Container with Badges */}
        <div className="relative h-48 bg-slate-100 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Category and Rx Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
            <span className="bg-white/95 backdrop-blur-xs text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs border border-slate-200/60">
              {product.category}
            </span>

            {isPrescription ? (
              <span
                id={`rx-badge-${product.id}`}
                className="bg-amber-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1 border border-amber-700/50"
              >
                <FileText className="w-3 h-3" />
                <span>Prescription Required</span>
              </span>
            ) : (
              <span className="bg-emerald-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>OTC Direct</span>
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            id={`wishlist-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xs transition-colors ${
              wishlisted
                ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs'
                : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white'
            }`}
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {/* Low Stock Alert Badge (Requirement Unique Feature 5) */}
          {isLowStock && (
            <div
              id={`low-stock-alert-${product.id}`}
              className="absolute bottom-2.5 left-2.5 bg-rose-600/95 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-xs flex items-center gap-1 animate-pulse"
            >
              <AlertCircle className="w-3 h-3" />
              <span>Only {product.stock} left</span>
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white font-bold text-xs uppercase tracking-wider">
              Out of Stock
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-4 pb-0">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">{product.brand}</span>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-[11px] text-slate-400 font-normal">({product.reviewsCount})</span>
            </div>
          </div>

          <h3 className="font-bold text-sm text-slate-900 line-clamp-2 group-hover:text-teal-700 transition-colors">
            {product.name}
          </h3>

          {product.dosageForm && (
            <div className="text-[11px] font-medium text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded mt-1.5 inline-block border border-amber-200/60">
              Form: {product.dosageForm}
            </div>
          )}

          <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Footer Price & Buttons */}
      <div className="p-4 pt-3">
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-slate-900">₹{product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">₹{product.originalPrice}</span>
            )}
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Stock: <span className={product.stock <= 5 ? 'text-rose-600 font-bold' : 'text-slate-800'}>{product.stock}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            id={`add-cart-btn-${product.id}`}
            onClick={() => addToCart({ productId: product.id, quantity: 1 })}
            disabled={isOutOfStock}
            className="px-2.5 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-teal-600" />
            <span>Add to Cart</span>
          </button>

          <button
            id={`buy-now-btn-${product.id}`}
            onClick={() => onBuyNow(product)}
            disabled={isOutOfStock}
            className={`px-2.5 py-2 rounded-xl text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer ${
              isPrescription
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
            }`}
          >
            {isPrescription ? <FileText className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
            <span>{isPrescription ? 'Buy with Rx' : 'Buy Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
