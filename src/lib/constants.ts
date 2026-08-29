import { Product, StoreSettings } from './types';

export const INITIAL_JEWELRY_BOX_PRODUCT: Product = {
  id: 'prod-jewelry-box-01',
  slug: 'jewelry-box',
  name: 'Portable Mini Travel Jewelry Box',
  subtitle: 'Keep your jewelry and cosmetics perfectly organized — the ultimate travel companion!',
  description: 'Our cute and compact portable jewelry box is designed to keep your rings, earrings, necklaces, and watches organized. High quality waterproof PU leather exterior with soft velvet interior lining protects your valuables from scratches.',
  category: 'Travel Organizer & Gifting',
  rating: 4.9,
  reviewCount: 128,
  basePrice: 499,
  originalPrice: 750,
  images: [
    '/images/products/hello-kitty-pair.png',
    '/images/products/hello-kitty-open.png',
    '/images/products/pink-box-interior.png',
    '/images/products/mandala-boxes.png',
  ],
  variants: [
    {
      id: 'var-black',
      name: 'Black',
      color: 'Black',
      colorHex: '#1E293B',
      image: '/images/products/hello-kitty-pair.png',
      inStock: true,
      stockCount: 45,
      stock: 45,
      isDefault: true,
    },
    {
      id: 'var-white',
      name: 'White',
      color: 'White',
      colorHex: '#F8FAFC',
      image: '/images/products/hello-kitty-open.png',
      inStock: true,
      stockCount: 38,
      stock: 38,
      isDefault: false,
    },
  ],
  packages: [
    {
      id: 'pkg-2',
      title: '2 Pieces',
      subtitle: '1 for you + 1 for your best friend',
      quantity: 2,
      price: 899,
      originalPrice: 1500,
      badge: 'Popular',
      isPopular: true,
      savings: 'Save ৳601',
    },
    {
      id: 'pkg-1',
      title: '1 Piece',
      subtitle: 'Standard single pack',
      quantity: 1,
      price: 499,
      originalPrice: 750,
      badge: '',
      isPopular: false,
      savings: 'Save ৳251',
    },
  ],
  combos: [
    {
      id: 'pkg-2',
      title: '2 Pieces',
      subtitle: '1 for you + 1 for your best friend',
      quantity: 2,
      price: 899,
      originalPrice: 1500,
      badge: 'Popular',
      isPopular: true,
      savings: 'Save ৳601',
    },
    {
      id: 'pkg-1',
      title: '1 Piece',
      subtitle: 'Standard single pack',
      quantity: 1,
      price: 499,
      originalPrice: 750,
      badge: '',
      isPopular: false,
      savings: 'Save ৳251',
    },
  ],
  features: [
    {
      icon: 'Sparkles',
      title: 'Compact & Portable',
      description: 'Palm-sized dimensions (10 x 10 x 5 cm), easily fits into vanity or travel bag.',
    },
    {
      icon: 'ShieldCheck',
      title: 'Scratch-Proof Soft Velvet Lining',
      description: 'Ultra-soft velvet lining protects your precious gold, diamond and silver jewelry.',
    },
    {
      icon: 'Layers',
      title: 'Multi-Compartment Organizer',
      description: 'Dedicated ring slots, necklace hooks, and removable dividers for watches and earrings.',
    },
    {
      icon: 'Gift',
      title: 'Luxury Gift Packaging',
      description: 'Premium aesthetic finish making it an ideal gift for birthdays and anniversaries.',
    },
  ],
  specifications: [
    { key: 'Material', value: 'Premium Waterproof PU Leather + Soft Velvet' },
    { key: 'Size', value: '10 cm x 10 cm x 5 cm' },
    { key: 'Weight', value: '150 grams (Ultra Lightweight)' },
    { key: 'Lock System', value: 'Smooth Metal Zipper' },
  ],
  isActive: true,
};

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Subinyas',
  phone: '01617492486',
  whatsappNumber: '8801617492486',
  metaPixelId: '1234567890123456',
  deliveryInsideDhaka: 70,
  deliveryOutsideDhaka: 130,
  announcementText: '🚚 Fast Cash on Delivery Available Nationwide!',
  isPixelActive: true,
};

export const PRODUCT_AI_PROMPT_TEMPLATE = `You are an expert e-commerce copywriter & product specialist for our online store "Subinyas".
Analyze the product (image, photos, title, or concept) provided and generate complete product details in pure English.

==================================================
CRITICAL FORMATTING REQUIREMENT:
Output every individual section in its own distinct Markdown Code Block (copy box) so each field can be easily copied with one click in Gemini / ChatGPT, followed by the complete JSON format.
==================================================

### 1. PRODUCT NAME (Title)
\`\`\`text
[Enter Catchy, Clear Product Title in English (e.g., Portable Mini Travel Jewelry Box)]
\`\`\`

### 2. CATEGORY
\`\`\`text
[Enter single primary category name (e.g., Travel Organizers, Vanity Accessories, Jewelry Box)]
\`\`\`

### 3. SUBTITLE
\`\`\`text
[Enter 1-line captivating marketing hook / subtitle in English]
\`\`\`

### 4. DESCRIPTION
\`\`\`text
[Enter multi-line detailed product description in English highlighting materials, craftsmanship, organization compartments, and customer benefits]
\`\`\`

### 5. BASE PRICE (BDT)
\`\`\`text
499
\`\`\`

### 6. ORIGINAL / REGULAR PRICE (BDT)
\`\`\`text
799
\`\`\`

### 7. COLOR VARIANTS (Plain text line-by-line)
\`\`\`text
Variant 1:
Color Name: Black
Color Hex: #1E293B
Stock Count: 50

Variant 2:
Color Name: White
Color Hex: #F8FAFC
Stock Count: 40
\`\`\`

### 8. PACKAGE DEALS (JSON format)
\`\`\`json
[
  {
    "title": "2 Pieces",
    "subtitle": "1 for you + 1 for your best friend",
    "quantity": 2,
    "price": 899,
    "originalPrice": 1500,
    "badge": "Popular",
    "isPopular": true,
    "savings": "Save ৳601"
  },
  {
    "title": "1 Piece",
    "subtitle": "Standard single pack",
    "quantity": 1,
    "price": 499,
    "originalPrice": 750,
    "badge": "",
    "isPopular": false,
    "savings": "Save ৳251"
  }
]
\`\`\`

### 9. KEY FEATURES (JSON format)
\`\`\`json
[
  {
    "icon": "Sparkles",
    "title": "Compact & Portable",
    "description": "Palm-sized dimensions (10 x 10 x 5 cm), easily fits into your bag or luggage."
  },
  {
    "icon": "ShieldCheck",
    "title": "Scratch-Proof Soft Velvet Lining",
    "description": "Ultra-soft interior velvet protects your precious gold and diamond jewelry."
  },
  {
    "icon": "Layers",
    "title": "Multi-Compartment Organizer",
    "description": "Dedicated ring slots, necklace hooks, and removable dividers for watches."
  },
  {
    "icon": "Gift",
    "title": "Luxury Gift Packaging",
    "description": "Premium aesthetic finish making it an ideal gift for birthdays and anniversaries."
  }
]
\`\`\`
*(Supported Lucide icons: Sparkles, ShieldCheck, Layers, Gift, Truck, Award, Zap, Heart, Check, Star)*

### 10. SPECIFICATIONS (JSON format)
\`\`\`json
[
  { "key": "Material", "value": "Waterproof PU Leather + Soft Velvet Lining" },
  { "key": "Size", "value": "10 cm x 10 cm x 5 cm" },
  { "key": "Weight", "value": "150 grams (Ultra Lightweight)" },
  { "key": "Lock System", "value": "Smooth Metal Zipper" }
]
\`\`\`

==================================================
### FULL COMBINED JSON (For direct database / API use):
\`\`\`json
{
  "name": "...",
  "category": "...",
  "subtitle": "...",
  "description": "...",
  "basePrice": 499,
  "originalPrice": 799,
  "variants": [ ... ],
  "packages": [ ... ],
  "features": [ ... ],
  "specifications": [ ... ]
}
\`\`\`
`;

