import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  UserIcon,
  CalendarIcon,
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
    toggleAllSources,
    setExpandedSources
  };
};

// 加载状态组件
const LoadingState = memo(() => (
  <div className="bg-white rounded-xl shadow-lg p-12 text-center">
    <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
    <p className="text-gray-600">正在加载内容...</p>
  </div>
));

LoadingState.displayName = 'LoadingState';

// 空状态组件
const EmptyState = memo(() => (
  <div className="bg-white rounded-xl shadow-lg p-12 text-center">
    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white text-3xl font-bold">
      N
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无内容</h3>
    <p className="text-gray-600 mb-6">请检查数据源或网络连接</p>
  </div>
));

EmptyState.displayName = 'EmptyState';

// 错误状态组件
const ErrorState = memo(() => (
  <div className="bg-white rounded-xl shadow-lg p-12 text-center">
    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-400 to-orange-400 rounded-full flex items-center justify-center text-white text-3xl font-bold">
      !
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">加载失败</h3>
    <p className="text-gray-600 mb-6">内容加载出现错误，请稍后重试</p>
  </div>
));

ErrorState.displayName = 'ErrorState';

// 来源标题栏组件
const SourceHeader = memo(({ sourceName, sourceFeeds, color, isExpanded, onToggle }) => (
  <div
    className="px-4 sm:px-6 py-4 cursor-pointer hover:bg-opacity-90 transition-all duration-200 flex items-center justify-between"
    style={{ backgroundColor: color + '10' }}
    onClick={onToggle}
  >
    <div className="flex items-center space-x-3 min-w-0">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
        style={{ backgroundColor: color }}
      >
        {sourceName.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{sourceName}</h3>
        <p className="text-sm text-gray-600">{sourceFeeds.length} 篇文章</p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <span
        className="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium text-white hidden sm:block"
        style={{ backgroundColor: color }}
      >
        {sourceFeeds[0]?.category || sourceFeeds[0]?.feed_name}
      </span>
      {isExpanded ? (
        <ChevronDownIcon className="w-5 h-5 text-gray-500 transition-transform duration-200" />
      ) : (
        <ChevronRightIcon className="w-5 h-5 text-gray-500 transition-transform duration-200" />
      )}
    </div>
  </div>
));

SourceHeader.displayName = 'SourceHeader';

// 文章项组件
const FeedItem = memo(({ feed, color }) => (
  <div className="p-6 hover:bg-gray-50 transition-colors duration-200">
    <div className="flex flex-col sm:flex-row items-start sm:space-x-4 space-y-4 sm:space-y-0">
      <div
        className="w-2 h-16 sm:h-20 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1 min-w-0 w-full">
        <a 
          href={feed.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors duration-200 block"
        >
          {feed.title}
        </a>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {utils.stripHtml(feed.description || feed.content || '')}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
        </div>
      </div>
    </div>
  </div>
));

FeedItem.displayName = 'FeedItem';

// 主NewsList组件
const NewsList = ({ data, error, loading = false }) => {
  // 所有Hooks必须在函数开始时无条件调用
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

  // 获取所有来源名称
  const sourceNames = useMemo(() => Object.keys(groupedFeeds), [groupedFeeds]);

  // 使用自定义Hook管理展开状态
  const { expandedSources, toggleSource, toggleAllSources } = useExpandedState(sourceNames);

  // 使用useMemo优化颜色映射
  const sourceColors = useMemo(() => {
    return utils.generateColorMap(sourceNames);
  }, [sourceNames]);

  // 展开/收起全部
  const handleToggleAll = useCallback(() => {
    toggleAllSources(sourceNames);
  }, [sourceNames, toggleAllSources]);

  // 状态检查和渲染逻辑
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6 w-11/12 md:w-4/5 mx-auto">
      {/* 全部展开/收起按钮 - 仅在有多个来源时显示 */}
      {sourceNames.length > 1 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={handleToggleAll}
            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-200 text-sm font-medium"
          >
            {expandedSources.size === sourceNames.length ? '收起全部' : '展开全部'}
          </button>
        </div>
      )}

      {sourceNames.map((sourceName) => {
        const sourceFeeds = groupedFeeds[sourceName];
        const isExpanded = expandedSources.has(sourceName);
        const color = sourceColors[sourceName];

        return (
          <div key={sourceName} className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300">
            {/* 来源标题栏 */}
            <SourceHeader
              sourceName={sourceName}
              sourceFeeds={sourceFeeds}
              color={color}
              isExpanded={isExpanded}
              onToggle={() => toggleSource(sourceName)}
            />

            {/* 文章列表 */}
            <div 
              className="grid transition-all duration-300 ease-in-out"
              style={{
                gridTemplateRows: isExpanded ? '1fr' : '0fr',
              }}
            >
              <div className="overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {sourceFeeds.map(feed => (
                    <FeedItem
                      key={feed.id}
                      feed={feed}
                      color={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

NewsList.displayName = 'NewsList';

export default memo(NewsList);