'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 客户端组件不能导出metadata，已移除

export default function ViewerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // 客户端验证登录状态
  useEffect(() => {
    const checkLogin = async () => {
      try {
        // 更精确地检查cookie - 使用正则表达式确保找到完整的cookie
        const cookies = document.cookie;
        // 尝试找到auth_session cookie，并确保它不是空值
        const sessionCookieMatch = cookies.match(/auth_session=([^;]+)/);
        const hasValidCookie = !!sessionCookieMatch && sessionCookieMatch[1].length > 0;
        
        console.log('视图布局检测到会话状态:', hasValidCookie ? '已登录' : '未登录');
        
        if (!hasValidCookie) {
          console.log('未检测到有效的登录会话，重定向到登录页面...');
          router.replace('/auth/login?redirect=' + encodeURIComponent('/viewer'));
          return;
        }
        
        // 如果cookie有效，设置认证状态为true
        setIsAuthenticated(true);
        setIsCheckingAuth(false);
      } catch (error) {
        console.error('验证登录状态时出错:', error);
        // 出错时也允许继续，避免无限重定向
        setIsAuthenticated(true); // 出错时默认允许访问
        setIsCheckingAuth(false);
      }
    };
    
    // 页面加载后延迟一点再检查，确保cookie已加载
    const timer = setTimeout(() => {
      checkLogin();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={inter.className}>
        {isCheckingAuth ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : isAuthenticated ? (
          <main className="min-h-[calc(100vh-4rem)] bg-background">
            {children}
          </main>
        ) : null}
      </body>
    </html>
  );
}
