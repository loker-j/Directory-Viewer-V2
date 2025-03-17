import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// 模拟数据
const mockProjects = [
  {
    id: '1',
    name: '我的文档目录',
    createdAt: '2023-03-16T12:00:00Z',
    shortUrl: 'https://mlckq.top/s/abc123',
    size: 1024 * 1024 * 2.5, // 2.5MB
    itemCount: 156,
    data: {
      // 目录结构数据
      name: '根目录',
      type: 'directory',
      children: [
        {
          name: '文档',
          type: 'directory',
          children: [
            { name: '报告.docx', type: 'file', size: 1024 * 512 },
            { name: '笔记.txt', type: 'file', size: 1024 * 128 }
          ]
        },
        {
          name: '图片',
          type: 'directory',
          children: [
            { name: '照片1.jpg', type: 'file', size: 1024 * 1024 * 1.2 },
            { name: '照片2.jpg', type: 'file', size: 1024 * 1024 * 0.8 }
          ]
        }
      ]
    }
  },
  {
    id: '2',
    name: '工作项目文件',
    createdAt: '2023-03-15T09:30:00Z',
    shortUrl: 'https://mlckq.top/s/def456',
    size: 1024 * 1024 * 5.8, // 5.8MB
    itemCount: 230,
    data: {
      // 目录结构数据
      name: '根目录',
      type: 'directory',
      children: [
        {
          name: '源代码',
          type: 'directory',
          children: [
            { name: 'index.js', type: 'file', size: 1024 * 256 },
            { name: 'styles.css', type: 'file', size: 1024 * 128 }
          ]
        },
        {
          name: '资源',
          type: 'directory',
          children: [
            { name: 'logo.png', type: 'file', size: 1024 * 512 },
            { name: 'banner.jpg', type: 'file', size: 1024 * 1024 * 0.5 }
          ]
        }
      ]
    }
  },
  {
    id: '3',
    name: '学习资料',
    createdAt: '2023-03-10T14:20:00Z',
    shortUrl: 'https://mlckq.top/s/ghi789',
    size: 1024 * 1024 * 10.3, // 10.3MB
    itemCount: 312,
    data: {
      // 目录结构数据
      name: '根目录',
      type: 'directory',
      children: [
        {
          name: '课程',
          type: 'directory',
          children: [
            { name: '数学.pdf', type: 'file', size: 1024 * 1024 * 2.5 },
            { name: '物理.pdf', type: 'file', size: 1024 * 1024 * 3.2 }
          ]
        },
        {
          name: '练习',
          type: 'directory',
          children: [
            { name: '习题1.docx', type: 'file', size: 1024 * 768 },
            { name: '习题2.docx', type: 'file', size: 1024 * 896 }
          ]
        }
      ]
    }
  }
];

// 获取项目详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 获取当前登录用户
  const currentUser = await getCurrentUser(request);
  
  if (!currentUser || !currentUser.user) {
    return NextResponse.json(
      { error: '用户未登录或会话已过期' },
      { status: 401 }
    );
  }
  
  try {
    // 查找项目
    const project = mockProjects.find(p => p.id === params.id);
    
    if (!project) {
      return NextResponse.json(
        { error: '项目不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ project });
  } catch (error) {
    console.error('获取项目详情失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 更新项目名称
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 获取当前登录用户
  const currentUser = await getCurrentUser(request);
  
  if (!currentUser || !currentUser.user) {
    return NextResponse.json(
      { error: '用户未登录或会话已过期' },
      { status: 401 }
    );
  }
  
  try {
    // 获取请求体
    const body = await request.json();
    
    // 验证请求体
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json(
        { error: '项目名称不能为空' },
        { status: 400 }
      );
    }
    
    // 查找项目
    const projectIndex = mockProjects.findIndex(p => p.id === params.id);
    
    if (projectIndex === -1) {
      return NextResponse.json(
        { error: '项目不存在' },
        { status: 404 }
      );
    }
    
    // 更新项目名称
    mockProjects[projectIndex].name = body.name.trim();
    
    return NextResponse.json({ 
      success: true, 
      project: {
        id: mockProjects[projectIndex].id,
        name: mockProjects[projectIndex].name,
        shortUrl: mockProjects[projectIndex].shortUrl
      }
    });
  } catch (error) {
    console.error('更新项目名称失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 