export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-200/80 mt-16">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">N</span>
            <span className="text-lg font-semibold text-gray-700">News Hub</span>
          </div>
          <p className="text-center text-sm text-gray-500">
            聚合最新资讯，洞察世界动态。
          </p>
          <div className="flex justify-center space-x-6">
            <a href="https://github.com/jinlong-yang/news" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors">
              <span className="sr-only">GitHub</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.378.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.308.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" /></svg>
            </a>
          </div>
          <div className="text-center text-sm text-gray-500 border-t border-gray-200/80 w-full pt-4 mt-4">
            <p>© {new Date().getFullYear()} News Hub. All Rights Reserved.</p>
            <p className="mt-1">Powered by <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">Next.js</a> & <a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">Tailwind CSS</a>.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
