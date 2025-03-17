import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifySession, getUserById, createSession, deleteSession } from './db';

// 密钥（从环境变量中获取）
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'login_system_secret_key_7x9z2q8w4e1r5t3y');
// 会话cookie名称
const SESSION_COOKIE_NAME = 'auth_session';

// 创建JWT令牌
export async function createToken(userId: string, expiresIn: string = '24h'): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
  
  return token;
}

// 验证JWT令牌
export async function verifyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.userId as string;
  } catch (error) {
    console.error('令牌验证失败:', error);
    return null;
  }
}

// 设置认证会话
export async function setAuthSession(userId: string, response: NextResponse): Promise<void> {
  try {
    console.log(`开始创建会话: ${userId}`);
    // 创建会话
    const session = await createSession(userId);
    console.log(`会话创建成功: ${session.id}`);
    
    // 设置会话cookie
    console.log('设置会话cookie');
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: session.id,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // 开发环境不需要secure
      sameSite: 'lax', // 使用lax而不是strict，允许跨站点请求时保留cookie
      maxAge: 60 * 60 * 24, // 24小时
      path: '/',
    });
    
    console.log(`会话cookie设置完成: ${SESSION_COOKIE_NAME}=${session.id}`);
  } catch (error) {
    console.error('设置认证会话时发生错误:', error);
    throw error;
  }
}

// 销毁认证会话
export async function destroyAuthSession(response: NextResponse): Promise<void> {
  try {
    // 不再从cookieStore获取sessionId
    // 只负责清除响应中的cookie
    console.log('清除会话cookie');
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    console.log('会话cookie已清除');
  } catch (error) {
    console.error('销毁会话时发生错误:', error);
    // 继续执行，确保cookie被清除
  }
}

// 获取当前认证用户
export async function getCurrentUser(request: NextRequest): Promise<{user: any, sessionId: string | undefined} | null> {
  // 从cookie中获取会话ID
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  
  if (!sessionId) {
    return null;
  }
  
  // 验证会话
  const userId = await verifySession(sessionId);
  
  if (!userId) {
    return null;
  }
  
  // 获取用户信息
  const user = await getUserById(userId);
  
  if (!user) {
    return null;
  }
  
  // 不返回密码哈希等敏感信息
  const { passwordHash, ...safeUser } = user;
  
  return {
    user: safeUser,
    sessionId
  };
}

// 登录失败计数器（防暴力破解）
const loginFailures: Record<string, { count: number, lastAttempt: number }> = {};

// 登录失败限制时间（分钟）
const LOGIN_LOCKOUT_MINUTES = 15;
// 最大失败次数
const MAX_LOGIN_ATTEMPTS = 5;

// 检查登录失败限制
export function checkLoginRateLimit(phoneNumber: string): { allowed: boolean, remainingMinutes?: number } {
  const now = Date.now();
  const failure = loginFailures[phoneNumber];
  
  // 如果没有失败记录或已重置
  if (!failure) {
    return { allowed: true };
  }
  
  // 检查是否已超过限制时间
  const minutesSinceLastAttempt = (now - failure.lastAttempt) / (1000 * 60);
  
  if (minutesSinceLastAttempt >= LOGIN_LOCKOUT_MINUTES) {
    // 重置失败计数
    delete loginFailures[phoneNumber];
    return { allowed: true };
  }
  
  // 检查是否达到最大失败次数
  if (failure.count >= MAX_LOGIN_ATTEMPTS) {
    const remainingMinutes = Math.ceil(LOGIN_LOCKOUT_MINUTES - minutesSinceLastAttempt);
    return { 
      allowed: false, 
      remainingMinutes 
    };
  }
  
  return { allowed: true };
}

// 记录登录失败
export function recordLoginFailure(phoneNumber: string): void {
  const now = Date.now();
  
  if (!loginFailures[phoneNumber]) {
    loginFailures[phoneNumber] = { count: 1, lastAttempt: now };
  } else {
    loginFailures[phoneNumber].count += 1;
    loginFailures[phoneNumber].lastAttempt = now;
  }
}

// 重置登录失败计数
export function resetLoginFailures(phoneNumber: string): void {
  delete loginFailures[phoneNumber];
} 