import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { verifyJwtToken } from '@/lib/jwt';
import { ObjectId, Filter, Document } from 'mongodb';

export interface CategoryItem {
  _id?: string;
  id?: string;
  name: string;
  order: number;
  createdAt: string;
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
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json({ success: false, message: 'ক্যাটাগরির নাম দিন।' }, { status: 400 });
    }

    const db = await getDb();
    let calculatedOrder = 1;

    if (db) {
      const highestCat = await db
        .collection('categories')
        .find({})
        .sort({ order: -1 })
        .limit(1)
        .toArray();

      if (highestCat && highestCat.length > 0 && typeof highestCat[0].order === 'number') {
        calculatedOrder = highestCat[0].order + 1;
      } else {
        const count = await db.collection('categories').countDocuments();
        calculatedOrder = count + 1;
      }
    }

    // Exact schema fields: _id, name, order, createdAt
    const newCat = {
      name: name.trim(),
      order: calculatedOrder,
      createdAt: new Date().toISOString(),
    };

    let insertedId = '';
    if (db) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await db.collection('categories').insertOne(newCat as any);
      insertedId = res.insertedId.toString();
    }

    return NextResponse.json({
      success: true,
      message: 'ক্যাটাগরি সংরক্ষিত হয়েছে',
      category: { _id: insertedId, ...newCat },
    });
  } catch (error) {
    console.error('Error adding category:', error);
    return NextResponse.json({ success: false, message: 'Failed to add category' }, { status: 500 });
  }
}

// PATCH for drag-and-drop reordering
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
    const { items, id, name, order } = body;

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, message: 'Database disconnected' }, { status: 500 });
    }

    // Bulk reorder
    if (Array.isArray(items)) {
      for (const item of items) {
        const targetId = item._id || item.id;
        if (!targetId) continue;
        const filter: Filter<Document> = ObjectId.isValid(targetId)
          ? { _id: new ObjectId(targetId) }
          : ({ _id: targetId } as unknown as Filter<Document>);

        await db.collection('categories').updateOne(filter, {
          $set: { order: Number(item.order) },
        });
      }
      return NextResponse.json({ success: true, message: 'ক্যাটাগরি ক্রম আপডেট হয়েছে' });
    }

    // Single category edit
    if (id) {
      const filter: Filter<Document> = ObjectId.isValid(id)
        ? { _id: new ObjectId(id) }
        : ({ _id: id } as unknown as Filter<Document>);

      const updateData: Record<string, unknown> = {};
      if (name) updateData.name = name.trim();
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

    if (!catId) {
      return NextResponse.json({ success: false, message: 'Category ID is required' }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, message: 'Database disconnected' }, { status: 500 });
    }

    const filter: Filter<Document> = ObjectId.isValid(catId)
      ? { _id: new ObjectId(catId) }
      : ({ _id: catId } as unknown as Filter<Document>);

    await db.collection('categories').deleteOne(filter);

    return NextResponse.json({ success: true, message: 'ক্যাটাগরি মুছে ফেলা হয়েছে' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete category' }, { status: 500 });
  }
}
