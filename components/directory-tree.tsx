'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown, Folder, File } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DirectoryItem {
  name: string
  type: 'file' | 'folder'
  level: number
  children: DirectoryItem[]
}

interface DirectoryTreeProps {
  items: DirectoryItem[]
  searchQuery?: string
  currentMatchIndex: number
  onMatchesUpdate: (matches: string[], currentIndex: number) => void
}

export function DirectoryTree({ 
  items, 
  searchQuery = '',
  currentMatchIndex,
  onMatchesUpdate
}: DirectoryTreeProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [matchedItems, setMatchedItems] = useState<string[]>([])

  // 搜索处理
  useEffect(() => {
    if (!searchQuery) {
      setMatchedItems([])
      onMatchesUpdate([], -1)
      return
    }

    const matches: string[] = []

    // 查找匹配项
    const findMatches = (item: DirectoryItem, parentPath = '') => {
      const currentPath = parentPath ? `${parentPath}/${item.name}` : item.name
      
      if (item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        matches.push(currentPath)
      }

      if (item.type === 'folder') {
        item.children.forEach(child => findMatches(child, currentPath))
      }
    }

    items.forEach(item => findMatches(item))
    setMatchedItems(matches)
    onMatchesUpdate(matches, matches.length > 0 ? 0 : -1)
  }, [searchQuery, items, onMatchesUpdate])

  // 当前匹配项变化时，展开父文件夹并滚动到视图
  useEffect(() => {
    if (matchedItems.length > 0 && currentMatchIndex >= 0) {
      const currentPath = matchedItems[currentMatchIndex]
      
      // 获取当前匹配项的所有父文件夹路径
      const folders = currentPath.split('/')
      const parentFolders = new Set<string>()
      for (let i = 0; i < folders.length - 1; i++) {
        parentFolders.add(folders.slice(0, i + 1).join('/'))
      }
      
      // 更新展开状态，只展开当前匹配项的父文件夹
      setExpandedItems(prev => {
        const newExpanded = new Set(prev)
        parentFolders.forEach(folder => newExpanded.add(folder))
        return newExpanded
      })

      // 等待DOM更新后滚动
      setTimeout(() => {
        const element = document.getElementById(`item-${currentPath.replace(/\//g, '-')}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
  }, [currentMatchIndex, matchedItems])

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedItems(newExpanded)
  }

  const renderItem = (item: DirectoryItem, parentPath = '') => {
    const currentPath = parentPath ? `${parentPath}/${item.name}` : item.name
    const isExpanded = expandedItems.has(currentPath)
    const hasChildren = item.type === 'folder' && item.children.length > 0
    const isMatched = matchedItems.includes(currentPath)
    const isCurrentMatch = matchedItems[currentMatchIndex] === currentPath
    const isFolder = item.type === 'folder'

    return (
      <div key={currentPath}>
        <div 
          id={`item-${currentPath.replace(/\//g, '-')}`}
          className={cn(
            "flex items-center py-1 px-2 rounded hover:bg-accent/50 cursor-pointer",
            isMatched && "bg-yellow-100 dark:bg-yellow-900/30",
            isCurrentMatch && "ring-2 ring-primary"
          )}
          style={{ paddingLeft: `${item.level * 1.5}rem` }}
          onClick={() => isFolder && toggleExpand(currentPath)}
        >
          {isFolder && (
            <div className="w-4 h-4 mr-1">
              {hasChildren && (
                isExpanded ? 
                  <ChevronDown className="w-4 h-4" /> : 
                  <ChevronRight className="w-4 h-4" />
              )}
            </div>
          )}
          {isFolder ? (
            <Folder className="w-4 h-4 mr-2 text-blue-500" />
          ) : (
            <File className="w-4 h-4 mr-2 text-gray-500" />
          )}
          <span className={cn(
            "text-sm",
            isMatched && "font-medium",
            isCurrentMatch && "text-primary"
          )}>
            {item.name}
          </span>
        </div>
        {isFolder && isExpanded && hasChildren && (
          <div>
            {item.children.map(child => renderItem(child, currentPath))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-4 bg-background">
      {items.map(item => renderItem(item))}
    </div>
  )
} 