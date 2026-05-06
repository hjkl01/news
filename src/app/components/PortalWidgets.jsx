import React, { useMemo } from 'react';

const formatDate = (dateString) => {
  if (!dateString) return '未知';
  return new Date(dateString).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  });
};

const PortalWidgets = ({ data = [] }) => {
  const trends = useMemo(() => {
    const sourceCount = data.reduce((acc, item) => {
      const key = item.feed_name || '未知来源';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(sourceCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [data]);

  const latest = useMemo(() => {
    return data.slice(0, 6);
  }, [data]);

  return (
    <div className="space-y-3">
      <section className="card card-density">
        <header className="border-b border-[var(--card-border)] px-3 py-2">
          <h3 className="text-sm font-semibold text-slate-800">来源热度</h3>
        </header>
        <div className="space-y-1 px-3 py-2">
          {trends.map(([name, count], index) => (
            <div key={name} className="flex items-center justify-between rounded-md px-2 py-1 hover-lite hover:bg-slate-50">
              <span className="truncate text-xs text-slate-700">#{index + 1} {name}</span>
              <span className="text-xs font-medium text-indigo-600">{count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card card-density">
        <header className="border-b border-[var(--card-border)] px-3 py-2">
          <h3 className="text-sm font-semibold text-slate-800">快速入口</h3>
        </header>
        <div className="grid grid-cols-2 gap-2 px-3 py-2 text-xs">
          {[
            ['新闻', '/news'],
            ['科技', '/tech'],
            ['技术', '/code'],
            ['论坛', '/forum'],
            ['国外', '/foreign'],
            ['RSS', '/rss']
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="rounded-md border border-slate-200 px-2 py-1 text-center text-slate-700 hover-lite hover:border-indigo-300 hover:text-indigo-600"
            >
              {label}
            </a>
          ))}
        </div>
      </section>

      <section className="card card-density">
        <header className="border-b border-[var(--card-border)] px-3 py-2">
          <h3 className="text-sm font-semibold text-slate-800">最新时间线</h3>
        </header>
        <div className="space-y-1 px-3 py-2">
          {latest.map((item) => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-md px-2 py-1 hover-lite hover:bg-slate-50"
            >
              <p className="line-clamp-2 text-xs font-medium text-slate-800">{item.title}</p>
              <p className="mt-1 text-[11px] text-slate-400">{item.feed_name} · {formatDate(item.pub_date)}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PortalWidgets;
