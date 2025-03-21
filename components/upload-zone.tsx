'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { parseDirectoryText } from '@/lib/parse-directory'
import { formatFileSize } from '@/lib/utils'

interface DirectoryItem {
  name: string
  type: string
  level: number
  children?: DirectoryItem[]
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const CHUNK_SIZE = 1024 * 1024; // 1MB

// 添加进度状态接口
interface ProgressStatus {
  stage: '读取文件' | '解析结构' | '处理数据' | '完成'
  progress: number
  detail?: string
}

export function UploadZone() {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progressStatus, setProgressStatus] = useState<ProgressStatus>({
    stage: '读取文件',
    progress: 0
  })

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const readFileInChunks = async (file: File) => {
    let text = ''
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
    let currentChunk = 0

    const readNextChunk = async (start: number): Promise<string> => {
      const end = Math.min(start + CHUNK_SIZE, file.size)
      const blob = file.slice(start, end)
      const chunkText = await blob.text()
      currentChunk++
      setProgressStatus({
        stage: '读取文件',
        progress: Math.floor((currentChunk / totalChunks) * 100),
        detail: `${formatFileSize(end)} / ${formatFileSize(file.size)}`
      })
      return chunkText
    }

    for (let start = 0; start < file.size; start += CHUNK_SIZE) {
      text += await readNextChunk(start)
    }

    return text
  }

  const processFile = async (file: File) => {
    console.log('开始处理文件:', file.name, '大小:', formatFileSize(file.size))
    
    try {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`文件大小超过限制 (最大 ${formatFileSize(MAX_FILE_SIZE)})`)
      }

      // 读取文件
      setProgressStatus({ stage: '读取文件', progress: 0 })
      const text = await readFileInChunks(file)
      console.log('文件读取完成')

      // 解析结构
      setProgressStatus({ stage: '解析结构', progress: 0 })
      console.log('开始解析目录结构...')
      const rootItems = parseDirectoryText(text)
      console.log('解析后的目录结构:', rootItems)
      setProgressStatus({ stage: '解析结构', progress: 100 })

      // 处理数据
      setProgressStatus({ 
        stage: '处理数据', 
        progress: 0,
        detail: '准备数据...'
      })

      const directoryData = {
        name: file.name.replace(/\.[^/.]+$/, ''),
        size: file.size,
        itemCount: countItems(rootItems),
        data: rootItems
      }

      // 发送数据
      setProgressStatus({
        stage: '处理数据',
        progress: 50,
        detail: '上传数据...'
      })

      // 先上传到公共存储（无需登录即可访问）
      const response = await fetch('/api/viewer/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(directoryData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '上传失败')
      }

      const result = await response.json()
      
      if (!result.success || !result.identifier) {
        throw new Error('处理失败')
      }
      
      const identifier = result.identifier;
      
      // 将项目同时保存到用户的项目列表中（需要登录）
      try {
        setProgressStatus({
          stage: '处理数据',
          progress: 75,
          detail: '添加到项目列表...'
        })
        
        // 尝试将项目添加到用户的项目列表
        const saveToProjectsResponse = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include', // 重要：需要发送 cookies 以验证用户身份
          body: JSON.stringify({
            name: directoryData.name,
            size: directoryData.size,
            itemCount: directoryData.itemCount,
            data: directoryData.data,
            // 添加一个引用字段，指向公共存储的标识符
            publicIdentifier: identifier
          })
        })
        
        console.log('项目列表保存结果:', saveToProjectsResponse.status);
        
        // 即使保存到项目列表失败，也继续流程（用户仍然可以查看目录页）
      } catch (saveError) {
        console.error('保存到项目列表失败:', saveError);
        // 继续流程，不中断
      }

      setProgressStatus({
        stage: '完成',
        progress: 100,
        detail: '处理完成，即将跳转...'
      })

      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push(`/projects/${encodeURIComponent(identifier)}`)
    } catch (error) {
      console.error('处理文件时出错:', error)
      throw error
    }
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setIsProcessing(true)

    try {
      const file = e.dataTransfer.files[0]
      if (!file) {
        throw new Error('请上传文件')
      }
      if (!file.name.endsWith('.txt')) {
        throw new Error('请上传 .txt 文件')
      }
      await processFile(file)
    } catch (error) {
      console.error('处理拖放文件时出错:', error)
      alert(error instanceof Error ? error.message : '上传失败')
    } finally {
      setIsProcessing(false)
      setProgressStatus({ stage: '读取文件', progress: 0 })
    }
  }, [router])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    try {
      if (!file.name.endsWith('.txt')) {
        throw new Error('请上传 .txt 文件')
      }
      await processFile(file)
    } catch (error) {
      console.error('处理文件时出错:', error)
      alert(error instanceof Error ? error.message : '上传失败')
    } finally {
      setIsProcessing(false)
      setProgressStatus({ stage: '读取文件', progress: 0 })
      if (e.target) {
        e.target.value = ''
      }
    }
  }, [router])

  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-8
        ${isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'}
        ${isProcessing ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
        transition-all duration-200
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="text-center space-y-4">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".txt"
          onChange={handleFileSelect}
          disabled={isProcessing}
        />
        
        <label
          htmlFor="file-upload"
          className="block space-y-2 cursor-pointer"
        >
          <div className="text-2xl">📁</div>
          <div className="font-medium">
            {isProcessing ? (
              <div className="space-y-2">
                <div>{progressStatus.stage}</div>
                <div className="text-sm text-muted-foreground">
                  {progressStatus.detail}
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${progressStatus.progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <span className="text-primary">点击上传</span>
                {' '}或拖放文件到这里
              </>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            支持 .txt 格式，最大 {formatFileSize(MAX_FILE_SIZE)}
          </div>
        </label>
      </div>
    </div>
  )
}

function countItems(items: DirectoryItem[]): number {
  let count = items.length
  for (const item of items) {
    if (item.children) {
      count += countItems(item.children)
    }
  }
  return count
} 