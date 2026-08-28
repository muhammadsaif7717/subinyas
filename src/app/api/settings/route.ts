import { NextRequest, NextResponse } from 'next/server';
import { getStoreSettings, updateStoreSettings } from '@/lib/data-store';

export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, message: 'সেটিংস লোড করতে সমস্যা হয়েছে' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = await updateStoreSettings(body);
    return NextResponse.json({ success: true, message: 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে', settings: updated });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ success: false, message: 'সেটিংস আপডেট ব্যর্থ হয়েছে' }, { status: 500 });
  }
}
