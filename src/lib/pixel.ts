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

export const trackViewContent = (productName: string, category: string, price: number) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: productName,
      content_category: category,
      value: price,
      currency: 'BDT',
    });
  }
};

export const trackAddToCart = (productName: string, comboTitle: string, price: number, quantity: number) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_name: `${productName} - ${comboTitle}`,
      value: price,
      currency: 'BDT',
      num_items: quantity,
    });
  }
};

export const trackInitiateCheckout = (value: number, numItems: number) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value,
      currency: 'BDT',
      num_items: numItems,
    });
  }
};

export const trackPurchase = (orderId: string, value: number, numItems: number, productName: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      content_name: productName,
      content_type: 'product',
      value: value,
      currency: 'BDT',
      num_items: numItems,
      order_id: orderId,
    });
  }
};
