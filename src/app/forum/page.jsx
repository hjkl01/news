'use client';
import React from 'react';
import data from './data.json';

function App() {
  return (
    <div className="justify-center gap-4 w-4/5 mx-auto">
      {data.map((item, index) => (
        <div key={index} className="p-4 text-black shadow-md rounded-lg">
          <h2 className="text-lg font-semibold">
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              {item.title}
            </a>
          </h2>
          {item.category}-{item.feed_name}-{item.pub_date}
        </div>
      ))}
    </div>
  );
}

export default App;
