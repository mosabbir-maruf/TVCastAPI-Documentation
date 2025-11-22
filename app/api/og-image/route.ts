import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// In Next.js, public files are at the project root's public folder
const publicDir = join(process.cwd(), 'public');

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page');

  if (!page) {
    return NextResponse.redirect(new URL('/meta.jpeg', request.url));
  }

  // Map page names to image file names
  const imageMap: Record<string, string> = {
    home: 'meta-home.jpeg',
    testing: 'meta-testing.jpeg',
    maintainer: 'meta-maintainer.jpeg',
  };

  const imageFile = imageMap[page] || `meta-${page}.jpeg`;
  const imagePath = join(publicDir, imageFile);
  const fallbackPath = join(publicDir, 'meta.jpeg');

  // Check if the specific image exists, otherwise use fallback
  let targetPath: string;
  let finalImageFile: string;
  
  if (existsSync(imagePath)) {
    targetPath = imagePath;
    finalImageFile = imageFile;
  } else {
    targetPath = fallbackPath;
    finalImageFile = 'meta.jpeg';
  }

  try {
    const imageBuffer = await readFile(targetPath);
    const contentType = finalImageFile.endsWith('.png') ? 'image/png' : 'image/jpeg';
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, must-revalidate',
      },
    });
  } catch (error) {
    console.error(`Failed to read image: ${targetPath}`, error);
    // If even fallback fails, return 404
    return new NextResponse('Image not found', { status: 404 });
  }
}

