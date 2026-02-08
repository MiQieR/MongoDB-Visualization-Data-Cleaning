import "./globals.css"

export const metadata = {
  title: "食物数据管理",
  description: "MongoDB Atlas 数据查看与编辑"
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
