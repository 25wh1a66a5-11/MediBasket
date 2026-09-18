import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './context/ToastContext.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { WishlistProvider } from './context/WishlistContext.js';
import { CartProvider, useCart } from './context/CartContext.js';
import { Product, Kit, Order } from './types.js';
import { api } from './services/api.js';

// Components
import { Navbar } from './components/Navbar.js';
import { Hero } from './components/Hero.js';
import { SituationKits } from './components/SituationKits.js';
import { KitCustomizerModal } from './components/KitCustomizerModal.js';
import { CustomKitBuilder } from './components/CustomKitBuilder.js';
import { Marketplace } from './components/Marketplace.js';
import { ProductDetailsModal } from './components/ProductDetailsModal.js';
import { CartDrawer } from './components/CartDrawer.js';
import { CheckoutView } from './components/CheckoutView.js';
import { OrderConfirmationView } from './components/OrderConfirmationView.js';
import { OrderTrackingView } from './components/OrderTrackingView.js';
import { UserDashboardView } from './components/UserDashboardView.js';
import { AdminDashboardView } from './components/AdminDashboardView.js';
import { Footer } from './components/Footer.js';
import { CompetitionDemoGuideModal } from './components/CompetitionDemoGuideModal.js';

function MainApp() {
  const { isAdmin, switchRole } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const { showToast } = useToast();

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('home');
  // 'home' | 'marketplace' | 'builder' | 'checkout' | 'confirmation' | 'tracking' | 'dashboard' | 'dashboard-orders' | 'dashboard-kits' | 'dashboard-wishlist' | 'admin'

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [kits, setKits] = useState<Kit[]>([]);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSituation, setSelectedSituation] = useState<string>('All');

  // Modal states
  const [selectedKitForCustomizer, setSelectedKitForCustomizer] = useState<Kit | null>(null);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [showDemoGuide, setShowDemoGuide] = useState<boolean>(false);

  // Orders flow state
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // Load initial products & kits
  const loadInitialData = async () => {
    try {
      setLoadingInitial(true);
      const [prodRes, kitRes] = await Promise.all([
        api.products.getAll(),
        api.kits.getAll(),
      ]);
      setProducts(prodRes.products);
      setKits(kitRes.kits);
    } catch (err: any) {
      showToast('error', 'Failed to load catalog', err.message);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle Buy Now (adds to cart and goes directly to checkout)
  const handleBuyNow = async (product: Product, quantity = 1) => {
    await addToCart({ productId: product.id, quantity });
    setCurrentView('checkout');
  };

  // Handle category selection from hero or footer
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentView('marketplace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle situation selection from navbar or situation grid
  const handleSituationSelect = (situation: string) => {
    setSelectedSituation(situation);
    if (currentView !== 'home') {
      setCurrentView('home');
    }
    setTimeout(() => {
      const element = document.getElementById('situation-kits-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Handle 15-step demo navigation triggers
  const handleDemoStepAction = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        setCurrentView('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 2:
        setCurrentView('home');
        setSelectedSituation('All');
        setTimeout(() => {
          document.getElementById('situation-kits-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        break;
      case 3:
        setCurrentView('home');
        setSelectedSituation('College');
        setTimeout(() => {
          document.getElementById('situation-kits-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        break;
      case 4:
      case 5:
        const collegeKit = kits.find(k => k.situation === 'College') || kits[0];
        if (collegeKit) {
          setSelectedKitForCustomizer(collegeKit);
        }
        break;
      case 6:
        setIsCartOpen(true);
        break;
      case 7:
        setCurrentView('marketplace');
        setSearchQuery('Bandage');
        break;
      case 8:
        setCurrentView('marketplace');
        setSearchQuery('');
        setSelectedCategory('First Aid');
        break;
      case 9:
        setCurrentView('marketplace');
        const lowStockItem = products.find(p => p.stock > 0 && p.stock <= 5) || products[0];
        if (lowStockItem) {
          setSelectedProductForModal(lowStockItem);
        }
        break;
      case 10:
        setCurrentView('marketplace');
        break;
      case 11:
        setIsCartOpen(true);
        break;
      case 12:
        setCurrentView('checkout');
        break;
      case 13:
        if (confirmedOrder) {
          setCurrentView('confirmation');
        } else {
          setCurrentView('checkout');
        }
        break;
      case 14:
        if (trackingOrderId) {
          setCurrentView('tracking');
        } else {
          // fetch first available order
          api.orders.getAll().then(res => {
            if (res.orders.length > 0) {
              setTrackingOrderId(res.orders[0].id);
              setCurrentView('tracking');
            } else {
              setCurrentView('checkout');
            }
          });
        }
        break;
      case 15:
        switchRole('admin');
        setCurrentView('admin');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-teal-100 selection:text-teal-900">
      {/* Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenKitBuilder={() => setCurrentView('builder')}
        onSelectSituation={handleSituationSelect}
        onOpenDemoGuide={() => setShowDemoGuide(true)}
      />

      {/* Main Content Areas */}
      <main className="flex-1">
        {loadingInitial ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-500">Preparing MediBasket Essentials...</p>
          </div>
        ) : (
          <>
            {/* VIEW: HOME */}
            {currentView === 'home' && (
              <>
                <Hero
                  onExploreKits={() => {
                    const el = document.getElementById('situation-kits-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onShopProducts={() => setCurrentView('marketplace')}
                  onBuildMyKit={() => setCurrentView('builder')}
                  onSelectCategory={handleCategorySelect}
                />

                <SituationKits
                  kits={kits}
                  allProducts={products}
                  selectedSituation={selectedSituation}
                  onSelectSituation={setSelectedSituation}
                  onCustomizeKit={kit => setSelectedKitForCustomizer(kit)}
                />

                {/* Featured Products Mini Section on Home */}
                <section className="py-14 bg-slate-50">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <div className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                          Quick Emergency Restock
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900">
                          Popular Healthcare & Hygiene Essentials
                        </h2>
                      </div>
                      <button
                        onClick={() => setCurrentView('marketplace')}
                        className="text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer"
                      >
                        View All {products.length} Products &rarr;
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {products.slice(0, 4).map(p => (
                        <div
                          key={p.id}
                          onClick={() => setSelectedProductForModal(p)}
                          className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                        >
                          <div>
                            <div className="relative h-40 bg-slate-100 rounded-xl overflow-hidden mb-3">
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                              {p.stock <= 5 && (
                                <span className="absolute bottom-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                  Only {p.stock} left
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-teal-700">{p.category}</span>
                            <h3 className="font-bold text-xs text-slate-900 line-clamp-2 mt-0.5">{p.name}</h3>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="font-black text-sm text-slate-900">₹{p.price}</span>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                addToCart({ productId: p.id, quantity: 1 });
                              }}
                              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-lg"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* VIEW: MARKETPLACE */}
            {currentView === 'marketplace' && (
              <Marketplace
                products={products}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                onSelectProduct={p => setSelectedProductForModal(p)}
                onBuyNow={p => handleBuyNow(p, 1)}
              />
            )}

            {/* VIEW: CUSTOM KIT BUILDER */}
            {currentView === 'builder' && (
              <CustomKitBuilder
                products={products}
                onComplete={() => setIsCartOpen(true)}
                onViewMyKits={() => setCurrentView('dashboard-kits')}
              />
            )}

            {/* VIEW: CHECKOUT */}
            {currentView === 'checkout' && (
              <CheckoutView
                onBackToShopping={() => setCurrentView('marketplace')}
                onOrderPlaced={order => {
                  setConfirmedOrder(order);
                  setTrackingOrderId(order.id);
                  setCurrentView('confirmation');
                }}
              />
            )}

            {/* VIEW: ORDER CONFIRMATION */}
            {currentView === 'confirmation' && confirmedOrder && (
              <OrderConfirmationView
                order={confirmedOrder}
                onTrackOrder={orderId => {
                  setTrackingOrderId(orderId);
                  setCurrentView('tracking');
                }}
                onContinueShopping={() => setCurrentView('marketplace')}
              />
            )}

            {/* VIEW: ORDER TRACKING */}
            {currentView === 'tracking' && trackingOrderId && (
              <OrderTrackingView
                orderId={trackingOrderId}
                onBack={() => setCurrentView('dashboard-orders')}
                onSelectProductForReview={productId => {
                  const prod = products.find(p => p.id === productId);
                  if (prod) setSelectedProductForModal(prod);
                }}
              />
            )}

            {/* VIEW: USER DASHBOARDS */}
            {(currentView === 'dashboard' ||
              currentView === 'dashboard-orders' ||
              currentView === 'dashboard-kits' ||
              currentView === 'dashboard-wishlist') && (
              <UserDashboardView
                initialTab={
                  currentView === 'dashboard-orders'
                    ? 'orders'
                    : currentView === 'dashboard-kits'
                    ? 'kits'
                    : currentView === 'dashboard-wishlist'
                    ? 'wishlist'
                    : 'overview'
                }
                products={products}
                onTrackOrder={orderId => {
                  setTrackingOrderId(orderId);
                  setCurrentView('tracking');
                }}
                onOpenKitBuilder={() => setCurrentView('builder')}
                onSelectProduct={p => setSelectedProductForModal(p)}
              />
            )}

            {/* VIEW: ADMIN DASHBOARD */}
            {currentView === 'admin' && isAdmin && (
              <AdminDashboardView
                products={products}
                kits={kits}
                onRefreshProducts={loadInitialData}
                onRefreshKits={loadInitialData}
              />
            )}
          </>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => setCurrentView('checkout')}
        onExploreProducts={() => setCurrentView('marketplace')}
      />

      {/* Kit Customizer Modal */}
      <KitCustomizerModal
        kit={selectedKitForCustomizer}
        allProducts={products}
        isOpen={Boolean(selectedKitForCustomizer)}
        onClose={() => setSelectedKitForCustomizer(null)}
        onKitSaved={() => {
          setSelectedKitForCustomizer(null);
          setCurrentView('dashboard-kits');
        }}
      />

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProductForModal}
        isOpen={Boolean(selectedProductForModal)}
        onClose={() => setSelectedProductForModal(null)}
        onBuyNow={(prod, qty) => handleBuyNow(prod, qty)}
      />

      {/* 15-Step Evaluation Checklist Modal */}
      <CompetitionDemoGuideModal
        isOpen={showDemoGuide}
        onClose={() => setShowDemoGuide(false)}
        onStepAction={handleDemoStepAction}
      />

      {/* Footer with strict non-prescription regulatory disclosure */}
      <Footer
        onSelectCategory={handleCategorySelect}
        onSelectSituation={handleSituationSelect}
        onOpenDemoGuide={() => setShowDemoGuide(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <MainApp />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
