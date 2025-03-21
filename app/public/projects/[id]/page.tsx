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

export default function PublicProjectPage({ params }: PageProps) {
  const [project, setProject] = useState<DirectoryData | null>(null)
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentMatch, setCurrentMatch] = useState(0)
  const [matchedItems, setMatchedItems] = useState<string[]>([])
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [shortUrl, setShortUrl] = useState<string>('')

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

  useEffect(() => {
    async function fetchProject() {
      try {
        const identifier = decodeURIComponent(params.id)
        // 使用公开API获取项目数据
        const response = await fetch(`/api/public/projects/${encodeURIComponent(identifier)}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '获取项目失败')
        }

        // 格式可能是project或data，两种情况都处理
        const projectData = data.project || data.data
        if (projectData) {
          setProject(projectData)
          
          // 如果项目数据中已有短链接ID，直接使用
          if (projectData.short_id) {
            console.log('从项目数据中获取短链接ID:', projectData.short_id)
            const fullShortUrl = `${window.location.origin}/s/${projectData.short_id}`
            setShortUrl(fullShortUrl)
          }
        } else {
          setError('未找到项目')
        }
      } catch (error) {
        console.error('获取项目失败:', error)
        setError('加载项目失败')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [params.id])

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
            url={shortUrl || `${window.location.origin}/public/projects/${params.id}`}
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
            onMatchesUpdate={handleMatchesUpdate}
            currentMatchIndex={currentMatch}
          />

          {showScrollTop && (
            <Button
              onClick={scrollToTop}
              className="fixed bottom-4 right-4 p-2 rounded-full shadow-md"
              size="sm"
              variant="outline"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 