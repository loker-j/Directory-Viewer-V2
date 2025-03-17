import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordSchema } from '@/lib/validation';
import { getUserByPhoneNumber } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { put } from '@vercel/blob';

// 密码重置接口
export async function POST(request: NextRequest) {
  try {
    console.log('开始处理密码重置请求');
    // 解析请求体
    const body = await request.json();
    console.log('密码重置请求数据:', {...body, newPassword: '******', confirmPassword: '******'});
    
    // 验证请求数据
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      console.error('重置密码数据验证失败:', validation.error.format());
      return NextResponse.json(
        { error: '表单数据无效', details: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { phoneNumber, newPassword } = validation.data;
    
    // 获取用户
    console.log('获取用户信息:', phoneNumber);
    const user = await getUserByPhoneNumber(phoneNumber);
    if (!user) {
      // 为安全起见，不应明确表示用户不存在
      console.warn(`重置密码失败: 用户不存在 ${phoneNumber}`);
      return NextResponse.json(
        { error: '密码重置失败，请检查手机号是否正确' },
        { status: 400 }
      );
    }
    
    // 生成新的密码哈希
    console.log(`为用户 ${user.id} 生成新密码哈希`);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    
    // 更新用户密码
    user.passwordHash = passwordHash;
    
    // 存储更新后的用户信息
    const USER_PREFIX = 'users/';
    const blobName = `${USER_PREFIX}${user.id}.json`;
    console.log(`更新用户数据, Blob: ${blobName}`);
    
    try {
      const result = await put(blobName, JSON.stringify(user), {
        contentType: 'application/json',
        access: 'public'
      });
      console.log('用户数据更新成功, URL:', result.url);
    } catch (error) {
      console.error('更新用户数据失败:', error);
      throw new Error('密码重置失败，请稍后重试');
    }
    
    return NextResponse.json(
      { success: true, message: '密码重置成功' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('密码重置过程中发生错误:', error);
    return NextResponse.json(
      { error: '密码重置失败，请稍后重试' },
      { status: 500 }
    );
  }
} 