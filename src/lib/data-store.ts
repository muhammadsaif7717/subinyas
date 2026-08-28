import { getDb } from './mongodb';
import { Product, Order, StoreSettings, OrderStatus } from './types';
import { INITIAL_JEWELRY_BOX_PRODUCT, INITIAL_SETTINGS } from './constants';
import { ObjectId } from 'mongodb';

// Global in-memory storage fallback when MongoDB connection is not set up
let memoryProducts: Product[] = [INITIAL_JEWELRY_BOX_PRODUCT];
let memoryOrders: Order[] = [
  {
    orderId: 'ORD-9821',
    customerName: 'সুমাইয়া আক্তার',
    phone: '01712345678',
    address: 'বাড়ি ১২, রোড ৪, সেক্টর ৭, উত্তরা, ঢাকা',
    deliveryArea: 'inside_dhaka',
    deliveryCharge: 70,
    productSlug: 'jewelry-box',
    productNameBn: 'প্রিমিয়াম মিনি পোর্টেবল ট্রাভেল জুয়েলারি বক্স',
    comboId: 'combo-duo',
    comboTitleBn: '২টি বক্স বেস্টি কম্বো (Best Deal)',
    quantity: 2,
    selectedVariants: ['হ্যালো কিটি বেবি পিঙ্ক (Baby Pink)', 'হ্যালো কিটি পার্ল হোয়াইট (Pearl White)'],
    subtotal: 899,
    totalAmount: 969,
    status: 'Confirmed',
    notes: 'কাস্টমারকে কল দিয়ে কনফার্ম করা হয়েছে',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    orderId: 'ORD-9822',
    customerName: 'তানভীর আহমেদ',
    phone: '01898765432',
    address: 'জিইসি মোড়, নাসিরাবাদ, চট্টগ্রাম',
    deliveryArea: 'outside_dhaka',
    deliveryCharge: 130,
    productSlug: 'jewelry-box',
    productNameBn: 'প্রিমিয়াম মিনি পোর্টেবল ট্রাভেল জুয়েলারি বক্স',
    comboId: 'combo-single',
    comboTitleBn: '১টি জুয়েলারি বক্স (সিঙ্গেল প্যাক)',
    quantity: 1,
    selectedVariants: ['হ্যালো কিটি বেবি পিঙ্ক (Baby Pink)'],
    subtotal: 499,
    totalAmount: 629,
    status: 'Pending',
    notes: 'ডেলিভারি চার্জ অগ্রিম বিকাশের মেসেজ পাঠানো হয়েছে',
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

export async function saveProduct(product: Product): Promise<boolean> {
  const db = await getDb();
  if (db) {
    const { _id, ...cleanProduct } = product as unknown as { _id?: string };
    await db.collection('products').updateOne(
      { slug: product.slug },
      { $set: { ...cleanProduct, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );
    return true;
  }

  const index = memoryProducts.findIndex((p) => p.slug === product.slug);
  if (index > -1) {
    memoryProducts[index] = product;
  } else {
    memoryProducts.push(product);
  }
  return true;
}

export async function deleteProduct(slug: string): Promise<boolean> {
  const db = await getDb();
  if (db) {
    let filter: Record<string, unknown> = { slug };
    if (ObjectId.isValid(slug)) {
      filter = { $or: [{ _id: new ObjectId(slug) }, { slug }, { id: slug }] };
    } else {
      filter = { $or: [{ slug }, { id: slug }] };
    }
    const res = await db.collection('products').deleteOne(filter);
    console.log(`Deleted product ${slug}, deletedCount:`, res.deletedCount);
    return true;
  }
  memoryProducts = memoryProducts.filter((p) => p.slug !== slug && p.id !== slug);
  return true;
}

export async function updateProductStock(slug: string, variantId: string, inStock: boolean, stockCount: number): Promise<boolean> {
  const db = await getDb();
  if (db) {
    await db.collection('products').updateOne(
      { slug, 'variants.id': variantId },
      {
        $set: {
          'variants.$.inStock': inStock,
          'variants.$.stockCount': stockCount,
          updatedAt: new Date().toISOString(),
        },
      }
    );
    return true;
  }

  const p = memoryProducts.find((item) => item.slug === slug);
  if (p) {
    const v = p.variants.find((item) => item.id === variantId);
    if (v) {
      v.inStock = inStock;
      v.stockCount = stockCount;
      return true;
    }
  }
  return false;
}

export async function getOrders(statusFilter?: string, search?: string): Promise<Order[]> {
  const db = await getDb();
  if (db) {
    const query: Record<string, unknown> = {};
    if (statusFilter && statusFilter !== 'All') {
      query.status = statusFilter;
    }
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    const orders = (await db.collection('orders').find(query).sort({ createdAt: -1 }).toArray()) as unknown as Order[];
    return orders;
  }

  let filtered = [...memoryOrders];
  if (statusFilter && statusFilter !== 'All') {
    filtered = filtered.filter((o) => o.status === statusFilter);
  }
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.orderId.toLowerCase().includes(s) ||
        o.customerName.toLowerCase().includes(s) ||
        o.phone.includes(s)
    );
  }
  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createOrder(orderData: Omit<Order, 'orderId' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Order> {
  const orderId = `SUB-${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder: Order = {
    ...orderData,
    orderId,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const db = await getDb();
  if (db) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.collection('orders').insertOne({ ...newOrder } as any);
    return newOrder;
  }

  memoryOrders.unshift(newOrder);
  return newOrder;
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus, notes?: string): Promise<boolean> {
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

      // If moved to Shipped/Delivered from Pending (deduct stock if not already deducted)
      const isNowFulfilled = ['Confirmed', 'Shipped', 'Delivered'].includes(newStatus);
      const wasFulfilled = ['Confirmed', 'Shipped', 'Delivered'].includes(prevStatus || '');

      const isNowCancelled = ['Cancelled', 'Returned'].includes(newStatus);
      const wasCancelled = ['Cancelled', 'Returned'].includes(prevStatus || '');

      if (isNowCancelled && wasFulfilled) {
        // Return item to stock (+1 per variant)
        for (const varName of variants) {
          await db.collection('products').updateOne(
            { slug: productSlug, 'variants.nameBn': varName },
            {
              $inc: { 'variants.$.stockCount': 1 },
              $set: { 'variants.$.inStock': true, updatedAt: new Date().toISOString() },
            }
          );
        }
      } else if (isNowFulfilled && (wasCancelled || prevStatus === 'Pending')) {
        // Deduct from stock (-1 per variant)
        for (const varName of variants) {
          const prod = (await db.collection('products').findOne({ slug: productSlug })) as unknown as Product | null;
          const targetVariant = prod?.variants?.find((v) => v.nameBn === varName);
          const currentCount = targetVariant?.stockCount || 10;
          const newCount = Math.max(0, currentCount - 1);

          await db.collection('products').updateOne(
            { slug: productSlug, 'variants.nameBn': varName },
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

export async function getStoreSettings(): Promise<StoreSettings> {
  const db = await getDb();
  if (db) {
    const settings = (await db.collection('settings').findOne({})) as unknown as StoreSettings | null;
    if (settings) return settings;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.collection('settings').insertOne({ ...INITIAL_SETTINGS } as any);
    return INITIAL_SETTINGS;
  }
  return memorySettings;
}

export async function updateStoreSettings(newSettings: Partial<StoreSettings>): Promise<boolean> {
  const db = await getDb();
  if (db) {
    await db.collection('settings').updateOne(
      {},
      { $set: { ...newSettings, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );
    return true;
  }
  memorySettings = { ...memorySettings, ...newSettings };
  return true;
}
