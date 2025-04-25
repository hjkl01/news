'use client';
import React, { useState, useEffect } from 'react';
import jsonData from './data.json';

const App = () => {
  const [groupedData, setGroupedData] = useState({});
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const grouped = jsonData.reduce((acc, item) => {
      if (!acc[item.feed_name]) {
        acc[item.feed_name] = [];
      }
      acc[item.feed_name].push(item);
      return acc;
    }, {});

    setGroupedData(grouped);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(groupedData).map(feedName => (
            <div
              key={feedName}
              className={`bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl ${hoveredCard === feedName ? 'scale-[1.02]' : ''
                }`}
              onMouseEnter={() => setHoveredCard(feedName)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white truncate">{feedName}</h2>
                <span className="text-xs text-blue-100 bg-blue-600/30 px-2 py-1 rounded-full">
                  {groupedData[feedName].length} 篇文章
                </span>
              </div>
              <ul className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {groupedData[feedName].slice(0, 15).map(item => (
                  <li
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="px-6 py-4">
                      <div className="flex flex-col gap-3">
                        <a
                          href={item.link}
                          className="text-gray-800 hover:text-blue-600 transition-colors duration-200 font-medium line-clamp-2 group"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="group-hover:underline">{item.title}</span>
                        </a>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded-full text-gray-600 text-xs">
                            {new Date(item.pub_date).toLocaleDateString('zh-CN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="bg-gradient-to-t from-white to-transparent h-8 w-full sticky bottom-0"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
