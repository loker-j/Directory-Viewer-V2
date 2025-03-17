import { put } from '@vercel/blob';
import { compress, decompress } from '../utils/compression';

export const FILE_STRATEGY = {
  SMALL: {
    maxItems: 1000,
    storage: 'URL',
    backup: 'localStorage'
  },
  LARGE: {
    minItems: 1000,
    storage: 'Vercel Blob',
    backup: 'sessionStorage',
    limits: {
      free: '5GB',
      bandwidth: '100GB/month'
    }
  }
} as const;

export interface DirectoryData {
  name: string;
  size: number;
  itemCount: number;
  data: any;
}

export async function storeDirectoryData(data: DirectoryData): Promise<string> {
  console.log('存储目录数据:', {
    name: data.name,
    size: data.size,
    itemCount: data.itemCount
  });

  if (data.itemCount < FILE_STRATEGY.SMALL.maxItems) {
    console.log('使用小文件策略');
    return handleSmallFile(data);
  } else {
    console.log('使用大文件策略');
    return handleLargeFile(data);
  }
}

async function handleSmallFile(data: DirectoryData): Promise<string> {
  try {
    console.log('开始压缩数据');
    const compressed = await compress(JSON.stringify(data));
    
    // 备份到localStorage（仅浏览器环境）
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`dir_${data.name}`, compressed);
        console.log('数据已备份到localStorage');
      } catch (e) {
        console.warn('备份到localStorage失败:', e);
      }
    }
    
    return compressed;
  } catch (error) {
    console.error('处理小文件失败:', error);
    throw new Error('处理小文件失败');
  }
}

async function handleLargeFile(data: DirectoryData): Promise<string> {
  try {
    console.log('准备上传到Blob存储');
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('未配置BLOB_READ_WRITE_TOKEN');
      throw new Error('Blob存储未配置');
    }

    // 创建Blob对象
    const jsonString = JSON.stringify(data);
    console.log('数据序列化完成, 大小:', jsonString.length);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    console.log('Blob对象创建完成, 大小:', blob.size);

    // 生成唯一文件名
    const fileName = `dir_${data.name}_${Date.now()}.json`;
    console.log('准备上传文件:', fileName);

    // 上传到Vercel Blob
    const { url } = await put(fileName, blob, {
      access: 'public',
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    console.log('文件上传成功, URL:', url);
    
    // 备份处理进度到sessionStorage（仅浏览器环境）
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(`dir_${data.name}_progress`, '100');
        console.log('进度已保存到sessionStorage');
      } catch (e) {
        console.warn('保存进度失败:', e);
      }
    }
    
    return url;
  } catch (error) {
    console.error('处理大文件失败:', error);
    throw new Error('处理大文件失败');
  }
}

export async function retrieveDirectoryData(identifier: string): Promise<DirectoryData | null> {
  try {
    console.log('开始获取数据:', identifier);
    
    if (identifier.startsWith('http')) {
      console.log('从Blob存储获取数据');
      const response = await fetch(identifier);
      if (!response.ok) {
        throw new Error('获取数据失败: ' + response.statusText);
      }
      return await response.json();
    } else {
      console.log('从URL参数解压缩数据');
      const decompressed = await decompress(identifier);
      return JSON.parse(decompressed);
    }
  } catch (error) {
    console.error('获取目录数据失败:', error);
    return null;
  }
} 