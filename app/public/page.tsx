import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PublicPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-3xl font-bold mb-6">目录结构查看器</h1>
        <p className="text-gray-600 mb-8">
          这是目录结构查看器的公开访问区域。您可以通过短链接访问共享的项目目录，无需登录。
        </p>
        <div className="space-y-4">
          <Button asChild>
            <Link href="/">
              返回首页
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 