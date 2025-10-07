"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

// 常量配置
const CONFIG = {
  NAV_LINKS: [
    ['首页', '/'],
    ['新闻', '/news'],
    ['国外', '/foreign'],
    ['科技', '/tech'],
    ['技术', '/code'],
    ['资讯', '/info'],
    ['论坛', '/forum'],
    ['娱乐', '/funny'],
    ['公众号', '/public'],
    ['RSS', '/rss']
  ],
  DATE_FORMAT_OPTIONS: {
    year: 'numeric' as const,
    month: 'long' as const,
    day: 'numeric' as const
  }
};

// 工具函数
const utils = {
  // 格式化日期
  formatDate: (date: Date) => {
    return date.toLocaleDateString('zh-CN', CONFIG.DATE_FORMAT_OPTIONS);
  },

  // 检查是否为当前路径
  isActivePath: (path: string, currentPath: string) => {
    return path === currentPath;
  },

  // 生成导航链接样式
  getNavLinkStyle: (isActive: boolean) => {
    return `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 whitespace-nowrap ${isActive
        ? 'bg-indigo-100 text-indigo-700 shadow-inner'
        : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
      }`;
  }
};

// 动态日期组件
const DynamicDate = () => {
  const [date, setDate] = useState('');

  useEffect(() => {
    setDate(utils.formatDate(new Date()));
  }, []);

  return (
    <span className="text-sm text-gray-500 hidden md:inline whitespace-nowrap">
      {date}
    </span>
  );
};

// 导航链接组件
const NavLink = ({ label, path, isActive }: { label: string; path: string; isActive: boolean }) => {
  return (
    <li>
      <Link
        href={path}
        className={utils.getNavLinkStyle(isActive)}
      >
        {label}
      </Link>
    </li>
  );
};

// 主Header组件
export default function Header() {
  const pathname = usePathname();

  // 使用useMemo优化导航链接渲染
  const navLinks = useMemo(() => {
    return CONFIG.NAV_LINKS.map(([label, path]) => ({
      label,
      path,
      isActive: utils.isActivePath(path, pathname)
    }));
  }, [pathname]);

  return (
    <header className="w-full bg-white/80 shadow-sm sticky top-0 z-30 backdrop-blur-lg border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-4">
          {/* Logo区域 */}
          <div className="flex items-center gap-3 self-start md:self-center">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 group-hover:from-indigo-600 group-hover:to-blue-600 transition-all duration-300 ease-in-out transform group-hover:scale-110 group-hover:shadow-lg text-white font-bold text-2xl shadow-md">
                N
              </span>
              <span className="text-2xl font-bold text-gray-800 group-hover:text-indigo-600 tracking-tight transition-colors duration-300">
                News
              </span>
            </Link>
          </div>

          {/* 导航区域 */}
          <nav className="w-full md:w-auto">
            <ul className="flex flex-wrap justify-center md:justify-start gap-x-2 gap-y-2 md:gap-x-1 lg:gap-x-2">
              {navLinks.map(({ label, path, isActive }) => (
                <NavLink
                  key={path}
                  label={label}
                  path={path}
                  isActive={isActive}
                />
              ))}
            </ul>
          </nav>

          {/* 日期显示区域 */}
          <div className="hidden md:flex items-center">
            <DynamicDate />
          </div>
        </div>
      </div>
    </header>
  );
}
