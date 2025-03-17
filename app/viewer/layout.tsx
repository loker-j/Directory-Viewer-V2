'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ViewerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // 简化的客户端验证逻辑
  useEffect(() => {
    // 检查登录状态的函数
    const checkAuth = () => {
      try {
        // 直接检查cookie中是否包含auth_session字符串
        // 简化逻辑，只要存在就认为有登录状态
        const hasCookie = document.cookie.indexOf('auth_session=') !== -1;
        
        console.log('客户端检测登录状态:', hasCookie ? '已登录' : '未登录');
        
        if (!hasCookie) {
          // 未检测到登录cookie，重定向到登录页面
          console.log('未检测到登录cookie，重定向到登录页面');
          router.push('/auth/login?redirect=/viewer');
          return;
        }
        
        // 检测到登录cookie，停止加载状态
        setIsLoading(false);
      } catch (error) {
        console.error('检查登录状态时出错:', error);
        // 出错时继续显示内容
        setIsLoading(false);
      }
    };

    // 初次加载时设置一个较长的延迟，确保cookie已经设置好
    const timer = setTimeout(checkAuth, 500);
    
    return () => clearTimeout(timer);
  }, [router]);

  // 简化的渲染逻辑
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}
