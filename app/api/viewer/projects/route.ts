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
    console.log('目录数据已存储，标识符:', identifier);
    
    return NextResponse.json({ 
      success: true, 
      identifier 
    });
  } catch (error) {
    console.error('处理目录数据失败:', error);
    return NextResponse.json(
      { success: false, error: '处理目录失败' },
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
        { success: false, error: '未提供标识符' },
        { status: 400 }
      );
    }
    
    console.log('获取目录数据，标识符:', identifier);
    const data = await retrieveDirectoryData(identifier);
    
    if (!data) {
      return NextResponse.json(
        { success: false, error: '未找到目录数据' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data 
    });
  } catch (error) {
    console.error('获取目录数据失败:', error);
    return NextResponse.json(
      { success: false, error: '获取目录失败' },
      { status: 500 }
    );
  }
} 