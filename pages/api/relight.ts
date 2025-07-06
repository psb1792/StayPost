import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';

// Disable body parsing to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

interface RelightRequest {
  image_file: formidable.File;
  prompt: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the multipart form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    
    // Extract image file and prompt
    const imageFile = Array.isArray(files.image_file) 
      ? files.image_file[0] 
      : files.image_file;
    
    const prompt = Array.isArray(fields.prompt) 
      ? fields.prompt[0] 
      : fields.prompt;

    if (!imageFile) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'No prompt provided' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(imageFile.mimetype || '')) {
      return res.status(400).json({ 
        error: 'Invalid file type. Only JPEG, PNG, and WebP are supported.' 
      });
    }

    // Prepare form data for ClipDrop API
    const formData = new FormData();
    
    // Read the file and create a blob
    const fileBuffer = fs.readFileSync(imageFile.filepath);
    const blob = new Blob([fileBuffer], { type: imageFile.mimetype || 'image/jpeg' });
    
    formData.append('image_file', blob, imageFile.originalFilename || 'image.jpg');
    formData.append('prompt', prompt);

    // Call ClipDrop Relight API
    const clipdropResponse = await fetch('https://clipdrop-api.co/relight/v1', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLIPDROP_API_KEY || '',
      },
      body: formData,
    });

    // Clean up temporary file
    fs.unlinkSync(imageFile.filepath);

    if (!clipdropResponse.ok) {
      const errorText = await clipdropResponse.text();
      console.error('ClipDrop API Error:', errorText);
      
      return res.status(clipdropResponse.status).json({
        error: 'ClipDrop API request failed',
        details: errorText,
        status: clipdropResponse.status
      });
    }

    // Get the relighted image as buffer
    const relightedImageBuffer = await clipdropResponse.arrayBuffer();
    
    // Set appropriate headers for image response
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Length', relightedImageBuffer.byteLength);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    // Send the relighted image
    res.status(200).send(Buffer.from(relightedImageBuffer));

  } catch (error) {
    console.error('Relight API Error:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}