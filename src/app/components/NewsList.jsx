import React, { useState, useMemo } from 'react';

// NewsList 组件，采用 App.tsx 风格，支持分组、展开、分类色条、文章列表
const NewsList = ({ data }) => {
  // 按来源分组
  const groupedFeeds = useMemo(() => {
    return data.reduce((acc, item) => {
      if (!acc[item.feed_name]) acc[item.feed_name] = [];
      acc[item.feed_name].push(item);
      return acc;
    }, {});
  }, [data]);

  // 来源展开状态
  const [expandedSources, setExpandedSources] = useState(() => new Set(Object.keys(groupedFeeds)));

  // 分类色板
  const colorPalette = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316',
    '#EC4899', '#6366F1', '#14B8A6', '#F43F5E'
  ];
  // 来源名到色彩映射
  const sourceColors = useMemo(() => {
    const keys = Object.keys(groupedFeeds);
    const map = {};
    keys.forEach((k, i) => { map[k] = colorPalette[i % colorPalette.length]; });
    return map;
  }, [groupedFeeds]);

  const toggleSource = (sourceName) => {
    setExpandedSources(prev => {
      const next = new Set(prev);
      if (next.has(sourceName)) next.delete(sourceName); else next.add(sourceName);
      return next;
    });
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white text-3xl font-bold">N</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无内容</h3>
        <p className="text-gray-600 mb-6">请检查数据源或网络连接</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-4/5 mx-auto">
      {Object.entries(groupedFeeds).map(([sourceName, sourceFeeds]) => {
        const isExpanded = expandedSources.has(sourceName);
        const color = sourceColors[sourceName];
        return (
          <div key={sourceName} className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* 来源标题栏 */}
            <div
              className="px-6 py-4 cursor-pointer hover:bg-opacity-90 transition-all duration-200 flex items-center justify-between"
              style={{ backgroundColor: color + '10' }}
              onClick={() => toggleSource(sourceName)}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: color }}
                >
                  {sourceName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{sourceName}</h3>
                  <p className="text-sm text-gray-600">{sourceFeeds.length} 篇文章</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: color }}
                >
                  {sourceFeeds[0]?.category || sourceFeeds[0]?.feed_name}
                </span>
                <svg className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isExpanded ? '' : 'rotate-[-90deg]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            {/* 文章列表 */}
            {isExpanded && (
              <div className="divide-y divide-gray-100">
                {sourceFeeds.map(feed => (
                  <div key={feed.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start space-x-4">
                      <div
                        className="w-2 h-16 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {feed.title}
                        </h4>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {(feed.description || feed.content || '').replace(/<[^>]*>/g, '')}
                        </p>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804" /></svg>
                              <span className="truncate max-w-32">{feed.author || feed.feed_name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              <span>{feed.pub_date ? new Date(feed.pub_date).toLocaleDateString('zh-CN') : ''}</span>
                            </div>
                          </div>
                          <a
                            href={feed.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 font-medium transition-colors duration-200 hover:underline"
                            style={{ color }}
                          >
                            <span>阅读全文</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default NewsList;
