import { NextRequest, NextResponse } from 'next/server';
import { getProjectById } from '@/lib/db';

// 获取项目详情 - 公开访问API，不需要登录
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('公开API获取项目详情，项目ID:', params.id);
    
    // 从数据库获取项目
    const project = await getProjectById(params.id);
    
    if (!project) {
      return NextResponse.json(
        { error: '项目不存在' },
        { status: 404 }
      );
    }
    
    // 返回项目数据，不检查用户身份
    return NextResponse.json({ project });
  } catch (error) {
    console.error('获取项目详情失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 