'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// 确保与服务器端使用相同的cookie名称
const SESSION_COOKIE_NAME = 'auth_session';

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [username, setUsername] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // 在客户端检查登录状态
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // 使用更精确的cookie检测方法
        const cookies = document.cookie.split(';');
        const sessionCookie = cookies.find(c => c.trim().startsWith(`${SESSION_COOKIE_NAME}=`));
        const hasValidSession = !!sessionCookie && sessionCookie.trim().split('=')[1].length > 0;
        
        console.log('导航组件检测到会话状态:', hasValidSession ? '已登录' : '未登录');
        
        setIsLoggedIn(hasValidSession);
        
        // 如果已登录，获取用户信息
        if (hasValidSession) {
          try {
            const response = await fetch('/api/auth/check-session', {
              credentials: 'include'
            });
            if (response.ok) {
              const data = await response.json();
              if (data.user && data.user.username) {
                setUsername(data.user.username);
              }
            }
          } catch (error) {
            console.error('获取用户信息失败:', error);
          }
        }
        
        setIsLoaded(true);
        
        // 如果在上传页但未登录，服务器会处理重定向
        // 这里只设置前端状态
      } catch (error) {
        console.error('检查登录状态失败:', error);
        setIsLoggedIn(false);
        setIsLoaded(true);
      }
    };
    
    // 设置延迟确保cookie加载完成
    const timer = setTimeout(() => {
      checkLoginStatus();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [pathname]);  // 添加pathname依赖，确保路由变化时重新检查
  
  // 关闭用户菜单的处理函数
  const handleClickOutside = () => {
    setShowUserMenu(false);
  };
  
  // 添加点击外部关闭菜单的事件监听
  useEffect(() => {
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showUserMenu]);
  
  return (
    <nav className="bg-white shadow-sm dark:bg-gray-800">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link 
            href="/" 
            className="text-lg font-bold text-gray-800 dark:text-white flex items-center"
          >
            <svg width="30" height="30" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
              <path d="M514.6 215.1c-.7 5.9-3.6 71.2-3.6 81.7v8.3l22.2-22c12.3-12.1 22.4-21.8 22.5-21.7.1.1-1.1 4.9-2.7 10.7-1.5 5.7-6.3 24.5-10.5 41.6-4.3 17.2-8.1 31.1-8.5 30.8-.4-.3-6-9.2-12.4-19.8l-11.7-19.4-28.7 7.2c-15.8 4-31.1 8-34.1 8.9l-5.4 1.6.6-12.3c.3-7.8.2-10.4-.3-7.2-.5 2.7-.9 8-.9 11.7-.1 3.8-.3 6.8-.7 6.8-.3 0-4.2-3.3-8.7-7.3-4.5-3.9-14.7-12.7-22.7-19.3-8-6.7-16.5-14-19-16.3-4.4-4.2-4.4-4.2-1.5-3.6 1.7.4 12.9 3.1 25 6s35.1 8.3 51 11.9c16 3.6 32.1 7.4 35.8 8.5 3.8 1 6.5 1.5 6 1.1-.4-.4-7.5-6.2-15.8-12.8-8.2-6.6-21.1-17.1-28.5-23.2-12.1-10-13.8-11.1-16.5-10.5-2.8.5-34.9 10.2-52.5 15.9l-7.5 2.4-.6 9.4c-.4 5.1-.9 21.4-1.2 36.3-.4 24.8-.1 28.1 1.8 15.2.3-2.6 1-4.5 1.5-4.2 1.4.8 21 25 27 33.3 2.9 4 5.4 7.2 5.7 7.2.4 0-3.4-7.4-17.8-34.6-3.3-6.1-5.9-11.4-5.9-11.7 0-.3 2.3-2.2 5-4.2 2.8-2 5-4.1 5-4.6s-1.2-2.8-2.7-5.2c-3.8-6.1-15.9-28.8-16.8-31.7-.9-2.8-2.8-4.3 20.7 15.6 19.1 16.3 27.8 23.5 30.8 25.9l2.5 2-2.9 33.2c-1.6 18.3-2.7 33.5-2.4 33.8.6.6 4.6-.4 23.7-6.1 6.3-1.9 11.6-3.2 11.9-2.9.3.3-13.2 14.3-30 31.2l-30.6 30.6-14.8-13.5c-19.9-18.1-30.4-27.2-30.8-26.7-.4.4 15.8 21.6 29 38.1 2.9 3.8 4.9 6.8 4.3 6.8-1.2 0-22.1-9.8-48.3-22.8l-18.8-9.3-11.7 8.2c-6.4 4.5-17.1 12.2-23.9 17.2-6.8 4.9-12.5 8.7-12.8 8.4-.3-.3 6-12 14-26.1 8-14.1 14.6-25.8 14.6-26 0-.8-4.8.9-29.5 10.3l-24 9.2-6.3 6.2c-10.2 9.9-30.5 31.7-30.1 32.1.9.9 57.3-3 59.1-4.1 1.3-.7 112.4-1.6 117.2-.9 4 .6 6.6 2.5 23.3 16.8 10.3 8.9 21.3 18.4 24.3 21.2 7.5 6.9 43.7 38.7 46.6 40.9l2.4 1.9v31c0 24.4-.3 30.9-1.2 30.6-3.9-1.5-19.5-6.3-34.8-10.8-9.6-2.9-25.9-7.9-36.3-11.1l-18.7-6 18.2-16.1c10.1-8.9 19.4-17.1 20.7-18.2l2.4-2.1-.6 24c-.3 13.2-.2 23.3.2 22.5.5-.8 1.3-15.3 2-32.2.6-16.9 1.5-35.3 1.8-40.9l.6-10.3-6.4 5c-3.5 2.7-11.1 8.6-16.8 13.2-5.7 4.5-10.6 8-10.9 7.8-.2-.3-1.5-6.7-2.9-14.3-1.3-7.5-2.5-13.8-2.7-14-.1-.2-5.4 2.1-11.7 5-6.3 3-16.3 7.5-22.4 10.1-6 2.7-11.4 5.1-11.8 5.5-.7.7 4.2 31.4 6.3 38.9.4 1.8 4.2 8.3 8.3 14.5 6.8 10.4 7.3 11.5 5.7 12.5-7.9 4.9-54.1 31.2-54.9 31.2-.5 0-5.1-1.6-10.3-3.5-5.1-2-9.9-3.8-10.7-4.1-.8-.2 5.2-3.7 13.2-7.7l14.7-7.2-15.4-19c-15.3-19-17.8-21.5-62.8-63.4l-7.8-7.3-5.7 4.8c-35.1 29.9-54.7 47.3-54.1 48 .4.3 40.3-14 47-16.9 3.6-1.5 4.2-1.4 21 2.9 9.5 2.5 23.2 6 30.3 7.9 7.2 1.8 12.3 3.6 11.5 3.8-.8.3-21.5 4.6-46 9.6s-45.8 9.5-47.5 9.9c-2.7.8-1.8 1.2 9.5 5 19.8 6.5 49 15.2 50.8 15.1 1.7-.1 10.9-10 27-29.1l9-10.6.6 3.6c.6 3.7.9 49.2.3 49.2-.2 0-5-1.6-10.7-3.5-18.6-6.3-11.6-3 11.2 5.3 12.3 4.4 21.6 8.3 20.8 8.6-.8.3-14.4 2.5-30.2 5l-28.7 4.5-4.4 4.8c-4.7 5.1-17.3 19.6-19.7 22.7-1.4 1.8-1.1 1.8 8 1.2 5.2-.4 19.4-1.3 31.5-2.1 18.9-1.3 22.2-1.8 23.5-3.3.8-1 7.5-8.6 14.7-16.8l13.3-15 15.7-5.8c8.7-3.1 26.6-9.6 39.8-14.4l23.9-8.6 27.3 13.9 27.3 13.9 14 19.6 14 19.5v163.3l-9.5 19.6-9.4 19.7-16.8 7.9c-9.2 4.4-19 9.1-21.8 10.4l-5 2.5h80l80-.1-20.5-10.1-20.5-10.2-10.2-20-10.2-20v-162l6.7-9.2c3.7-5 10.5-14.3 15.2-20.6 9.7-13.2 5-10.2 45.3-27.9l22.8-9.9 39.4 13.1c21.7 7.2 39.5 13.5 39.5 13.9 0 .5-27.6 23.7-36.8 30.8-.8.7-1.3 1.6-.9 1.9.3.3 8.5-6.1 18.3-14.2 21.7-18.3 22.4-18.8 22.4-17.6 0 .6-6.8 14.9-15 31.7-8.3 16.9-14.9 30.9-14.8 31 .6.5 43.8 4.8 44.2 4.4.2-.2-2.3-15-5.5-32.9s-5.8-32.9-5.6-33.4c.2-.7 8.2 7.7 28.3 30.1l2.9 3.2 31.5.8c17.3.5 31.7.8 31.9.6.4-.3-10.9-13.6-18.6-22l-4.8-5.2-27.5-3.9c-18.4-2.6-26.8-4.2-25.5-4.7 1.1-.5 13-5.8 26.5-11.8 27.7-12.4 51.3-22.1 70.8-29.2 7.3-2.6 13.1-4.9 12.9-5.1-.2-.2-13.8-2.4-30.3-4.9-16.4-2.5-36.5-5.7-44.5-7-8.1-1.4-15.1-2.5-15.7-2.5-.6 0 .2 1.2 1.6 2.8 1.5 1.5 8.6 9.8 15.9 18.4l13.2 15.7-18.2 7.6c-10 4.3-22.9 9.7-28.6 12.1-5.8 2.5-11.2 4.2-12 3.9-2.7-1-29.1-15.7-29.6-16.4-.2-.4 7.8-2 17.8-3.5 10-1.6 19.5-3.1 21-3.5l2.8-.6-11.5-15.5-11.4-15.5-17.6-12.9c-9.7-7-17.8-13.2-18.1-13.7-.7-1 6.8-12.3 15.6-23.5 9.5-12.1 35-43.8 36.1-44.9.9-.9-2 4-21.3 35.5l-5.9 9.5 7.8 7.5c13.5 13.1 38.2 35.1 38.2 34.1 0-.9-3.3-23-11-72.9-1.7-10.7-2.7-19.8-2.4-20.3.3-.5 1.5-.9 2.7-.9 7.9-.1 7-1-12.1-12.7l-18.7-11.6-14 1.8c-7.7 1-21.6 2.7-30.8 3.9l-16.8 2.2 3.4 1.6c1.9.9 11.6 6.4 21.5 12.2l18.1 10.6 21.7-3.5c11.9-2 21.8-3.4 22-3.3.3.4-27.5 35.5-34.6 43.6l-4.5 5.2-6.3-8.2c-17.8-23.6-21.5-28.6-31.2-42.1-5.8-8.1-10.9-14.7-11.3-14.7-1.1 0 .6 2.3 25.3 35.9 11.8 16 21.5 29.5 21.6 29.9 0 .4-12.1 12.7-27 27.4l-27.1 26.6-14.5-8.5c-8-4.7-23.2-13.6-33.7-19.9-10.6-6.2-19.3-11-19.3-10.6 0 .7 8.1 5.6 48.9 29.8 10.9 6.5 15.9 9.9 15 10.4-1.3.7-11.4 4.7-72.6 28.5l-21.3 8.2v-41.5l8.2-10.3c4.5-5.7 22.5-27.5 39.9-48.5 34.1-41.1 30.8-37.7 68.4-68.5 21-17.2 20-16.6 35.6-21.5 22.3-7.1 22.4-7.1 22.2-8.2-.2-.6-7.9-14.6-17.3-31.1-9.3-16.6-17-30.3-17-30.5 0-.2 7.1 3.6 15.8 8.6C715 358.9 717 360 717.6 360c.4 0 5.8-4.4 12.1-9.8 6.3-5.3 13.2-11.3 15.5-13.2l4-3.5 3 3.5c1.5 1.9 4.9 7.5 7.4 12.5 2.5 4.9 4.3 8.1 3.9 7-.4-1.1-2.4-8.5-4.6-16.4l-4-14.4 2.6-3.6c2-2.9 2.2-3.7 1-3.9-2.5-.6-87.6 12.5-88.7 13.6-.4.4-1.5 17.7-2.5 38.4-1.4 31-2 37.5-3.1 36.6-.7-.6-7.8-10.6-15.7-22.2L634 363.5l-29.6-14c-16.3-7.7-29.9-14.1-30.2-14.2-1.1-.4-14.8 31.5-13.9 32.4.4.4 9.3-19.3 11.8-26.1.7-2 1.5-3.6 1.9-3.6.3 0 6.4 12.1 13.6 26.9 11 22.3 13.6 26.9 15.5 27.3 5.2 1.1 57.5 14.9 59.3 15.6 1.7.7.6 1.6-6 5.2-8.3 4.6-25.9 15.1-35.6 21.3l-5.7 3.7-27.8-32.8c-15.3-18-31.6-36.8-36.2-41.7-4.7-5-10.3-10.8-12.4-13.1l-3.8-4.1 12.3-5.3c6.8-2.9 17-7.3 22.8-9.7 5.8-2.4 11-4.9 11.5-5.4.7-.7.5-.8-.5-.4-1.2.4-2.1-1.1-3.9-6.7-8-25.6-19.7-57.7-22-60.5-4.9-6-37.4-44.8-38.7-46.2-1-1.1-1.3-.6-1.8 3z" fill="#3C63E4"/>
            </svg>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0A2463] to-[#1890ff]">
              目录可视化
            </span>
          </Link>
          <Link 
            href="/viewer" 
            className={`text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white ${pathname === '/viewer' ? 'font-medium' : ''}`}
          >
            上传文件
          </Link>
          
          {isLoggedIn && (
            <Link 
              href="/projects" 
              className={`text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white ${pathname.startsWith('/projects') ? 'font-medium' : ''}`}
            >
              我的项目
            </Link>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {isLoaded && (
            isLoggedIn ? (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white">
                    {username.charAt(0).toUpperCase()}
                  </span>
                  <span>{username || '用户'}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10">
                    <Link 
                      href="/projects" 
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      我的项目
                    </Link>
                    <button 
                      onClick={async () => {
                        try {
                          await fetch('/api/auth/logout', { 
                            method: 'POST',
                            credentials: 'include' // 确保发送cookies
                          });
                          // 清除客户端状态
                          setIsLoggedIn(false);
                          // 强制刷新页面以确保所有状态都重置
                          window.location.href = '/';
                        } catch (error) {
                          console.error('退出登录失败:', error);
                        }
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  登录
                </Link>
                <Link 
                  href="/auth/register" 
                  className="text-sm px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  注册
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  );
} 