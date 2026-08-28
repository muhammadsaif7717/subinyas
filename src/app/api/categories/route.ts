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

// Helper to reliably authenticate admin with case-insensitivity and DB fallback
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

    // Fallback check in MongoDB users collection
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
    const isAdmin = await checkIsAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const body = await request.json();
    const { name, order } = body;

    if (!name?.trim()) {
      return NextResponse.json({ success: false, message: 'ক্যাটাগরির নাম দিন।' }, { status: 400 });
    }

    const db = await getDb();
    let calculatedOrder = Number(order);

    if (isNaN(calculatedOrder) || calculatedOrder <= 0) {
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
      } else {
        calculatedOrder = 1;
      }
    }

    // Exact schema: _id, name, order, createdAt
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
    const isAdmin = await checkIsAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized - Admin access required' }, { status: 401 });
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
    const isAdmin = await checkIsAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized - Admin access required' }, { status: 401 });
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

    let filter: Filter<Document>;
    if (ObjectId.isValid(catId)) {
      filter = { $or: [{ _id: new ObjectId(catId) }, { id: catId }] as any };
    } else {
      filter = { $or: [{ _id: catId as any }, { id: catId }, { name: catId }] as any };
    }

    const res = await db.collection('categories').deleteOne(filter);
    console.log(`Deleted category ${catId}, deletedCount:`, res.deletedCount);

    return NextResponse.json({ success: true, message: 'ক্যাটাগরি মুছে ফেলা হয়েছে' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete category' }, { status: 500 });
  }
}
