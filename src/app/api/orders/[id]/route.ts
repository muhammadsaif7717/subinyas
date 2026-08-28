import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus } from '@/lib/data-store';
import { OrderStatus } from '@/lib/types';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, notes } = body;

    const validStatuses: OrderStatus[] = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: 'অকার্যকর স্ট্যাটাস' }, { status: 400 });
    }

    const success = await updateOrderStatus(id, status, notes);
    if (!success) {
      return NextResponse.json({ success: false, message: 'অর্ডার পাওয়া যায়নি' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'অর্ডার সফলভাবে আপডেট হয়েছে' });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, message: 'অর্ডার আপডেট করতে সমস্যা হয়েছে' }, { status: 500 });
  }
}
