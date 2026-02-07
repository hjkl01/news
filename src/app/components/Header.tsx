"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

const CONFIG = {
  NAV_LINKS: [
    ['首页', '/'],
    ['新闻', '/news'],
    ['国外', '/foreign'],
    ['科技', '/tech'],
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
    return `px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
      isActive
        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200'
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
    <span className="text-sm text-slate-500 hidden md:inline whitespace-nowrap font-medium bg-slate-100 px-3 py-1.5 rounded-full">
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
    <header className="w-full bg-white/90 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-4">
          <div className="flex items-center gap-3 self-start md:self-center">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 group-hover:from-indigo-600 group-hover:to-violet-600 transition-all duration-300 shadow-lg shadow-indigo-200 text-white font-bold text-xl">
                N
              </span>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                NewsHub
              </span>
            </Link>
          </div>

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

          <div className="hidden md:flex items-center">
            <DynamicDate />
          </div>
        </div>
      </div>
    </header>
  );
}
