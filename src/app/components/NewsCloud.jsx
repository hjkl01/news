import React, { useState, useEffect } from 'react';

// 通用云图资讯卡片组件
const NewsCloud = ({ data }) => {
  const [groupedData, setGroupedData] = useState({});
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const grouped = data.reduce((acc, item) => {
      if (!acc[item.feed_name]) {
        acc[item.feed_name] = [];
      }
      acc[item.feed_name].push(item);
      return acc;
    }, {});
    setGroupedData(grouped);
  }, [data]);

  function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  const getBubbleStyle = (id) => {
    const hash = hashCode(id);
    const sizes = ["text-xs", "text-sm", "text-base", "text-lg", "text-xl"];
    const colors = [
      "bg-indigo-50 text-indigo-700",
      "bg-blue-50 text-blue-700",
      "bg-indigo-100 text-indigo-800",
      "bg-blue-100 text-blue-800",
      "bg-indigo-200 text-indigo-900"
    ];
    const pxs = ["px-2", "px-3", "px-4"];
    const pys = ["py-1", "py-1.5", "py-2"];
    const size = sizes[hash % sizes.length];
    const color = colors[hash % colors.length];
    const px = pxs[hash % pxs.length];
    const py = pys[hash % pys.length];
    const rotate = (hash % 9) - 4;
    return { size, color, px, py, rotate };
  };

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {Object.keys(groupedData).map(feedName => (
          <div
            key={feedName}
            className={`bg-white/70 border border-indigo-100 rounded-3xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:ring-2 hover:ring-indigo-200/60 ${hoveredCard === feedName ? 'scale-[1.03] ring-2 ring-indigo-300/40' : ''}`}
            onMouseEnter={() => setHoveredCard(feedName)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* feed 名称区 */}
            <div className="bg-gradient-to-r from-indigo-500 to-blue-400 px-7 py-5 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-white truncate tracking-wide drop-shadow-lg">{feedName}</h2>
              <span className="text-xs text-blue-100 bg-blue-600/30 px-2 py-1 rounded-full shadow-sm ml-2">
                {groupedData[feedName].length} 篇
              </span>
            </div>
            {/* 云图气泡区 */}
            <div className="flex flex-wrap gap-3 px-7 py-7 min-h-[200px] items-start justify-start bg-gradient-to-br from-indigo-50/80 to-blue-50/60 relative">
              {groupedData[feedName].slice(0, 10).map((item) => {
                const { size, color, px, py, rotate } = getBubbleStyle(item.id.toString());
                return (
                  <a
                    key={item.id}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`relative rounded-full font-semibold shadow transition-all duration-200 hover:ring-2 hover:ring-indigo-300 hover:shadow-lg cursor-pointer ${size} ${color} ${px} ${py} whitespace-nowrap flex items-center hover:scale-105`}
                    title={item.title}
                    style={{
                      transform: `rotate(${rotate}deg)`
                    }}
                  >
                    <span>{item.title.length > 20 ? item.title.slice(0, 18) + '…' : item.title}</span>
                    <span className="ml-2 text-[10px] text-gray-400 bg-white/60 rounded px-1.5 py-0.5 shadow-sm border border-gray-100 font-normal hidden md:inline-block">
                      {new Date(item.pub_date).toLocaleDateString('zh-CN', {
                        year: '2-digit', month: '2-digit', day: '2-digit'
                      })}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsCloud;
