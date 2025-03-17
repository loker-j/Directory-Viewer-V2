import { NextRequest, NextResponse } from 'next/server';
import { createInvitationCode } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// 生成邀请码接口
export async function POST(request: NextRequest) {
  try {
    // 验证用户是否已登录
    const auth = await getCurrentUser(request);
    if (!auth) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }
    
    // 获取请求参数（可选）
    const body = await request.json().catch(() => ({}));
    const maxUsage = body.maxUsage || 5; // 默认5次使用次数
    const expiresInDays = body.expiresInDays || undefined; // 默认不过期
    
    // 生成邀请码
    const invitationCode = await createInvitationCode(
      auth.user.id,
      maxUsage,
      expiresInDays
    );
    
    return NextResponse.json({
      success: true,
      code: invitationCode.code,
      maxUsage: invitationCode.maxUsage,
      expiresAt: invitationCode.expiresAt
    });
    
  } catch (error) {
    console.error('生成邀请码失败:', error);
    return NextResponse.json(
      { error: '生成邀请码失败，请稍后重试' },
      { status: 500 }
    );
  }
} 