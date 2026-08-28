import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getProductBySlug, updateProductStock, saveProduct, deleteProduct } from '@/lib/data-store';
import { verifyJwtToken } from '@/lib/jwt';
import { Product } from '@/lib/types';

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

    // Check if it's a full product save request
    if (body.product) {
      const productData = body.product as Product;
      if (!productData.nameBn || !productData.slug || !productData.basePrice) {
        return NextResponse.json({ success: false, message: 'পণ্যের নাম, স্লাগ এবং মূল্য বাধ্যতামূলক।' }, { status: 400 });
      }

      await saveProduct(productData);
      return NextResponse.json({ success: true, message: 'প্রোডাক্ট সফলভাবে সংরক্ষণ করা হয়েছে!' });
    }

    // Stock update request
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
    console.error('Error in product POST:', error);
    return NextResponse.json({ success: false, message: 'সার্ভার ত্রুটি' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('subinyas_admin_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyJwtToken(token);
    if (payload?.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ success: false, message: 'Product slug is required' }, { status: 400 });
    }

    await deleteProduct(slug);
    return NextResponse.json({ success: true, message: 'প্রোডাক্ট সফলভাবে মুছে ফেলা হয়েছে' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete product' }, { status: 500 });
  }
}
