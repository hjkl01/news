/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  ChevronDownIcon,
  ChevronRightIcon
} from 'lucide-react';

const CONFIG = {
  COLOR_PALETTE: [
    '#6366F1', '#8B5CF6', '#10B981', '#F59E0B',
    '#EF4444', '#06B6D4', '#84CC16', '#F97316',
    '#EC4899', '#14B8A6', '#F43F5E', '#A855F7'
  ],
  MAX_TITLE_LENGTH: 25,
  MAX_DESCRIPTION_LENGTH: 150,
  HOT_ITEMS_PER_SOURCE: 5
};

const utils = {
  stripHtml: (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  },

  formatDate: (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('zh-CN');
  },

  truncateText: (text, maxLength = CONFIG.MAX_TITLE_LENGTH) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '…';
  },

  generateColorMap: (keys) => {
    const map = {};
    keys.forEach((key, index) => {
      map[key] = CONFIG.COLOR_PALETTE[index % CONFIG.COLOR_PALETTE.length];
    });
    return map;
  }
};

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

const LoadingState = memo(() => (
  <div className="card p-8 text-center">
    <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
    <p className="text-slate-600 mt-4">正在加载内容...</p>
  </div>
));

LoadingState.displayName = 'LoadingState';

const EmptyState = memo(() => (
  <div className="card p-8 text-center">
    <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-2xl">
      📰
    </div>
    <h3 className="text-lg font-medium text-slate-700 mb-2">暂无内容</h3>
    <p className="text-slate-500">请检查数据源或网络连接</p>
  </div>
));

EmptyState.displayName = 'EmptyState';

const ErrorState = memo(() => (
  <div className="card p-8 text-center">
    <div className="w-14 h-14 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center text-2xl">
      ⚠️
    </div>
    <h3 className="text-lg font-medium text-slate-700 mb-2">加载失败</h3>
    <p className="text-slate-500">内容加载出现错误，请稍后重试</p>
  </div>
));

ErrorState.displayName = 'ErrorState';

const SourceHeader = memo(({ sourceName, sourceFeeds, color, isExpanded, onToggle }) => (
  <div
    className="px-5 py-4 cursor-pointer hover:bg-slate-50 transition-all duration-200 flex items-center justify-between border-b border-slate-100"
    style={{ background: `linear-gradient(to right, ${color}08, transparent)` }}
    onClick={onToggle}
  >
    <div className="flex items-center space-x-3 min-w-0">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
      >
        {sourceName.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-medium text-slate-800 truncate">{sourceName}</h3>
        <p className="text-xs text-slate-500">{sourceFeeds.length} 篇文章</p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
        {isExpanded ? '收起' : '展开'}
      </span>
      {isExpanded ? (
        <ChevronDownIcon className="w-4 h-4 text-slate-400" />
      ) : (
        <ChevronRightIcon className="w-4 h-4 text-slate-400" />
      )}
    </div>
  </div>
));

SourceHeader.displayName = 'SourceHeader';

const FeedItem = memo(({ feed, color }) => (
  <div className="px-[var(--density-item-px)] py-[var(--density-item-py)] hover-lite hover:bg-indigo-50/40 border-b border-slate-50 last:border-0">
    <div className="flex gap-4">
      <div
        className="w-1 h-14 rounded-full flex-shrink-0 mt-1"
        style={{ background: `linear-gradient(to bottom, ${color}, ${color}80)` }}
      />
      <div className="flex-1 min-w-0">
        <a
          href={feed.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[15px] text-slate-800 font-medium line-clamp-2 hover:text-indigo-600 transition-colors block leading-[1.4]"
        >
          {feed.title}
        </a>
        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
          {utils.stripHtml(feed.description || feed.content || '')}
        </p>
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
          <span>{feed.author || feed.feed_name}</span>
          <span>{utils.formatDate(feed.pub_date)}</span>
        </div>
      </div>
    </div>
  </div>
));

FeedItem.displayName = 'FeedItem';

const HotList = memo(({ groupedFeeds, sourceNames }) => {
  const hotRows = useMemo(() => {
    const rows = [];

    sourceNames.forEach((sourceName) => {
      const items = groupedFeeds[sourceName] || [];
      items.slice(0, CONFIG.HOT_ITEMS_PER_SOURCE).forEach((item) => {
        rows.push(item);
      });
    });

    return rows
      .sort((a, b) => new Date(b.pub_date) - new Date(a.pub_date))
      .slice(0, 30);
  }, [groupedFeeds, sourceNames]);

  return (
    <div className="card card-density overflow-hidden">
      <div className="border-b border-[var(--card-border)] px-3 py-2">
        <h2 className="text-sm font-semibold text-slate-800">热点快览</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {hotRows.map((feed) => (
          <a
            key={feed.id}
            href={feed.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-2 hover-lite hover:bg-slate-50"
          >
            <p className="line-clamp-2 text-[13px] font-medium leading-[1.35] text-slate-800 hover:text-indigo-600">
              {feed.title}
            </p>
            <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">
              {utils.stripHtml(feed.description || feed.content || '')}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">{feed.feed_name} · {utils.formatDate(feed.pub_date)}</p>
          </a>
        ))}
      </div>
    </div>
  );
});

HotList.displayName = 'HotList';

const NewsList = ({
  data,
  error,
  loading = false,
  mode = 'main',
  title = '新闻列表',
  subtitle = '按来源分组，优先展示最近更新',
  priorityFeeds = []
}) => {
  const [showOnlyPriority, setShowOnlyPriority] = useState(false);
  const [expandPriority, setExpandPriority] = useState(false);

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

  const sourceNames = useMemo(() => Object.keys(groupedFeeds), [groupedFeeds]);
  const { expandedSources, toggleSource } = useExpandedState(sourceNames);

  const sourceColors = useMemo(() => {
    return utils.generateColorMap(sourceNames);
  }, [sourceNames]);

  const isHotMode = mode === 'hot';

  const normalizedPriorityFeeds = useMemo(
    () => priorityFeeds.map((item) => String(item).toLowerCase()),
    [priorityFeeds]
  );

  const priorityRows = useMemo(() => {
    if (isHotMode || normalizedPriorityFeeds.length === 0) {
      return [];
    }

    return data
      .filter((item) => {
        const feedName = String(item.feed_name || '').toLowerCase();
        return normalizedPriorityFeeds.some((keyword) => feedName.includes(keyword));
      })
      .slice(0, 8);
  }, [data, isHotMode, normalizedPriorityFeeds]);

  const visiblePriorityRows = useMemo(() => {
    if (expandPriority) {
      return priorityRows;
    }
    return priorityRows.slice(0, 5);
  }, [expandPriority, priorityRows]);

  const priorityIds = useMemo(() => {
    return new Set(priorityRows.map((item) => item.id));
  }, [priorityRows]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  if (isHotMode) {
    return <HotList groupedFeeds={groupedFeeds} sourceNames={sourceNames} />;
  }

  return (
    <div className="space-y-3 w-full">
      <div className="mb-1">
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>

      {priorityRows.length > 0 && (
        <div className="card card-density overflow-hidden border-indigo-200/80">
          <div className="border-b border-indigo-100 bg-indigo-50/60 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-indigo-700">优先来源：GitHub all</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowOnlyPriority((prev) => !prev)}
                  className={`rounded-md border px-2 py-1 text-[11px] font-medium hover-lite ${
                    showOnlyPriority
                      ? 'border-indigo-400 bg-indigo-100 text-indigo-700'
                      : 'border-indigo-200 bg-white text-indigo-600 hover:border-indigo-300'
                  }`}
                >
                  {showOnlyPriority ? '显示全部来源' : '只看 GitHub all'}
                </button>
                {priorityRows.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setExpandPriority((prev) => !prev)}
                    className="rounded-md border border-indigo-200 bg-white px-2 py-1 text-[11px] font-medium text-indigo-600 hover-lite hover:border-indigo-300"
                  >
                    {expandPriority ? '收起' : `展开(${priorityRows.length})`}
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {visiblePriorityRows.map((row) => (
              <a
                key={`priority-${row.id}`}
                href={row.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 hover-lite hover:bg-indigo-50/50"
              >
                <p className="line-clamp-2 text-[14px] font-medium leading-[1.35] text-slate-800 hover:text-indigo-600">
                  {row.title}
                </p>
                <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">
                  {utils.stripHtml(row.description || row.content || '')}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">{row.feed_name} · {utils.formatDate(row.pub_date)}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {sourceNames.map((sourceName) => {
        if (showOnlyPriority) {
          return null;
        }

        const sourceFeeds = (groupedFeeds[sourceName] || []).filter((item) => {
          if (priorityIds.size === 0) return true;
          return !priorityIds.has(item.id);
        });

        if (sourceFeeds.length === 0) {
          return null;
        }

        const isExpanded = expandedSources.has(sourceName);
        const color = sourceColors[sourceName];

        return (
          <div key={sourceName} className="card card-density overflow-hidden">
            <SourceHeader
              sourceName={sourceName}
              sourceFeeds={sourceFeeds}
              color={color}
              isExpanded={isExpanded}
              onToggle={() => toggleSource(sourceName)}
            />
            <div
              className="grid transition-all duration-300 ease-in-out"
              style={{
                gridTemplateRows: isExpanded ? '1fr' : '0fr',
              }}
            >
              <div className="overflow-hidden">
                <div className="divide-y divide-slate-100">
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
