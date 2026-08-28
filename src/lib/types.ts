export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';

export type DeliveryArea = 'inside_dhaka' | 'outside_dhaka';

export interface ProductVariant {
  id: string;
  name: string;
  nameBn?: string;
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
  titleBn: string;
  subtitleBn: string;
  quantity: number;
  price: number;
  originalPrice: number;
  badge?: string;
  isPopular?: boolean;
  savingsBn: string;
}

export interface Product {
  _id?: string;
  id: string;
  slug: string;
  name: string;
  nameBn: string;
  taglineBn: string;
  descriptionBn: string;
  category: string;
  rating: number;
  reviewCount: number;
  basePrice: number;
  originalPrice: number;
  images: string[];
  variants: ProductVariant[];
  combos: ComboOption[];
  featuresBn: {
    icon: string;
    title: string;
    description: string;
  }[];
  specificationsBn: {
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
  productSlug: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  mediaUrls?: string[];
  isVerifiedPurchase?: boolean;
  status: 'Pending' | 'Approved' | 'Declined' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
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
  items?: any[];
  productSlug?: string;
  productName?: string;
  productNameBn?: string;
  comboId?: string;
  comboTitleBn?: string;
  quantity?: number;
  selectedVariant?: any;
  selectedVariants?: string[];
  subtotal: number;
  total?: number;
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  note?: string;
  paymentMethod?: 'cod' | 'sslcommerz' | 'bkash' | 'nagad';
  advancePaid?: number;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productSlug: string;
  productName: string;
  productNameBn?: string;
  image: string;
  comboId: string;
  comboTitleBn: string;
  selectedVariants: string[];
  price: number;
  quantity: number;
}

export interface WishlistItem {
  id: string;
  productSlug: string;
  productName: string;
  productNameBn?: string;
  image: string;
  price: number;
  rating?: number;
}

export interface StoreSettings {
  _id?: string;
  storeName: string;
  storeNameBn: string;
  phone: string;
  whatsappNumber: string;
  metaPixelId: string;
  deliveryInsideDhaka: number;
  deliveryOutsideDhaka: number;
  announcementTextBn: string;
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
