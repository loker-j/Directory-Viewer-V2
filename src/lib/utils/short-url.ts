import { put, list, del } from '@vercel/blob';
import { nanoid } from 'nanoid';

const BLOB_PREFIX = 'short-urls/';
const SHORT_ID_LENGTH = 6;
const EXPIRY_DAYS = 30;
const GRACE_PERIOD_DAYS = 7;

// 简单的内存缓存
const urlCache = new Map<string, {
  data: ShortUrl;
  timestamp: number;
}>();

const CACHE_TTL = 1000 * 60 * 5; // 5分钟缓存

export interface ShortUrl {
  shortId: string;
  originalUrl: string;
  createdAt: string;
  accessCount: number;
  lastAccessAt: string;
  isExpired: boolean;
}

// 生成短链接
export async function createShortUrl(originalUrl: string): Promise<string> {
  const shortId = nanoid(SHORT_ID_LENGTH);
  const now = new Date().toISOString();
  
  const shortUrl: ShortUrl = {
    shortId,
    originalUrl,
    createdAt: now,
    lastAccessAt: now,
    accessCount: 0,
    isExpired: false
  };

  const blob = new Blob([JSON.stringify(shortUrl)], { type: 'application/json' });
  await put(`${BLOB_PREFIX}${shortId}.json`, blob, {
    access: 'public',
    addRandomSuffix: false
  });

  // 添加到缓存
  urlCache.set(shortId, {
    data: shortUrl,
    timestamp: Date.now()
  });

  return shortId;
}

// 获取原始URL
export async function getOriginalUrl(shortId: string): Promise<string | null> {
  try {
    // 检查缓存
    const cached = urlCache.get(shortId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data.originalUrl;
    }

    // 使用默认的 Vercel Blob 域名
    const blobUrl = process.env.BLOB_PUBLIC_URL || 'https://store.blob.vercel-storage.com';
    const response = await fetch(`${blobUrl}/${BLOB_PREFIX}${shortId}.json`);
    if (!response.ok) return null;
    
    const shortUrl: ShortUrl = await response.json();
    const now = new Date();
    const createdAt = new Date(shortUrl.createdAt);
    const lastAccessAt = new Date(shortUrl.lastAccessAt);
    
    // 计算时间差
    const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const daysSinceLastAccess = (now.getTime() - lastAccessAt.getTime()) / (1000 * 60 * 60 * 24);
    
    // 检查是否需要延期
    if (daysSinceCreation > EXPIRY_DAYS && daysSinceLastAccess <= GRACE_PERIOD_DAYS) {
      // 更新访问信息
      shortUrl.lastAccessAt = now.toISOString();
      shortUrl.accessCount += 1;
      
      // 异步更新存储
      const blob = new Blob([JSON.stringify(shortUrl)], { type: 'application/json' });
      put(`${BLOB_PREFIX}${shortId}.json`, blob, {
        access: 'public',
        addRandomSuffix: false
      }).catch(error => {
        console.error('更新短链接访问信息失败:', error);
      });
      
      // 更新缓存
      urlCache.set(shortId, {
        data: shortUrl,
        timestamp: Date.now()
      });
      
      return shortUrl.originalUrl;
    }
    
    // 如果超过宽限期，标记为过期
    if (daysSinceCreation > EXPIRY_DAYS && daysSinceLastAccess > GRACE_PERIOD_DAYS) {
      shortUrl.isExpired = true;
      return null;
    }
    
    // 正常访问，更新计数
    shortUrl.accessCount += 1;
    shortUrl.lastAccessAt = now.toISOString();
    
    // 异步更新存储
    const blob = new Blob([JSON.stringify(shortUrl)], { type: 'application/json' });
    put(`${BLOB_PREFIX}${shortId}.json`, blob, {
      access: 'public',
      addRandomSuffix: false
    }).catch(error => {
      console.error('更新短链接访问信息失败:', error);
    });
    
    // 更新缓存
    urlCache.set(shortId, {
      data: shortUrl,
      timestamp: Date.now()
    });
    
    return shortUrl.originalUrl;
  } catch (error) {
    console.error('获取短链接失败:', error);
    return null;
  }
}

// 清理过期的短链接
export async function cleanupExpiredUrls() {
  const { blobs } = await list({ prefix: BLOB_PREFIX });
  const now = new Date();
  
  for (const blob of blobs) {
    try {
      const response = await fetch(blob.url);
      const shortUrl: ShortUrl = await response.json();
      
      const lastAccessAt = new Date(shortUrl.lastAccessAt);
      const daysSinceLastAccess = (now.getTime() - lastAccessAt.getTime()) / (1000 * 60 * 60 * 24);
      
      // 只清理超���宽限期的链接
      if (daysSinceLastAccess > GRACE_PERIOD_DAYS) {
        await del(blob.url);
        // 从缓存中移除
        urlCache.delete(shortUrl.shortId);
      }
    } catch (error) {
      console.error('处理短链接失败:', error);
    }
  }
}

// 定期清理缓存中的过期项
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of urlCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      urlCache.delete(key);
    }
  }
}, CACHE_TTL); 