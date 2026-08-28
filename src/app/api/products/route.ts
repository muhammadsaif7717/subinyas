import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getProductBySlug, updateProductStock } from '@/lib/data-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const product = await getProductBySlug(slug);
      if (!product) {
        return NextResponse.json({ success: false, message: 'প্রোডাক্ট পাওয়া যায়নি' }, { status: 404 });
      }
      return NextResponse.json({ success: true, product });
    }

    const products = await getProducts();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, message: 'প্রোডাক্ট লোড করতে ব্যর্থ হয়েছে' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, variantId, inStock, stockCount } = body;

    if (!slug || !variantId) {
      return NextResponse.json({ success: false, message: 'সঠিক তথ্য দিন' }, { status: 400 });
    }

    const success = await updateProductStock(slug, variantId, Boolean(inStock), Number(stockCount) || 0);
    if (!success) {
      return NextResponse.json({ success: false, message: 'স্টক আপডেট করা সম্ভব হয়নি' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'স্টক সফলভাবে আপডেট হয়েছে' });
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json({ success: false, message: 'সার্ভার ত্রুটি' }, { status: 500 });
  }
}
