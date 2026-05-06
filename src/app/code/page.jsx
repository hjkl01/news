'use client';
import React from 'react';
import jsonData from './data.json';
import PortalLayout from '../components/PortalLayout';

const App = () => {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <PortalLayout
        data={jsonData}
        title="技术（工程实践）"
        subtitle="偏工程实践与开源项目，聚焦可落地代码与工具"
        categoryFilter="技术"
      />
    </div>
  );
};

export default App;
