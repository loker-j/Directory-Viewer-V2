import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './lib/db';

const SESSION_COOKIE_NAME = 'auth_session';

// 中间件函数
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`中间件处理请求: ${pathname}`);
  
  // 如果是 /viewer 路径，检查是否登录
  if (pathname === '/viewer' || pathname.startsWith('/viewer/')) {
    console.log('检测到viewer路径，验证登录状态');
    
    // 获取会话ID
    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    
    if (!sessionId) {
      console.log('无会话ID，重定向到登录页面');
      return redirectToLogin(request);
    }
    
    // 验证会话
    try {
      const userId = await verifySession(sessionId);
      
      if (!userId) {
        console.log('会话无效，重定向到登录页面');
        const response = NextResponse.redirect(new URL('/auth/login', request.url));
        response.cookies.delete(SESSION_COOKIE_NAME);
        return response;
      }
      
      console.log(`用户已登录 (ID: ${userId})，允许访问`);
      return NextResponse.next();
    } catch (error) {
      console.error('验证会话失败:', error);
      return redirectToLogin(request);
    }
  }
  
  // 不是 /viewer 路径，直接放行
  return NextResponse.next();
}

// 重定向到登录页面
function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/auth/login';
  url.search = `?redirect=${encodeURIComponent(request.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

// 指定中间件匹配路径，只匹配 /viewer 开头的路径
export const config = {
  matcher: ['/viewer', '/viewer/:path*']
}; 