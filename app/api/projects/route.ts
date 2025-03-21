import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserProjects, saveProject } from '@/lib/db';
import { z } from 'zod';

// 模拟数据，仅在未实现实际数据获取时使用
const mockProjects = [
  {
    id: '1',
    name: '我的文档目录',
    createdAt: '2023-03-16T12:00:00Z',
    size: 1024 * 1024 * 2.5, // 2.5MB
    itemCount: 156,
    shortUrl: 'https://mlckq.top/s/abc123'
  },
  {
    id: '2',
    name: '工作项目文件',
    createdAt: '2023-03-15T09:30:00Z',
    size: 1024 * 1024 * 5.8, // 5.8MB
    itemCount: 230,
    shortUrl: 'https://mlckq.top/s/def456'
  },
  {
    id: '3',
    name: '学习资料',
    createdAt: '2023-03-10T14:20:00Z',
    size: 1024 * 1024 * 10.3, // 10.3MB
    itemCount: 312,
    shortUrl: 'https://mlckq.top/s/ghi789'
  }
];

export async function GET(request: NextRequest) {
  // 获取当前登录用户
  const currentUser = await getCurrentUser(request);
  
  if (!currentUser || !currentUser.user) {
    return NextResponse.json(
      { error: '用户未登录或会话已过期' },
      { status: 401 }
    );
  }
  
  try {
    // 从数据库获取真实的用户项目
    const projects = await getUserProjects(currentUser.user.id);
    console.log(`获取到用户 ${currentUser.user.id} 的项目:`, projects.length || 0);
    
    // 返回真实项目数据
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('处理项目列表请求失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 定义目录数据的验证模式
const directorySchema = z.object({
  name: z.string(),
  size: z.number(),
  itemCount: z.number(),
  data: z.any(),
  shortUrl: z.string().optional(),
  identifier: z.string().optional(),
  publicIdentifier: z.string().optional()
}).strict();

// 处理项目上传
export async function POST(request: NextRequest) {
  // 获取当前登录用户
  const currentUser = await getCurrentUser(request);
  
  if (!currentUser || !currentUser.user) {
    return NextResponse.json(
      { error: '用户未登录或会话已过期' },
      { status: 401 }
    );
  }
  
  try {
    // 解析请求体
    const body = await request.json();
    
    // 验证请求数据
    const validatedData = directorySchema.safeParse(body);
    if (!validatedData.success) {
      console.error('数据验证失败:', validatedData.error);
      return NextResponse.json(
        { success: false, error: '无效的目录数据' },
        { status: 400 }
      );
    }
    
    console.log(`开始保存项目, 用户ID: ${currentUser.user.id}, 项目名称: ${validatedData.data.name}`);
    
    // 保存项目数据
    const result = await saveProject(currentUser.user.id, validatedData.data);
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: '保存项目失败' },
        { status: 500 }
      );
    }
    
    console.log(`项目保存成功, ID: ${result.id}`);
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      identifier: result.id
    });
  } catch (error) {
    console.error('处理项目上传失败:', error);
    return NextResponse.json(
      { success: false, error: '处理项目失败，请稍后重试' },
      { status: 500 }
    );
  }
} 