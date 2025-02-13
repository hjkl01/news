'use client';
import React from 'react';
import data from './data.json';

function App() {
  return (
    <div className="flex flex-wrap justify-center gap-4 w-4/5 mx-auto">
      {data.map((item, index) => (
        <div key={index} className="p-4 text-black shadow-md rounded-lg flex flex-col">
          <h2 className="text-lg font-semibold mb-2">
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              <span title={item.title}>{item.title.length > 25 ? `${item.title.substring(0, 25)}...` : item.title}</span>
            </a>
          </h2>
          <div className="text-sm text-gray-600">
            {item.category}-{item.feed_name}-{item.pub_date}
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
