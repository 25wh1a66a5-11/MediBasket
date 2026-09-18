import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
  Check,
  Star,
  Package,
  RotateCcw,
} from 'lucide-react';
import { Product } from '../types.js';
import { ProductCard } from './ProductCard.js';

interface MarketplaceProps {
  products: Product[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onSelectProduct: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export function Marketplace({
  products,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onSelectProduct,
  onBuyNow,
}: MarketplaceProps) {
  // Filter States
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Extract unique categories and brands
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const brands = ['All', ...Array.from(new Set(products.map(p => p.brand)))];

  // Filtering & Sorting logic
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        const matchBrand = p.brand.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchBrand && !matchDesc) return false;
      }

      // Category
      if (selectedCategory !== 'All' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Brand
      if (selectedBrand !== 'All' && p.brand !== selectedBrand) {
        return false;
      }

      // Max price
      if (p.price > maxPrice) {
        return false;
      }

      // Min rating
      if (p.rating < minRating) {
        return false;
      }

      // In stock
      if (onlyInStock && p.stock <= 0) {
        return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [products, searchQuery, selectedCategory, selectedBrand, maxPrice, minRating, onlyInStock, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedBrand('All');
    setMaxPrice(1000);
    setMinRating(0);
    setOnlyInStock(false);
    setSortBy('featured');
  };

  return (
    <div id="product-marketplace-section" className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
            Certified Non-Prescription Catalog
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Healthcare & Emergency Essentials
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Showing {filteredProducts.length} certified medical items • Sterile packaging & fast dispatch
          </p>
        </div>

        {/* Search Bar & Sort Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search name, brand, category..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            {/* Sort Control */}
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                id="sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="text-xs text-slate-700 font-medium bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured Essentials</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">New Arrivals</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className={`space-y-6 lg:block ${showMobileFilters ? 'block' : 'hidden'}`}>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-teal-600" />
                Filters
              </span>
              <button
                onClick={resetFilters}
                className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset All
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Category
              </label>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedCategory === cat
                        ? 'bg-teal-50 text-teal-800 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Max Price
                </label>
                <span className="text-xs font-bold text-slate-900">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="25"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹50</span>
                <span>₹1000+</span>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Minimum Rating
              </label>
              <div className="space-y-1.5">
                {[4.5, 4.0, 3.5, 0].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    className={`w-full text-left px-2 py-1 rounded-lg text-xs flex items-center justify-between ${
                      minRating === rating ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{rating === 0 ? 'All Ratings' : `${rating} & above`}</span>
                    </div>
                    {minRating === rating && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Brand
              </label>
              <select
                value={selectedBrand}
                onChange={e => setSelectedBrand(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-medium"
              >
                {brands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={e => setOnlyInStock(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-base">No matching products found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try adjusting your search query, price slider, or category filters.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                  onBuyNow={onBuyNow}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
