import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getProductBySlug, updateProductStock, saveProduct, deleteProduct } from '@/lib/data-store';
import { verifyJwtToken } from '@/lib/jwt';
import { Product } from '@/lib/types';
import { getDb } from '@/lib/mongodb';

// Helper for admin auth check with DB fallback
async function checkIsAdmin(request: NextRequest): Promise<boolean> {
  try {
    const token =
      request.cookies.get('subinyas_admin_token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return false;

    const payload = verifyJwtToken(token);
    if (!payload) return false;

    if (payload.role && payload.role.toLowerCase() === 'admin') {
      return true;
    }

    const db = await getDb();
    if (db && (payload.email || payload.userId)) {
      const query: Record<string, unknown> = {};
      if (payload.email) query.email = payload.email;
      else if (payload.userId) query.userId = payload.userId;

      const user = await db.collection('users').findOne(query);
      if (user && user.role && user.role.toLowerCase() === 'admin') {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const product = await getProductBySlug(slug);
      if (!product) {
        return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, product });
    }

    const products = await getProducts();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, message: 'Failed to load products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if it's a full product save request (wrapped in { product } or direct object)
    const productData = (body.product || (body.name && (body.slug || body.basePrice) ? body : null)) as Product | null;
    if (productData) {
      if (!productData.name || !productData.slug || !productData.basePrice) {
        return NextResponse.json(
          { success: false, message: 'Product name, slug, and base price are required.' },
          { status: 400 }
        );
      }

      await saveProduct(productData);
      return NextResponse.json({ success: true, message: 'Product saved successfully!' });
    }

    // Hero Slider toggle request
    if (body.toggleHeroSlider) {
      const { slug, isHeroSlider, heroOrder } = body;
      if (!slug) {
        return NextResponse.json({ success: false, message: 'Product slug is required' }, { status: 400 });
      }

      const db = await getDb();
      if (db) {
        const updateFields: Record<string, unknown> = {
          isHeroSlider: Boolean(isHeroSlider),
          updatedAt: new Date().toISOString(),
        };
        if (heroOrder !== undefined) {
          updateFields.heroOrder = Number(heroOrder);
        }
        await db.collection('products').updateOne({ slug }, { $set: updateFields });
      }

      return NextResponse.json({ success: true, message: 'Hero slider visibility updated!' });
    }

    // Stock update request
    const { slug, variantId, inStock, stockCount } = body;
    if (!slug || !variantId) {
      return NextResponse.json({ success: false, message: 'Invalid stock parameters' }, { status: 400 });
    }

    const success = await updateProductStock(slug, variantId, Boolean(inStock), Number(stockCount) || 0);
    if (!success) {
      return NextResponse.json({ success: false, message: 'Failed to update stock' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Stock updated successfully' });
  } catch (error) {
    console.error('Error in product POST:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await checkIsAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ success: false, message: 'Product slug is required' }, { status: 400 });
    }

    await deleteProduct(slug);
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete product' }, { status: 500 });
  }
}
