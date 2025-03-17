import { createShortUrl } from '@/lib/utils/short-url'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { originalUrl } = await request.json()

    if (!originalUrl) {
      console.warn('缺少originalUrl参数')
      return NextResponse.json({ error: '缺少originalUrl参数' }, { status: 400 })
    }

    console.log('创建短链接，原始URL:', originalUrl)
    const shortId = await createShortUrl(originalUrl)
    console.log('已创建短链接:', shortId)
    
    return NextResponse.json({ shortId }, { status: 200 })
  } catch (error) {
    console.error('创建短链接失败:', error)
    return NextResponse.json({ error: '创建短链接失败' }, { status: 500 })
  }
} 