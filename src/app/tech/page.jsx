'use client';
import React, { useState, useEffect } from 'react';
import jsonData from './data.json';


const App = () => {
  const [groupedData, setGroupedData] = useState({});

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
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {Object.keys(groupedData).map(feedName => (
          <div key={feedName} style={{ flex: '1 1 calc(50% - 20px)', border: '1px solid #ccc', borderRadius: '8px', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h1 style={{ marginTop: 0 }}>{feedName}</h1>
            <br />
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {groupedData[feedName].slice(0, 10).map(item => (
                <li key={item.id} style={{ marginBottom: '10px' }}>
                  <strong>{item.title}</strong> - <a href={item.link} target="_blank" rel="noopener noreferrer">Read more</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
