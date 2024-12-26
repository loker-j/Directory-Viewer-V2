import { NextRequest, NextResponse } from 'next/server'
import { createShortUrl } from '@/lib/utils/short-url'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { originalUrl } = body

    if (!originalUrl) {
      return NextResponse.json(
        { error: '缺少原始URL' },
        { status: 400 }
      )
    }

    const shortId = await createShortUrl(originalUrl)
    
    return NextResponse.json({ shortId })
  } catch (error) {
    console.error('创建短链接失败:', error)
    return NextResponse.json(
      { error: '创建短链接失败' },
      { status: 500 }
    )
  }
} 