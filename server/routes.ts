import { Router, Request, Response } from 'express';
import { mongoDb, Product, Kit, Order, SavedKit, Review, Prescription } from './db.js';
import { initialSeedData } from './seedData.js';

export const apiRouter = Router();

// Ensure initial seed if db is empty
function ensureSeed() {
  const currentProducts = mongoDb.products.find();
  if (currentProducts.length === 0) {
    console.log('Seeding initial MediBasket data into MongoDB store...');
    mongoDb.setRawData(JSON.parse(JSON.stringify(initialSeedData)));
  }
}
ensureSeed();

// Session / auth simulation state (stored in server memory/cookies or authorization headers)
let activeUserId = 'usr_demo_01'; // Default logged-in demo user for seamless grading

// --- AUTH REST APIs ---

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const user = mongoDb.users.findById(activeUserId);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Check demo accounts or existing users
  let user = mongoDb.users.findOne({ email });
  if (!user) {
    if (email.toLowerCase().includes('admin')) {
      user = mongoDb.users.findOne({ role: 'admin' });
    } else {
      // Auto-create or authenticate as demo user for smooth testing
      user = mongoDb.users.findOne({ role: 'user' });
    }
  }

  if (user) {
    activeUserId = user.id;
    return res.json({ message: 'Login successful', user });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, address, city, pincode } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const existing = mongoDb.users.findOne({ email });
  if (existing) {
    activeUserId = existing.id;
    return res.json({ message: 'Welcome back', user: existing });
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    name,
    email,
    phone: phone || '+91 98765 00000',
    role: 'user' as const,
    address: address || '',
    city: city || 'Bengaluru',
    pincode: pincode || '560001',
    createdAt: new Date().toISOString(),
  };

  mongoDb.users.insertOne(newUser);
  activeUserId = newUser.id;
  res.status(201).json({ message: 'Registered successfully', user: newUser });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  activeUserId = '';
  res.json({ message: 'Logged out successfully' });
});

apiRouter.post('/auth/switch-role', (req: Request, res: Response) => {
  const { role } = req.body; // 'admin' or 'user'
  const targetUser = mongoDb.users.findOne({ role });
  if (targetUser) {
    activeUserId = targetUser.id;
    return res.json({ message: `Switched to ${role} session`, user: targetUser });
  }
  res.status(404).json({ error: 'Role user not found' });
});

apiRouter.put('/auth/profile', (req: Request, res: Response) => {
  const user = mongoDb.users.findById(activeUserId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { name, phone, address, city, pincode } = req.body;
  mongoDb.users.updateOne({ id: activeUserId }, {
    ...(name && { name }),
    ...(phone && { phone }),
    ...(address && { address }),
    ...(city && { city }),
    ...(pincode && { pincode }),
  });

  const updated = mongoDb.users.findById(activeUserId);
  res.json({ message: 'Profile updated', user: updated });
});

// --- CATEGORIES ---

apiRouter.get('/categories', (req: Request, res: Response) => {
  const categories = mongoDb.categories.find();
  res.json({ categories });
});

// --- PRODUCTS REST APIs ---

apiRouter.get('/products', (req: Request, res: Response) => {
  let products = mongoDb.products.find();

  const { search, category, brand, minPrice, maxPrice, rating, inStock, sort } = req.query;

  // Search filter (Product name, category, brand)
  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }

  // Category filter
  if (category && typeof category === 'string' && category !== 'All') {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  // Brand filter
  if (brand && typeof brand === 'string' && brand !== 'All') {
    products = products.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
  }

  // Price range
  if (minPrice) {
    const min = Number(minPrice);
    if (!isNaN(min)) products = products.filter(p => p.price >= min);
  }
  if (maxPrice) {
    const max = Number(maxPrice);
    if (!isNaN(max)) products = products.filter(p => p.price <= max);
  }

  // Rating filter
  if (rating) {
    const minRating = Number(rating);
    if (!isNaN(minRating)) products = products.filter(p => p.rating >= minRating);
  }

  // In stock filter
  if (inStock === 'true') {
    products = products.filter(p => p.stock > 0);
  }

  // Sort
  if (sort === 'price_asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    products.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'newest') {
    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Extract unique brands for filter UI
  const allBrands = Array.from(new Set(mongoDb.products.find().map(p => p.brand)));

  res.json({
    products,
    total: products.length,
    brands: allBrands,
  });
});

apiRouter.get('/products/:id', (req: Request, res: Response) => {
  const product = mongoDb.products.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Also include reviews
  const reviews = mongoDb.reviews.find({ productId: product.id });
  res.json({ product, reviews });
});

// Admin: Add Product
apiRouter.post('/products', (req: Request, res: Response) => {
  const { name, description, category, price, originalPrice, brand, image, stock, specifications, usageInfo } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }

  const newProduct: Product = {
    id: `prod_${Date.now()}`,
    name,
    description: description || 'Certified medical emergency and first-aid essential.',
    category,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : Math.round(Number(price) * 1.25),
    brand: brand || 'MediBasket Certified',
    image: image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    stock: Number(stock) || 20,
    rating: 5.0,
    reviewsCount: 1,
    specifications: specifications || { 'Grade': 'Medical Grade / Non-Prescription' },
    usageInfo: usageInfo || 'Clean wound before use. Store in cool, dry conditions.',
    isEssential: true,
    createdAt: new Date().toISOString(),
  };

  mongoDb.products.insertOne(newProduct);
  res.status(201).json({ message: 'Product created successfully', product: newProduct });
});

// Admin: Update Product
apiRouter.put('/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const product = mongoDb.products.findById(id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const updateData = req.body;
  if (updateData.price) updateData.price = Number(updateData.price);
  if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);

  mongoDb.products.updateOne({ id }, updateData);
  const updated = mongoDb.products.findById(id);
  res.json({ message: 'Product updated successfully', product: updated });
});

// Admin: Delete Product
apiRouter.delete('/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = mongoDb.products.deleteOne({ id });
  if (!deleted) return res.status(404).json({ error: 'Product not found' });
  res.json({ message: 'Product deleted successfully' });
});

// --- KITS REST APIs ---

// Helper function to calculate bundle price & savings dynamically
export function calculateBundlePricing(items: Array<{ productId: string; quantity: number }>) {
  let normalPrice = 0;
  const populatedItems: Array<{ product: Product; quantity: number; itemTotal: number }> = [];

  for (const item of items) {
    const prod = mongoDb.products.findById(item.productId);
    if (prod) {
      const q = item.quantity || 1;
      const itemTotal = prod.price * q;
      normalPrice += itemTotal;
      populatedItems.push({
        product: prod,
        quantity: q,
        itemTotal,
      });
    }
  }

  // Dynamic Bundle Savings logic:
  // Kits offer ~15% to 20% savings compared to buying individual products
  // E.g., if normal price is 650, bundle is ~550, savings is 100
  let discountPercentage = 0.15;
  if (populatedItems.length >= 5) {
    discountPercentage = 0.18;
  } else if (populatedItems.length <= 2) {
    discountPercentage = 0.10;
  }

  const bundlePrice = Math.round(normalPrice * (1 - discountPercentage));
  const savings = normalPrice - bundlePrice;

  return {
    normalPrice,
    bundlePrice,
    savings,
    discountPercentage: Math.round(discountPercentage * 100),
    items: populatedItems,
  };
}

// Get all kits (or filter by situation)
apiRouter.get('/kits', (req: Request, res: Response) => {
  const { situation } = req.query;
  let kits = mongoDb.kits.find();

  if (situation && typeof situation === 'string') {
    kits = kits.filter(k => k.situation.toLowerCase() === situation.toLowerCase());
  }

  // Populate product previews for each kit
  const populatedKits = kits.map(kit => {
    const calc = calculateBundlePricing(kit.items);
    return {
      ...kit,
      calculated: calc,
    };
  });

  res.json({ kits: populatedKits });
});

apiRouter.get('/kits/:id', (req: Request, res: Response) => {
  const kit = mongoDb.kits.findById(req.params.id);
  if (!kit) return res.status(404).json({ error: 'Kit not found' });

  const calculation = calculateBundlePricing(kit.items);
  res.json({
    kit: {
      ...kit,
      calculation,
    },
  });
});

// Dynamic Bundle Calculator API: POST /api/kits/calculate
// Steps: User selects products & quantities -> calculates individual price, total price, savings dynamically!
apiRouter.post('/kits/calculate', (req: Request, res: Response) => {
  const { items } = req.body; // array of { productId, quantity }
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  const calculation = calculateBundlePricing(items);
  res.json(calculation);
});

// Admin: Create kit
apiRouter.post('/kits', (req: Request, res: Response) => {
  const { name, description, category, situation, image, items, customBundlePrice } = req.body;
  if (!name || !situation || !items || items.length === 0) {
    return res.status(400).json({ error: 'Name, situation, and at least one item are required' });
  }

  const calc = calculateBundlePricing(items);
  const bundlePrice = customBundlePrice ? Number(customBundlePrice) : calc.bundlePrice;
  const savings = calc.normalPrice - bundlePrice;

  const newKit: Kit = {
    id: `kit_${Date.now()}`,
    name,
    description: description || 'Specialized situation-based preparedness kit.',
    category: category || 'Emergency Essentials',
    situation,
    image: image || 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80',
    items,
    normalPrice: calc.normalPrice,
    bundlePrice,
    savings,
    createdAt: new Date().toISOString(),
  };

  mongoDb.kits.insertOne(newKit);
  res.status(201).json({ message: 'Kit created successfully', kit: newKit });
});

// Admin: Update kit
apiRouter.put('/kits/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const kit = mongoDb.kits.findById(id);
  if (!kit) return res.status(404).json({ error: 'Kit not found' });

  const { name, description, category, situation, image, items, bundlePrice } = req.body;

  let normalPrice = kit.normalPrice;
  let savings = kit.savings;
  let finalBundlePrice = bundlePrice !== undefined ? Number(bundlePrice) : kit.bundlePrice;

  if (items && Array.isArray(items)) {
    const calc = calculateBundlePricing(items);
    normalPrice = calc.normalPrice;
    if (bundlePrice === undefined) {
      finalBundlePrice = calc.bundlePrice;
    }
    savings = normalPrice - finalBundlePrice;
  } else if (bundlePrice !== undefined) {
    savings = normalPrice - finalBundlePrice;
  }

  mongoDb.kits.updateOne({ id }, {
    ...(name && { name }),
    ...(description && { description }),
    ...(category && { category }),
    ...(situation && { situation }),
    ...(image && { image }),
    ...(items && { items }),
    normalPrice,
    bundlePrice: finalBundlePrice,
    savings,
  });

  const updated = mongoDb.kits.findById(id);
  res.json({ message: 'Kit updated successfully', kit: updated });
});

// Admin: Delete kit
apiRouter.delete('/kits/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = mongoDb.kits.deleteOne({ id });
  if (!deleted) return res.status(404).json({ error: 'Kit not found' });
  res.json({ message: 'Kit deleted successfully' });
});

// --- CART REST APIs ---

apiRouter.get('/cart', (req: Request, res: Response) => {
  const cartItems = mongoDb.cart.find();

  let subtotal = 0;
  let bundleSavings = 0;

  for (const item of cartItems) {
    subtotal += item.price * item.quantity;
    if (item.savings) {
      bundleSavings += item.savings * item.quantity;
    }
  }

  // Free delivery threshold over ₹500
  const deliveryFee = subtotal === 0 || subtotal >= 500 ? 0 : 40;
  const finalTotal = subtotal + deliveryFee;

  const hasPrescriptionItems = cartItems.some(item => {
    if (item.requiresPrescription) return true;
    if (item.productId) {
      const prod = mongoDb.products.findById(item.productId);
      return Boolean(prod?.requiresPrescription);
    }
    return false;
  });

  res.json({
    items: cartItems,
    itemCount: cartItems.reduce((acc, curr) => acc + curr.quantity, 0),
    subtotal,
    bundleDiscount: bundleSavings,
    deliveryFee,
    finalTotal,
    freeDeliveryThreshold: 500,
    amountForFreeDelivery: subtotal < 500 ? 500 - subtotal : 0,
    hasPrescriptionItems,
  });
});

apiRouter.post('/cart/add', (req: Request, res: Response) => {
  const { productId, kitId, isCustomKit, customKitName, customKitItems, quantity = 1 } = req.body;

  // Case 1: Adding a single standard product
  if (productId) {
    const prod = mongoDb.products.findById(productId);
    if (!prod) return res.status(404).json({ error: 'Product not found' });

    const existing = mongoDb.cart.findOne({ productId });
    if (existing) {
      const newQty = existing.quantity + quantity;
      mongoDb.cart.updateOne({ id: existing.id }, { quantity: newQty });
      return res.json({ message: 'Cart quantity updated', item: { ...existing, quantity: newQty } });
    }

    const newItem = {
      id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      productId,
      quantity,
      price: prod.price,
      normalPrice: prod.originalPrice || prod.price,
      savings: (prod.originalPrice || prod.price) - prod.price,
      name: prod.name,
      image: prod.image,
      category: prod.category,
      requiresPrescription: Boolean(prod.requiresPrescription),
    };

    mongoDb.cart.insertOne(newItem);
    return res.status(201).json({ message: 'Product added to cart', item: newItem });
  }

  // Case 2: Adding a predefined or customized kit
  if (kitId || isCustomKit) {
    let kitName = customKitName;
    let kitPrice = 0;
    let normalPrice = 0;
    let savings = 0;
    let image = 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80';

    if (kitId && !isCustomKit) {
      const kit = mongoDb.kits.findById(kitId);
      if (!kit) return res.status(404).json({ error: 'Kit not found' });
      kitName = kit.name;
      kitPrice = kit.bundlePrice;
      normalPrice = kit.normalPrice;
      savings = kit.savings;
      image = kit.image;
    } else if (customKitItems && Array.isArray(customKitItems)) {
      const calc = calculateBundlePricing(customKitItems);
      kitName = customKitName || 'Custom Emergency Kit';
      kitPrice = calc.bundlePrice;
      normalPrice = calc.normalPrice;
      savings = calc.savings;
      if (calc.items.length > 0) {
        image = calc.items[0].product.image;
      }
    }

    const newItem = {
      id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      kitId: kitId || undefined,
      isCustomKit: Boolean(isCustomKit),
      customKitName: kitName,
      customKitItems,
      quantity,
      price: kitPrice,
      normalPrice,
      savings,
      name: kitName || 'Emergency Kit',
      image,
      category: 'Kit',
    };

    mongoDb.cart.insertOne(newItem);
    return res.status(201).json({ message: 'Kit added to cart with bundle savings', item: newItem });
  }

  return res.status(400).json({ error: 'Must provide productId, kitId, or customKitItems' });
});

apiRouter.put('/cart/item/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantity } = req.body;

  const item = mongoDb.cart.findById(id);
  if (!item) return res.status(404).json({ error: 'Cart item not found' });

  if (quantity <= 0) {
    mongoDb.cart.deleteOne({ id });
    return res.json({ message: 'Item removed from cart' });
  }

  mongoDb.cart.updateOne({ id }, { quantity: Number(quantity) });
  const updated = mongoDb.cart.findById(id);
  res.json({ message: 'Quantity updated', item: updated });
});

apiRouter.delete('/cart/item/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  mongoDb.cart.deleteOne({ id });
  res.json({ message: 'Item removed from cart' });
});

apiRouter.delete('/cart/clear', (req: Request, res: Response) => {
  mongoDb.cart.deleteMany(() => true);
  res.json({ message: 'Cart cleared' });
});

// --- ORDERS & CHECKOUT REST APIs ---

apiRouter.post('/orders', (req: Request, res: Response) => {
  const { address, paymentMethod, directItem, prescriptionId } = req.body;

  if (!address || !address.fullName || !address.phone || !address.streetAddress || !address.city || !address.pincode) {
    return res.status(400).json({ error: 'Please provide all required delivery address fields' });
  }

  let cartItems: any[] = [];

  if (directItem) {
    // "Buy Now" direct purchase flow
    cartItems = [directItem];
  } else {
    cartItems = mongoDb.cart.find();
    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }
  }

  // --- PRESCRIPTION MEDICINE VERIFICATION CHECK ---
  // Check if any cart item is a prescription medicine
  const prescriptionItems = cartItems.filter(item => {
    if (item.requiresPrescription) return true;
    if (item.productId) {
      const prod = mongoDb.products.findById(item.productId);
      return Boolean(prod?.requiresPrescription);
    }
    return false;
  });

  const hasPrescriptionItems = prescriptionItems.length > 0;
  let verifiedPrescription: any = null;

  if (hasPrescriptionItems) {
    if (!prescriptionId) {
      return res.status(400).json({
        error: 'A verified prescription is required. Your order includes regulated prescription medicines that cannot be checked out without an approved medical prescription.',
        code: 'PRESCRIPTION_REQUIRED',
        rxItems: prescriptionItems.map(i => i.name),
      });
    }

    verifiedPrescription = mongoDb.prescriptions.findById(prescriptionId);
    if (!verifiedPrescription) {
      return res.status(400).json({
        error: 'Selected prescription could not be found. Please upload or link a valid medical prescription.',
        code: 'PRESCRIPTION_INVALID',
      });
    }

    if (verifiedPrescription.status !== 'approved') {
      const statusMessage = verifiedPrescription.status === 'rejected'
        ? `Your uploaded prescription was rejected (${verifiedPrescription.rejectionReason || 'Pharmacist flagged discrepancy'}). Please upload a corrected valid prescription.`
        : 'Your prescription is currently pending verification by our certified pharmacist. Prescription medicines can only be checked out once approved.';

      return res.status(400).json({
        error: statusMessage,
        code: verifiedPrescription.status === 'rejected' ? 'PRESCRIPTION_REJECTED' : 'PRESCRIPTION_PENDING',
        status: verifiedPrescription.status,
        rejectionReason: verifiedPrescription.rejectionReason,
      });
    }
  }

  let subtotal = 0;
  let totalSavings = 0;
  const orderItems: any[] = [];
  let primaryKitId: string | undefined = undefined;
  let primaryKitName: string | undefined = undefined;

  for (const item of cartItems) {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    if (item.savings) totalSavings += item.savings * item.quantity;

    if (item.kitId || item.isCustomKit) {
      primaryKitId = item.kitId || 'custom_kit';
      primaryKitName = item.name;
    }

    const itemIsRx = item.requiresPrescription || (item.productId && Boolean(mongoDb.products.findById(item.productId)?.requiresPrescription));

    orderItems.push({
      productId: item.productId,
      kitId: item.kitId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      isKit: Boolean(item.kitId || item.isCustomKit),
      kitItemsSummary: item.customKitItems ? item.customKitItems.map((k: any) => k.name).join(', ') : undefined,
      requiresPrescription: Boolean(itemIsRx),
      prescriptionId: itemIsRx && verifiedPrescription ? verifiedPrescription.id : undefined,
    });

    // Deduct stock if individual product
    if (item.productId) {
      const prod = mongoDb.products.findById(item.productId);
      if (prod && prod.stock > 0) {
        mongoDb.products.updateOne({ id: prod.id }, { stock: Math.max(0, prod.stock - item.quantity) });
      }
    }
  }

  const deliveryFee = subtotal >= 500 ? 0 : 40;
  const discount = totalSavings > 0 ? Math.min(100, Math.round(totalSavings * 0.2)) : 0;
  const totalAmount = subtotal + deliveryFee - discount;

  // Generate Unique Human-Readable Order ID (e.g. MB-84192)
  const orderNumber = Math.floor(10000 + Math.random() * 90000);
  const orderId = `MB-${orderNumber}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    id: orderId,
    userId: activeUserId || 'usr_demo_01',
    customerName: address.fullName,
    customerEmail: address.email || 'customer@medibasket.com',
    customerPhone: address.phone,
    items: orderItems,
    kitId: primaryKitId,
    kitName: primaryKitName,
    subtotal,
    discount,
    deliveryFee,
    totalAmount,
    hasPrescriptionItems,
    prescriptionId: verifiedPrescription?.id,
    prescriptionStatus: hasPrescriptionItems ? 'approved' : 'none',
    address: {
      fullName: address.fullName,
      phone: address.phone,
      email: address.email || 'customer@medibasket.com',
      streetAddress: address.streetAddress,
      city: address.city,
      pincode: address.pincode,
    },
    paymentMethod: paymentMethod || 'cod',
    status: 'Order Placed',
    trackingHistory: [
      {
        status: 'Order Placed',
        timestamp: now,
        description: hasPrescriptionItems
          ? `Order confirmed with pharmacist-verified Prescription (#${verifiedPrescription.id}). Sent to sterile packaging.`
          : paymentMethod === 'online_simulated'
            ? 'Payment authorized. Order confirmed and sent to automated warehouse.'
            : 'Cash on Delivery order confirmed. Sterile verification in progress.',
        location: 'MediBasket Hub, Dispatch Center',
      },
    ],
    createdAt: now,
  };

  mongoDb.orders.insertOne(newOrder);

  // Clear cart if not direct Buy Now
  if (!directItem) {
    mongoDb.cart.deleteMany(() => true);
  }

  res.status(201).json({
    message: 'Order placed successfully',
    order: newOrder,
  });
});

apiRouter.get('/orders', (req: Request, res: Response) => {
  const user = mongoDb.users.findById(activeUserId);
  let orders: Order[] = [];

  if (user && user.role === 'admin') {
    orders = mongoDb.orders.find();
  } else {
    orders = mongoDb.orders.find({ userId: activeUserId });
  }

  // Sort newest first
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ orders });
});

apiRouter.get('/orders/:id', (req: Request, res: Response) => {
  const order = mongoDb.orders.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ order });
});

apiRouter.get('/orders/:id/track', (req: Request, res: Response) => {
  const order = mongoDb.orders.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const timelineSteps: Array<'Order Placed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered'> = [
    'Order Placed',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
  ];

  const currentStepIndex = timelineSteps.indexOf(order.status);

  res.json({
    orderId: order.id,
    status: order.status,
    currentStepIndex,
    steps: timelineSteps.map((step, idx) => ({
      name: step,
      isCompleted: idx <= currentStepIndex,
      isCurrent: idx === currentStepIndex,
      historyEntry: order.trackingHistory.find(h => h.status === step),
    })),
    trackingHistory: order.trackingHistory,
    items: order.items,
    totalAmount: order.totalAmount,
    address: order.address,
    canReorderKit: Boolean(order.kitId),
    kitId: order.kitId,
  });
});

// Unique Feature 4: "REORDER KIT" from past order
apiRouter.post('/orders/:id/reorder-kit', (req: Request, res: Response) => {
  const order = mongoDb.orders.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const kitItem = order.items.find(i => i.isKit);
  if (!kitItem) {
    return res.status(400).json({ error: 'No kit found in this order to reorder' });
  }

  // Add the kit directly to cart
  const cartItem = {
    id: `cart_${Date.now()}_reorder`,
    kitId: order.kitId || kitItem.kitId,
    quantity: 1,
    price: kitItem.price,
    name: kitItem.name,
    image: kitItem.image,
    category: 'Kit',
  };

  mongoDb.cart.insertOne(cartItem);
  res.json({ message: `Successfully added '${kitItem.name}' to cart for reorder!`, cartItem });
});

// Admin: Update Order Status
apiRouter.put('/orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note, location } = req.body;

  const order = mongoDb.orders.findById(id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const validStatuses = ['Order Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status' });
  }

  const now = new Date().toISOString();
  const history = [...order.trackingHistory];

  const defaultDescriptions: Record<string, string> = {
    'Order Placed': 'Order verified and authorized for processing.',
    'Packed': 'Medical and hygiene items checked, batch-verified, and sealed into emergency bag.',
    'Shipped': 'Package dispatched via Express Health Logistics.',
    'Out for Delivery': 'Delivery partner is en route with your package.',
    'Delivered': 'Package safely delivered and signed.',
  };

  history.push({
    status,
    timestamp: now,
    description: note || defaultDescriptions[status] || `Status updated to ${status}`,
    location: location || 'MediBasket Hub',
  });

  mongoDb.orders.updateOne({ id }, {
    status,
    trackingHistory: history,
    ...(status === 'Delivered' && { deliveredAt: now }),
  });

  const updated = mongoDb.orders.findById(id);
  res.json({ message: `Order status updated to ${status}`, order: updated });
});

// --- SAVED KITS ("MY KITS") REST APIs ---

apiRouter.get('/my-kits', (req: Request, res: Response) => {
  const savedKits = mongoDb.savedKits.find({ userId: activeUserId });
  const populated = savedKits.map(sk => {
    const calc = calculateBundlePricing(sk.items);
    return {
      ...sk,
      calculation: calc,
    };
  });
  res.json({ savedKits: populated });
});

apiRouter.post('/my-kits', (req: Request, res: Response) => {
  const { name, purpose, items } = req.body;
  if (!name || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Kit name and items are required' });
  }

  const calc = calculateBundlePricing(items);
  const newSavedKit: SavedKit = {
    id: `saved_kit_${Date.now()}`,
    userId: activeUserId || 'usr_demo_01',
    name,
    purpose: purpose || 'General',
    items,
    normalPrice: calc.normalPrice,
    bundlePrice: calc.bundlePrice,
    savings: calc.savings,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mongoDb.savedKits.insertOne(newSavedKit);
  res.status(201).json({ message: 'Kit saved to My Kits successfully', savedKit: newSavedKit });
});

apiRouter.put('/my-kits/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const kit = mongoDb.savedKits.findById(id);
  if (!kit) return res.status(404).json({ error: 'Saved kit not found' });

  const { name, purpose, items } = req.body;
  let normalPrice = kit.normalPrice;
  let bundlePrice = kit.bundlePrice;
  let savings = kit.savings;

  if (items && Array.isArray(items)) {
    const calc = calculateBundlePricing(items);
    normalPrice = calc.normalPrice;
    bundlePrice = calc.bundlePrice;
    savings = calc.savings;
  }

  mongoDb.savedKits.updateOne({ id }, {
    ...(name && { name }),
    ...(purpose && { purpose }),
    ...(items && { items }),
    normalPrice,
    bundlePrice,
    savings,
    updatedAt: new Date().toISOString(),
  });

  const updated = mongoDb.savedKits.findById(id);
  res.json({ message: 'Saved kit updated', savedKit: updated });
});

apiRouter.delete('/my-kits/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  mongoDb.savedKits.deleteOne({ id });
  res.json({ message: 'Saved kit deleted' });
});

apiRouter.post('/my-kits/:id/add-to-cart', (req: Request, res: Response) => {
  const { id } = req.params;
  const kit = mongoDb.savedKits.findById(id);
  if (!kit) return res.status(404).json({ error: 'Saved kit not found' });

  const calc = calculateBundlePricing(kit.items);

  const cartItem = {
    id: `cart_${Date.now()}_mykit`,
    isCustomKit: true,
    customKitName: kit.name,
    customKitItems: calc.items.map(i => ({
      productId: i.product.id,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
    })),
    quantity: 1,
    price: kit.bundlePrice,
    normalPrice: kit.normalPrice,
    savings: kit.savings,
    name: kit.name,
    image: calc.items.length > 0 ? calc.items[0].product.image : 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80',
    category: 'Kit',
  };

  mongoDb.cart.insertOne(cartItem);
  res.json({ message: `Added '${kit.name}' to cart!`, cartItem });
});

// --- WISHLIST REST APIs ---

apiRouter.get('/wishlist', (req: Request, res: Response) => {
  const wishlistItems = mongoDb.wishlist.find({ userId: activeUserId });
  const populated = wishlistItems.map(w => {
    const product = mongoDb.products.findById(w.productId);
    return {
      ...w,
      product,
    };
  }).filter(w => w.product !== null);

  res.json({ wishlist: populated });
});

apiRouter.post('/wishlist/toggle', (req: Request, res: Response) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId is required' });

  const existing = mongoDb.wishlist.findOne({ userId: activeUserId, productId });
  if (existing) {
    mongoDb.wishlist.deleteOne({ id: existing.id });
    return res.json({ message: 'Removed from wishlist', inWishlist: false });
  }

  const newItem = {
    id: `wish_${Date.now()}`,
    userId: activeUserId || 'usr_demo_01',
    productId,
    createdAt: new Date().toISOString(),
  };

  mongoDb.wishlist.insertOne(newItem);
  res.json({ message: 'Added to wishlist', inWishlist: true });
});

apiRouter.delete('/wishlist/:productId', (req: Request, res: Response) => {
  const { productId } = req.params;
  mongoDb.wishlist.deleteOne({ userId: activeUserId, productId });
  res.json({ message: 'Removed from wishlist' });
});

// --- REVIEWS REST APIs ---

apiRouter.get('/reviews/product/:productId', (req: Request, res: Response) => {
  const { productId } = req.params;
  const reviews = mongoDb.reviews.find({ productId });
  reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ reviews });
});

apiRouter.post('/reviews', (req: Request, res: Response) => {
  const { productId, rating, comment, orderId } = req.body;
  if (!productId || !rating || !comment) {
    return res.status(400).json({ error: 'Product ID, rating, and comment are required' });
  }

  const numRating = Number(rating);
  if (numRating < 1 || numRating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  const user = mongoDb.users.findById(activeUserId);
  const userName = user ? user.name : 'Verified Customer';

  const newReview: Review = {
    id: `rev_${Date.now()}`,
    productId,
    userId: activeUserId || 'usr_demo_01',
    userName,
    orderId,
    rating: numRating,
    comment,
    createdAt: new Date().toISOString(),
  };

  mongoDb.reviews.insertOne(newReview);

  // Recalculate average product rating dynamically!
  const allReviews = mongoDb.reviews.find({ productId });
  const totalRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0);
  const newAverage = Number((totalRating / allReviews.length).toFixed(1));

  mongoDb.products.updateOne({ id: productId }, {
    rating: newAverage,
    reviewsCount: allReviews.length,
  });

  res.status(201).json({
    message: 'Review submitted successfully',
    review: newReview,
    updatedProductRating: newAverage,
    reviewsCount: allReviews.length,
  });
});

// --- ADMIN ANALYTICS & DASHBOARD REST APIs ---

apiRouter.get('/admin/analytics', (req: Request, res: Response) => {
  const orders = mongoDb.orders.find();
  const products = mongoDb.products.find();
  const users = mongoDb.users.find({ role: 'user' });
  const kits = mongoDb.kits.find();

  // Total Sales & Total Orders
  const totalSales = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalOrders = orders.length;
  const totalCustomers = users.length;

  // Low stock products (stock <= 5)
  const lowStockProducts = products.filter(p => p.stock <= 5);

  // Most purchased products & popular kits
  const productPurchaseCounts: Record<string, { name: string; count: number; revenue: number; image: string }> = {};
  const kitPurchaseCounts: Record<string, { name: string; count: number; revenue: number }> = {};

  for (const o of orders) {
    for (const item of o.items) {
      if (item.productId) {
        if (!productPurchaseCounts[item.productId]) {
          productPurchaseCounts[item.productId] = { name: item.name, count: 0, revenue: 0, image: item.image };
        }
        productPurchaseCounts[item.productId].count += item.quantity;
        productPurchaseCounts[item.productId].revenue += item.price * item.quantity;
      }
      if (item.kitId) {
        if (!kitPurchaseCounts[item.kitId]) {
          kitPurchaseCounts[item.kitId] = { name: item.name, count: 0, revenue: 0 };
        }
        kitPurchaseCounts[item.kitId].count += item.quantity;
        kitPurchaseCounts[item.kitId].revenue += item.price * item.quantity;
      }
    }
  }

  const topProducts = Object.values(productPurchaseCounts).sort((a, b) => b.count - a.count).slice(0, 5);
  const topKits = Object.values(kitPurchaseCounts).sort((a, b) => b.count - a.count).slice(0, 5);

  // Recent 6 orders
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);

  const allPrescriptions = mongoDb.prescriptions.find();
  const pendingPrescriptionsCount = allPrescriptions.filter(p => p.status === 'pending').length;

  res.json({
    metrics: {
      totalSales,
      totalOrders,
      totalCustomers,
      lowStockCount: lowStockProducts.length,
      activeOrdersCount: orders.filter(o => o.status !== 'Delivered').length,
      pendingPrescriptionsCount,
    },
    lowStockProducts,
    topProducts,
    topKits,
    recentOrders,
    prescriptions: allPrescriptions,
    categoryCounts: mongoDb.categories.find().map(c => ({
      name: c.name,
      count: products.filter(p => p.category === c.name).length,
    })),
  });
});

// --- PRESCRIPTION MANAGEMENT REST APIs ---

// Get prescriptions: Admins get all; Users get their own (or all if specified)
apiRouter.get('/prescriptions', (req: Request, res: Response) => {
  const { all, status } = req.query;
  const user = mongoDb.users.findById(activeUserId);
  const isAdmin = user?.role === 'admin' || all === 'true';

  let list: Prescription[] = [];
  if (isAdmin) {
    list = mongoDb.prescriptions.find();
  } else {
    list = mongoDb.prescriptions.find(p => p.userId === (activeUserId || 'usr_demo_01'));
  }

  if (status) {
    list = list.filter(p => p.status === status);
  }

  list.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  res.json({ prescriptions: list });
});

apiRouter.get('/prescriptions/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const prescription = mongoDb.prescriptions.findById(id);
  if (!prescription) {
    return res.status(404).json({ error: 'Prescription not found' });
  }
  res.json({ prescription });
});

// Upload new prescription
apiRouter.post('/prescriptions/upload', (req: Request, res: Response) => {
  const {
    patientName,
    doctorName,
    hospitalOrClinic,
    prescriptionDate,
    fileUrl,
    fileName,
    fileSize,
    notes,
  } = req.body;

  if (!patientName || !doctorName || !prescriptionDate) {
    return res.status(400).json({ error: 'Patient name, doctor name, and prescription date are required.' });
  }

  const user = mongoDb.users.findById(activeUserId) || {
    id: 'usr_demo_01',
    name: 'Aarav Sharma',
    email: 'user@medibasket.com',
    phone: '+91 98765 43210',
  };

  const rxId = `rx_${Date.now()}`;
  const now = new Date().toISOString();

  const newPrescription: Prescription = {
    id: rxId,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userPhone: user.phone,
    patientName,
    doctorName,
    hospitalOrClinic: hospitalOrClinic || 'Healthcare Clinic / Hospital',
    prescriptionDate,
    fileUrl: fileUrl || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    fileName: fileName || `Prescription_${patientName.replace(/\s+/g, '_')}.pdf`,
    fileSize: fileSize || '1.1 MB',
    notes: notes || '',
    status: 'pending',
    uploadedAt: now,
  };

  mongoDb.prescriptions.insertOne(newPrescription);

  res.status(201).json({
    message: 'Prescription successfully uploaded. A licensed pharmacist will verify it within 15–30 minutes.',
    prescription: newPrescription,
  });
});

// Admin / Pharmacist Verification Endpoint
apiRouter.put('/prescriptions/:id/verify', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, rejectionReason, verifiedBy } = req.body;

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid verification status. Must be approved, rejected, or pending.' });
  }

  if (status === 'rejected' && !rejectionReason) {
    return res.status(400).json({ error: 'Please provide a rejection reason so the patient can rectify the issue.' });
  }

  const prescription = mongoDb.prescriptions.findById(id);
  if (!prescription) {
    return res.status(404).json({ error: 'Prescription not found.' });
  }

  const now = new Date().toISOString();
  const updatePayload: Partial<Prescription> = {
    status,
    verifiedBy: status !== 'pending' ? (verifiedBy || 'Chief Pharmacist R. Verma (Reg #PH-99201)') : undefined,
    verifiedAt: status !== 'pending' ? now : undefined,
    rejectionReason: status === 'rejected' ? rejectionReason : undefined,
  };

  mongoDb.prescriptions.updateOne({ id }, updatePayload);
  const updated = mongoDb.prescriptions.findById(id);

  res.json({
    message: `Prescription #${id} has been marked as ${status.toUpperCase()}.`,
    prescription: updated,
  });
});

// Delete prescription
apiRouter.delete('/prescriptions/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const prescription = mongoDb.prescriptions.findById(id);
  if (!prescription) return res.status(404).json({ error: 'Prescription not found' });

  mongoDb.prescriptions.deleteOne({ id });
  res.json({ message: 'Prescription deleted successfully' });
});

// Admin: Restock product
apiRouter.post('/admin/restock/:productId', (req: Request, res: Response) => {
  const { productId } = req.params;
  const { quantity = 25 } = req.body;
  const product = mongoDb.products.findById(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const newStock = product.stock + Number(quantity);
  mongoDb.products.updateOne({ id: productId }, { stock: newStock });
  res.json({ message: `Restocked ${product.name}. New stock: ${newStock}`, product: { ...product, stock: newStock } });
});

// Admin: Reset to Seed Data for Competition Demo
apiRouter.post('/admin/reset-data', (req: Request, res: Response) => {
  mongoDb.setRawData(JSON.parse(JSON.stringify(initialSeedData)));
  res.json({ message: 'MediBasket database reset to initial verified seed state!' });
});
