import { NextRequest, NextResponse } from 'next/server';
import { destroyAuthSession } from '@/lib/auth';
import { deleteSession } from '@/lib/db';

const SESSION_COOKIE_NAME = 'auth_session';

// 登出接口
export async function POST(request: NextRequest) {
  try {
    console.log('执行登出操作');
    
    // 获取会话ID
    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (sessionId) {
      console.log(`删除会话: ${sessionId}`);
      try {
        await deleteSession(sessionId);
      } catch (error) {
        console.error('删除会话失败:', error);
      }
    }
    
    const response = NextResponse.json(
      { success: true, message: '登出成功' },
      { status: 200 }
    );
    
    // 销毁会话（主要是清除cookie）
    await destroyAuthSession(response);
    
    // 确保cookie被清除
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      path: '/',
      maxAge: 0,
    });
    
    console.log('登出完成，会话已销毁');
    return response;
  } catch (error) {
    console.error('登出失败:', error);
    return NextResponse.json(
      { error: '登出失败，请稍后重试' },
      { status: 500 }
    );
  }
} 