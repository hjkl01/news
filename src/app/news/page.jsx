'use client';
import React from 'react';
import jsonData from './data.json';
import PortalLayout from '../components/PortalLayout';

const App = () => {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <PortalLayout data={jsonData} title="新闻" categoryFilter="新闻" />
    </div>
  );
};

export default App;
