import "./globals.css"

export const metadata = {
  title: "食物数据管理",
  description: "MongoDB Atlas 数据查看与编辑"
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
