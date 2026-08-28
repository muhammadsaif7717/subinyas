import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { verifyJwtToken } from '@/lib/jwt';
import { ObjectId } from 'mongodb';

export interface CategoryItem {
  _id?: string;
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function GET() {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: true, categories: [] });
    }

    const categories = await db
      .collection('categories')
      .find({})
      .sort({ order: 1, createdAt: 1 })
      .toArray();

    return NextResponse.json({ success: true, categories: categories || [] });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ success: false, message: 'Failed to load categories', categories: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('subinyas_admin_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyJwtToken(token);
    if (payload?.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, nameBn, slug, order } = body;

    if (!name?.trim() || !nameBn?.trim()) {
      return NextResponse.json({ success: false, message: 'ক্যাটাগরির নাম (English এবং বাংলা) উভয়ই দিন।' }, { status: 400 });
    }

    const autoSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const db = await getDb();
    let calculatedOrder = Number(order);

    if (isNaN(calculatedOrder) || calculatedOrder <= 0) {
      if (db) {
        const count = await db.collection('categories').countDocuments();
        calculatedOrder = count + 1;
      } else {
        calculatedOrder = 1;
      }
    }

    const newCat: CategoryItem = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      nameBn: nameBn.trim(),
      slug: autoSlug,
      order: calculatedOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.collection('categories').insertOne(newCat as any);
    }

    return NextResponse.json({ success: true, message: 'ক্যাটাগরি সফলভাবে সংরক্ষিত হয়েছে', category: newCat });
  } catch (error) {
    console.error('Error adding category:', error);
    return NextResponse.json({ success: false, message: 'Failed to add category' }, { status: 500 });
  }
}

// PATCH for reordering or editing
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('subinyas_admin_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyJwtToken(token);
    if (payload?.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { items, id, name, nameBn, order } = body;

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, message: 'Database disconnected' }, { status: 500 });
    }

    // Bulk reorder
    if (Array.isArray(items)) {
      for (const item of items) {
        let filter: Record<string, unknown> = { id: item.id };
        if (ObjectId.isValid(item.id)) {
          filter = { $or: [{ _id: new ObjectId(item.id) }, { id: item.id }] };
        }
        await db.collection('categories').updateOne(filter, {
          $set: { order: Number(item.order), updatedAt: new Date().toISOString() },
        });
      }
      return NextResponse.json({ success: true, message: 'ক্যাটাগরি ক্রম সফলভাবে আপডেট হয়েছে' });
    }

    // Single category edit
    if (id) {
      let filter: Record<string, unknown> = { id };
      if (ObjectId.isValid(id)) {
        filter = { $or: [{ _id: new ObjectId(id) }, { id }] };
      }
      const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() };
      if (name) updateData.name = name.trim();
      if (nameBn) updateData.nameBn = nameBn.trim();
      if (order !== undefined) updateData.order = Number(order);

      await db.collection('categories').updateOne(filter, { $set: updateData });
      return NextResponse.json({ success: true, message: 'ক্যাটাগরি আপডেট হয়েছে' });
    }

    return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ success: false, message: 'Failed to update category' }, { status: 500 });
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
    const catId = searchParams.get('id');

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, message: 'Database disconnected' }, { status: 500 });
    }

    if (catId === 'all') {
      await db.collection('categories').deleteMany({});
      return NextResponse.json({ success: true, message: 'সকল ক্যাটাগরি মুছে ফেলা হয়েছে' });
    }

    if (!catId) {
      return NextResponse.json({ success: false, message: 'Category ID is required' }, { status: 400 });
    }

    let filter: Record<string, unknown> = { id: catId };
    if (ObjectId.isValid(catId)) {
      filter = { $or: [{ _id: new ObjectId(catId) }, { id: catId }] };
    }
    await db.collection('categories').deleteOne(filter);

    return NextResponse.json({ success: true, message: 'ক্যাটাগরি মুছে ফেলা হয়েছে' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete category' }, { status: 500 });
  }
}
