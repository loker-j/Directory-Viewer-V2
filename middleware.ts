import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './lib/db';

const SESSION_COOKIE_NAME = 'auth_session';

// 公开路由列表
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/reset-password',
  '/api/projects',
  '/api/short-url',        // 添加短链接API路径
  '/projects',             // 添加项目页面路径
  '/projects/[id]',        // 添加项目详情页路径
  '/s',                   // 添加短链接重定向基础路径
];

// 验证session并重定向至登录页面的函数
async function validateSessionOrRedirect(request: NextRequest) {
  // 获取会话ID
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  console.log(`会话ID: ${sessionId ? '存在' : '不存在'}`);
  
  // 如果没有会话ID，重定向到登录页面
  if (!sessionId) {
    console.log('没有会话ID，重定向到登录页面');
    return redirectToLogin(request);
  }
  
  // 验证会话
  try {
    const userId = await verifySession(sessionId);
    if (!userId) {
      console.log('会话无效，重定向到登录页面');
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: '',
        path: '/',
        maxAge: 0,
      });
      return response;
    }
    
    console.log(`用户ID: ${userId}，允许访问`);
    return NextResponse.next();
  } catch (error) {
    console.error('会话验证发生错误:', error);
    return redirectToLogin(request);
  }
}

// 中间件函数
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`处理中间件请求: ${pathname}`);
  
  // 特别处理: 明确拦截/viewer相关的所有路径
  if (pathname === '/viewer' || pathname.startsWith('/viewer/')) {
    console.log(`特别处理: 检测到viewer路径 ${pathname}`);
    return validateSessionOrRedirect(request);
  }
  
  // 检查是否是公开路由
  if (
    publicRoutes.some(route => pathname === route) || 
    pathname.startsWith('/api/public') ||
    pathname.startsWith('/api/projects') ||
    pathname.startsWith('/api/short-url') ||
    pathname.startsWith('/projects/') ||
    pathname.startsWith('/s/') ||
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico')
  ) {
    console.log(`公开路由: ${pathname}，不需要验证`);
    return NextResponse.next();
  }
  
  // 其他所有路由都需要验证
  return validateSessionOrRedirect(request);
}

// 重定向到登录页面
function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/auth/login';
  url.search = `?redirect=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
  return NextResponse.redirect(url);
}

// 配置中间件匹配路径 - 确保包含/viewer路径
export const config = {
  matcher: [
    // 确保/viewer路径被匹配
    '/viewer', 
    '/viewer/:path*',
    // 匹配所有路径，除了静态资源
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 