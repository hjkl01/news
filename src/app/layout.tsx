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
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-b from-blue-50 to-white min-h-screen`}
      >
        <header className="sticky top-0 z-50 backdrop-blur-lg bg-blue-500/95 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <nav className="px-4 py-4">
              <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm md:text-base">
                <li>
                  <a href="/" className="text-white hover:text-blue-100 transition-colors duration-200 font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    首页
                  </a>
                </li>
                <li><a href="/news" className="text-white hover:text-blue-100 transition-colors duration-200 font-medium">新闻</a></li>
                <li><a href="/foreign" className="text-white hover:text-blue-100 transition-colors duration-200 font-medium">国外</a></li>
                <li><a href="/tech" className="text-white hover:text-blue-100 transition-colors duration-200 font-medium">科技</a></li>
                <li><a href="/code" className="text-white hover:text-blue-100 transition-colors duration-200 font-medium">技术</a></li>
                <li><a href="/live" className="text-white hover:text-blue-100 transition-colors duration-200 font-medium">生活</a></li>
                <li><a href="/info" className="text-white hover:text-blue-100 transition-colors duration-200 font-medium">资讯</a></li>
                <li><a href="/forum" className="text-white hover:text-blue-100 transition-colors duration-200 font-medium">论坛</a></li>
                <li><a href="/funny" className="text-white hover:text-blue-100 transition-colors duration-200 font-medium">娱乐</a></li>
                <li><a href="/public" className="text-white hover:text-blue-100 transition-colors duration-200 font-medium">公众号</a></li>
              </ul>
            </nav>
          </div>
        </header>

        <main className="flex-grow">
          {children}
        </main>

        <footer className="mt-auto py-6 px-4 bg-blue-500/10">
          <div className="max-w-7xl mx-auto text-center text-sm text-blue-600">
            <p> {new Date().getFullYear()} News Hub. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
