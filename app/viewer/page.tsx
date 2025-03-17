'use client';

import { useState, useEffect } from 'react';
import { UploadZone } from '@/components/upload-zone';
import { Nav } from '@/components/nav';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // 在客户端加载时确认会话状态
  useEffect(() => {
    // 页面加载完成后设置状态
    console.log('上传页面加载完成');
    setIsLoaded(true);
  }, []);
  
  return (
    <>
      <Nav />
      <main className="container mx-auto p-4 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">目录结构查看器</h1>
          <p className="text-sm text-muted-foreground">
            快速查看和分析文件夹的目录结构
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {isLoaded ? (
            <UploadZone />
          ) : (
            <div className="py-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">加载中...</span>
              </div>
              <p className="mt-2 text-gray-600">页面加载中...</p>
            </div>
          )}

          <div className="text-center space-y-4">
            <h2 className="text-lg font-semibold">使用方法</h2>
            <ol className="list-decimal space-y-2 text-sm text-muted-foreground inline-block text-left">
              <li>打开百度网盘网页版，找到要分析的文件夹</li>
              <li>右键点击文件夹，选择&quot;生成目录文件.txt&quot;</li>
              <li>将生成的 txt 文件上传到本网站</li>
              <li>等待处理完成后即可查看目录结构</li>
            </ol>
          </div>

          <footer className="text-center text-sm text-muted-foreground">
            <p>式钦出品</p>
          </footer>
        </div>
      </main>
    </>
  );
}
