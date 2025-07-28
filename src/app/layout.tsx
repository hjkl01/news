import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "News Hub - Your Daily Source",
  description: "A modern news aggregator built with Next.js",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-indigo-50 via-white to-blue-100 min-h-screen flex flex-col`}>
        {/* 顶部导航栏，融合品牌与栏目导航 */}
        <header className="w-full bg-white/80 shadow-sm sticky top-0 z-20 backdrop-blur border-b border-indigo-100">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
              <span className="inline-block w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-400 flex items-center justify-center text-white font-bold text-xl shadow-md">N</span>
              <span className="text-xl font-extrabold text-indigo-700 tracking-wide drop-shadow-sm">News</span>
            </div>
            <nav className="flex-1 w-full sm:w-auto mt-2 sm:mt-0">
              <ul className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-2 text-sm md:text-base">
                {[
                  ['首页', '/'],
                  ['新闻', '/news'],
                  ['国外', '/foreign'],
                  ['科技', '/tech'],
                  ['技术', '/code'],
                  ['生活', '/live'],
                  ['资讯', '/info'],
                  ['论坛', '/forum'],
                  ['娱乐', '/funny'],
                  ['公众号', '/public'],
                  ['RSS', '/rss']
                ].map(([label, path]) => (
                  <li key={path}>
                    <a
                      href={path}
                      className="text-indigo-700 hover:text-blue-600 transition-all duration-200 font-medium px-3 py-1.5 rounded-full hover:bg-indigo-50"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <span className="ml-auto text-xs text-gray-400 hidden sm:inline whitespace-nowrap">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
          </div>
        </header>
        <main className="flex-1 w-full">
          {children}
        </main>
        {/* 页脚 */}
        <footer className="w-full text-center text-xs text-gray-400 py-6 mt-8">© {new Date().getFullYear()} News | Powered by Next.js & Tailwind CSS</footer>
      </body>
    </html>
  );
}
