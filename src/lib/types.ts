export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';

export type DeliveryArea = 'inside_dhaka' | 'outside_dhaka';

export interface ProductVariant {
  id: string;
  name: string;
  color?: string;
  colorHex?: string;
  colorCode?: string;
  image: string;
  inStock: boolean;
  stock?: number;
  stockCount: number;
  isDefault?: boolean;
}

export interface ComboOption {
  id: string;
  title: string;
  subtitle?: string;
  quantity: number;
  price: number;
  originalPrice: number;
  badge?: string;
  isPopular?: boolean;
  savings?: string;
}

export interface Product {
  _id?: string;
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  category: string;
  rating: number;
  reviewCount: number;
  basePrice: number;
  originalPrice: number;
  images: string[];
  variants: ProductVariant[];
  packages: ComboOption[];
  combos?: ComboOption[];
  features: {
    icon: string;
    title: string;
    description: string;
  }[];
  specifications: {
    key: string;
    value: string;
  }[];
  isFeatured?: boolean;
  isHeroSlider?: boolean;
  heroBannerImage?: string;
  heroLayout?: 'text_left' | 'text_right';
  heroOrder?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function isProductInStock(p: Product): boolean {
  if (p.isActive === false) return false;
  if (!p.variants || p.variants.length === 0) return true;
  return p.variants.some(
    (v) =>
      v.inStock !== false &&
      (v.stockCount === undefined || Number(v.stockCount) > 0 || (v.stock !== undefined && Number(v.stock) > 0))
  );
}

export interface Review {
  _id?: string;
  id: string;
  productId?: string;
  productSlug?: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  customerName?: string;
  rating: number;
  comment: string;
  photos?: string[];
  mediaUrls?: string[];
  isVerifiedPurchase?: boolean;
  verifiedPurchase?: boolean;
  status: 'Pending' | 'Approved' | 'Declined' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  productSlug: string;
  productName: string;
  productImage: string;
  variantId?: string;
  variantName?: string;
  variantColor?: string;
  comboId?: string;
  comboTitle?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  _id?: string;
  id?: string;
  orderId: string;
  userId?: string;
  userEmail?: string;
  customerName: string;
  phone: string;
  address: string;
  deliveryArea: DeliveryArea;
  deliveryCharge: number;
  deliveryFee?: number;
  items?: OrderItem[];
  productSlug?: string;
  productName?: string;
  comboId?: string;
  comboTitle?: string;
  quantity?: number;
  selectedVariant?: ProductVariant;
  selectedVariants?: string[];
  subtotal: number;
  total?: number;
  discount?: number;
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  note?: string;
  paymentMethod?: 'cod' | 'sslcommerz' | 'bkash' | 'nagad';
  advancePaid?: number;
  transactionId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string;
  productSlug: string;
  productName: string;
  image: string;
  comboId: string;
  comboTitle: string;
  selectedVariants: string[];
  price: number;
  quantity: number;
}

export interface WishlistItem {
  id: string;
  productSlug: string;
  productName: string;
  image: string;
  price: number;
  rating?: number;
}

export interface StoreSettings {
  _id?: string;
  storeName: string;
  phone: string;
  whatsappNumber: string;
  metaPixelId: string;
  deliveryInsideDhaka: number;
  deliveryOutsideDhaka: number;
  announcementText: string;
  isPixelActive: boolean;
  heroBannerSlugs?: string[];
  updatedAt?: string;
}

export interface User {
  _id?: string;
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'customer';
  avatar?: string;
  cart?: CartItem[];
  wishlist?: WishlistItem[];
  createdAt?: string;
}
