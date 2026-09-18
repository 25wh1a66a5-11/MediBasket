import React, { useState } from 'react';
import {
  ShoppingBag,
  Heart,
  User,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  Search,
  Menu,
  X,
  SlidersHorizontal,
  ChevronDown,
  LogOut,
  UserCheck,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenKitBuilder: () => void;
  onSelectSituation: (situation: string) => void;
  onOpenDemoGuide: () => void;
}

export function Navbar({
  currentView,
  setCurrentView,
  searchQuery,
  setSearchQuery,
  onOpenKitBuilder,
  onSelectSituation,
  onOpenDemoGuide,
}: NavbarProps) {
  const { user, isAdmin, logout, switchRole } = useAuth();
  const { cart, setIsCartOpen } = useCart();
  const { wishlistIds } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [situationDropdownOpen, setSituationDropdownOpen] = useState(false);

  const situations = [
    'College',
    'Travel',
    'Sports',
    'Home',
    'Office',
    'Monsoon',
    'Hostel',
    'Outdoor Activities',
  ];

  const handleSituationClick = (situation: string) => {
    onSelectSituation(situation);
    setSituationDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Tagline & Safety Bar */}
      <div id="top-announcement-bar" className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-teal-400">
              <ShieldCheck className="w-3.5 h-3.5" /> MediBasket
            </span>
            <span className="text-slate-400">|</span>
            <span className="font-medium tracking-wide text-white">"Be Ready. Stay Safe."</span>
            <span className="hidden sm:inline text-slate-400">
              — Non-Prescription Emergency & Hygiene Essentials Only
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="competition-demo-btn"
              onClick={onOpenDemoGuide}
              className="inline-flex items-center gap-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 px-2.5 py-0.5 rounded-full font-medium transition-colors cursor-pointer border border-teal-500/30"
            >
              <Award className="w-3 h-3" />
              <span>Competition Demo Flow (15 Steps)</span>
            </button>
            <div className="hidden md:flex items-center gap-1.5 text-slate-300 text-xs">
              <span>Active Session:</span>
              <button
                onClick={() => switchRole(isAdmin ? 'user' : 'admin')}
                className="font-semibold underline hover:text-white transition-colors"
                title="Click to toggle user/admin"
              >
                {isAdmin ? 'Admin Officer' : 'Customer (Aarav)'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              id="brand-logo-btn"
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <div className="relative">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1.5 text-[10px] font-black text-amber-300">+</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xl tracking-tight text-slate-900 font-sans">MediBasket</span>
                  <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded-sm">ESSENTIALS</span>
                </div>
                <div className="text-[11px] text-slate-500 -mt-0.5 font-medium tracking-tight">Be Ready. Stay Safe.</div>
              </div>
            </button>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="navbar-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentView !== 'marketplace') {
                    setCurrentView('marketplace');
                  }
                }}
                placeholder="Search bandages, kits, thermometer, sanitizer..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-transparent focus:border-teal-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {/* Situation Dropdown */}
            <div className="relative">
              <button
                id="nav-situation-dropdown"
                onClick={() => setSituationDropdownOpen(!situationDropdownOpen)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-slate-700 hover:text-teal-700 hover:bg-teal-50 transition-colors"
              >
                <span>Situations</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {situationDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Choose Situation
                  </div>
                  {situations.map((sit) => (
                    <button
                      key={sit}
                      onClick={() => handleSituationClick(sit)}
                      className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center justify-between"
                    >
                      <span>{sit}</span>
                      <span className="text-[10px] text-teal-600 font-semibold">Kit &rarr;</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              id="nav-products-btn"
              onClick={() => setCurrentView('marketplace')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                currentView === 'marketplace'
                  ? 'text-teal-700 bg-teal-50 font-semibold'
                  : 'text-slate-700 hover:text-teal-700 hover:bg-slate-50'
              }`}
            >
              Shop Products
            </button>

            <button
              id="nav-custom-builder-btn"
              onClick={onOpenKitBuilder}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold border border-teal-200/60 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Build My Kit</span>
            </button>

            <button
              id="nav-my-kits-btn"
              onClick={() => setCurrentView('dashboard-kits')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                currentView === 'dashboard-kits'
                  ? 'text-teal-700 bg-teal-50 font-semibold'
                  : 'text-slate-700 hover:text-teal-700 hover:bg-slate-50'
              }`}
            >
              My Kits
            </button>

            {isAdmin && (
              <button
                id="nav-admin-dashboard-btn"
                onClick={() => setCurrentView('admin')}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  currentView === 'admin'
                    ? 'bg-amber-100 text-amber-900 font-semibold'
                    : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </button>
            )}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Wishlist */}
            <button
              id="nav-wishlist-btn"
              onClick={() => setCurrentView('dashboard-wishlist')}
              className="relative p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Saved Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.size > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistIds.size}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              id="nav-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-xs shadow-teal-600/20"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline font-semibold text-sm">
                ₹{cart.finalTotal}
              </span>
              {cart.itemCount > 0 && (
                <span className="bg-white text-teal-800 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center -ml-0.5 shadow-xs">
                  {cart.itemCount}
                </span>
              )}
            </button>

            {/* User Profile / Menu */}
            <div className="relative">
              <button
                id="nav-user-menu-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                  {user ? user.name.charAt(0) : 'U'}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="font-semibold text-sm text-slate-900">{user?.name || 'Guest User'}</div>
                    <div className="text-xs text-slate-500 truncate">{user?.email || 'user@medibasket.com'}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                        isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                      }`}>
                        {isAdmin ? 'ADMIN OFFICER' : 'VERIFIED CUSTOMER'}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setCurrentView('dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>User Dashboard</span>
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('dashboard-orders');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      <span>My Orders & Tracking</span>
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('dashboard-kits');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <Layers className="w-4 h-4 text-slate-400" />
                      <span>My Saved Kits</span>
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    {/* Quick Demo Switch Role button */}
                    <button
                      onClick={() => {
                        switchRole(isAdmin ? 'user' : 'admin');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50/50 hover:bg-teal-100 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-teal-600" />
                        Switch to {isAdmin ? 'Customer Role' : 'Admin Officer'}
                      </span>
                      <span className="text-[10px] bg-teal-200 text-teal-900 px-1 rounded">Demo</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setCurrentView('admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-amber-900 hover:bg-amber-50 flex items-center gap-2.5 font-medium"
                      >
                        <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (currentView !== 'marketplace') setCurrentView('marketplace');
              }}
              placeholder="Search emergency products..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <button
            onClick={() => {
              setCurrentView('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 font-medium text-slate-800"
          >
            Home
          </button>
          <button
            onClick={() => {
              setCurrentView('marketplace');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 font-medium text-slate-800"
          >
            Shop Products
          </button>
          <button
            onClick={() => {
              onOpenKitBuilder();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 font-semibold text-teal-700 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Build My Kit (Custom Builder)
          </button>
          <button
            onClick={() => {
              setCurrentView('dashboard-kits');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 font-medium text-slate-800"
          >
            My Saved Kits
          </button>
          <button
            onClick={() => {
              setCurrentView('dashboard-orders');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 font-medium text-slate-800"
          >
            Order Tracking & History
          </button>
          {isAdmin && (
            <button
              onClick={() => {
                setCurrentView('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 font-semibold text-amber-800"
            >
              Admin Dashboard
            </button>
          )}

          <div className="pt-2 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-400 mb-2">Situations</div>
            <div className="grid grid-cols-2 gap-2">
              {situations.map((sit) => (
                <button
                  key={sit}
                  onClick={() => handleSituationClick(sit)}
                  className="text-left text-xs p-2 rounded-lg bg-slate-50 hover:bg-teal-50 hover:text-teal-700 text-slate-700"
                >
                  {sit}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
