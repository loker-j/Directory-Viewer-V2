import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// 模拟数据
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
    // 返回模拟数据
    return NextResponse.json({ projects: mockProjects });
  } catch (error) {
    console.error('处理项目列表请求失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 