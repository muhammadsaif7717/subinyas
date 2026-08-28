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
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', name: 'Organizers', nameBn: 'অর্গানাইজার', slug: 'organizers' },
  { id: 'cat-2', name: 'Jewelry Box', nameBn: 'জুয়েলারি বক্স', slug: 'jewelry-box' },
  { id: 'cat-3', name: 'Pouches', nameBn: 'ভেলভেট পাউচ', slug: 'pouches' },
  { id: 'cat-4', name: 'Travel', nameBn: 'ট্রাভেল এক্সেসরিজ', slug: 'travel' },
  { id: 'cat-5', name: 'Accessories', nameBn: 'ফ্যাশন এক্সেসরিজ', slug: 'accessories' },
  { id: 'cat-6', name: 'Bags', nameBn: 'মেকআপ ব্যাগ', slug: 'bags' },
  { id: 'cat-7', name: 'Gifts', nameBn: 'গিফট আইটেম', slug: 'gifts' },
];

export async function GET() {
  try {
    const db = await getDb();
    if (db) {
      const categories = await db.collection('categories').find({}).sort({ createdAt: 1 }).toArray();
      if (categories && categories.length > 0) {
        return NextResponse.json({ success: true, categories });
      }

      // Seed default categories into MongoDB if collection is empty
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.collection('categories').insertMany(DEFAULT_CATEGORIES.map(c => ({ ...c, createdAt: new Date().toISOString() })) as any);
      return NextResponse.json({ success: true, categories: DEFAULT_CATEGORIES });
    }

    return NextResponse.json({ success: true, categories: DEFAULT_CATEGORIES });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ success: false, message: 'Failed to load categories' }, { status: 500 });
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
    const { name, nameBn, slug } = body;

    if (!name?.trim()) {
      return NextResponse.json({ success: false, message: 'ক্যাটাগরির নাম দিন।' }, { status: 400 });
    }

    const autoSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newCat: CategoryItem = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      nameBn: (nameBn || name).trim(),
      slug: autoSlug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const db = await getDb();
    if (db) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.collection('categories').insertOne(newCat as any);
    }

    return NextResponse.json({ success: true, message: 'ক্যাটাগরি সফলভাবে যুক্ত হয়েছে', category: newCat });
  } catch (error) {
    console.error('Error adding category:', error);
    return NextResponse.json({ success: false, message: 'Failed to add category' }, { status: 500 });
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
    if (db) {
      let filter: Record<string, unknown> = { id: catId };
      if (ObjectId.isValid(catId)) {
        filter = { $or: [{ _id: new ObjectId(catId) }, { id: catId }] };
      }
      await db.collection('categories').deleteOne(filter);
    }

    return NextResponse.json({ success: true, message: 'ক্যাটাগরি মুছে ফেলা হয়েছে' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete category' }, { status: 500 });
  }
}
