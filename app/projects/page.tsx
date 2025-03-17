'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Nav } from '@/components/nav';

interface Project {
  id: string;
  name: string;
  createdAt: string;
  shortUrl?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    async function fetchProjects() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/projects', {
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            // 未登录，重定向到登录页
            router.push('/auth/login');
            return;
          }
          throw new Error('获取项目列表失败');
        }

        const data = await response.json();
        setProjects(data.projects || []);
      } catch (err) {
        console.error('加载项目列表出错:', err);
        setError('无法加载项目列表，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();
  }, [router]);

  const startEditing = (project: Project) => {
    setEditingId(project.id);
    setNewName(project.name);
  };

  const saveProjectName = async (projectId: string) => {
    if (!newName.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: newName }),
      });

      if (response.ok) {
        // 更新本地状态
        setProjects(projects.map(p => 
          p.id === projectId ? { ...p, name: newName } : p
        ));
        setEditingId(null);
      } else {
        throw new Error('更新项目名称失败');
      }
    } catch (err) {
      console.error('保存项目名称出错:', err);
      // 可以增加一个错误提示
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // 可以添加复制成功的提示
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };

  return (
    <>
      <Nav />
      <main className="container mx-auto p-4 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">我的项目</h1>
          <Link
            href="/viewer"
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            创建新项目
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">加载中...</span>
            </div>
            <p className="mt-2 text-gray-600">正在加载项目列表...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">无项目</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">开始创建您的第一个目录结构</p>
            <div className="mt-6">
              <Link
                href="/viewer"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                创建项目
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-grow mb-2 sm:mb-0">
                    {editingId === project.id ? (
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded-md mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={() => saveProjectName(project.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded-md mr-1 text-sm"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate mr-2">
                          {project.name}
                        </h3>
                        <button
                          onClick={() => startEditing(project)}
                          className="p-1 text-gray-500 hover:text-blue-500"
                          title="编辑名称"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {project.shortUrl && (
                      <button
                        onClick={() => copyToClipboard(project.shortUrl || '')}
                        className="p-1 text-gray-500 hover:text-blue-500 flex items-center"
                        title="复制短链接"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">复制短链</span>
                      </button>
                    )}
                    <Link
                      href={`/projects/${project.id}`}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm flex items-center"
                    >
                      查看
                      <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
} 