import { getOriginalUrl } from '@/lib/utils/short-url'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface PageProps {
  params: {
    id: string
  }
}

export default async function ShortUrlPage({ params }: PageProps) {
  const originalUrl = await getOriginalUrl(params.id)
  
  if (!originalUrl) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">链接已过期</h1>
          <p className="text-muted-foreground mb-6">
            此链接已过期或不存在。
          </p>
          <Button asChild>
            <Link href="/">返回首页</Link>
          </Button>
        </div>
      </div>
    )
  }

  // 检查原始URL是否包含项目ID
  const projectIdMatch = originalUrl.match(/\/projects\/([^/?&#]+)/);
  if (projectIdMatch && projectIdMatch[1]) {
    const projectId = projectIdMatch[1];
    // 重定向到公开访问的项目页面，并将短链接ID作为查询参数传递
    redirect(`/public/projects/${projectId}?shortId=${params.id}`);
  }
  
  // 如果URL不是项目URL，则使用原始重定向
  redirect(originalUrl)
} 