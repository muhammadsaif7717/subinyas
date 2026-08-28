import { NextRequest, NextResponse } from 'next/server';
import { getOrders, createOrder, getStoreSettings } from '@/lib/data-store';
import { DeliveryArea } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const orders = await getOrders(status, search);
    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ success: false, message: 'অর্ডার লোড করতে সমস্যা হয়েছে' }, { status: 500 });
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
      productSlug,
      productNameBn,
      comboId,
      comboTitleBn,
      quantity,
      selectedVariants,
      subtotal,
      notes,
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
    const calculatedSubtotal = Number(subtotal) || 499;
    const totalAmount = calculatedSubtotal + deliveryCharge;

    const newOrder = await createOrder({
      customerName: customerName.trim(),
      phone: cleanPhone,
      address: address.trim(),
      deliveryArea: area,
      deliveryCharge,
      productSlug: productSlug || 'jewelry-box',
      productNameBn: productNameBn || 'প্রিমিয়াম মিনি পোর্টেবল ট্রাভেল জুয়েলারি বক্স',
      comboId: comboId || 'combo-single',
      comboTitleBn: comboTitleBn || '১টি বক্স',
      quantity: Number(quantity) || 1,
      selectedVariants: Array.isArray(selectedVariants) && selectedVariants.length > 0 ? selectedVariants : ['Hello Kitty Soft Pink'],
      subtotal: calculatedSubtotal,
      totalAmount,
      notes: notes || '',
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
