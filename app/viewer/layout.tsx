export default function ViewerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 完全依赖中间件处理授权
  return <>{children}</>;
}
