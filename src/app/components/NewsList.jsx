import React, { useState, useMemo, useCallback } from 'react';
import {
  UserIcon,
  CalendarIcon,
  ExternalLinkIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from 'lucide-react';

// 常量配置
const CONFIG = {
  COLOR_PALETTE: [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316',
    '#EC4899', '#6366F1', '#14B8A6', '#F43F5E'
  ],
  MAX_TITLE_LENGTH: 20,
  MAX_DESCRIPTION_LENGTH: 150
};

// 工具函数
const utils = {
  // 清理HTML标签
  stripHtml: (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  },

  // 格式化日期
  formatDate: (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('zh-CN');
  },

  // 截断文本
  truncateText: (text, maxLength = CONFIG.MAX_TITLE_LENGTH) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '…';
  },

  // 生成颜色映射
  generateColorMap: (keys) => {
    const map = {};
    keys.forEach((key, index) => {
      map[key] = CONFIG.COLOR_PALETTE[index % CONFIG.COLOR_PALETTE.length];
    });
    return map;
  }
};

// 自定义Hook：展开状态管理
const useExpandedState = (initialSources) => {
  const [expandedSources, setExpandedSources] = useState(() => new Set(initialSources));

  const toggleSource = useCallback((sourceName) => {
    setExpandedSources(prev => {
      const next = new Set(prev);
      if (next.has(sourceName)) {
        next.delete(sourceName);
      } else {
        next.add(sourceName);
      }
      return next;
    });
  }, []);

  const toggleAllSources = useCallback((allSources) => {
    setExpandedSources(prev => {
      if (prev.size === allSources.length) {
        return new Set();
      } else {
        return new Set(allSources);
      }
    });
  }, []);

  return {
    expandedSources,
    toggleSource,
    toggleAllSources
  };
};

// 空状态组件
const EmptyState = () => (
  <div className="bg-white rounded-xl shadow-lg p-12 text-center">
    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white text-3xl font-bold">
      N
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无内容</h3>
    <p className="text-gray-600 mb-6">请检查数据源或网络连接</p>
  </div>
);

// 来源标题栏组件
const SourceHeader = ({ sourceName, sourceFeeds, color, isExpanded, onToggle }) => (
  <div
    className="px-6 py-4 cursor-pointer hover:bg-opacity-90 transition-all duration-200 flex items-center justify-between"
    style={{ backgroundColor: color + '10' }}
    onClick={onToggle}
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
      {isExpanded ? (
        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
      ) : (
        <ChevronRightIcon className="w-5 h-5 text-gray-500" />
      )}
    </div>
  </div>
);

// 文章项组件
const FeedItem = ({ feed, color }) => (
  <div className="p-6 hover:bg-gray-50 transition-colors duration-200">
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
          {utils.stripHtml(feed.description || feed.content || '')}
        </p>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <UserIcon className="w-4 h-4" />
              <span className="truncate max-w-32">
                {feed.author || feed.feed_name}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <CalendarIcon className="w-4 h-4" />
              <span>{utils.formatDate(feed.pub_date)}</span>
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
            <ExternalLinkIcon className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  </div>
);

// 主NewsList组件
const NewsList = ({ data }) => {
  // 使用useMemo优化分组计算
  const groupedFeeds = useMemo(() => {
    if (!data || data.length === 0) return {};

    return data.reduce((acc, item) => {
      if (!acc[item.feed_name]) {
        acc[item.feed_name] = [];
      }
      acc[item.feed_name].push(item);
      return acc;
    }, {});
  }, [data]);

  // 使用自定义Hook管理展开状态
  const { expandedSources, toggleSource } = useExpandedState(Object.keys(groupedFeeds));

  // 使用useMemo优化颜色映射
  const sourceColors = useMemo(() => {
    return utils.generateColorMap(Object.keys(groupedFeeds));
  }, [groupedFeeds]);

  // 空状态检查
  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6 w-4/5 mx-auto">
      {Object.entries(groupedFeeds).map(([sourceName, sourceFeeds]) => {
        const isExpanded = expandedSources.has(sourceName);
        const color = sourceColors[sourceName];

        return (
          <div key={sourceName} className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* 来源标题栏 */}
            <SourceHeader
              sourceName={sourceName}
              sourceFeeds={sourceFeeds}
              color={color}
              isExpanded={isExpanded}
              onToggle={() => toggleSource(sourceName)}
            />

            {/* 文章列表 */}
            {isExpanded && (
              <div className="divide-y divide-gray-100">
                {sourceFeeds.map(feed => (
                  <FeedItem
                    key={feed.id}
                    feed={feed}
                    color={color}
                  />
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
