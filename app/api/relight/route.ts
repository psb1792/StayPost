import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the multipart form data
    const formData = await request.formData();
    
    const imageFile = formData.get('image_file') as File;
    const prompt = formData.get('prompt') as string;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'No prompt provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are supported.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Prepare form data for ClipDrop API
    const clipdropFormData = new FormData();
    clipdropFormData.append('image_file', imageFile);
    clipdropFormData.append('prompt', prompt);

    // Call ClipDrop Relight API
    const clipdropResponse = await fetch('https://clipdrop-api.co/relight/v1', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLIPDROP_API_KEY || '',
      },
      body: clipdropFormData,
    });

    if (!clipdropResponse.ok) {
      const errorText = await clipdropResponse.text();
      console.error('ClipDrop API Error:', errorText);
      
      return NextResponse.json(
        {
          error: 'ClipDrop API request failed',
          details: errorText,
          status: clipdropResponse.status
        },
        { status: clipdropResponse.status }
      );
    }

    // Get the relighted image as buffer
    const relightedImageBuffer = await clipdropResponse.arrayBuffer();
    
    // Return the relighted image with appropriate headers
    return new NextResponse(relightedImageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': relightedImageBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=31536000',
      },
    });

  } catch (error) {
    console.error('Relight API Error:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}