import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserByPhoneNumber, 
  verifyPassword, 
  updateLastLogin, 
  verifyActivationCode, 
  useActivationCode as markActivationCodeAsUsed
} from '@/lib/db';
import { loginSchema } from '@/lib/validation';
import { 
  checkLoginRateLimit, 
  recordLoginFailure, 
  resetLoginFailures, 
  setAuthSession 
} from '@/lib/auth';

// 登录接口
export async function POST(request: NextRequest) {
  try {
    console.log('开始处理登录请求');
    // 解析请求体
    const body = await request.json();
    console.log('登录请求数据:', {...body, password: '******'});
    
    // 验证请求数据
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      console.error('登录数据验证失败:', validation.error.format());
      return NextResponse.json(
        { error: '表单数据无效', details: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { phoneNumber, password, activationCode } = validation.data;
    
    // 检查登录频率限制
    const rateLimit = checkLoginRateLimit(phoneNumber);
    if (!rateLimit.allowed) {
      console.warn(`登录频率限制: ${phoneNumber} 尝试次数过多`);
      return NextResponse.json(
        { 
          error: '登录尝试次数过多', 
          lockoutMinutes: rateLimit.remainingMinutes 
        },
        { status: 429 }
      );
    }
    
    // 获取用户
    console.log('获取用户信息:', phoneNumber);
    const user = await getUserByPhoneNumber(phoneNumber);
    if (!user) {
      console.warn(`登录失败: 用户不存在 ${phoneNumber}`);
      // 记录失败（即使用户不存在，也记录以防止用户名枚举攻击）
      recordLoginFailure(phoneNumber);
      return NextResponse.json(
        { error: '手机号或密码错误' },
        { status: 401 }
      );
    }
    
    console.log(`找到用户: ${user.id}, 验证密码`);
    // 验证密码
    const isPasswordValid = await verifyPassword(user, password);
    if (!isPasswordValid) {
      console.warn(`登录失败: 密码错误 ${phoneNumber}`);
      // 记录失败
      recordLoginFailure(phoneNumber);
      return NextResponse.json(
        { error: '手机号或密码错误' },
        { status: 401 }
      );
    }
    
    // 如果需要激活码但未提供
    if (user.isActive === false && !activationCode) {
      console.warn(`登录失败: 需要激活码 ${phoneNumber}`);
      return NextResponse.json(
        { error: '需要激活码', requireActivationCode: true },
        { status: 403 }
      );
    }
    
    // 验证激活码（如果需要）
    if (user.isActive === false && activationCode) {
      console.log(`验证激活码: ${activationCode}`);
      const isActivationCodeValid = await verifyActivationCode(activationCode);
      if (!isActivationCodeValid) {
        console.warn(`登录失败: 激活码无效 ${activationCode}`);
        return NextResponse.json(
          { error: '激活码无效或已过期' },
          { status: 400 }
        );
      }
      
      // 使用激活码
      await markActivationCodeAsUsed(activationCode);
      console.log(`激活码使用成功: ${activationCode}`);
      
      // 激活用户账号（这部分需要实现账号激活的相关功能）
      // TODO: 实现账号激活
    }
    
    // 更新最后登录时间
    try {
      console.log(`更新用户最后登录时间: ${user.id}`);
      const updateResult = await updateLastLogin(user.id);
      if (!updateResult) {
        console.warn(`更新最后登录时间失败，但将继续登录流程`);
      }
    } catch (error) {
      console.error('更新最后登录时间失败:', error);
      // 不要因为这个错误中断登录流程
    }
    
    // 重置登录失败计数
    resetLoginFailures(phoneNumber);
    
    // 创建响应
    console.log(`登录成功: ${user.id}`);
    const response = NextResponse.json(
      { 
        success: true, 
        message: '登录成功',
        userId: user.id
      },
      { status: 200 }
    );
    
    // 设置认证会话
    try {
      console.log(`设置认证会话: ${user.id}`);
      await setAuthSession(user.id, response);
    } catch (error) {
      console.error('设置认证会话失败:', error);
      // 不要因为这个错误中断登录流程，但记录下来
    }
    
    return response;
    
  } catch (error) {
    console.error('登录处理过程中发生错误:', error);
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
} 