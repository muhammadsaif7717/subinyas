import { getDb } from './mongodb';
import { Product, Order, StoreSettings, OrderStatus } from './types';
import { INITIAL_JEWELRY_BOX_PRODUCT, INITIAL_SETTINGS } from './constants';
import { ObjectId } from 'mongodb';

// Global in-memory storage fallback when MongoDB connection is not set up
let memoryProducts: Product[] = [INITIAL_JEWELRY_BOX_PRODUCT];
let memoryOrders: Order[] = [
  {
    orderId: 'ORD-9821',
    customerName: 'Sumaiya Akter',
    phone: '01712345678',
    address: 'House 12, Road 4, Sector 7, Uttara, Dhaka',
    deliveryArea: 'inside_dhaka',
    deliveryCharge: 70,
    productSlug: 'jewelry-box',
    productName: 'Portable Mini Travel Jewelry Box',
    comboId: 'pkg-2',
    comboTitle: '2 Pieces (Best Deal)',
    quantity: 2,
    selectedVariants: ['Black', 'White'],
    subtotal: 899,
    totalAmount: 969,
    status: 'Confirmed',
    notes: 'Order confirmed over customer phone call',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    orderId: 'ORD-9822',
    customerName: 'Tanveer Ahmed',
    phone: '01898765432',
    address: 'GEC Circle, Nasirabad, Chattogram',
    deliveryArea: 'outside_dhaka',
    deliveryCharge: 130,
    productSlug: 'jewelry-box',
    productName: 'Portable Mini Travel Jewelry Box',
    comboId: 'pkg-1',
    comboTitle: '1 Piece (Single Pack)',
    quantity: 1,
    selectedVariants: ['Black'],
    subtotal: 499,
    totalAmount: 629,
    status: 'Pending',
    notes: 'Advance delivery fee invoice sent',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];
let memorySettings: StoreSettings = { ...INITIAL_SETTINGS };

export async function getProducts(): Promise<Product[]> {
  const db = await getDb();
  if (db) {
    const products = (await db.collection('products').find({}).toArray()) as unknown as Product[];
    return products || [];
  }
  return memoryProducts;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const db = await getDb();
  if (db) {
    let filter: Record<string, unknown> = { slug };
    if (ObjectId.isValid(slug)) {
      filter = { $or: [{ _id: new ObjectId(slug) }, { slug }, { id: slug }] };
    }
    const product = (await db.collection('products').findOne(filter)) as unknown as Product | null;
    return product;
  }
  return memoryProducts.find((p) => p.slug === slug || p.id === slug) || null;
}

export async function createOrUpdateProduct(productData: Partial<Product>): Promise<Product> {
  const db = await getDb();
  const slug = productData.slug || 'default-product';

  const doc: Product = {
    id: productData.id || `prod-${Date.now()}`,
    slug,
    name: productData.name || 'New Product',
    subtitle: productData.subtitle || '',
    description: productData.description || '',
    category: productData.category || 'General',
    rating: productData.rating || 5.0,
    reviewCount: productData.reviewCount || 0,
    basePrice: productData.basePrice || 0,
    originalPrice: productData.originalPrice || 0,
    images: productData.images || ['/images/products/hello-kitty-pair.png'],
    variants: productData.variants || [],
    packages: productData.packages || productData.combos || [],
    combos: productData.packages || productData.combos || [],
    features: productData.features || [],
    specifications: productData.specifications || [],
    isFeatured: productData.isFeatured !== false,
    isHeroSlider: productData.isHeroSlider === true,
    heroBannerImage: productData.heroBannerImage,
    heroLayout: productData.heroLayout || 'text_left',
    heroOrder: productData.heroOrder || 1,
    isActive: productData.isActive !== false,
    createdAt: productData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (db) {
    await db.collection('products').updateOne({ slug }, { $set: doc }, { upsert: true });
    return doc;
  }

  const existingIdx = memoryProducts.findIndex((p) => p.slug === slug);
  if (existingIdx >= 0) {
    memoryProducts[existingIdx] = { ...memoryProducts[existingIdx], ...doc };
    return memoryProducts[existingIdx];
  } else {
    memoryProducts.push(doc);
    return doc;
  }
}

export const saveProduct = createOrUpdateProduct;

export async function updateProductStock(
  slug: string,
  variantId: string,
  inStock: boolean,
  stockCount: number
): Promise<boolean> {
  const db = await getDb();
  if (db) {
    const res = await db.collection('products').updateOne(
      { slug, 'variants.id': variantId },
      {
        $set: {
          'variants.$.inStock': inStock,
          'variants.$.stockCount': stockCount,
          'variants.$.stock': stockCount,
          updatedAt: new Date().toISOString(),
        },
      }
    );
    return res.matchedCount > 0;
  }
  const prod = memoryProducts.find((p) => p.slug === slug || p.id === slug);
  if (prod && prod.variants) {
    const variant = prod.variants.find((v) => v.id === variantId);
    if (variant) {
      variant.inStock = inStock;
      variant.stockCount = stockCount;
      variant.stock = stockCount;
      return true;
    }
  }
  return false;
}

export async function deleteProduct(slug: string): Promise<boolean> {
  const db = await getDb();
  if (db) {
    const res = await db.collection('products').deleteOne({ slug });
    return res.deletedCount > 0;
  }
  const prevLen = memoryProducts.length;
  memoryProducts = memoryProducts.filter((p) => p.slug !== slug && p.id !== slug);
  return memoryProducts.length < prevLen;
}

export async function getOrders(): Promise<Order[]> {
  const db = await getDb();
  if (db) {
    const orders = (await db.collection('orders').find({}).sort({ createdAt: -1 }).toArray()) as unknown as Order[];
    return orders || [];
  }
  return memoryOrders;
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const db = await getDb();
  if (db) {
    const order = (await db.collection('orders').findOne({
      $or: [{ orderId }, { id: orderId }],
    })) as unknown as Order | null;
    return order;
  }
  return memoryOrders.find((o) => o.orderId === orderId || o.id === orderId) || null;
}

export async function createOrder(orderData: Partial<Order>): Promise<Order> {
  const db = await getDb();
  const count = (await getOrders()).length + 1;
  const newOrderId = `ORD-${1000 + count}`;

  const doc: Order = {
    orderId: newOrderId,
    customerName: orderData.customerName || '',
    phone: orderData.phone || '',
    address: orderData.address || '',
    deliveryArea: orderData.deliveryArea || 'inside_dhaka',
    deliveryCharge: orderData.deliveryCharge || 70,
    deliveryFee: orderData.deliveryCharge || 70,
    productSlug: orderData.productSlug || 'jewelry-box',
    productName: orderData.productName || 'Product Order',
    comboId: orderData.comboId || 'pkg-1',
    comboTitle: orderData.comboTitle || 'Standard Package',
    quantity: orderData.quantity || 1,
    selectedVariant: orderData.selectedVariant,
    selectedVariants: orderData.selectedVariants || [],
    items: orderData.items || [],
    subtotal: orderData.subtotal || 0,
    total: orderData.totalAmount || 0,
    discount: orderData.discount || 0,
    totalAmount: orderData.totalAmount || 0,
    status: 'Pending',
    notes: orderData.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (db) {
    await db.collection('orders').insertOne(doc as any);
    return doc;
  }

  memoryOrders.unshift(doc);
  return doc;
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  notes?: string
): Promise<boolean> {
  const db = await getDb();
  if (db) {
    const existingOrder = (await db.collection('orders').findOne({ orderId })) as unknown as Order | null;
    const prevStatus = existingOrder?.status;

    const updateDoc: Record<string, unknown> = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    if (notes !== undefined) {
      updateDoc.notes = notes;
    }
    await db.collection('orders').updateOne({ orderId }, { $set: updateDoc });

    // Inventory Adjustment Logic
    if (existingOrder && prevStatus !== newStatus) {
      const productSlug = existingOrder.productSlug;
      const variants = existingOrder.selectedVariants || [];

      const isNowFulfilled = ['Confirmed', 'Shipped', 'Delivered'].includes(newStatus);
      const wasFulfilled = ['Confirmed', 'Shipped', 'Delivered'].includes(prevStatus || '');

      const isNowCancelled = ['Cancelled', 'Returned'].includes(newStatus);
      const wasCancelled = ['Cancelled', 'Returned'].includes(prevStatus || '');

      if (isNowCancelled && wasFulfilled) {
        for (const varName of variants) {
          await db.collection('products').updateOne(
            { slug: productSlug, 'variants.name': varName },
            {
              $inc: { 'variants.$.stockCount': 1 },
              $set: { 'variants.$.inStock': true, updatedAt: new Date().toISOString() },
            }
          );
        }
      } else if (isNowFulfilled && (wasCancelled || prevStatus === 'Pending')) {
        for (const varName of variants) {
          const prod = (await db.collection('products').findOne({ slug: productSlug })) as unknown as Product | null;
          const targetVariant = prod?.variants?.find((v) => v.name === varName);
          const currentCount = targetVariant?.stockCount || 10;
          const newCount = Math.max(0, currentCount - 1);

          await db.collection('products').updateOne(
            { slug: productSlug, 'variants.name': varName },
            {
              $set: {
                'variants.$.stockCount': newCount,
                'variants.$.inStock': newCount > 0,
                updatedAt: new Date().toISOString(),
              },
            }
          );
        }
      }
    }

    return true;
  }

  const order = memoryOrders.find((o) => o.orderId === orderId);
  if (order) {
    order.status = newStatus;
    if (notes !== undefined) order.notes = notes;
    order.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
}

export async function getSettings(): Promise<StoreSettings> {
  const db = await getDb();
  if (db) {
    const settings = (await db.collection('settings').findOne({})) as unknown as StoreSettings | null;
    return settings || memorySettings;
  }
  return memorySettings;
}

export async function updateSettings(settingsData: Partial<StoreSettings>): Promise<StoreSettings> {
  const db = await getDb();
  const updated: StoreSettings = {
    storeName: settingsData.storeName || memorySettings.storeName,
    phone: settingsData.phone || memorySettings.phone,
    whatsappNumber: settingsData.whatsappNumber || memorySettings.whatsappNumber,
    metaPixelId: settingsData.metaPixelId ?? memorySettings.metaPixelId,
    deliveryInsideDhaka: settingsData.deliveryInsideDhaka ?? memorySettings.deliveryInsideDhaka,
    deliveryOutsideDhaka: settingsData.deliveryOutsideDhaka ?? memorySettings.deliveryOutsideDhaka,
    announcementText: settingsData.announcementText ?? memorySettings.announcementText,
    isPixelActive: settingsData.isPixelActive ?? memorySettings.isPixelActive,
    heroBannerSlugs: settingsData.heroBannerSlugs ?? memorySettings.heroBannerSlugs,
    updatedAt: new Date().toISOString(),
  };

  if (db) {
    await db.collection('settings').updateOne({}, { $set: updated }, { upsert: true });
    return updated;
  }
  memorySettings = { ...memorySettings, ...updated };
  return memorySettings;
}

export const getStoreSettings = getSettings;
export const updateStoreSettings = updateSettings;

