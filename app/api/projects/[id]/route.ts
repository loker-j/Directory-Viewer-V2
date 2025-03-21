import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getProjectById, updateProject, deleteProject } from '@/lib/db';

// 模拟数据（仅供参考，实际使用真实数据）
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
    // 从数据库获取项目
    const project = await getProjectById(params.id);
    
    if (!project) {
      return NextResponse.json(
        { error: '项目不存在' },
        { status: 404 }
      );
    }
    
    // 验证项目所有权
    if (project.user_id !== currentUser.user.id) {
      return NextResponse.json(
        { error: '没有权限访问此项目' },
        { status: 403 }
      );
    }
    
    // 如果项目中没有short_id，可以在此处添加短链接生成逻辑，但这里我们先不实现
    
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
    
    // 获取项目
    const project = await getProjectById(params.id);
    
    if (!project) {
      return NextResponse.json(
        { error: '项目不存在' },
        { status: 404 }
      );
    }
    
    // 验证项目所有权
    if (project.user_id !== currentUser.user.id) {
      return NextResponse.json(
        { error: '没有权限修改此项目' },
        { status: 403 }
      );
    }
    
    // 更新项目
    const updatedProject = await updateProject(params.id, { name: body.name.trim() });
    
    if (!updatedProject) {
      return NextResponse.json(
        { error: '更新项目失败' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      project: {
        id: updatedProject.id,
        name: updatedProject.name,
        shortUrl: updatedProject.shortUrl
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

// 删除项目
export async function DELETE(
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
    // 获取项目
    const project = await getProjectById(params.id);
    
    if (!project) {
      return NextResponse.json(
        { error: '项目不存在' },
        { status: 404 }
      );
    }
    
    // 验证项目所有权
    if (project.user_id !== currentUser.user.id) {
      return NextResponse.json(
        { error: '没有权限删除此项目' },
        { status: 403 }
      );
    }
    
    // 删除项目
    const success = await deleteProject(params.id);
    
    if (!success) {
      return NextResponse.json(
        { error: '删除项目失败' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true
    });
  } catch (error) {
    console.error('删除项目失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 