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
    if (products.length > 0) return products;
    // Seed initial product if empty
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.collection('products').insertOne({ ...INITIAL_JEWELRY_BOX_PRODUCT } as any);
    return [INITIAL_JEWELRY_BOX_PRODUCT];
  }
  return memoryProducts;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const db = await getDb();
  if (db) {
    const product = (await db.collection('products').findOne({ slug })) as unknown as Product | null;
    if (product) return product;
    if (slug === 'jewelry-box') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.collection('products').insertOne({ ...INITIAL_JEWELRY_BOX_PRODUCT } as any);
      return INITIAL_JEWELRY_BOX_PRODUCT;
    }
    return null;
  }
  return memoryProducts.find((p) => p.slug === slug) || (slug === 'jewelry-box' ? INITIAL_JEWELRY_BOX_PRODUCT : null);
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

export async function getOrders(statusFilter?: string, searchQuery?: string): Promise<Order[]> {
  const db = await getDb();
  if (db) {
    const query: Record<string, unknown> = {};
    if (statusFilter && statusFilter !== 'All') {
      query.status = statusFilter;
    }
    if (searchQuery) {
      query.$or = [
        { customerName: { $regex: searchQuery, $options: 'i' } },
        { phone: { $regex: searchQuery, $options: 'i' } },
        { orderId: { $regex: searchQuery, $options: 'i' } },
      ];
    }
    const orders = (await db.collection('orders').find(query).sort({ createdAt: -1 }).toArray()) as unknown as Order[];
    return orders;
  }

  let filtered = [...memoryOrders];
  if (statusFilter && statusFilter !== 'All') {
    filtered = filtered.filter((o) => o.status === statusFilter);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (o) => o.customerName.toLowerCase().includes(q) || o.phone.includes(q) || o.orderId.toLowerCase().includes(q)
    );
  }
  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createOrder(orderData: Omit<Order, 'orderId' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Order> {
  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();
  const newOrder: Order = {
    ...orderData,
    orderId,
    status: 'Pending',
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDb();
  if (db) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await db.collection('orders').insertOne({ ...newOrder } as any);
    newOrder._id = res.insertedId.toString();
  } else {
    memoryOrders.unshift(newOrder);
  }

  return newOrder;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): Promise<boolean> {
  const now = new Date().toISOString();
  const db = await getDb();
  if (db) {
    const updateObj: Record<string, unknown> = { status, updatedAt: now };
    if (notes !== undefined) updateObj.notes = notes;

    let filter: Record<string, unknown> = { orderId };
    if (ObjectId.isValid(orderId)) {
      filter = { $or: [{ orderId }, { _id: new ObjectId(orderId) }] };
    }
    await db.collection('orders').updateOne(filter, { $set: updateObj });
    return true;
  }

  const order = memoryOrders.find((o) => o.orderId === orderId || o._id === orderId);
  if (order) {
    order.status = status;
    if (notes !== undefined) order.notes = notes;
    order.updatedAt = now;
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

export async function updateStoreSettings(newSettings: Partial<StoreSettings>): Promise<StoreSettings> {
  const now = new Date().toISOString();
  const db = await getDb();
  if (db) {
    await db.collection('settings').updateOne(
      {},
      { $set: { ...newSettings, updatedAt: now } },
      { upsert: true }
    );
    const updated = (await db.collection('settings').findOne({})) as unknown as StoreSettings | null;
    return updated || { ...memorySettings, ...newSettings };
  }

  memorySettings = { ...memorySettings, ...newSettings, updatedAt: now };
  return memorySettings;
}
