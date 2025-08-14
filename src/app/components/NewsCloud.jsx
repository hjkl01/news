import React, { useState, useEffect, useMemo, useCallback } from 'react';

// 常量配置
const CONFIG = {
  MAX_ITEMS_PER_FEED: 10,
  BUBBLE_CONFIG: {
    SIZES: ["text-xs", "text-sm", "text-base", "text-lg", "text-xl"],
    COLORS: [
      "bg-indigo-50 text-indigo-700",
      "bg-blue-50 text-blue-700",
      "bg-indigo-100 text-indigo-800",
      "bg-blue-100 text-blue-800",
      "bg-indigo-200 text-indigo-900"
    ],
    PADDING_X: ["px-2", "px-3", "px-4"],
    PADDING_Y: ["py-1", "py-1.5", "py-2"],
    MAX_ROTATION: 4,
    MAX_TITLE_LENGTH: 20
  },
  DATE_FORMAT_OPTIONS: {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit'
  }
};

// 工具函数
const utils = {
  // 生成哈希值
  hashCode: (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  },

  // 格式化日期
  formatDate: (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('zh-CN', CONFIG.DATE_FORMAT_OPTIONS);
  },

  // 截断文本
  truncateText: (text, maxLength = CONFIG.BUBBLE_CONFIG.MAX_TITLE_LENGTH) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - 2) + '…';
  },

  // 生成气泡样式
  getBubbleStyle: (id) => {
    const hash = utils.hashCode(id.toString());
    const { SIZES, COLORS, PADDING_X, PADDING_Y, MAX_ROTATION } = CONFIG.BUBBLE_CONFIG;

    return {
      size: SIZES[hash % SIZES.length],
      color: COLORS[hash % COLORS.length],
      px: PADDING_X[hash % PADDING_X.length],
      py: PADDING_Y[hash % PADDING_Y.length],
      rotate: (hash % (MAX_ROTATION * 2 + 1)) - MAX_ROTATION
    };
  }
};

// 自定义Hook：数据分组管理
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

// 自定义Hook：悬停状态管理
const useHoverState = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleMouseEnter = useCallback((feedName) => {
    setHoveredCard(feedName);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredCard(null);
  }, []);

  return {
    hoveredCard,
    handleMouseEnter,
    handleMouseLeave
  };
};

// 气泡组件
const Bubble = ({ item, style }) => (
  <a
    href={item.link}
    target="_blank"
    rel="noopener noreferrer"
    className={`relative rounded-full font-semibold shadow transition-all duration-200 hover:ring-2 hover:ring-indigo-300 hover:shadow-lg cursor-pointer ${style.size} ${style.color} ${style.px} ${style.py} whitespace-nowrap flex items-center hover:scale-105`}
    title={item.title}
    style={{
      transform: `rotate(${style.rotate}deg)`
    }}
  >
    <span>{utils.truncateText(item.title)}</span>
    <span className="ml-2 text-[10px] text-gray-400 bg-white/60 rounded px-1.5 py-0.5 shadow-sm border border-gray-100 font-normal hidden md:inline-block">
      {utils.formatDate(item.pub_date)}
    </span>
  </a>
);

// 云图卡片组件
const CloudCard = ({ feedName, feedItems, isHovered, onMouseEnter, onMouseLeave }) => (
  <div
    className={`bg-white/70 border border-indigo-100 rounded-3xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:ring-2 hover:ring-indigo-200/60 ${isHovered ? 'scale-[1.03] ring-2 ring-indigo-300/40' : ''
      }`}
    onMouseEnter={() => onMouseEnter(feedName)}
    onMouseLeave={onMouseLeave}
  >
    {/* Feed名称区域 */}
    <div className="bg-gradient-to-r from-indigo-500 to-blue-400 px-7 py-5 flex items-center justify-between">
      <h2 className="text-xl font-extrabold text-white truncate tracking-wide drop-shadow-lg">
        {feedName}
      </h2>
      <span className="text-xs text-blue-100 bg-blue-600/30 px-2 py-1 rounded-full shadow-sm ml-2">
        {feedItems.length} 篇
      </span>
    </div>

    {/* 云图气泡区域 */}
    <div className="flex flex-wrap gap-3 px-7 py-7 min-h-[200px] items-start justify-start bg-gradient-to-br from-indigo-50/80 to-blue-50/60 relative">
      {feedItems.slice(0, CONFIG.MAX_ITEMS_PER_FEED).map((item) => {
        const bubbleStyle = utils.getBubbleStyle(item.id);
        return (
          <Bubble
            key={item.id}
            item={item}
            style={bubbleStyle}
          />
        );
      })}
    </div>
  </div>
);

// 主NewsCloud组件
const NewsCloud = ({ data }) => {
  // 使用自定义Hook管理数据分组
  const groupedData = useGroupedData(data);

  // 使用自定义Hook管理悬停状态
  const { hoveredCard, handleMouseEnter, handleMouseLeave } = useHoverState();

  // 使用useMemo优化feed名称列表
  const feedNames = useMemo(() => Object.keys(groupedData), [groupedData]);

  // 空状态检查
  if (!data || data.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-10">
        <div className="bg-white/70 border border-indigo-100 rounded-3xl shadow-md p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            N
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无内容</h3>
          <p className="text-gray-600">请检查数据源或网络连接</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
        {feedNames.map(feedName => (
          <CloudCard
            key={feedName}
            feedName={feedName}
            feedItems={groupedData[feedName]}
            isHovered={hoveredCard === feedName}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </div>
    </div>
  );
};

export default NewsCloud;
