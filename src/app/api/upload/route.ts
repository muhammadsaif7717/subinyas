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
    const contentType = request.headers.get('content-type') || '';

    // Handle JSON payload (e.g. { url: 'https://...', base64: 'data:image/...' })
    if (contentType.includes('application/json')) {
      const jsonBody = await request.json();
      const imageUrl = jsonBody.url;
      const base64Data = jsonBody.base64;

      if (!imageUrl && !base64Data) {
        return NextResponse.json(
          { success: false, message: 'Please provide an image url or base64 data' },
          { status: 400 }
        );
      }

      if (
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      ) {
        const uploadSource = imageUrl || base64Data;
        const uploadResult = await cloudinary.uploader.upload(uploadSource, {
          folder: 'subinyas/products',
          resource_type: 'auto',
        });

        return NextResponse.json({
          success: true,
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        });
      }

      // Fallback if Cloudinary credentials are not set
      return NextResponse.json({
        success: true,
        url: imageUrl || base64Data,
        isLocalFallback: true,
      });
    }

    // Handle Multipart FormData (files or clipboard blobs)
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const urlFromForm = formData.get('url') as string | null;

    if (urlFromForm) {
      if (
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      ) {
        const uploadResult = await cloudinary.uploader.upload(urlFromForm, {
          folder: 'subinyas/products',
          resource_type: 'auto',
        });

        return NextResponse.json({
          success: true,
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        });
      }

      return NextResponse.json({
        success: true,
        url: urlFromForm,
        isLocalFallback: true,
      });
    }

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file or URL provided' }, { status: 400 });
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
            folder: 'subinyas/products',
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
