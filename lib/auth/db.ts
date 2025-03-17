import { put, list, del } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { User, ActivationCode, InvitationCode, Session } from '../types';

// 用户集合前缀
const USER_PREFIX = 'users/';
// 激活码集合前缀
const ACTIVATION_CODE_PREFIX = 'activation-codes/';
// 邀请码集合前缀
const INVITATION_CODE_PREFIX = 'invitation-codes/';
// 会话集合前缀
const SESSION_PREFIX = 'sessions/';

// 创建用户
export async function createUser(phoneNumber: string, password: string, invitedBy?: string): Promise<User> {
  console.log(`开始创建用户，手机号: ${phoneNumber}`);
  
  // 检查手机号是否已注册
  const existingUser = await getUserByPhoneNumber(phoneNumber);
  if (existingUser) {
    console.error(`手机号 ${phoneNumber} 已注册`);
    throw new Error('该手机号已注册');
  }

  // 密码加密
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  console.log('密码加密完成');

  const now = new Date().toISOString();
  const userId = uuidv4();
  console.log(`生成用户ID: ${userId}`);
  
  const user: User = {
    id: userId,
    phoneNumber,
    passwordHash,
    registeredAt: now,
    lastLoginAt: null,
    invitedBy,
    isActive: true,
  };

  // 存储用户信息
  const blobName = `${USER_PREFIX}${user.id}.json`;
  console.log('创建用户，保存到Blob:', blobName);
  try {
    const result = await put(blobName, JSON.stringify(user), {
      contentType: 'application/json',
      access: 'public'
    });
    console.log('用户创建成功，Blob URL:', result.url);
  } catch (error) {
    console.error('保存用户数据失败:', error);
    throw new Error('创建用户失败，请稍后再试');
  }

  // 如果有邀请码，更新使用次数
  if (invitedBy) {
    try {
      await updateInvitationCodeUsage(invitedBy);
      console.log(`更新邀请码 ${invitedBy} 使用次数成功`);
    } catch (error) {
      console.error(`更新邀请码使用次数失败:`, error);
      // 不影响用户注册，所以只记录错误
    }
  }

  return user;
}

// 通过手机号获取用户
export async function getUserByPhoneNumber(phoneNumber: string): Promise<User | null> {
  try {
    console.log('开始通过手机号查找用户:', phoneNumber);
    // 获取所有用户
    const { blobs } = await list({ prefix: USER_PREFIX });
    console.log(`获取到 ${blobs.length} 条用户记录`);
    
    if (blobs.length === 0) {
      console.log('没有找到任何用户记录');
      return null;
    }
    
    for (const blob of blobs) {
      try {
        console.log('处理用户 Blob:', blob.url);
        const response = await fetch(blob.url);
        if (!response.ok) {
          console.error(`获取用户数据失败, URL: ${blob.url}, 状态码: ${response.status}`);
          continue;
        }
        
        const userData = await response.json() as User;
        console.log('Blob 数据:', userData);
        
        if (userData.phoneNumber === phoneNumber) {
          console.log('找到匹配的用户手机号:', phoneNumber);
          return userData;
        }
      } catch (error) {
        console.error(`读取Blob ${blob.url} 失败:`, error);
      }
    }
    
    console.log('未找到手机号匹配的用户:', phoneNumber);
    return null;
  } catch (error) {
    console.error('通过手机号获取用户失败:', error);
    return null;
  }
}

// 通过ID获取用户
export async function getUserById(userId: string): Promise<User | null> {
  try {
    // 获取所有用户
    console.log('获取用户列表');
    const { blobs } = await list({ prefix: USER_PREFIX });
    console.log(`找到 ${blobs.length} 个用户记录`);
    
    for (const blob of blobs) {
      console.log('检查Blob:', blob.url);
      try {
        // 从URL提取用户ID
        const urlParts = blob.url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const blobUserId = fileName.replace('.json', '').replace(`${USER_PREFIX}`, '');
        
        if (blobUserId === userId) {
          console.log('找到匹配的用户ID:', userId);
          const response = await fetch(blob.url);
          if (!response.ok) {
            console.error('获取用户数据失败, 状态码:', response.status);
            continue;
          }
          
          const userData = await response.json() as User;
          console.log('成功获取用户数据');
          return userData;
        }
      } catch (error) {
        console.error(`处理Blob ${blob.url} 失败:`, error);
      }
    }
    
    console.log('未找到用户ID:', userId);
    return null;
  } catch (error) {
    console.error('获取用户失败:', error);
    return null;
  }
}

// 验证用户密码
export async function verifyPassword(user: User, password: string): Promise<boolean> {
  return await bcrypt.compare(password, user.passwordHash);
}

// 更新用户最后登录时间
export async function updateLastLogin(userId: string): Promise<void> {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('用户不存在');
  }

  user.lastLoginAt = new Date().toISOString();

  const blobName = `${USER_PREFIX}${user.id}.json`;
  await put(blobName, JSON.stringify(user), {
    contentType: 'application/json',
    access: 'public'
  });
}

// 创建激活码
export async function createActivationCode(maxUsage: number = 1, expiresInHours: number = 24): Promise<ActivationCode> {
  const code = generateRandomCode(8);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000).toISOString();

  const activationCode: ActivationCode = {
    code,
    isUsed: false,
    usageCount: 0,
    maxUsage,
    expiresAt,
    createdAt: now.toISOString(),
  };

  const blobName = `${ACTIVATION_CODE_PREFIX}${code}.json`;
  await put(blobName, JSON.stringify(activationCode), {
    contentType: 'application/json',
    access: 'public'
  });

  return activationCode;
}

// 验证激活码
export async function verifyActivationCode(code: string): Promise<boolean> {
  try {
    const blobName = `${ACTIVATION_CODE_PREFIX}${code}.json`;
    const blobUrl = `${process.env.NEXT_PUBLIC_BLOB_PUBLIC_URL}/${blobName}`;
    const response = await fetch(blobUrl);
    if (!response.ok) return false;
    
    const activationCode = await response.json() as ActivationCode;
    const now = new Date();
    const expiresAt = new Date(activationCode.expiresAt);
    
    // 检查是否过期或已用完
    if (expiresAt < now || activationCode.usageCount >= activationCode.maxUsage) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('验证激活码失败:', error);
    return false;
  }
}

// 使用激活码
export async function useActivationCode(code: string): Promise<boolean> {
  try {
    const blobName = `${ACTIVATION_CODE_PREFIX}${code}.json`;
    const blobUrl = `${process.env.NEXT_PUBLIC_BLOB_PUBLIC_URL}/${blobName}`;
    const response = await fetch(blobUrl);
    if (!response.ok) return false;
    
    const activationCode = await response.json() as ActivationCode;
    const now = new Date();
    const expiresAt = new Date(activationCode.expiresAt);
    
    // 检查是否过期或已用完
    if (expiresAt < now || activationCode.usageCount >= activationCode.maxUsage) {
      return false;
    }
    
    // 更新使用次数
    activationCode.usageCount += 1;
    activationCode.isUsed = activationCode.usageCount >= activationCode.maxUsage;
    
    await put(blobName, JSON.stringify(activationCode), {
      contentType: 'application/json',
      access: 'public'
    });
    
    return true;
  } catch (error) {
    console.error('使用激活码失败:', error);
    return false;
  }
}

// 创建邀请码
export async function createInvitationCode(userId: string, maxUsage: number = 5, expiresInDays?: number): Promise<InvitationCode> {
  const code = generateRandomCode(8);
  const now = new Date();
  const expiresAt = expiresInDays
    ? new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const invitationCode: InvitationCode = {
    code,
    userId,
    usageCount: 0,
    maxUsage,
    expiresAt,
    createdAt: now.toISOString(),
  };

  const blobName = `${INVITATION_CODE_PREFIX}${code}.json`;
  await put(blobName, JSON.stringify(invitationCode), {
    contentType: 'application/json',
    access: 'public'
  });

  return invitationCode;
}

// 验证邀请码
export async function verifyInvitationCode(code: string): Promise<string | null> {
  try {
    const blobName = `${INVITATION_CODE_PREFIX}${code}.json`;
    const blobUrl = `${process.env.NEXT_PUBLIC_BLOB_PUBLIC_URL}/${blobName}`;
    const response = await fetch(blobUrl);
    if (!response.ok) return null;
    
    const invitationCode = await response.json() as InvitationCode;
    const now = new Date();
    
    // 检查是否过期
    if (invitationCode.expiresAt && new Date(invitationCode.expiresAt) < now) {
      return null;
    }
    
    // 检查是否达到最大使用次数
    if (invitationCode.usageCount >= invitationCode.maxUsage) {
      return null;
    }
    
    return invitationCode.userId;
  } catch (error) {
    console.error('验证邀请码失败:', error);
    return null;
  }
}

// 更新邀请码使用次数
export async function updateInvitationCodeUsage(code: string): Promise<boolean> {
  try {
    const blobName = `${INVITATION_CODE_PREFIX}${code}.json`;
    const blobUrl = `${process.env.NEXT_PUBLIC_BLOB_PUBLIC_URL}/${blobName}`;
    const response = await fetch(blobUrl);
    if (!response.ok) return false;
    
    const invitationCode = await response.json() as InvitationCode;
    
    // 更新使用次数
    invitationCode.usageCount += 1;
    
    await put(blobName, JSON.stringify(invitationCode), {
      contentType: 'application/json',
      access: 'public'
    });
    
    return true;
  } catch (error) {
    console.error('更新邀请码使用次数失败:', error);
    return false;
  }
}

// 创建会话
export async function createSession(userId: string, expiresInHours: number = 24): Promise<Session> {
  const sessionId = uuidv4();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000).toISOString();

  const session: Session = {
    id: sessionId,
    userId,
    expiresAt,
    createdAt: now.toISOString(),
  };

  const blobName = `${SESSION_PREFIX}${sessionId}.json`;
  await put(blobName, JSON.stringify(session), {
    contentType: 'application/json',
    access: 'public'
  });

  return session;
}

// 验证会话
export async function verifySession(sessionId: string): Promise<string | null> {
  try {
    const blobName = `${SESSION_PREFIX}${sessionId}.json`;
    const blobUrl = `${process.env.NEXT_PUBLIC_BLOB_PUBLIC_URL}/${blobName}`;
    const response = await fetch(blobUrl);
    if (!response.ok) return null;
    
    const session = await response.json() as Session;
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    // 检查会话是否过期
    if (expiresAt < now) {
      await deleteSession(sessionId);
      return null;
    }
    
    return session.userId;
  } catch (error) {
    console.error('验证会话失败:', error);
    return null;
  }
}

// 删除会话
export async function deleteSession(sessionId: string): Promise<void> {
  try {
    const blobName = `${SESSION_PREFIX}${sessionId}.json`;
    await del(blobName);
  } catch (error) {
    console.error('删除会话失败:', error);
  }
}

// 生成随机码
function generateRandomCode(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
} 