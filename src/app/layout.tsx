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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-b from-blue-50 via-white to-blue-50 min-h-screen flex flex-col`}
      >
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-blue-600/95 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <nav className="px-6 py-4">
              <ul className="flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm md:text-base">
                <li>
                  <a href="/" className="text-white hover:text-blue-100 transition-all duration-300 font-medium flex items-center gap-2 hover:scale-105">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    首页
                  </a>
                </li>
                {[
                  ['新闻', '/news'],
                  ['国外', '/foreign'],
                  ['科技', '/tech'],
                  ['技术', '/code'],
                  ['生活', '/live'],
                  ['资讯', '/info'],
                  ['论坛', '/forum'],
                  ['娱乐', '/funny'],
                  ['公众号', '/public']
                ].map(([label, path]) => (
                  <li key={path}>
                    <a
                      href={path}
                      className="text-white hover:text-blue-100 transition-all duration-300 font-medium px-3 py-2 rounded-full hover:bg-white/10"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </header>

        <main className="flex-grow">
          {children}
        </main>

        <footer className="mt-auto py-8 px-4 bg-gradient-to-b from-blue-500/5 to-blue-500/10">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sm text-blue-700 font-medium">
              © {new Date().getFullYear()} News Hub. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
