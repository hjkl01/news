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
              {groupedData[feedName].slice(0, 15).map(item => (
                <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                  <a href={item.link} style={{ flex: 1 }}>
                    <strong>{item.title.length > 28 ? `${item.title.substring(0, 28)}...` : item.title}</strong>
                  </a>
                  <span style={{ marginLeft: '10px', fontSize: '14px' }}>{item.pub_date}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div >
  )
};

export default App;
