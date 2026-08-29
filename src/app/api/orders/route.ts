import { NextRequest, NextResponse } from 'next/server';
import { getOrders, createOrder, getSettings as getStoreSettings } from '@/lib/data-store';
import { DeliveryArea, CartItem } from '@/lib/types';

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ success: false, message: 'Failed to load orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      phone,
      address,
      deliveryArea,
      items,
      productSlug,
      productName,
      comboId,
      comboTitle,
      quantity,
      selectedVariants,
      subtotal,
      notes,
    } = body;

    // Validation
    if (!customerName || !customerName.trim()) {
      return NextResponse.json({ success: false, message: 'Please enter your name' }, { status: 400 });
    }

    const cleanPhone = (phone || '').replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 11) {
      return NextResponse.json({ success: false, message: 'Please enter a valid 11-digit phone number' }, { status: 400 });
    }

    if (!address || !address.trim()) {
      return NextResponse.json({ success: false, message: 'Please enter your complete address' }, { status: 400 });
    }

    const settings = await getStoreSettings();
    const area: DeliveryArea = deliveryArea === 'outside_dhaka' ? 'outside_dhaka' : 'inside_dhaka';
    const deliveryCharge = area === 'outside_dhaka' ? settings.deliveryOutsideDhaka : settings.deliveryInsideDhaka;

    let calculatedSubtotal = Number(subtotal) || 0;
    const cartItems: CartItem[] = Array.isArray(items) ? items : [];

    if (cartItems.length > 0) {
      calculatedSubtotal = cartItems.reduce((acc, it) => acc + (it.price * (it.quantity || 1)), 0);
    } else if (!calculatedSubtotal) {
      calculatedSubtotal = 499;
    }

    const totalAmount = calculatedSubtotal + deliveryCharge;

    const newOrder = await createOrder({
      customerName: customerName.trim(),
      phone: cleanPhone,
      address: address.trim(),
      deliveryArea: area,
      deliveryCharge,
      items: cartItems.length > 0 ? (cartItems as any) : undefined,
      productSlug: productSlug || (cartItems[0]?.productSlug ?? 'general-item'),
      productName: productName || (cartItems[0]?.productName ?? 'Ordered Item'),
      comboId: comboId || (cartItems[0]?.comboId ?? 'standard'),
      comboTitle: comboTitle || (cartItems[0]?.comboTitle ?? `${cartItems.length || 1} Item(s)`),
      quantity: Number(quantity) || (cartItems.reduce((sum, it) => sum + (it.quantity || 1), 0) || 1),
      selectedVariants: Array.isArray(selectedVariants) && selectedVariants.length > 0
        ? selectedVariants
        : (cartItems[0]?.selectedVariants ?? ['Standard']),
      subtotal: calculatedSubtotal,
      totalAmount,
      notes: notes || '',
      status: 'Pending',
    });

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ success: false, message: 'Failed to place order' }, { status: 500 });
  }
}
