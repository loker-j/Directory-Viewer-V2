import { put } from '@vercel/blob'
import { nanoid } from 'nanoid'
import { cache } from 'react'

interface ShortUrl {
  shortId: string
  originalUrl: string
  createdAt: string
  lastAccessAt: string
  accessCount: number
  isExpired: boolean
}

const shortUrlCache = new Map<string, ShortUrl>()
const creatingUrls = new Set<string>() // 记录正在创建中的URL

// 使用 React cache 来避免重复创建
export const createShortUrl = cache(async (originalUrl: string): Promise<string> => {
  console.log('开始创建短链接, 原始URL:', originalUrl)

  // 确保环境变量已设置
  const blobPublicUrl = process.env.NEXT_PUBLIC_BLOB_PUBLIC_URL || '';
  if (!blobPublicUrl) {
    console.warn('警告: NEXT_PUBLIC_BLOB_PUBLIC_URL 环境变量未设置');
  }

  // 如果正在创建中，等待
  if (creatingUrls.has(originalUrl)) {
    console.log('URL正在创建中，等待...')
    while (creatingUrls.has(originalUrl)) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    // 创建完成后，从缓存中获取
    for (const [_, shortUrl] of shortUrlCache.entries()) {
      if (shortUrl.originalUrl === originalUrl && !shortUrl.isExpired) {
        console.log('从缓存中获取刚创建的短链接:', shortUrl.shortId)
        return shortUrl.shortId
      }
    }
  }

  // 标记为正在创建
  creatingUrls.add(originalUrl)

  try {
    // 先检查内存缓存
    for (const [_, shortUrl] of shortUrlCache.entries()) {
      if (shortUrl.originalUrl === originalUrl && !shortUrl.isExpired) {
        console.log('从内存缓存中找到已存在的短链接:', shortUrl.shortId)
        return shortUrl.shortId
      }
    }

    // 检查Blob存储中是否已存在相同的URL
    try {
      const indexUrl = `${blobPublicUrl}/short-urls/index.json`;
      console.log('检查index URL:', indexUrl);
      const response = await fetch(indexUrl);
      console.log('index响应状态:', response.status);
      
      if (response.ok) {
        const index = await response.json() as Record<string, string>
        console.log('获取到的index数据:', index);
        const existingId = Object.entries(index).find(([_, url]) => url === originalUrl)?.[0]
        if (existingId) {
          console.log('从Blob存储中找到已存在的短链接:', existingId)
          return existingId
        }
        console.log('index中未找到匹配的URL');
      }
    } catch (error) {
      console.error('检查已存在短链接失败:', error)
    }

    const shortId = nanoid(6)
    console.log('生成的短ID:', shortId)

    const shortUrl: ShortUrl = {
      shortId,
      originalUrl,
      createdAt: new Date().toISOString(),
      lastAccessAt: new Date().toISOString(),
      accessCount: 0,
      isExpired: false
    }

    console.log('创建的短链接对象:', shortUrl)

    const path = `short-urls/${shortId}.json`
    console.log('准备上传到Blob存储, 路径:', path)

    const { url } = await put(path, JSON.stringify(shortUrl), {
      access: 'public',
      addRandomSuffix: false
    })

    // 更新索引
    try {
      const indexPath = 'short-urls/index.json'
      const indexUrl = `${blobPublicUrl}/${indexPath}`;
      console.log('准备更新index, URL:', indexUrl);
      const indexResponse = await fetch(indexUrl)
      console.log('获取现有index响应状态:', indexResponse.status);
      const index = (indexResponse.ok ? await indexResponse.json() : {}) as Record<string, string>
      console.log('现有index数据:', index);
      index[shortId] = originalUrl
      console.log('更新后的index数据:', index);
      await put(indexPath, JSON.stringify(index), {
        access: 'public',
        addRandomSuffix: false
      })
      console.log('index更新成功');
    } catch (error) {
      console.error('更新短链接索引失败:', error)
    }

    console.log('Blob存储上传成功, URL:', url)
    shortUrlCache.set(shortId, shortUrl)
    console.log('短链接已添加到缓存')

    return shortId
  } finally {
    // 无论成功失败，都移除正在创建的标记
    creatingUrls.delete(originalUrl)
  }
})

export const getOriginalUrl = async (shortId: string): Promise<string | null> => {
  console.log('开始获取短链接, ID:', shortId)

  // 确保环境变量已设置
  const blobPublicUrl = process.env.BLOB_PUBLIC_URL || process.env.NEXT_PUBLIC_BLOB_PUBLIC_URL || '';
  if (!blobPublicUrl) {
    console.warn('警告: BLOB_PUBLIC_URL 环境变量未设置');
  }

  // 先从缓存中查找
  const cachedUrl = shortUrlCache.get(shortId)
  if (cachedUrl && !cachedUrl.isExpired) {
    console.log('从缓存中找到短链接')
    return cachedUrl.originalUrl
  }

  try {
    const path = `short-urls/${shortId}.json`
    const blobUrl = `${blobPublicUrl}/${path}`
    console.log('请求Blob URL:', blobUrl)

    const response = await fetch(blobUrl)
    console.log('Blob响应状态:', response.status)

    if (!response.ok) {
      console.log('获取短链接失败:', response.status)
      return null
    }

    const text = await response.text()
    console.log('获取到的原始响应:', text)

    const shortUrl = JSON.parse(text) as ShortUrl
    console.log('解析后的短链接数据:', shortUrl)

    const now = new Date()
    const lastAccess = new Date(shortUrl.lastAccessAt)
    const daysSinceLastAccess = Math.floor((now.getTime() - lastAccess.getTime()) / (1000 * 60 * 60 * 24))

    console.log('当前时间:', now.toISOString())
    console.log('最后访问时间:', shortUrl.lastAccessAt)
    console.log('距离上次访问天数:', daysSinceLastAccess)

    // 如果超过30天未访问，标记为过期
    if (daysSinceLastAccess > 30) {
      console.log('链接已过期')
      shortUrl.isExpired = true
      await put(path, JSON.stringify(shortUrl), {
        access: 'public',
        addRandomSuffix: false
      })
      return null
    }

    // 只有距离上次更新超过1天才更新访问时间和计数
    if (daysSinceLastAccess >= 1) {
      console.log('距离上次更新已超过1天，更新访问信息')
      shortUrl.lastAccessAt = now.toISOString()
      shortUrl.accessCount += 1
      await put(path, JSON.stringify(shortUrl), {
        access: 'public',
        addRandomSuffix: false
      })
    } else {
      console.log('距离上次更新不足1天，跳过更新')
    }

    shortUrlCache.set(shortId, shortUrl)
    return shortUrl.originalUrl
  } catch (error) {
    console.error('获取短链接失败:', error)
    return null
  }
} 