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
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Object.keys(groupedData).map(feedName => (
          <div
            key={feedName}
            className={`bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 ${
              hoveredCard === feedName ? 'scale-[1.02] shadow-2xl' : ''
            }`}
            onMouseEnter={() => setHoveredCard(feedName)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="bg-blue-500 px-6 py-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{feedName}</h2>
              <span className="text-sm text-blue-100">
                {groupedData[feedName].length} articles
              </span>
            </div>
            <ul className="divide-y divide-blue-100">
              {groupedData[feedName].slice(0, 15).map(item => (
                <li 
                  key={item.id} 
                  className="hover:bg-blue-50 transition-all duration-200"
                >
                  <div className="px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <a
                        href={item.link}
                        className="text-gray-800 hover:text-blue-600 transition-colors duration-200 flex-1 font-medium line-clamp-2"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.title}
                      </a>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="whitespace-nowrap bg-blue-50 px-2 py-1 rounded-full text-blue-600">
                          {new Date(item.pub_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="bg-gradient-to-t from-white to-transparent h-4 w-full absolute bottom-0"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
