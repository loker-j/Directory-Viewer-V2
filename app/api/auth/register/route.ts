import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/db';
import { registerSchema } from '@/lib/validation';
import { verifyInvitationCode } from '@/lib/db';

// 注册接口
export async function POST(request: NextRequest) {
  try {
    console.log('开始处理注册请求');
    // 解析请求体
    const body = await request.json();
    console.log('注册请求数据:', {...body, password: '******', confirmPassword: '******'});
    
    // 验证请求数据
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      console.error('注册数据验证失败:', validation.error.format());
      return NextResponse.json(
        { error: '表单数据无效', details: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { phoneNumber, password, invitationCode } = validation.data;
    console.log(`手机号: ${phoneNumber}, 是否有邀请码: ${!!invitationCode}`);
    
    // 验证邀请码（如果提供）
    if (invitationCode) {
      console.log(`验证邀请码: ${invitationCode}`);
      const userId = await verifyInvitationCode(invitationCode);
      if (!userId) {
        console.warn(`邀请码无效: ${invitationCode}`);
        return NextResponse.json(
          { error: '邀请码无效或已过期' },
          { status: 400 }
        );
      }
      console.log(`邀请码有效，邀请人ID: ${userId}`);
      // 邀请码有效，继续注册流程
    }
    
    // 创建用户
    console.log('开始创建用户:', phoneNumber);
    const user = await createUser(phoneNumber, password, invitationCode);
    console.log(`用户创建成功, ID: ${user.id}`);
    
    // 返回成功响应
    return NextResponse.json(
      { 
        success: true, 
        message: '注册成功', 
        userId: user.id 
      },
      { status: 201 }
    );
    
  } catch (error: unknown) {
    console.error('注册过程中发生错误:', error);
    
    // 处理已存在的用户错误
    if (error instanceof Error && error.message === '该手机号已注册') {
      return NextResponse.json(
        { error: '该手机号已注册' },
        { status: 409 }
      );
    }
    
    // 处理其他错误
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
} 