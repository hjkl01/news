"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

const CONFIG = {
  NAV_LINKS: [
    ['首页', '/'],
    ['新闻', '/news'],
    ['国外', '/foreign'],
    ['科技/技术', '/tech'],
    ['技术', '/code'],
    ['论坛', '/forum'],
    ['娱乐', '/funny'],
    ['RSS', '/rss']
  ]
};

const utils = {
  isActivePath: (path: string, currentPath: string) => {
    return path === currentPath;
  },

  getNavLinkStyle: (isActive: boolean) => {
    return `px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 whitespace-nowrap ${
      isActive
        ? 'bg-indigo-500 text-white'
        : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
    }`;
  }
};

const DynamicDate = () => {
  const [date, setDate] = useState('');

  useEffect(() => {
    const formatDate = () => {
      return new Date().toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    setDate(formatDate());
  }, []);

  return (
    <span className="text-xs text-slate-500 hidden md:inline whitespace-nowrap font-medium bg-slate-100 px-2 py-1 rounded-md">
      {date}
    </span>
  );
};

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

export default function Header() {
  const pathname = usePathname();

  const navLinks = useMemo(() => {
    return CONFIG.NAV_LINKS.map(([label, path]) => ({
      label,
      path,
      isActive: utils.isActivePath(path, pathname)
    }));
  }, [pathname]);

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-3 gap-3">
          <div className="flex items-center gap-3 self-start md:self-center">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-500 group-hover:bg-indigo-600 transition-colors duration-200 text-white font-bold text-lg">
                N
              </span>
              <span className="text-xl font-bold text-slate-900">
                NewsHub
              </span>
            </Link>
          </div>

          <nav className="w-full md:w-auto">
            <ul className="flex flex-wrap justify-center md:justify-start gap-x-1 gap-y-1">
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

          <div className="hidden md:flex items-center">
            <DynamicDate />
          </div>
        </div>
      </div>
    </header>
  );
}
