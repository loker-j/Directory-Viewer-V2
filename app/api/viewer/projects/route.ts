import { NextRequest, NextResponse } from 'next/server';
import { storeDirectoryData, retrieveDirectoryData, DirectoryData } from '@/lib/storage';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { saveProject } from '@/lib/db';

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
    
    // 获取当前用户(如果已登录)
    const currentUser = await getCurrentUser(request);
    const userId = currentUser?.user?.id;
    
    // 存储目录数据
    const identifier = await storeDirectoryData(validatedData);
    console.log('目录数据已存储，标识符:', identifier);
    
    // 如果用户已登录，将项目关联到用户
    if (userId) {
      await saveProject(userId, {
        name: validatedData.name,
        size: validatedData.size,
        itemCount: validatedData.itemCount,
        identifier // 存储原始标识符，便于后续访问
      });
      console.log(`已将项目关联到用户 ${userId}`);
    }
    
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
      console.error('错误: 未提供标识符');
      return NextResponse.json(
        { success: false, error: '未提供标识符' },
        { status: 400 }
      );
    }
    
    console.log('获取目录数据，标识符:', identifier);
    console.log('标识符类型:', typeof identifier);
    console.log('标识符长度:', identifier.length);
    
    try {
      const data = await retrieveDirectoryData(identifier);
      
      if (!data) {
        console.error('未找到目录数据，标识符:', identifier);
        return NextResponse.json(
          { success: false, error: '未找到目录数据' },
          { status: 404 }
        );
      }
      
      console.log('成功获取到目录数据, 名称:', data.name);
      console.log('项目数据大小:', JSON.stringify(data).length);
      
      return NextResponse.json({ 
        success: true, 
        data 
      });
    } catch (error) {
      console.error('获取目录数据时发生错误:', error);
      return NextResponse.json(
        { success: false, error: '获取目录失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('获取目录数据请求处理失败:', error);
    return NextResponse.json(
      { success: false, error: '获取目录失败' },
      { status: 500 }
    );
  }
} 