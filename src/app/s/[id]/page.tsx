import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getOriginalUrl } from '@/lib/utils/short-url'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface PageProps {
  params: {
    id: string
  }
}

export default async function ShortUrlPage({ params }: PageProps) {
  const originalUrl = await getOriginalUrl(params.id)
  
  if (!originalUrl) {
    return (
      <div className="min-h-screen bg-background flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-card p-6 rounded-lg shadow-lg space-y-4">
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
              </div>
              <h1 className="text-2xl font-bold">链接已过期</h1>
              <p className="text-muted-foreground">
                此链接已超过30天未被访问，已被自动清理。
              </p>
            </div>
            <div className="flex justify-center">
              <Button asChild>
                <Link href="/">返回首页</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  redirect(originalUrl)
} 