'use client';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbq?: (...args: any[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _fbq?: any;
  }
}

export const trackPageView = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};

export const trackViewContent = (productName: string, category?: string, price?: number) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: productName,
      content_category: category || 'General',
      value: price || 0,
      currency: 'BDT',
    });
  }
};

export const trackAddToCart = (productName: string, comboTitleOrPrice?: string | number, price?: number, quantity?: number) => {
  if (typeof window !== 'undefined' && window.fbq) {
    const val = typeof comboTitleOrPrice === 'number' ? comboTitleOrPrice : price || 0;
    const title = typeof comboTitleOrPrice === 'string' ? `${productName} - ${comboTitleOrPrice}` : productName;
    window.fbq('track', 'AddToCart', {
      content_name: title,
      value: val,
      currency: 'BDT',
      num_items: quantity || 1,
    });
  }
};

export const trackInitiateCheckout = (numItemsOrValue?: number, valueOrNumItems?: number) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value: valueOrNumItems || numItemsOrValue || 0,
      currency: 'BDT',
      num_items: numItemsOrValue || 1,
    });
  }
};

export const trackPurchase = (orderId: string, value: number, numItems?: number, productName?: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      content_name: productName || 'Order',
      content_type: 'product',
      value: value,
      currency: 'BDT',
      num_items: numItems || 1,
      order_id: orderId,
    });
  }
};
