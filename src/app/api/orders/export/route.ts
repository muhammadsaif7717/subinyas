import { NextResponse } from 'next/server';
import { getOrders } from '@/lib/data-store';

export async function GET() {
  try {
    const orders = await getOrders();

    // CSV header compatible with Bangladeshi couriers (Steadfast/Pathao/eCourier)
    const header = [
      'Order ID',
      'Date',
      'Customer Name',
      'Phone Number',
      'Delivery Address',
      'Delivery Area',
      'Product Name',
      'Combo / Quantity',
      'Selected Colors',
      'Total Amount (BDT)',
      'Delivery Charge (BDT)',
      'Status',
      'Notes',
    ];

    const rows = orders.map((o) => [
      `"${o.orderId}"`,
      `"${new Date(o.createdAt).toLocaleDateString('en-GB')}"`,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${o.phone}"`,
      `"${(o.address || '').replace(/"/g, '""')}"`,
      `"${o.deliveryArea === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}"`,
      `"${(o.productNameBn || '').replace(/"/g, '""')}"`,
      `"${(o.comboTitleBn || '').replace(/"/g, '""')}"`,
      `"${(o.selectedVariants || []).join(', ').replace(/"/g, '""')}"`,
      o.totalAmount,
      o.deliveryCharge,
      `"${o.status}"`,
      `"${(o.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [header.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="subinyas_orders_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting orders:', error);
    return NextResponse.json({ success: false, message: 'CSV এক্সপোর্ট করতে সমস্যা হয়েছে' }, { status: 500 });
  }
}
