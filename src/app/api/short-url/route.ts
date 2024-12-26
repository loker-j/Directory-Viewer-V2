import { createShortUrl } from '@/lib/utils/short-url'
import { NextResponse } from 'next/server'
import { logger } from '../../../lib/logger'

export async function POST(request: Request) {
  try {
    const { originalUrl } = await request.json()

    if (!originalUrl) {
      logger.warn('Missing originalUrl in request')
      return NextResponse.json({ error: 'Missing originalUrl' }, { status: 400 })
    }

    logger.info('Creating short URL for:', originalUrl)
    const shortId = await createShortUrl(originalUrl)
    logger.info('Created short URL:', shortId)
    
    return NextResponse.json({ shortId }, { status: 200 })
  } catch (error) {
    logger.error('Failed to create short URL:', error)
    return NextResponse.json({ error: '创建短链接失败' }, { status: 500 })
  }
} 