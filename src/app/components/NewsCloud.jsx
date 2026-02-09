import React, { useState, useEffect, useMemo, memo } from 'react';

const utils = {
  formatDate: (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins} 分钟前`;
    if (diffHours < 24) return `${diffHours} 小时前`;
    if (diffDays < 7) return `${diffDays} 天前`;

    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  }
};

const useGroupedData = (data) => {
  const [groupedData, setGroupedData] = useState({});

  useEffect(() => {
    if (!data || data.length === 0) {
      setGroupedData({});
      return;
    }

    const grouped = data.reduce((acc, item) => {
      if (!acc[item.feed_name]) {
        acc[item.feed_name] = [];
      }
      acc[item.feed_name].push(item);
      return acc;
    }, {});

    setGroupedData(grouped);
  }, [data]);

  return groupedData;
};

const FeedCard = memo(({ feedName, feedItems, index }) => {
  const colors = [
    'from-indigo-500 to-purple-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
    'from-violet-500 to-fuchsia-500'
  ];
  const colorClass = colors[index % colors.length];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="px-5 py-4 bg-gradient-to-r border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold shadow-lg`}>
            {feedName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 truncate pr-3">{feedName}</h3>
            <p className="text-xs text-slate-400 mt-0.5">最新动态</p>
          </div>
        </div>
        <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full font-medium">
          {feedItems.length} 篇
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {feedItems.slice(0, 6).map((item) => (
          <a
            key={item.id}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-5 py-3.5 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-transparent transition-all duration-200 group"
          >
            <div className="flex items-start gap-3">
              <div className="w-1 h-1 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 mt-2.5 flex-shrink-0 group-hover:from-indigo-500 group-hover:to-purple-500 transition-colors" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm text-slate-700 font-medium line-clamp-2 group-hover:text-indigo-600 transition-colors leading-relaxed">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-slate-400">
                    {utils.formatDate(item.pub_date)}
                  </span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
});

FeedCard.displayName = 'FeedCard';

const EmptyState = () => (
  <div className="max-w-md mx-auto py-20 text-center">
    <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
      <span className="text-4xl">📰</span>
    </div>
    <h3 className="text-xl font-semibold text-slate-700 mb-2">暂无内容</h3>
    <p className="text-slate-500">请检查数据源或网络连接</p>
  </div>
);

const NewsCloud = ({ data }) => {
  const groupedData = useGroupedData(data);
  const feedNames = useMemo(() => Object.keys(groupedData), [groupedData]);

  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
        </h1>
        <p className="text-slate-500">聚合全球优质资讯，助您洞察世界</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {feedNames.map((feedName, index) => (
          <FeedCard
            key={feedName}
            feedName={feedName}
            feedItems={groupedData[feedName]}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default NewsCloud;
