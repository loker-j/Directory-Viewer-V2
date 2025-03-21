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

// 项目集合前缀
const PROJECT_PREFIX = 'projects/';
const PROJECT_USER_INDEX_PREFIX = 'project-user-index/';

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
    console.log(`开始通过ID查找用户: ${userId}`);
    
    // 获取所有用户
    const { blobs } = await list({ prefix: USER_PREFIX });
    console.log(`找到 ${blobs.length} 个用户记录`);
    
    for (const blob of blobs) {
      console.log('检查Blob:', blob.url);
      try {
        // 直接获取和解析用户数据
        const response = await fetch(blob.url);
        if (!response.ok) {
          console.error('获取用户数据失败, 状态码:', response.status);
          continue;
        }
        
        const userData = await response.json() as User;
        // 直接比较用户ID
        if (userData.id === userId) {
          console.log('找到匹配的用户ID:', userId);
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
export async function updateLastLogin(userId: string): Promise<boolean> {
  try {
    console.log(`开始更新用户最后登录时间: ${userId}`);
    const user = await getUserById(userId);
    
    if (!user) {
      console.warn(`更新登录时间失败：未找到用户ID - ${userId}`);
      return false;
    }

    user.lastLoginAt = new Date().toISOString();
    console.log(`设置用户 ${userId} 的最后登录时间为 ${user.lastLoginAt}`);

    const blobName = `${USER_PREFIX}${user.id}.json`;
    await put(blobName, JSON.stringify(user), {
      contentType: 'application/json',
      access: 'public'
    });
    
    console.log(`成功更新用户 ${userId} 的最后登录时间`);
    return true;
  } catch (error) {
    console.error(`更新用户 ${userId} 的最后登录时间时发生错误:`, error);
    return false;
  }
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
    console.log(`使用激活码: ${code}`);
    
    // 使用list API查找激活码文件
    const { blobs } = await list({ prefix: `${ACTIVATION_CODE_PREFIX}${code}` });
    
    if (blobs.length === 0) {
      console.log(`未找到激活码: ${code} 的文件`);
      return false;
    }
    
    // 找到第一个匹配的激活码文件
    const activationBlob = blobs[0];
    console.log(`找到激活码文件: ${activationBlob.url}`);
    
    // 获取激活码数据
    const response = await fetch(activationBlob.url);
    if (!response.ok) {
      console.log(`激活码获取失败，状态码: ${response.status}`);
      return false;
    }
    
    const activationCode = await response.json() as ActivationCode;
    const now = new Date();
    const expiresAt = new Date(activationCode.expiresAt);
    
    // 检查是否过期或已用完
    if (expiresAt < now || activationCode.usageCount >= activationCode.maxUsage) {
      console.log(`激活码已过期或已用完: ${code}`);
      return false;
    }
    
    // 更新使用次数
    activationCode.usageCount += 1;
    activationCode.isUsed = activationCode.usageCount >= activationCode.maxUsage;
    
    await put(activationBlob.url.split('/').pop()!, JSON.stringify(activationCode), {
      contentType: 'application/json',
      access: 'public'
    });
    
    console.log(`激活码使用成功: ${code}, 使用次数: ${activationCode.usageCount}`);
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
    console.log(`验证邀请码: ${code}`);
    
    // 使用list API查找邀请码文件
    const { blobs } = await list({ prefix: `${INVITATION_CODE_PREFIX}${code}` });
    
    if (blobs.length === 0) {
      console.log(`未找到邀请码: ${code} 的文件`);
      return null;
    }
    
    // 找到第一个匹配的邀请码文件
    const invitationBlob = blobs[0];
    console.log(`找到邀请码文件: ${invitationBlob.url}`);
    
    // 获取邀请码数据
    const response = await fetch(invitationBlob.url);
    if (!response.ok) {
      console.log(`邀请码获取失败，状态码: ${response.status}`);
      return null;
    }
    
    const invitationCode = await response.json() as InvitationCode;
    const now = new Date();
    
    // 检查是否过期
    if (invitationCode.expiresAt && new Date(invitationCode.expiresAt) < now) {
      console.log(`邀请码已过期: ${code}`);
      return null;
    }
    
    // 检查是否达到最大使用次数
    if (invitationCode.usageCount >= invitationCode.maxUsage) {
      console.log(`邀请码已达到最大使用次数: ${code}`);
      return null;
    }
    
    console.log(`邀请码有效，关联用户ID: ${invitationCode.userId}`);
    return invitationCode.userId;
  } catch (error) {
    console.error('验证邀请码失败:', error);
    return null;
  }
}

// 更新邀请码使用次数
export async function updateInvitationCodeUsage(code: string): Promise<boolean> {
  try {
    console.log(`更新邀请码使用次数: ${code}`);
    
    // 使用list API查找邀请码文件
    const { blobs } = await list({ prefix: `${INVITATION_CODE_PREFIX}${code}` });
    
    if (blobs.length === 0) {
      console.log(`未找到邀请码: ${code} 的文件`);
      return false;
    }
    
    // 找到第一个匹配的邀请码文件
    const invitationBlob = blobs[0];
    console.log(`找到邀请码文件: ${invitationBlob.url}`);
    
    // 获取邀请码数据
    const response = await fetch(invitationBlob.url);
    if (!response.ok) {
      console.log(`邀请码获取失败，状态码: ${response.status}`);
      return false;
    }
    
    const invitationCode = await response.json() as InvitationCode;
    
    // 更新使用次数
    invitationCode.usageCount += 1;
    console.log(`邀请码 ${code} 使用次数更新为: ${invitationCode.usageCount}`);
    
    // 获取blob名称并保存更新后的邀请码
    const blobName = `${INVITATION_CODE_PREFIX}${code}.json`;
    await put(blobName, JSON.stringify(invitationCode), {
      contentType: 'application/json',
      access: 'public'
    });
    
    console.log(`邀请码使用次数更新成功: ${code}`);
    return true;
  } catch (error) {
    console.error('更新邀请码使用次数失败:', error);
    return false;
  }
}

// 创建会话
export async function createSession(userId: string, expiresInHours: number = 24): Promise<Session> {
  try {
    const sessionId = uuidv4();
    console.log(`生成会话ID: ${sessionId}`);
    
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000).toISOString();

    const session: Session = {
      id: sessionId,
      userId,
      expiresAt,
      createdAt: now.toISOString(),
    };

    const blobName = `${SESSION_PREFIX}${sessionId}.json`;
    console.log(`保存会话数据到Blob: ${blobName}`);
    
    const result = await put(blobName, JSON.stringify(session), {
      contentType: 'application/json',
      access: 'public'
    });
    
    console.log(`会话保存成功，URL: ${result.url}`);
    
    // 保存会话URL到本地Map，便于调试
    sessionCache.set(sessionId, {
      url: result.url,
      data: session
    });
    
    return session;
  } catch (error) {
    console.error('创建会话失败:', error);
    throw error;
  }
}

// 内存中的会话缓存，用于调试
const sessionCache = new Map<string, {url: string, data: Session}>();

// 验证会话
export async function verifySession(sessionId: string): Promise<string | null> {
  try {
    console.log(`开始验证会话: ${sessionId}`);
    
    // 首先尝试从缓存获取会话
    if (sessionCache.has(sessionId)) {
      console.log(`从缓存获取会话: ${sessionId}`);
      const cachedData = sessionCache.get(sessionId);
      if (cachedData) {
        const session = cachedData.data;
        console.log(`找到会话缓存: ${session.id}, 用户ID: ${session.userId}`);
        
        const now = new Date();
        const expiresAt = new Date(session.expiresAt);
        
        // 检查会话是否过期
        if (expiresAt < now) {
          console.log(`会话已过期，过期时间: ${expiresAt.toISOString()}`);
          sessionCache.delete(sessionId);
          await deleteSession(sessionId);
          return null;
        }
        
        console.log(`会话有效（来自缓存），返回用户ID: ${session.userId}`);
        return session.userId;
      }
    }
    
    // 否则从Blob存储获取会话 - 使用list API查找文件
    console.log(`从Blob存储查找会话: ${sessionId}`);
    
    try {
      // 列出会话前缀下的所有blob
      const { blobs } = await list({ prefix: `${SESSION_PREFIX}${sessionId}` });
      
      if (blobs.length === 0) {
        console.log(`未找到会话ID: ${sessionId} 的文件`);
        return null;
      }
      
      // 找到第一个匹配的会话文件
      const sessionBlob = blobs[0];
      console.log(`找到会话文件: ${sessionBlob.url}`);
      
      // 获取会话数据
      const response = await fetch(sessionBlob.url);
      if (!response.ok) {
        console.log(`会话获取失败，状态码: ${response.status}`);
        return null;
      }
      
      const session = await response.json() as Session;
      const now = new Date();
      
      // 检查会话是否过期
      if (new Date(session.expiresAt) < now) {
        console.log(`会话已过期，过期时间: ${session.expiresAt}`);
        await deleteSession(sessionId);
        return null;
      }
      
      console.log(`会话有效（来自Blob存储），返回用户ID: ${session.userId}`);
      return session.userId;
    } catch (error) {
      console.error('验证会话失败:', error);
      return null;
    }
  } catch (error) {
    console.error('验证会话失败:', error);
    return null;
  }
}

// 删除会话
export async function deleteSession(sessionId: string): Promise<boolean> {
  try {
    console.log(`开始删除会话: ${sessionId}`);
    
    // 从缓存中删除会话
    sessionCache.delete(sessionId);
    
    // 从Blob存储中删除会话
    const blobName = `${SESSION_PREFIX}${sessionId}.json`;
    await del(blobName);
    
    console.log(`会话删除成功: ${sessionId}`);
    return true;
  } catch (error) {
    console.error('删除会话失败:', error);
    return false;
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

// 获取用户的所有项目
export async function getUserProjects(userId: string): Promise<any[]> {
  console.log(`获取用户项目列表, 用户ID: ${userId}`);
  
  // 检查环境变量是否设置
  if (!process.env.NEXT_PUBLIC_BLOB_PUBLIC_URL) {
    console.error('错误: NEXT_PUBLIC_BLOB_PUBLIC_URL 环境变量未设置');
    return [];
  }
  
  try {
    // 查询用户项目索引
    const userIndexBlobName = `${PROJECT_USER_INDEX_PREFIX}${userId}`;
    let projectIds: string[] = [];
    
    try {
      // 正确获取用户项目索引，而不是覆盖它
      const indexUrl = `${process.env.NEXT_PUBLIC_BLOB_PUBLIC_URL}/${userIndexBlobName}`;
      console.log('尝试获取项目索引:', indexUrl);
      
      const response = await fetch(indexUrl);
      if (response.ok) {
        projectIds = await response.json();
        console.log('获取到项目索引:', projectIds);
      } else {
        console.log('项目索引不存在或获取失败，返回空数组');
        return [];
      }
    } catch (error) {
      console.error('获取用户项目索引失败:', error);
      // 如果索引不存在，则返回空数组
      return [];
    }
    
    // 如果没有找到项目，返回空数组
    if (!projectIds || projectIds.length === 0) {
      console.log('项目索引为空');
      return [];
    }
    
    // 获取每个项目的详细信息
    const projectPromises = projectIds.map(async (projectId) => {
      const projectBlobName = `${PROJECT_PREFIX}${projectId}.json`;
      try {
        // 正确获取项目数据，而不是覆盖它
        const projectUrl = `${process.env.NEXT_PUBLIC_BLOB_PUBLIC_URL}/${projectBlobName}`;
        console.log('获取项目数据:', projectUrl);
        
        const response = await fetch(projectUrl);
        if (response.ok) {
          const project = await response.json();
          return {
            ...project,
            id: projectId
          };
        }
        console.log(`项目 ${projectId} 获取失败`);
        return null;
      } catch (error) {
        console.error(`获取项目 ${projectId} 详情失败:`, error);
        return null;
      }
    });
    
    // 等待所有项目数据获取完成
    const projectsData = await Promise.all(projectPromises);
    
    // 过滤掉获取失败的项目
    return projectsData.filter(project => project !== null);
  } catch (error) {
    console.error('获取用户项目列表失败:', error);
    return [];
  }
}

// 保存项目并关联到用户
export async function saveProject(userId: string, projectData: any): Promise<{id: string} | null> {
  console.log(`保存项目, 用户ID: ${userId}`);
  
  try {
    const projectId = uuidv4();
    const now = new Date().toISOString();
    
    const project = {
      ...projectData,
      user_id: userId,
      created_at: now,
      updated_at: now
    };
    
    // 保存项目数据
    const projectBlobName = `${PROJECT_PREFIX}${projectId}.json`;
    await put(projectBlobName, JSON.stringify(project), {
      contentType: 'application/json',
      access: 'public',
      addRandomSuffix: false,
    });
    
    // 更新用户项目索引
    await updateUserProjectIndex(userId, projectId);
    
    return { id: projectId };
  } catch (error) {
    console.error('保存项目失败:', error);
    return null;
  }
}

// 更新用户的项目索引
async function updateUserProjectIndex(userId: string, projectId: string): Promise<boolean> {
  try {
    // 检查环境变量是否设置
    if (!process.env.NEXT_PUBLIC_BLOB_PUBLIC_URL) {
      console.error('错误: NEXT_PUBLIC_BLOB_PUBLIC_URL 环境变量未设置');
      return false;
    }
    
    // 获取用户项目索引
    const userIndexBlobName = `${PROJECT_USER_INDEX_PREFIX}${userId}`;
    let projectIds: string[] = [];
    
    try {
      // 正确获取用户现有项目索引，而不是覆盖它
      console.log(`尝试获取用户 ${userId} 的现有项目索引`);
      const indexUrl = `${process.env.NEXT_PUBLIC_BLOB_PUBLIC_URL}/${userIndexBlobName}`;
      console.log('索引URL:', indexUrl);
      
      const response = await fetch(indexUrl);
      if (response.ok) {
        projectIds = await response.json();
        console.log('成功获取到现有项目索引:', projectIds);
      } else {
        console.log('项目索引不存在，将创建新索引');
        projectIds = [];
      }
    } catch (error) {
      console.error('获取项目索引失败，创建新索引:', error);
      projectIds = [];
    }
    
    // 添加新项目ID（如果不存在）
    if (!projectIds.includes(projectId)) {
      projectIds.unshift(projectId); // 在数组开头添加，以便最新的项目排在前面
      console.log(`添加项目 ${projectId} 到索引，更新后索引:`, projectIds);
    } else {
      console.log(`项目 ${projectId} 已存在于索引中`);
    }
    
    // 保存更新后的索引
    console.log(`保存更新后的项目索引，共 ${projectIds.length} 个项目`);
    await put(userIndexBlobName, JSON.stringify(projectIds), {
      contentType: 'application/json',
      access: 'public',
      addRandomSuffix: false,
    });
    console.log('项目索引保存成功');
    
    return true;
  } catch (error) {
    console.error('更新用户项目索引失败:', error);
    return false;
  }
}

// 获取指定项目详情
export async function getProjectById(projectId: string): Promise<any | null> {
  console.log(`获取项目详情, 项目ID: ${projectId}`);
  
  // 检查环境变量是否设置
  if (!process.env.NEXT_PUBLIC_BLOB_PUBLIC_URL) {
    console.error('错误: NEXT_PUBLIC_BLOB_PUBLIC_URL 环境变量未设置');
    return null;
  }
  
  try {
    const projectBlobName = `${PROJECT_PREFIX}${projectId}.json`;
    
    try {
      // 正确获取项目数据，而不是覆盖它
      const projectUrl = `${process.env.NEXT_PUBLIC_BLOB_PUBLIC_URL}/${projectBlobName}`;
      console.log('获取项目详情:', projectUrl);
      
      const response = await fetch(projectUrl);
      if (response.ok) {
        const project = await response.json();
        return {
          ...project,
          id: projectId
        };
      }
      
      console.log(`项目 ${projectId} 不存在或获取失败`);
      return null;
    } catch (error) {
      console.error(`获取项目详情失败: ${projectId}`, error);
      return null;
    }
  } catch (error) {
    console.error(`获取项目详情失败: ${projectId}`, error);
    return null;
  }
}

// 更新项目信息
export async function updateProject(projectId: string, updateData: any): Promise<any | null> {
  console.log(`更新项目, 项目ID: ${projectId}`);
  
  try {
    // 首先获取当前项目数据
    const currentProject = await getProjectById(projectId);
    
    if (!currentProject) {
      console.error(`更新失败: 未找到项目 ${projectId}`);
      return null;
    }
    
    // 合并更新数据
    const updatedProject = {
      ...currentProject,
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    // 保存更新后的项目数据
    const projectBlobName = `${PROJECT_PREFIX}${projectId}.json`;
    const result = await put(projectBlobName, JSON.stringify(updatedProject), {
      contentType: 'application/json',
      access: 'public',
      addRandomSuffix: false,
    });
    
    return {
      ...updatedProject,
      id: projectId
    };
  } catch (error) {
    console.error(`更新项目失败: ${projectId}`, error);
    return null;
  }
}