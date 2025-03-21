'use client'

import { useEffect, useState, useCallback } from 'react'
import { DirectoryTree } from '@/components/directory-tree'
import { ShareOptions } from '@/components/share-options'
import { SearchBox } from '@/components/search-box'
import { ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PageProps {
  params: {
    id: string
  }
}

interface DirectoryData {
  name: string;
  size: number;
  itemCount: number;
  data: any;
}

export default function ProjectPage({ params }: PageProps) {
  const [project, setProject] = useState<DirectoryData | null>(null)
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentMatch, setCurrentMatch] = useState(0)
  const [matchedItems, setMatchedItems] = useState<string[]>([])
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [shortUrl, setShortUrl] = useState<string>('')
  const [isCreatingShortUrl, setIsCreatingShortUrl] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > window.innerHeight)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 创建短链接的函数
  const createShortUrl = async (originalUrl: string) => {
    if (isCreatingShortUrl || shortUrl) {
      console.log('跳过创建短链接:', { isCreating: isCreatingShortUrl, existingShortUrl: shortUrl });
      return;
    }
    
    try {
      setIsCreatingShortUrl(true)
      console.log('开始创建短链接:', originalUrl)
      
      // 先检查是否已存在
      const indexUrl = `${process.env.NEXT_PUBLIC_BLOB_PUBLIC_URL}/short-urls/index.json`;
      console.log('检查index文件:', indexUrl);
      
      const indexResponse = await fetch(indexUrl);
      console.log('Index响应状态:', indexResponse.status);
      
      if (indexResponse.ok) {
        const index = await indexResponse.json() as Record<string, string>;
        console.log('获取到的index数据:', index);
        
        const existingId = Object.entries(index).find(([_, url]) => url === originalUrl)?.[0];
        if (existingId) {
          const fullShortUrl = `${window.location.origin}/s/${existingId}`;
          console.log('找到已存在的短链接:', fullShortUrl);
          setShortUrl(fullShortUrl);
          return;
        }
        console.log('未找到已存在的短链接，将创建新的');
      } else {
        console.log('获取index文件失败，将创建新的短链接');
      }
      
      // 如果不存在，创建新的
      const shortResponse = await fetch('/api/short-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ originalUrl })
      });

      if (shortResponse.ok) {
        const data = await shortResponse.json();
        console.log('API响应:', data)
        
        if (data.shortId) {
          const fullShortUrl = `${window.location.origin}/s/${data.shortId}`;
          console.log('生成的完整短链接:', fullShortUrl)
          setShortUrl(fullShortUrl);
        } else {
          console.error('API响应中没有shortId:', data)
        }
      } else {
        console.error('API请求失败:', shortResponse.status)
      }
    } catch (error) {
      console.error('创建短链接失败:', error)
    } finally {
      setIsCreatingShortUrl(false)
    }
  }

  useEffect(() => {
    async function fetchProject() {
      try {
        const identifier = decodeURIComponent(params.id);
        console.log('获取项目详情，原始参数:', params.id);
        const response = await fetch(`/api/projects/${encodeURIComponent(identifier)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '获取项目失败');
        }

        if (data.project) {
          setProject(data.project);
          
          // 如果项目数据中已有短链接ID，直接使用
          if (data.project.short_id) {
            console.log('从项目数据中获取短链接ID:', data.project.short_id);
            const fullShortUrl = `${window.location.origin}/s/${data.project.short_id}`;
            setShortUrl(fullShortUrl);
          }
        } else {
          setError('未找到项目');
        }
      } catch (error) {
        console.error('获取项目失败:', error);
        setError('加载项目失败');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProject();
  }, [params.id]);

  // 单独的useEffect用于创建短链接
  useEffect(() => {
    // 检查是否是从短链接跳转来的
    const isFromShortUrl = document.referrer.includes('/s/');
    console.log('页面加载检查:', {
      hasProject: !!project,
      hasShortUrl: !!shortUrl,
      isCreating: isCreatingShortUrl,
      isFromShortUrl,
      referrer: document.referrer
    });
    
    // 只有在没有短链接且项目数据中也没有短链接时才创建
    if (project && !shortUrl && !isCreatingShortUrl && !isFromShortUrl) {
      const originalUrl = `${window.location.origin}/projects/${params.id}`;
      createShortUrl(originalUrl);
    }
  }, [project, params.id, shortUrl, isCreatingShortUrl])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.toLowerCase())
  }, [])

  const handleMatchesUpdate = useCallback((matches: string[], currentIndex: number) => {
    setMatchedItems(matches)
    setCurrentMatch(currentIndex)
  }, [])

  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    if (matchedItems.length === 0) return

    let newIndex = currentMatch
    if (direction === 'next') {
      newIndex = (currentMatch + 1) % matchedItems.length
    } else {
      newIndex = (currentMatch - 1 + matchedItems.length) % matchedItems.length
    }
    setCurrentMatch(newIndex)
  }, [currentMatch, matchedItems])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>项目不存在</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">
            {project.name}
          </h1>
          <ShareOptions 
            url={shortUrl || `${window.location.origin}/projects/${params.id}`}
            projectName={project.name}
          />
          <SearchBox 
            onSearch={handleSearch}
            totalMatches={matchedItems.length}
            currentMatch={currentMatch}
            onNavigate={handleNavigate}
          />
          <DirectoryTree 
            items={project.data} 
            searchQuery={searchQuery}
            currentMatchIndex={currentMatch}
            onMatchesUpdate={handleMatchesUpdate}
          />
        </div>
      </div>
      {showScrollTop && (
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-6 right-6 h-8 w-8 p-0 rounded-full shadow-lg bg-background/95 backdrop-blur-sm"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
} 