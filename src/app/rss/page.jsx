'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  RssIcon,
  FolderIcon,
  ExternalLinkIcon,
  CalendarIcon,
  UserIcon,
  RefreshCwIcon,
  AlertCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  CheckCircleIcon
} from 'lucide-react';

// 常量配置
const CONFIG = {
  BATCH_SIZE: 3,
  BATCH_DELAY: 100,
  CATEGORY_DELAY: 200,
  RSS_PROXY_URL: 'https://rsstojson.hjkl01.cn/api/rss',
  CATEGORY_COLORS: [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316',
    '#EC4899', '#6366F1', '#14B8A6', '#F43F5E'
  ]
};

// 工具函数
const utils = {
  // 清理HTML标签
  stripHtml: (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  },

  // 格式化日期
  formatDate: (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // 截断文本
  truncateText: (text, maxLength = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  // 生成唯一ID
  generateId: (prefix, index) => `${prefix}-${Date.now()}-${index}`,

  // 防抖函数
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// 自定义Hook：RSS数据管理
const useRSSData = () => {
  const [feedsByCategory, setFeedsByCategory] = useState({});
  const [categories, setCategories] = useState([]);
  const [rssConfig, setRssConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCategoriesAndConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const configResponse = await fetch('/rss-feeds.json');
      if (!configResponse.ok) {
        throw new Error('无法加载RSS配置文件');
      }
      const config = await configResponse.json();
      setRssConfig(config);

      // 动态生成分类
      const categoryMap = new Map();
      config.feeds.forEach((feedConfig, index) => {
        if (!categoryMap.has(feedConfig.category)) {
          categoryMap.set(feedConfig.category, {
            id: feedConfig.category.toLowerCase().replace(/\s+/g, '-'),
            name: feedConfig.category,
            color: CONFIG.CATEGORY_COLORS[index % CONFIG.CATEGORY_COLORS.length],
            count: 0
          });
        }
      });
      setCategories(Array.from(categoryMap.values()));
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载RSS内容时发生错误');
    } finally {
      setLoading(false);
    }
  }, []);

  const addFeedsToCategory = useCallback((categoryId, newFeeds) => {
    setFeedsByCategory(prev => {
      const currentFeeds = prev[categoryId] || [];
      // 用 link 去重
      const allFeeds = [...currentFeeds, ...newFeeds];
      const uniqueFeeds = [];
      const linkSet = new Set();
      for (const feed of allFeeds) {
        if (!linkSet.has(feed.link)) {
          linkSet.add(feed.link);
          uniqueFeeds.push(feed);
        }
      }
      return { ...prev, [categoryId]: uniqueFeeds };
    });
  }, []);

  const clearCategoryFeeds = useCallback((categoryId) => {
    setFeedsByCategory(prev => ({ ...prev, [categoryId]: [] }));
  }, []);

  const clearAllFeeds = useCallback(() => {
    setFeedsByCategory({});
  }, []);

  return {
    feedsByCategory,
    categories,
    rssConfig,
    loading,
    error,
    loadCategoriesAndConfig,
    addFeedsToCategory,
    clearCategoryFeeds,
    clearAllFeeds,
    setError
  };
};

// 自定义Hook：加载状态管理
const useLoadingState = () => {
  const [loadingFeeds, setLoadingFeeds] = useState(new Set());
  const [failedFeeds, setFailedFeeds] = useState([]);
  const [loadedFeedsCount, setLoadedFeedsCount] = useState(0);

  const addLoadingFeed = useCallback((feedName) => {
    setLoadingFeeds(prev => new Set(prev).add(feedName));
  }, []);

  const removeLoadingFeed = useCallback((feedName) => {
    setLoadingFeeds(prev => {
      const newSet = new Set(prev);
      newSet.delete(feedName);
      return newSet;
    });
  }, []);

  const addFailedFeed = useCallback((feedName) => {
    setFailedFeeds(prev => [...prev, feedName]);
  }, []);

  const incrementLoadedCount = useCallback(() => {
    setLoadedFeedsCount(prev => prev + 1);
  }, []);

  const resetLoadingState = useCallback(() => {
    setLoadingFeeds(new Set());
    setFailedFeeds([]);
    setLoadedFeedsCount(0);
  }, []);

  return {
    loadingFeeds,
    failedFeeds,
    loadedFeedsCount,
    addLoadingFeed,
    removeLoadingFeed,
    addFailedFeed,
    incrementLoadedCount,
    resetLoadingState
  };
};

// RSS Feed获取函数
const fetchRSSFeed = async (feedConfig, category) => {
  try {
    const proxyUrl = `${CONFIG.RSS_PROXY_URL}?url=${encodeURIComponent(feedConfig.url)}`;
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // 处理不同的响应格式
    let items = [];
    let feedTitle = '';

    if (data.status === 'ok' && data.items) {
      items = data.items;
      feedTitle = data.feed?.title || data.feed?.name || '';
    } else if (Array.isArray(data)) {
      items = data;
    } else if (data.rss?.channel?.item) {
      items = Array.isArray(data.rss.channel.item) ? data.rss.channel.item : [data.rss.channel.item];
      feedTitle = data.rss.channel.title || data.rss.channel.name || '';
    } else if (data.feed?.entry) {
      items = Array.isArray(data.feed.entry) ? data.feed.entry : [data.feed.entry];
      feedTitle = data.feed.title || data.feed.name || '';
    } else if (data.items && Array.isArray(data.items)) {
      items = data.items;
      feedTitle = data.title || data.name || '';
    }

    if (items && items.length > 0) {
      return items.map((item, index) => {
        const title = item.title || item.name || '无标题';
        const description = item.description || item.content || item.summary || '无描述';
        const link = item.link || item.url || '#';
        const pubDate = item.pubDate || item.published || item.updated || item.date || Date.now();
        const author = item.author || item.creator || feedTitle || feedConfig.title || feedConfig.name;

        return {
          id: utils.generateId(feedConfig.title || feedConfig.name, index),
          title: typeof title === 'string' ? title : (title?._text || title?._cdata || '无标题'),
          description: utils.stripHtml(typeof description === 'string' ? description : (description?._text || description?._cdata || '无描述')),
          link: typeof link === 'string' ? link : (link?._text || link?._cdata || '#'),
          pubDate: new Date(pubDate),
          category: category,
          source: feedTitle || feedConfig.title || feedConfig.name,
          author: typeof author === 'string' ? author : (author?._text || author?._cdata || feedConfig.title || feedConfig.name),
          feedName: feedConfig.title || feedConfig.name,
        };
      });
    }

    return null;
  } catch (error) {
    console.error(`Error fetching RSS feed ${feedConfig.title || feedConfig.name}:`, error);
    return null;
  }
};

// 主组件
export default function RSSPage() {
  const {
    feedsByCategory,
    categories,
    rssConfig,
    loading: configLoading,
    error,
    loadCategoriesAndConfig,
    addFeedsToCategory,
    clearCategoryFeeds,
    clearAllFeeds,
    setError
  } = useRSSData();

  const [customRssUrl, setCustomRssUrl] = useState('');
  const [isAddingCustomFeed, setIsAddingCustomFeed] = useState(false);

  const {
    loadingFeeds,
    failedFeeds,
    loadedFeedsCount,
    addLoadingFeed,
    removeLoadingFeed,
    addFailedFeed,
    incrementLoadedCount,
    resetLoadingState
  } = useLoadingState();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedSources, setExpandedSources] = useState(new Set());
  const [isSorted, setIsSorted] = useState(false);
  // 无需滚动

  // 初始化
  useEffect(() => {
    loadCategoriesAndConfig();
  }, [loadCategoriesAndConfig]);

  // 默认不自动选择任何分类
  useEffect(() => {
    if (categories.length > 0 && selectedCategory === null) {
      // 不自动选择第一个分类，让用户主动选择
      // 可以设置为 null 或不设置 selectedCategory
    }
  }, [categories, selectedCategory]);

  // 添加自定义分类到分类列表
  const allCategories = useMemo(() => {
    const customCategory = {
      id: 'custom',
      name: '自定义',
      color: '#8B5CF6',
      count: feedsByCategory['custom'] ? feedsByCategory['custom'].length : 0
    };

    return [customCategory, ...categories];
  }, [categories, feedsByCategory]);

  // 分批加载RSS feeds
  const loadFeedsForCategory = useCallback(async (categoryId) => {
    // 自定义分类不需要加载（数据已存在）
    if (categoryId === 'custom') {
      return;
    }

    if (!rssConfig) return;

    setError(null);
    clearCategoryFeeds(categoryId);
    resetLoadingState();

    try {
      const category = categories.find((c) => c.id === categoryId);
      if (!category) throw new Error('分类不存在');

      const feedConfigs = rssConfig.feeds.filter((f) =>
        f.category.toLowerCase().replace(/\s+/g, '-') === categoryId
      );

      // 分批处理
      for (let i = 0; i < feedConfigs.length; i += CONFIG.BATCH_SIZE) {
        const batch = feedConfigs.slice(i, i + CONFIG.BATCH_SIZE);

        // 并发加载当前批次
        batch.forEach(async (feedConfig) => {
          addLoadingFeed(feedConfig.title);

          try {
            const result = await fetchRSSFeed(feedConfig, category);
            if (result && result.length > 0) {
              addFeedsToCategory(categoryId, result);
              setExpandedSources(prev => new Set(prev).add(feedConfig.title));
              incrementLoadedCount();
            } else {
              addFailedFeed(feedConfig.title);
            }
          } catch (error) {
            console.error(error)
            addFailedFeed(feedConfig.title);
          } finally {
            removeLoadingFeed(feedConfig.title);
          }
        });

        // 批次间延迟
        if (i + CONFIG.BATCH_SIZE < feedConfigs.length) {
          await new Promise(resolve => setTimeout(resolve, CONFIG.BATCH_DELAY));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载RSS内容时发生错误');
    }
  }, [rssConfig, categories, addFeedsToCategory, clearCategoryFeeds, resetLoadingState, addLoadingFeed, removeLoadingFeed, addFailedFeed, incrementLoadedCount, setError]);

  // 事件处理函数
  const handleCategoryClick = useCallback(async (categoryId) => {
    setSelectedCategory(categoryId);
    setIsSorted(false);

    // 如果是自定义分类，不需要加载feeds（已经在feedsByCategory中）
    if (categoryId === 'custom') {
      const customFeeds = feedsByCategory['custom'] || [];
      if (customFeeds.length > 0) {
        const allSources = new Set(customFeeds.map(feed => feed.feedName));
        setExpandedSources(allSources);
      }
      return;
    }

    if (!feedsByCategory[categoryId] || feedsByCategory[categoryId].length === 0) {
      await loadFeedsForCategory(categoryId);
    } else {
      const allSources = new Set(feedsByCategory[categoryId].map(feed => feed.feedName));
      setExpandedSources(allSources);
    }
  }, [feedsByCategory, loadFeedsForCategory]);

  const handleRefresh = useCallback(async () => {
    clearAllFeeds();
    resetLoadingState();
    setIsSorted(false);

    if (selectedCategory) {
      await loadFeedsForCategory(selectedCategory);
    }
  }, [selectedCategory, clearAllFeeds, resetLoadingState, loadFeedsForCategory]);

  const handleSortByTime = useCallback(() => {
    if (selectedCategory) {
      setFeedsByCategory(prev => {
        const currentFeeds = prev[selectedCategory] || [];
        const sortedFeeds = [...currentFeeds].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
        return { ...prev, [selectedCategory]: sortedFeeds };
      });
      setIsSorted(true);
    }
  }, [selectedCategory]);

  const handleAddCustomFeed = useCallback(async () => {
    if (!customRssUrl.trim()) {
      setError('请输入有效的RSS地址');
      return;
    }

    setIsAddingCustomFeed(true);
    setError(null);

    try {
      // 创建一个临时的 feed 配置
      const feedConfig = {
        title: '自定义RSS源',
        name: '自定义RSS源',
        url: customRssUrl,
        category: '自定义'
      };

      // 获取分类信息
      const category = {
        id: 'custom',
        name: '自定义',
        color: '#8B5CF6' // 紫色
      };

      // 获取 RSS 数据
      const result = await fetchRSSFeed(feedConfig, category);

      if (result && result.length > 0) {
        // 添加到自定义分类
        addFeedsToCategory('custom', result);
        setExpandedSources(prev => new Set(prev).add(feedConfig.title));
        incrementLoadedCount();

        // 自动选择自定义分类
        setSelectedCategory('custom');
      } else {
        setError('无法获取RSS内容，请检查URL是否正确');
      }
    } catch (error) {
      console.error('Error adding custom feed:', error);
      setError('添加RSS源时发生错误: ' + (error.message || '未知错误'));
    } finally {
      setIsAddingCustomFeed(false);
    }
  }, [customRssUrl, selectedCategory, addFeedsToCategory, incrementLoadedCount, setError]);


  // 收起时滚动到下一个RSS的第一条新闻
  const [scrollToFeedId, setScrollToFeedId] = useState(null);

  // 计算属性，必须在 groupedFeeds 之前
  const currentFeeds = useMemo(() => {
    return selectedCategory ? (feedsByCategory[selectedCategory] || []) : [];
  }, [selectedCategory, feedsByCategory]);

  // groupedFeeds 只声明一次，供全局使用
  const groupedFeeds = useMemo(() => {
    return currentFeeds.reduce((acc, feed) => {
      if (!acc[feed.feedName]) {
        acc[feed.feedName] = [];
      }
      acc[feed.feedName].push(feed);
      return acc;
    }, {});
  }, [currentFeeds]);

  const toggleSourceWithScroll = useCallback((sourceName, idx, arr) => {
    setExpandedSources(prev => {
      const newExpanded = new Set(prev);
      const wasOpen = newExpanded.has(sourceName);
      if (wasOpen) {
        newExpanded.delete(sourceName);
        // 收起时滚动到下一个source的第一条新闻
        const next = arr[idx + 1];
        if (next) {
          const nextSourceName = next[0];
          const nextFeeds = groupedFeeds[nextSourceName];
          if (nextFeeds && nextFeeds.length > 0) {
            setScrollToFeedId(`rss-feed-item-${nextFeeds[0].id}`);
          }
        }
      } else {
        newExpanded.add(sourceName);
      }
      return newExpanded;
    });
  }, [groupedFeeds]);

  useEffect(() => {
    if (scrollToFeedId) {
      setTimeout(() => {
        const el = document.getElementById(scrollToFeedId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => {
            window.scrollBy({ top: -120, left: 0, behavior: 'instant' });
          }, 300);
        }
        setScrollToFeedId(null);
      }, 100);
    }
  }, [scrollToFeedId]);

  const toggleAllSources = useCallback(() => {
    const allSources = Object.keys(groupedFeeds);
    setExpandedSources(prev => {
      if (prev.size === allSources.length) {
        return new Set();
      } else {
        return new Set(allSources);
      }
    });
  }, [groupedFeeds]);

  const isLoading = configLoading || loadingFeeds.size > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                <RssIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">RSS订阅阅读器</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleAllSources}
                disabled={selectedCategory === null}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 shadow-sm hover:shadow-md border ${selectedCategory === null
                  ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                  }`}
              >
                <span>{expandedSources.size === Object.keys(groupedFeeds).length ? '收起全部' : '展开全部'}</span>
              </button>
              {selectedCategory !== null && Object.keys(groupedFeeds).length > 0 && (
                <button
                  onClick={handleSortByTime}
                  disabled={isSorted}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 shadow-sm hover:shadow-md border ${isSorted
                    ? 'bg-green-50 border-green-200 text-green-700 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                >
                  <ClockIcon className="w-4 h-4" />
                  <span>{isSorted ? '已按时间排序' : '按时间排序'}</span>
                </button>
              )}
              <button
                onClick={handleRefresh}
                disabled={isLoading || selectedCategory === null}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md border ${isLoading || selectedCategory === null
                  ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-transparent'
                  }`}
              >
                <RefreshCwIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>刷新内容</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 侧边栏 - 分类 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <div className="space-y-4">
                {/* 自定义RSS输入框 */}
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                    <RssIcon className="w-4 h-4 mr-2 text-blue-500" />
                    添加自定义RSS源
                  </h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={customRssUrl}
                      onChange={(e) => setCustomRssUrl(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !isAddingCustomFeed && customRssUrl.trim()) {
                          handleAddCustomFeed();
                        }
                      }}
                      placeholder="https://example.com/rss"
                      className="w-4/5 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                    />
                    <button
                      onClick={handleAddCustomFeed}
                      disabled={isAddingCustomFeed || !customRssUrl.trim()}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center shadow-sm whitespace-nowrap ${isAddingCustomFeed || !customRssUrl.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transform hover:scale-105'
                        }`}
                    >
                      {isAddingCustomFeed ? (
                        <RefreshCwIcon className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>添加</span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                    <FolderIcon className="w-4 h-4 mr-2 text-blue-500" />
                    分类
                  </h3>
                </div>
                {allCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between shadow-sm hover:shadow-md ${selectedCategory === category.id
                      ? 'text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    style={{
                      backgroundColor: selectedCategory === category.id ? category.color : 'transparent'
                    }}
                  >
                    <span className="font-medium">{category.name}</span>
                    <span
                      className="text-sm px-2 py-1 rounded-full font-medium"
                      style={{
                        backgroundColor: selectedCategory === category.id
                          ? 'rgba(255, 255, 255, 0.2)'
                          : category.color + '20',
                        color: selectedCategory === category.id ? 'white' : category.color
                      }}
                    >
                      {(feedsByCategory[category.id]?.length) || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 主内容区 */}
          <div className="lg:col-span-3">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center space-x-3 shadow-sm">
                <AlertCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">加载错误</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {failedFeeds.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <AlertCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <p className="text-yellow-800 font-medium">部分RSS源加载失败</p>
                </div>
                <p className="text-yellow-700 text-sm mb-2">以下RSS源暂时无法访问：</p>
                <div className="flex flex-wrap gap-2">
                  {failedFeeds.slice(0, 5).map((feed, index) => (
                    <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      {feed}
                    </span>
                  ))}
                  {failedFeeds.length > 5 && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      +{failedFeeds.length - 5} 更多
                    </span>
                  )}
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">正在动态加载RSS内容...</p>
                  {loadedFeedsCount > 0 && (
                    <p className="text-sm text-green-600 mt-2 flex items-center justify-center">
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      已成功加载 {loadedFeedsCount} 个RSS源
                    </p>
                  )}
                </div>

                {loadingFeeds.size > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-500 mb-3">正在动态加载RSS源：</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(loadingFeeds).map((feedName, index) => (
                        <div key={index} className="flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm shadow-sm">
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-500"></div>
                          <span>{feedName}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                      内容将实时显示，无需等待所有加载完成。新内容会追加到列表末尾，不影响已有内容的查看。
                    </p>
                  </div>
                )}
              </div>
            ) : selectedCategory === null ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <FolderIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">请选择一个分类</h3>
                <p className="text-gray-600 mb-6">从左侧分类列表中选择一个分类以查看RSS内容</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedFeeds).length === 0 ? (
                  <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <RssIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无RSS内容</h3>
                    <p className="text-gray-600 mb-6">该分类下暂无内容或加载失败</p>
                    <button
                      onClick={handleRefresh}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
                    >
                      重新加载
                    </button>
                  </div>
                ) : (
                  Object.entries(groupedFeeds).map(([sourceName, sourceFeeds], idx, arr) => {
                    const isExpanded = expandedSources.has(sourceName);
                    const categoryColor = sourceFeeds[0]?.category.color || '#3B82F6';
                    // 生成唯一id
                    const sourceHeaderId = `rss-source-header-${sourceName.replace(/[^a-zA-Z0-9]/g, '')}`;
                    return (
                      <div key={sourceName} className="bg-white rounded-xl shadow-lg">
                        {/* 来源标题栏 - 吸顶 */}
                        <div
                          id={sourceHeaderId}
                          className="px-6 py-4 cursor-pointer hover:bg-opacity-90 transition-all duration-200 sticky top-16 z-20 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm"
                          style={{ backgroundColor: categoryColor + '10' }}
                          onClick={() => toggleSourceWithScroll(sourceName, idx, arr)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-sm"
                                style={{ backgroundColor: categoryColor }}
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
                                className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm"
                                style={{ backgroundColor: categoryColor }}
                              >
                                {sourceFeeds[0]?.category.name}
                              </span>
                              {isExpanded ? (
                                <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                              ) : (
                                <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                              )}
                            </div>
                          </div>
                        </div>
                        {/* 文章列表 */}
                        {isExpanded && (
                          <div className="divide-y divide-gray-100 overflow-hidden">
                            {sourceFeeds.map((feed) => (
                              <div
                                key={feed.id}
                                id={`rss-feed-item-${feed.id}`}
                                className="p-6 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="flex items-start space-x-4">
                                  <div
                                    className="w-1 h-16 rounded-full flex-shrink-0 mt-1"
                                    style={{ backgroundColor: categoryColor }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                      <a
                                        href={feed.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-lg font-semibold text-gray-900 line-clamp-2 hover:underline"
                                        style={{ color: categoryColor }}
                                      >
                                        {feed.title}
                                      </a>
                                      <span className="flex items-center text-sm text-gray-500 whitespace-nowrap ml-4">
                                        <CalendarIcon className="w-4 h-4 mr-1" />
                                        {utils.formatDate(feed.pubDate)}
                                      </span>
                                    </div>
                                    <p className="text-gray-600 mb-4 line-clamp-3">
                                      {utils.truncateText(feed.description)}
                                    </p>
                                    <div className="flex items-center flex-wrap gap-2">
                                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        <div className="flex items-center space-x-1">
                                          <UserIcon className="w-4 h-4" />
                                          <span className="truncate max-w-32">{feed.author}</span>
                                        </div>
                                      </div>
                                    </div>
                                    {/* 去掉“阅读全文”链接，只在标题上加链接 */}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

