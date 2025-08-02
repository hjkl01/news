'use client';

import React, { useState, useEffect } from 'react';
import { RssIcon, FolderIcon, ExternalLinkIcon, CalendarIcon, UserIcon, RefreshCwIcon, AlertCircleIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react';

export default function RSSPage() {
  // feeds缓存，key为分类id，value为该分类下的feeds
  const [feedsByCategory, setFeedsByCategory] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSources, setExpandedSources] = useState(new Set());
  const [rssConfig, setRssConfig] = useState(null);
  const [failedFeeds, setFailedFeeds] = useState([]);

  // 预定义的分类颜色
  const categoryColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316',
    '#EC4899', '#6366F1', '#14B8A6', '#F43F5E'
  ];

  // 初始化：只加载分类信息和rssConfig
  useEffect(() => {
    loadCategoriesAndConfig();
  }, []);

  // 只加载分类信息和rssConfig
  const loadCategoriesAndConfig = async () => {
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
      let colorIndex = 0;
      config.feeds.forEach(feedConfig => {
        if (!categoryMap.has(feedConfig.category)) {
          categoryMap.set(feedConfig.category, {
            id: feedConfig.category.toLowerCase().replace(/\s+/g, '-'),
            name: feedConfig.category,
            color: categoryColors[colorIndex % categoryColors.length],
            count: 0
          });
          colorIndex++;
        }
      });
      setCategories(Array.from(categoryMap.values()));
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载RSS内容时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 按分类加载feeds
  const loadFeedsForCategory = async (categoryId) => {
    if (!rssConfig) return;
    setLoading(true);
    setError(null);
    try {
      // 找到该分类下的所有feedConfig
      const category = categories.find((c) => c.id === categoryId);
      if (!category) throw new Error('分类不存在');
      const feedConfigs = rssConfig.feeds.filter((f) => f.category.toLowerCase().replace(/\s+/g, '-') === categoryId);
      // 并发加载
      const feedPromises = feedConfigs.map((feedConfig) => fetchRSSFeed(feedConfig, category));
      const results = await Promise.allSettled(feedPromises);
      const allFeeds = [];
      const failedFeeds = [];
      results.forEach((result, index) => {
        const feedName = feedConfigs[index].title || feedConfigs[index].name;
        if (result.status === 'fulfilled' && result.value) {
          console.log(`Successfully loaded ${result.value.length} items from ${feedName}`);
          allFeeds.push(...result.value);
        } else {
          console.warn(`Failed to load feed: ${feedName}`, result);
          failedFeeds.push(feedName);
        }
      });

      // 如果有失败的feed，显示警告信息
      if (failedFeeds.length > 0) {
        console.warn(`Failed to load ${failedFeeds.length} feeds:`, failedFeeds);
        setFailedFeeds(prev => [...prev, ...failedFeeds]);
      }
      // 按发布时间排序
      allFeeds.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
      console.log(`Total feeds loaded for category ${categoryId}:`, allFeeds.length);
      setFeedsByCategory((prev) => ({ ...prev, [categoryId]: allFeeds }));
      // 默认展开所有来源
      const allSources = new Set(allFeeds.map(feed => feed.feedName));
      setExpandedSources(allSources);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载RSS内容时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // RSS代理加载
  const fetchRSSFeed = async (feedConfig, category) => {
    try {
      const proxyUrl = `https://rsstojson.hjkl01.cn/api/rss?url=${encodeURIComponent(feedConfig.url)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        console.warn(`HTTP error for ${feedConfig.title || feedConfig.name}: ${response.status}`);
        return null;
      }

      const data = await response.json();

      // 调试信息
      console.log(`RSS response for ${feedConfig.title || feedConfig.name}:`, data);

      // 处理不同的响应格式
      let items = [];
      let feedTitle = '';

      if (data.status === 'ok' && data.items) {
        // 标准格式
        items = data.items;
        feedTitle = data.feed?.title || data.feed?.name || '';
      } else if (Array.isArray(data)) {
        // 直接返回数组格式
        items = data;
      } else if (data.rss && data.rss.channel && data.rss.channel.item) {
        // RSS XML解析后的格式
        items = Array.isArray(data.rss.channel.item) ? data.rss.channel.item : [data.rss.channel.item];
        feedTitle = data.rss.channel.title || data.rss.channel.name || '';
      } else if (data.feed && data.feed.entry) {
        // Atom格式
        items = Array.isArray(data.feed.entry) ? data.feed.entry : [data.feed.entry];
        feedTitle = data.feed.title || data.feed.name || '';
      } else if (data.items && Array.isArray(data.items)) {
        // 新的标准RSS格式
        items = data.items;
        feedTitle = data.title || data.name || '';
      }

      if (items && items.length > 0) {
        return items.map((item, index) => {
          // 统一处理不同的字段名
          const title = item.title || item.name || '无标题';
          const description = item.description || item.content || item.summary || '无描述';
          const link = item.link || item.url || '#';
          const pubDate = item.pubDate || item.published || item.updated || item.date || Date.now();
          const author = item.author || item.creator || feedTitle || feedConfig.title || feedConfig.name;

          return {
            id: `${feedConfig.title || feedConfig.name}-${Date.now()}-${index}`,
            title: typeof title === 'string' ? title : (title?._text || title?._cdata || '无标题'),
            description: typeof description === 'string' ? description : (description?._text || description?._cdata || '无描述'),
            link: typeof link === 'string' ? link : (link?._text || link?._cdata || '#'),
            pubDate: new Date(pubDate),
            category: category,
            source: feedTitle || feedConfig.title || feedConfig.name,
            author: typeof author === 'string' ? author : (author?._text || author?._cdata || feedConfig.title || feedConfig.name),
            feedName: feedConfig.title || feedConfig.name,
          };
        });
      }

      console.warn(`No items found for ${feedConfig.title || feedConfig.name}`);
      return null;
    } catch (error) {
      console.error(`Error fetching RSS feed ${feedConfig.title || feedConfig.name}:`, error);
      return null;
    }
  };

  // 处理分类点击
  const handleCategoryClick = async (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === null) {
      // 全部分类的处理
      const allCategoryIds = categories.map(c => c.id);
      const unloadedCategories = allCategoryIds.filter(id => !feedsByCategory[id]);
      if (unloadedCategories.length > 0) {
        for (const catId of unloadedCategories) {
          await loadFeedsForCategory(catId);
        }
      }
    } else {
      if (!feedsByCategory[categoryId]) {
        await loadFeedsForCategory(categoryId); // 只在没缓存时加载
      } else {
        // 已加载，直接显示
        const allSources = new Set(feedsByCategory[categoryId].map(feed => feed.feedName));
        setExpandedSources(allSources);
      }
    }
  };

  // 刷新按钮：清空feeds缓存，重新加载当前分类
  const handleRefresh = async () => {
    setFeedsByCategory({});
    setFailedFeeds([]); // 清空失败记录
    if (selectedCategory === null) {
      // 重新加载所有分类
      for (const category of categories) {
        await loadFeedsForCategory(category.id);
      }
    } else if (selectedCategory) {
      await loadFeedsForCategory(selectedCategory);
    }
  };

  // 当前显示的feeds
  let filteredFeeds = [];
  if (selectedCategory === null) {
    // "全部"，合并所有分类feeds
    filteredFeeds = Object.values(feedsByCategory).flat();
  } else if (selectedCategory) {
    filteredFeeds = feedsByCategory[selectedCategory] || [];
  }

  // 按来源分组
  const groupedFeeds = filteredFeeds.reduce((acc, feed) => {
    if (!acc[feed.feedName]) {
      acc[feed.feedName] = [];
    }
    acc[feed.feedName].push(feed);
    return acc;
  }, {});

  const toggleSource = (sourceName) => {
    const newExpanded = new Set(expandedSources);
    if (newExpanded.has(sourceName)) {
      newExpanded.delete(sourceName);
    } else {
      newExpanded.add(sourceName);
    }
    setExpandedSources(newExpanded);
  };

  const toggleAllSources = () => {
    const allSources = Object.keys(groupedFeeds);
    if (expandedSources.size === allSources.length) {
      setExpandedSources(new Set());
    } else {
      setExpandedSources(new Set(allSources));
    }
  };

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
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200"
              >
                <span>{expandedSources.size === Object.keys(groupedFeeds).length ? '收起全部' : '展开全部'}</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 transform hover:scale-105"
              >
                <RefreshCwIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FolderIcon className="w-5 h-5 mr-2 text-blue-500" />
                分类
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryClick(null)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between ${selectedCategory === null
                    ? 'shadow-lg text-white bg-gradient-to-r from-blue-500 to-purple-600'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <span className="font-medium">全部</span>
                  <span className="text-sm px-2 py-1 rounded-full bg-white bg-opacity-20">
                    {Object.values(feedsByCategory).flat().length}
                  </span>
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between ${selectedCategory === category.id
                      ? 'shadow-lg text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    style={{
                      backgroundColor: selectedCategory === category.id ? category.color : 'transparent'
                    }}
                  >
                    <span className="font-medium">{category.name}</span>
                    <span
                      className="text-sm px-2 py-1 rounded-full"
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
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center space-x-3">
                <AlertCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">加载错误</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {failedFeeds.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <AlertCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <p className="text-yellow-800 font-medium">部分RSS源加载失败</p>
                </div>
                <p className="text-yellow-700 text-sm mb-2">以下RSS源暂时无法访问：</p>
                <div className="flex flex-wrap gap-2">
                  {failedFeeds.slice(0, 5).map((feed, index) => (
                    <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      {feed}
                    </span>
                  ))}
                  {failedFeeds.length > 5 && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      +{failedFeeds.length - 5} 更多
                    </span>
                  )}
                </div>
              </div>
            )}

            {loading ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">正在加载RSS内容...</p>
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
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                      重新加载
                    </button>
                  </div>
                ) : (
                  Object.entries(groupedFeeds).map(([sourceName, sourceFeeds]) => {
                    const isExpanded = expandedSources.has(sourceName);
                    const categoryColor = sourceFeeds[0]?.category.color || '#3B82F6';
                    return (
                      <div key={sourceName} className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* 来源标题栏 */}
                        <div
                          className="px-6 py-4 cursor-pointer hover:bg-opacity-90 transition-all duration-200"
                          style={{ backgroundColor: categoryColor + '10' }}
                          onClick={() => toggleSource(sourceName)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
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
                                className="px-3 py-1 rounded-full text-xs font-medium text-white"
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
                          <div className="divide-y divide-gray-100">
                            {sourceFeeds.map(feed => (
                              <div key={feed.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                                <div className="flex items-start space-x-4">
                                  <div
                                    className="w-2 h-16 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: categoryColor }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                      {feed.title}
                                    </h4>
                                    <p className="text-gray-600 mb-4 line-clamp-3">
                                      {feed.description.replace(/<[^>]*>/g, '')}
                                    </p>
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        <div className="flex items-center space-x-1">
                                          <UserIcon className="w-4 h-4" />
                                          <span className="truncate max-w-32">{feed.author}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <CalendarIcon className="w-4 h-4" />
                                          <span>{feed.pubDate.toLocaleDateString('zh-CN')}</span>
                                        </div>
                                      </div>
                                      <a
                                        href={feed.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center space-x-1 font-medium transition-colors duration-200 hover:underline"
                                        style={{ color: categoryColor }}
                                      >
                                        <span>阅读全文</span>
                                        <ExternalLinkIcon className="w-4 h-4" />
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
