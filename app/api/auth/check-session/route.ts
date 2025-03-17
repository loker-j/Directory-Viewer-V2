import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// 检查会话接口
export async function GET(request: NextRequest) {
  try {
    const userInfo = await getCurrentUser(request);
    
    if (!userInfo || !userInfo.user) {
      return NextResponse.json(
        { authenticated: false, message: '未登录' },
        { status: 401 }
      );
    }
    
    // 返回用户信息，不包含敏感数据
    return NextResponse.json(
      { 
        authenticated: true, 
        user: {
          id: userInfo.user.id,
          phoneNumber: userInfo.user.phoneNumber,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('会话检查失败:', error);
    return NextResponse.json(
      { error: '会话检查失败，请稍后重试' },
      { status: 500 }
    );
  }
} 