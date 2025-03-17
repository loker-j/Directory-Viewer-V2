import { NextRequest, NextResponse } from 'next/server';
import { storeDirectoryData, retrieveDirectoryData, DirectoryData } from '@/lib/storage';
import { z } from 'zod';

const directorySchema = z.object({
  name: z.string(),
  size: z.number(),
  itemCount: z.number(),
  data: z.any()
}).strict();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = directorySchema.parse(body) as DirectoryData;
    
    const identifier = await storeDirectoryData(validatedData);
    
    return NextResponse.json({ 
      success: true, 
      identifier 
    });
  } catch (error) {
    console.error('Error processing directory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process directory' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const identifier = searchParams.get('identifier');
    
    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'No identifier provided' },
        { status: 400 }
      );
    }
    
    const data = await retrieveDirectoryData(identifier);
    
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Directory not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data 
    });
  } catch (error) {
    console.error('Error retrieving directory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve directory' },
      { status: 500 }
    );
  }
}