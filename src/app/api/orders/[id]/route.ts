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

    const validStatuses: OrderStatus[] = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid order status' }, { status: 400 });
    }

    const success = await updateOrderStatus(id, status, notes);
    if (!success) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, message: 'Failed to update order' }, { status: 500 });
  }
}
