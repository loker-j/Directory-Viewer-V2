'use client';

import { useEffect } from "react";
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
  
  // 客户端验证登录状态
  useEffect(() => {
    const checkLogin = async () => {
      // 检查cookie是否存在
      const hasSessionCookie = document.cookie.includes('auth_session=');
      console.log('视图布局检测到会话状态:', hasSessionCookie ? '已登录' : '未登录');
      
      if (!hasSessionCookie) {
        console.log('未检测到登录状态，正在重定向到登录页面...');
        router.replace('/auth/login?redirect=' + encodeURIComponent('/viewer'));
      }
    };
    
    checkLogin();
  }, [router]);

  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={inter.className}>
        <main className="min-h-[calc(100vh-4rem)] bg-background">
          {children}
        </main>
      </body>
    </html>
  );
}
