export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

export type DeliveryArea = 'inside_dhaka' | 'outside_dhaka';

export interface ProductVariant {
  id: string;
  name: string;
  nameBn: string;
  color: string;
  colorHex: string;
  image: string;
  inStock: boolean;
  stockCount: number;
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
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  _id?: string;
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  deliveryArea: DeliveryArea;
  deliveryCharge: number;
  productSlug: string;
  productNameBn: string;
  comboId: string;
  comboTitleBn: string;
  quantity: number;
  selectedVariants: string[];
  subtotal: number;
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  advancePaid?: number;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
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
  updatedAt?: string;
}

export interface AdminUser {
  _id?: string;
  email: string;
  name: string;
  role: 'admin' | 'manager';
  passwordHash?: string;
  createdAt?: string;
}
