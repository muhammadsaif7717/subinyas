import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Configure Cloudinary
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If Cloudinary is configured with credentials
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
        const isVideo = file.type.startsWith('video/');
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'subinyas/reviews',
            resource_type: isVideo ? 'video' : 'image',
          },
          (error, result) => {
            if (error || !result) reject(error || new Error('Upload failed'));
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });

      return NextResponse.json({
        success: true,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      });
    }

    // Fallback: Convert to base64 Data URI if Cloudinary is not configured yet
    const mime = file.type || 'image/jpeg';
    const base64 = buffer.toString('base64');
    const dataUri = `data:${mime};base64,${base64}`;

    return NextResponse.json({
      success: true,
      url: dataUri,
      isLocalFallback: true,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ success: false, message: 'File upload failed' }, { status: 500 });
  }
}
