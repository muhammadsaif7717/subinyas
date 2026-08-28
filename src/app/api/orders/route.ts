import { NextRequest, NextResponse } from 'next/server';
import { getOrders, createOrder, getStoreSettings } from '@/lib/data-store';
import { DeliveryArea, CartItem } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const orders = await getOrders(status, search);
    return NextResponse.json({ success: true, count: orders.length, orders });
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
      items, // Multi-item cart from checkout
      productSlug,
      productNameBn,
      comboId,
      comboTitleBn,
      quantity,
      selectedVariants,
      subtotal,
      notes,
      paymentMethod,
    } = body;

    // Validation
    if (!customerName || !customerName.trim()) {
      return NextResponse.json({ success: false, message: 'অনুগ্রহ করে আপনার নাম লিখুন' }, { status: 400 });
    }

    const cleanPhone = (phone || '').replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 11) {
      return NextResponse.json({ success: false, message: 'অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন' }, { status: 400 });
    }

    if (!address || !address.trim()) {
      return NextResponse.json({ success: false, message: 'অনুগ্রহ করে আপনার সম্পূর্ণ ঠিকানা লিখুন' }, { status: 400 });
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
      items: cartItems.length > 0 ? cartItems : undefined,
      productSlug: productSlug || (cartItems[0]?.productSlug ?? 'general-item'),
      productNameBn: productNameBn || (cartItems[0]?.productNameBn ?? cartItems[0]?.productName ?? 'অর্ডারকৃত আইটেম'),
      comboId: comboId || (cartItems[0]?.comboId ?? 'standard'),
      comboTitleBn: comboTitleBn || (cartItems[0]?.comboTitleBn ?? `${cartItems.length || 1}টি আইটেম`),
      quantity: Number(quantity) || (cartItems.reduce((sum, it) => sum + (it.quantity || 1), 0) || 1),
      selectedVariants: Array.isArray(selectedVariants) && selectedVariants.length > 0
        ? selectedVariants
        : (cartItems[0]?.selectedVariants ?? ['Standard']),
      subtotal: calculatedSubtotal,
      totalAmount,
      notes: notes || '',
      paymentMethod: paymentMethod || 'cod',
    });

    return NextResponse.json({
      success: true,
      message: 'আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!',
      order: newOrder,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ success: false, message: 'অর্ডার সম্পন্ন করতে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' }, { status: 500 });
  }
}
