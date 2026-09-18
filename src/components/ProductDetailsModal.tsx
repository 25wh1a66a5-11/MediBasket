import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Info,
  CheckCircle2,
  AlertCircle,
  Clock,
  Heart,
  MessageSquare,
} from 'lucide-react';
import { Product, Review } from '../types.js';
import { api } from '../services/api.js';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useToast } from '../context/ToastContext.js';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export function ProductDetailsModal({
  product,
  isOpen,
  onClose,
  onBuyNow,
}: ProductDetailsModalProps) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Review submission state
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      fetchReviews(product.id);
    }
  }, [product]);

  const fetchReviews = async (productId: string) => {
    try {
      setLoadingReviews(true);
      const res = await api.reviews.getByProduct(productId);
      setReviews(res.reviews);
    } catch {
      // ignore
    } finally {
      setLoadingReviews(false);
    }
  };

  if (!isOpen || !product) return null;

  const wishlisted = isWishlisted(product.id);
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userComment.trim()) {
      showToast('error', 'Comment required', 'Please write a brief feedback note');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await api.reviews.submit({
        productId: product.id,
        rating: userRating,
        comment: userComment.trim(),
      });
      showToast('success', 'Review Added', 'Your feedback was saved and product rating recalculated.');
      setUserComment('');
      setShowReviewForm(false);
      // Update reviews list and dynamic product rating
      product.rating = res.updatedProductRating;
      product.reviewsCount = res.reviewsCount;
      fetchReviews(product.id);
    } catch (err: any) {
      showToast('error', 'Review failed', err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div id="product-details-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95">
        {/* Top Header */}
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
              {product.category}
            </span>
            <span className="text-xs text-slate-500 font-medium">Brand: {product.brand}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Section */}
            <div className="relative rounded-xl overflow-hidden bg-slate-100 aspect-square border border-slate-200">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              {isLowStock && (
                <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Only {product.stock} left in stock</span>
                </div>
              )}
            </div>

            {/* Product Details & Purchase Controls */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 leading-snug">
                  {product.name}
                </h1>

                {/* Rating row */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-xs text-amber-900">{product.rating}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {product.reviewsCount} verified reviews
                  </span>
                </div>

                {/* Price Display */}
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">₹{product.price}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-slate-400 line-through">₹{product.originalPrice}</span>
                  )}
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Over-The-Counter Essential
                  </span>
                </div>

                {/* Stock info */}
                <div className="mt-3 text-xs flex items-center gap-2">
                  <span className="font-semibold text-slate-600">Available Stock:</span>
                  <span className={`font-bold ${isLowStock ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {product.stock} units
                  </span>
                </div>

                {/* Brief description */}
                <p className="mt-4 text-xs text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Quantity and Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-semibold text-slate-700">Quantity:</span>
                  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold px-3">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                      wishlisted
                        ? 'border-rose-300 bg-rose-50 text-rose-600 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-rose-500' : ''}`} />
                    <span>{wishlisted ? 'Wishlisted' : 'Save'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    id="modal-add-to-cart-btn"
                    onClick={() => {
                      addToCart({ productId: product.id, quantity });
                      onClose();
                    }}
                    disabled={isOutOfStock}
                    className="py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-slate-50 flex items-center justify-center gap-1.5 disabled:opacity-40"
                  >
                    <ShoppingBag className="w-4 h-4 text-teal-600" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    id="modal-buy-now-btn"
                    onClick={() => {
                      onBuyNow(product, quantity);
                      onClose();
                    }}
                    disabled={isOutOfStock}
                    className="py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20 disabled:opacity-40"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Specifications & Usage Guide Tabs */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            {/* Product Specifications Table */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Product Specifications
              </h3>
              <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <tbody className="divide-y divide-slate-200">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <tr key={key}>
                        <td className="py-2 px-4 font-semibold text-slate-600 w-1/3 bg-slate-100/50">{key}</td>
                        <td className="py-2 px-4 text-slate-800">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Manufacturer Usage Information */}
            <div className="p-3.5 bg-teal-50/70 rounded-xl border border-teal-200/80">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-xs mb-1">
                <Info className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Usage Information Supplied by Manufacturer:</span>
              </div>
              <p className="text-xs text-teal-950 leading-relaxed pl-6">
                {product.usageInfo}
              </p>
            </div>

            {/* Strict Regulatory Disclaimer */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Medical Safety & Non-Prescription Disclosure:</span> This item is a certified non-prescription first-aid/emergency preparedness essential. MediBasket does not provide medical diagnoses, treatment recommendations, or prescription drugs. For clinical emergencies, contact local emergency services immediately.
              </div>
            </div>

            {/* Customer Reviews & Rating Submission Section */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Verified Customer Reviews ({reviews.length})
                  </h3>
                </div>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200"
                >
                  {showReviewForm ? 'Cancel Review' : '+ Write a Review'}
                </button>
              </div>

              {/* Review submission form */}
              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="text-xs font-semibold text-slate-800">Your Rating:</div>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= userRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">{userRating} / 5 Stars</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Feedback Note:</label>
                    <textarea
                      value={userComment}
                      onChange={e => setUserComment(e.target.value)}
                      placeholder="Describe the packaging, sterility, convenience, or product quality..."
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 disabled:opacity-50"
                    >
                      {submittingReview ? 'Submitting...' : 'Post Review'}
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              {loadingReviews ? (
                <div className="text-center py-4 text-xs text-slate-400">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  No customer reviews yet. Be the first to review this essential!
                </div>
              ) : (
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {reviews.map(r => (
                    <div key={r.id} className="p-3 bg-white rounded-xl border border-slate-100 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800">{r.userName}</span>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{r.comment}</p>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-teal-600" /> Verified Emergency Kit Purchase
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
